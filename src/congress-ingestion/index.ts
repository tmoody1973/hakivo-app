import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import { Env } from './raindrop.gen';
import { CongressApiClient } from './congress-api-client';
import type { DB } from '../db/hakivoDb/types';
import {
  generateBillId,
  generateMemberId,
  generateCommitteeId,
  transformBillToDb,
  transformMemberToDb,
  transformCosponsorsToDb,
  transformActionsToDb,
  transformCommitteeToDb,
  transformBillCommitteesToDb,
  transformSubjectsToDb,
  transformAmendmentsToDb,
  transformRelatedBillsToDb,
  extractBillSummary,
  buildBillTextUrl,
} from './data-transformers';

interface IngestBillsRequest {
  congress?: number;
  limit?: number;
  fullSync?: boolean;
}

interface IngestMembersRequest {
  congress?: number;
  limit?: number;
  currentMembersOnly?: boolean;
}

interface IngestionResponse {
  success: boolean;
  message: string;
  stats?: {
    billsProcessed?: number;
    membersProcessed?: number;
    errors?: number;
  };
}

export default class extends Service<Env> {
  private getDb(): Kysely<DB> {
    return new Kysely<DB>({
      dialect: new D1Dialect({ database: this.env.HAKIVO_DB as any }),
    });
  }

