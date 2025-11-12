import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen';
import { getDb } from './db';

/**
 * Simple Bill Storage Service
 * Direct storage endpoint for bills fetched from external scripts
 *
 * Pattern: External script → POST /api/bills → Direct DB insert
 */
export default class extends Service<Env> {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/health') {
      return Response.json({ status: 'ok' });
    }

    // POST /api/bills - Store a single bill
    if (url.pathname === '/api/bills' && request.method === 'POST') {
      return this.storeBill(request);
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  /**
   * Store a single bill with all its data
   */
  private async storeBill(request: Request): Promise<Response> {
    try {
      const data: any = await request.json();
      const db = getDb(this.env);

      this.env.logger.info(`📝 Storing bill ${data.id}...`);

      // 1. UPSERT sponsor as a member first (if sponsor data is provided)
      if (data.sponsorBioguideId && data.sponsorFirstName && data.sponsorLastName) {
        // Infer chamber from bill type: S/SRES/SJRES/SCONRES = Senate, HR/HRES/HJRES/HCONRES = House
        const chamber = data.billType.toUpperCase().startsWith('S') ? 'Senate' : 'House';

        await db
          .insertInto('members')
          .values({
            id: data.sponsorBioguideId,
            bioguide_id: data.sponsorBioguideId,
            first_name: data.sponsorFirstName,
            last_name: data.sponsorLastName,
            party: data.sponsorParty || null,
            state: data.sponsorState || 'Unknown',
            district: data.sponsorDistrict?.toString() || null,
            chamber: chamber,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .onConflict((oc) =>
            oc.column('bioguide_id').doUpdateSet({
              first_name: data.sponsorFirstName,
              last_name: data.sponsorLastName,
              party: data.sponsorParty || null,
              state: data.sponsorState || 'Unknown',
              district: data.sponsorDistrict?.toString() || null,
              chamber: chamber,
              updated_at: new Date().toISOString(),
            })
          )
          .execute();

        this.env.logger.info(`  ✅ Stored sponsor: ${data.sponsorFirstName} ${data.sponsorLastName} (${data.sponsorBioguideId})`);
      }

      // 2. Insert or update bill (matching existing schema + storing full text HTML)
      await db
        .insertInto('bills')
        .values({
          id: data.id,
          congress: data.congress,
          bill_type: data.billType,
          bill_number: data.billNumber,
          title: data.title,
          summary: data.summary || null,
          full_text: data.fullText || null, // Store actual HTML content
          full_text_url: data.congressGovUrl || null,
          sponsor_id: data.sponsorBioguideId || null,
          introduced_date: data.introducedDate || null,
          latest_action_date: data.latestActionDate || null,
          latest_action_text: data.latestActionText || null,
          status: data.status || 'introduced',
          policy_area: data.policyArea || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .onConflict((oc) =>
          oc.column('id').doUpdateSet({
            title: data.title,
            summary: data.summary || null,
            full_text: data.fullText || null, // Store actual HTML content
            full_text_url: data.congressGovUrl || null,
            sponsor_id: data.sponsorBioguideId || null,
            introduced_date: data.introducedDate || null,
            latest_action_date: data.latestActionDate || null,
            latest_action_text: data.latestActionText || null,
            status: data.status || 'introduced',
            policy_area: data.policyArea || null,
            updated_at: new Date().toISOString(),
          })
        )
        .execute();

      // 3. Store cosponsors (UPSERT members first to avoid FK constraint errors)
      if (data.cosponsors && data.cosponsors.length > 0) {
        for (const cosponsor of data.cosponsors) {
          // UPSERT member first (required for FK constraint)
          // Infer chamber from bill type: S/SRES = Senate, HR/HRES = House
          const chamber = data.billType.startsWith('S') ? 'Senate' : 'House';

          await db
            .insertInto('members')
            .values({
              id: cosponsor.bioguideId,
              bioguide_id: cosponsor.bioguideId,
              first_name: cosponsor.name?.split(' ')[0] || 'Unknown',
              last_name: cosponsor.name?.split(' ').slice(1).join(' ') || 'Unknown',
              party: cosponsor.party || null,
              state: cosponsor.state || 'Unknown',
              chamber: chamber,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .onConflict((oc) =>
              oc.column('bioguide_id').doUpdateSet({
                first_name: cosponsor.name?.split(' ')[0] || 'Unknown',
                last_name: cosponsor.name?.split(' ').slice(1).join(' ') || 'Unknown',
                party: cosponsor.party || null,
                state: cosponsor.state || 'Unknown',
                chamber: chamber,
                updated_at: new Date().toISOString(),
              })
            )
            .execute();

          // Now safe to insert cosponsor
          await db
            .insertInto('bill_cosponsors')
            .values({
              bill_id: data.id,
              member_id: cosponsor.bioguideId,
              sponsored_date: cosponsor.sponsorshipDate,
              created_at: new Date().toISOString(),
            })
            .onConflict((oc) => oc.columns(['bill_id', 'member_id']).doNothing())
            .execute();
        }
        this.env.logger.info(`  ✅ Stored ${data.cosponsors.length} cosponsors`);
      }

      // 4. Store actions (matching existing schema)
      if (data.actions && data.actions.length > 0) {
        for (const action of data.actions) {
          await db
            .insertInto('bill_actions')
            .values({
              bill_id: data.id,
              action_date: action.actionDate,
              action_text: action.text,
              action_type: action.type || 'Unknown',
              action_code: action.actionCode || null,
              created_at: new Date().toISOString(),
            })
            .execute();
        }
        this.env.logger.info(`  ✅ Stored ${data.actions.length} actions`);
      }

      // 5. Store subjects (matching existing schema)
      if (data.issueCategories && data.issueCategories.length > 0) {
        for (const subject of data.issueCategories) {
          await db
            .insertInto('bill_subjects')
            .values({
              bill_id: data.id,
              subject: subject,
              created_at: new Date().toISOString(),
            })
            .execute();
        }
        this.env.logger.info(`  ✅ Stored ${data.issueCategories.length} subjects`);
      }

      // 6. Store full text chunks (if provided for large bills)
      if (data.fullTextChunks && Array.isArray(data.fullTextChunks) && data.fullTextChunks.length > 0) {
        for (let i = 0; i < data.fullTextChunks.length; i++) {
          const chunk = data.fullTextChunks[i];
          await db
            .insertInto('bill_text_chunks')
            .values({
              bill_id: data.id,
              chunk_index: i,
              chunk_text: chunk,
              chunk_size: chunk.length,
              created_at: new Date().toISOString(),
            })
            .execute();
        }
        this.env.logger.info(`  ✅ Stored ${data.fullTextChunks.length} text chunks (total: ${Math.round(data.fullTextChunks.reduce((sum: number, c: string) => sum + c.length, 0) / 1024)}KB)`);
      }

      this.env.logger.info(`✅ Successfully stored ${data.id}`);

      return Response.json({
        success: true,
        billId: data.id,
        cosponsors: data.cosponsors?.length || 0,
        actions: data.actions?.length || 0,
        subjects: data.issueCategories?.length || 0,
        textChunks: data.fullTextChunks?.length || 0,
      });

    } catch (error: any) {
      this.env.logger.error(`❌ Error storing bill:`, error);
      return Response.json({
        error: 'Failed to store bill',
        details: error.message
      }, { status: 500 });
    }
  }
}