  private async getApiClient(): Promise<CongressApiClient> {
    // Get API key from KV cache (stored in environment)
    let apiKey = await this.env.API_CACHE.get('CONGRESS_API_KEY');

    if (!apiKey) {
      // Fallback to hardcoded key for development
      apiKey = 'LujQ9kIn44Remaqi1i3Q8fcbeK9nA6aAZ0coUa3C';
    }

    return new CongressApiClient(apiKey);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route requests to different ingestion handlers
      if (path === '/ingest/bills' && request.method === 'POST') {
        return await this.handleIngestBills(request);
      }

      if (path === '/ingest/members' && request.method === 'POST') {
        return await this.handleIngestMembers(request);
      }

      if (path === '/ingest/committees' && request.method === 'POST') {
        return await this.handleIngestCommittees(request);
      }

      if (path === '/health') {
        return new Response(JSON.stringify({ status: 'ok' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      this.env.logger.error('Ingestion error:', error as any);
      return new Response(
        JSON.stringify({
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  private async handleIngestBills(request: Request): Promise<Response> {
    const body: IngestBillsRequest = (await request.json()) as IngestBillsRequest;
    const apiClient = await this.getApiClient();
    const congress = body.congress || apiClient.getCurrentCongress();
    const limit = body.limit || 100;

    this.env.logger.info(`Starting bill ingestion for Congress ${congress}`, { limit });

    const db = this.getDb();
    let billsProcessed = 0;
    let errors = 0;

    try {
      // Fetch bills
      const billsResponse = await apiClient.getBills({ congress, limit });

      if (!billsResponse.bills || billsResponse.bills.length === 0) {
        return Response.json({
          success: true,
          message: 'No bills found',
          stats: { billsProcessed: 0, errors: 0 },
        });
      }

      // Process each bill
      for (const apiBill of billsResponse.bills) {
        try {
          const billId = generateBillId(apiBill.congress, apiBill.type, apiBill.number);

          // Transform and upsert bill
          const bill = transformBillToDb(apiBill);
          await db
            .insertInto('bills')
            .values(bill)
            .onConflict((oc) => oc.column('id').doUpdateSet(bill))
            .execute();

          // Fetch and store detailed information
          const billDetail = await apiClient.getBillDetail(
            apiBill.congress,
            apiBill.type,
            apiBill.number
          );

          if (billDetail.bill) {
            const detailedBill = billDetail.bill;

            // Store cosponsors
            if (detailedBill.cosponsors && detailedBill.cosponsors.length > 0) {
              const cosponsors = transformCosponsorsToDb(billId, detailedBill.cosponsors);
              for (const cosponsor of cosponsors) {
                await db
                  .insertInto('bill_cosponsors')
                  .values(cosponsor)
                  .onConflict((oc) => oc.columns(['bill_id', 'member_id']).doNothing())
                  .execute();
              }
            }

            // Store actions
            if (detailedBill.actions && detailedBill.actions.length > 0) {
              const actions = transformActionsToDb(billId, detailedBill.actions);
              for (const action of actions) {
                await db.insertInto('bill_actions').values(action).execute();
              }
            }

            // Store subjects
            if (detailedBill.subjects) {
              const subjects = transformSubjectsToDb(billId, detailedBill.subjects);
              for (const subject of subjects) {
                await db.insertInto('bill_subjects').values(subject).execute();
              }
            }

            // Update bill with summary, full text URL, and full text content
            let updates: any = { updated_at: new Date().toISOString() };

            if (detailedBill.summaries && detailedBill.summaries.length > 0) {
              const summary = extractBillSummary(detailedBill.summaries);
              if (summary) {
                updates.summary = summary;
              }
            }

            // Build full text URL
            const fullTextUrl = buildBillTextUrl(
              apiBill.congress,
              apiBill.type,
              apiBill.number
            );
            updates.full_text_url = fullTextUrl;

            // Fetch bill text versions and get formatted text
            try {
              const textResponse = await apiClient.getBillText(
                apiBill.congress,
                apiBill.type,
                apiBill.number
              );

              if (textResponse.textVersions && textResponse.textVersions.length > 0) {
                // Find the formatted text (HTML) version
                for (const version of textResponse.textVersions) {
                  if (version.formats) {
                    const formattedText = version.formats.find(
                      (f: any) => f.type === 'Formatted Text'
                    );

                    if (formattedText && formattedText.url) {
                      // Fetch the actual HTML content using globalThis.fetch
                      const textContent = await globalThis.fetch(formattedText.url);
                      if (textContent.ok) {
                        const html = await textContent.text();
                        updates.full_text = html;
                        break; // Use the first formatted text version found
                      }
                    }
                  }
                }
              }
            } catch (textError) {
              // Log error but continue - text fetching is not critical
              this.env.logger.error(`Failed to fetch bill text for ${billId}:`, textError as any);
            }

            if (Object.keys(updates).length > 1) {
              await db
                .updateTable('bills')
                .set(updates)
                .where('id', '=', billId)
                .execute();
            }
          }

          billsProcessed++;
          this.env.logger.info(`Processed bill ${billId}`);
        } catch (error) {
          errors++;
          this.env.logger.error(`Error processing bill:`, error as any);
        }
      }

      const response: IngestionResponse = {
        success: true,
        message: `Ingested ${billsProcessed} bills for Congress ${congress}`,
        stats: { billsProcessed, errors },
      };

      return Response.json(response);
    } catch (error) {
      this.env.logger.error('Bill ingestion failed:', error as any);
      throw error;
    }
  }

  private async handleIngestMembers(request: Request): Promise<Response> {
    const body: IngestMembersRequest = (await request.json()) as IngestMembersRequest;
    const congress = body.congress;
    const limit = body.limit || 250;
    const currentMembersOnly = body.currentMembersOnly !== false;

    this.env.logger.info('Starting member ingestion', { congress, limit, currentMembersOnly });

    const apiClient = await this.getApiClient();
    const db = this.getDb();
    let membersProcessed = 0;
    let errors = 0;

    try {
      // Fetch members
      const membersResponse = congress
        ? await apiClient.getMembersByCongress(congress, { limit, currentMember: currentMembersOnly })
        : await apiClient.getMembers({ limit, currentMember: currentMembersOnly });

      if (!membersResponse.members || membersResponse.members.length === 0) {
        return Response.json({
          success: true,
          message: 'No members found',
          stats: { membersProcessed: 0, errors: 0 },
        });
      }

      // Process each member
      for (const apiMember of membersResponse.members) {
        try {
          const memberId = generateMemberId(apiMember.bioguideId);

          // Fetch detailed member information
          const memberDetail = await apiClient.getMemberDetail(apiMember.bioguideId);

          if (memberDetail.member) {
            // Transform and upsert member
            const member = transformMemberToDb(memberDetail.member);
            await db
              .insertInto('members')
              .values(member)
              .onConflict((oc) => oc.column('id').doUpdateSet(member))
              .execute();

            membersProcessed++;
            this.env.logger.info(`Processed member ${memberId}`);
          }
        } catch (error) {
          errors++;
          this.env.logger.error(`Error processing member:`, error as any);
        }
      }

      const responseData: IngestionResponse = {
        success: true,
        message: `Ingested ${membersProcessed} members`,
        stats: { membersProcessed, errors },
      };

      return Response.json(responseData);
    } catch (error) {
      this.env.logger.error('Member ingestion failed:', error as any);
      throw error;
    }
  }

  private async handleIngestCommittees(request: Request): Promise<Response> {
    this.env.logger.info('Starting committee ingestion');

    const apiClient = await this.getApiClient();
    const db = this.getDb();
    let committeesProcessed = 0;
    let errors = 0;

    try {
      // Fetch House committees
      const houseResponse = await apiClient.getCommittees('house');
      const senateResponse = await apiClient.getCommittees('senate');

      const allCommittees = [
        ...(houseResponse.committees || []),
        ...(senateResponse.committees || []),
      ];

      for (const apiCommittee of allCommittees) {
        try {
          const committee = transformCommitteeToDb(apiCommittee);
          await db
            .insertInto('committees')
            .values(committee)
            .onConflict((oc) => oc.column('id').doUpdateSet(committee))
            .execute();

          committeesProcessed++;
          this.env.logger.info(`Processed committee ${committee.id}`);
        } catch (error) {
          errors++;
          this.env.logger.error(`Error processing committee:`, error as any);
        }
      }

      return Response.json({
        success: true,
        message: `Ingested ${committeesProcessed} committees`,
        stats: { errors },
      });
    } catch (error) {
      this.env.logger.error('Committee ingestion failed:', error as any);
      throw error;
    }
  }
}
