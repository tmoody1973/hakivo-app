import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import type { DB } from '../db/hakivoDb/types';

interface Env {
  _raindrop: {
    app: any;
  };
  HAKIVO_DB: any;
  CONGRESS_INGESTION: any;
  logger: any;
}

export default class extends Service<Env> {
  private getDb(): Kysely<DB> {
    return new Kysely<DB>({
      dialect: new D1Dialect({ database: this.env.HAKIVO_DB as any }),
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for admin access
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400',
      'Content-Type': 'application/json',
    };

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          ...corsHeaders,
          'Access-Control-Allow-Credentials': 'true',
        }
      });
    }

    try {
      // Dashboard stats
      if (path === '/admin/stats') {
        return await this.handleGetStats(corsHeaders);
      }

      // Bills endpoints
      if (path === '/admin/bills') {
        return await this.handleGetBills(url, corsHeaders);
      }

      if (path.startsWith('/admin/bills/')) {
        const billId = path.replace('/admin/bills/', '');
        return await this.handleGetBillDetail(billId, corsHeaders);
      }

      // Members endpoints
      if (path === '/admin/members') {
        return await this.handleGetMembers(url, corsHeaders);
      }

      if (path.startsWith('/admin/members/')) {
        const memberId = path.replace('/admin/members/', '');
        return await this.handleGetMemberDetail(memberId, corsHeaders);
      }

      // Committees endpoints
      if (path === '/admin/committees') {
        return await this.handleGetCommittees(corsHeaders);
      }

      // Bill text chunks endpoint
      if (path.match(/^\/admin\/bills\/[^/]+\/chunks$/)) {
        const billId = path.replace('/admin/bills/', '').replace('/chunks', '');
        return await this.handleGetBillChunks(billId, corsHeaders);
      }

      // Ingestion triggers
      if (path === '/admin/ingest/trigger' && request.method === 'POST') {
        return await this.handleTriggerIngestion(request, corsHeaders);
      }

      // Ingestion status
      if (path === '/admin/ingest/status') {
        return await this.handleGetIngestionStatus(corsHeaders);
      }

      // Clear all bills data
      if (path === '/admin/clear-data' && request.method === 'POST') {
        return await this.handleClearData(corsHeaders);
      }

      // Health check
      if (path === '/admin/health') {
        return new Response(JSON.stringify({ status: 'ok' }), { headers: corsHeaders });
      }

      return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: corsHeaders,
      });
    } catch (error) {
      this.env.logger.error('Admin endpoint error:', error);
      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  }

  private async handleGetStats(headers: Record<string, string>): Promise<Response> {
    const db = this.getDb();

    // Get counts from all tables
    const [
      billsCount,
      membersCount,
      committeesCount,
      billActionsCount,
      cosponsorsCount,
      subjectsCount,
      textChunksCount,
    ] = await Promise.all([
      db.selectFrom('bills').select(db.fn.count('id').as('count')).executeTakeFirst(),
      db.selectFrom('members').select(db.fn.count('id').as('count')).executeTakeFirst(),
      db.selectFrom('committees').select(db.fn.count('id').as('count')).executeTakeFirst(),
      db.selectFrom('bill_actions').select(db.fn.count('id').as('count')).executeTakeFirst(),
      db.selectFrom('bill_cosponsors').select(db.fn.count('id').as('count')).executeTakeFirst(),
      db.selectFrom('bill_subjects').select(db.fn.count('id').as('count')).executeTakeFirst(),
      db.selectFrom('bill_text_chunks').select(db.fn.count('id').as('count')).executeTakeFirst(),
    ]);

    // Get latest bills
    const latestBills = await db
      .selectFrom('bills')
      .select(['id', 'title', 'congress', 'bill_type', 'updated_at'])
      .orderBy('updated_at', 'desc')
      .limit(5)
      .execute();

    // Get congress breakdown
    const congressBreakdown = await db
      .selectFrom('bills')
      .select(['congress', db.fn.count('id').as('count')])
      .groupBy('congress')
      .orderBy('congress', 'desc')
      .execute();

    // Get policy area breakdown
    const policyAreas = await db
      .selectFrom('bills')
      .select(['policy_area', db.fn.count('id').as('count')])
      .where('policy_area', 'is not', null)
      .groupBy('policy_area')
      .orderBy('count', 'desc')
      .limit(10)
      .execute();

    // Count bills with chunked text (distinct bill_ids)
    const chunkedBillsResult = await db
      .selectFrom('bill_text_chunks')
      .select('bill_id')
      .groupBy('bill_id')
      .execute();

    const stats = {
      totals: {
        bills: Number(billsCount?.count || 0),
        members: Number(membersCount?.count || 0),
        committees: Number(committeesCount?.count || 0),
        actions: Number(billActionsCount?.count || 0),
        cosponsors: Number(cosponsorsCount?.count || 0),
        subjects: Number(subjectsCount?.count || 0),
        textChunks: Number(textChunksCount?.count || 0),
        billsWithChunks: chunkedBillsResult.length,
      },
      latestBills,
      congressBreakdown,
      topPolicyAreas: policyAreas,
      lastUpdated: new Date().toISOString(),
    };

    return new Response(JSON.stringify(stats), { headers });
  }

  private async handleGetBills(url: URL, headers: Record<string, string>): Promise<Response> {
    const db = this.getDb();
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const congress = url.searchParams.get('congress');
    const policyArea = url.searchParams.get('policy_area');
    const search = url.searchParams.get('search');

    let query = db.selectFrom('bills').selectAll();

    if (congress) {
      query = query.where('congress', '=', parseInt(congress, 10));
    }

    if (policyArea) {
      query = query.where('policy_area', '=', policyArea);
    }

    if (search) {
      query = query.where('title', 'like', `%${search}%`);
    }

    const bills = await query
      .orderBy('updated_at', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();

    // Enrich each bill with related data counts and preview
    const enrichedBills = await Promise.all(
      bills.map(async (bill) => {
        const [cosponsors, actions, subjects] = await Promise.all([
          db
            .selectFrom('bill_cosponsors')
            .innerJoin('members', 'members.id', 'bill_cosponsors.member_id')
            .select([
              'members.bioguide_id',
              'members.first_name',
              'members.last_name',
              'members.party',
              'members.state',
              'bill_cosponsors.sponsored_date',
            ])
            .where('bill_cosponsors.bill_id', '=', bill.id)
            .execute(),
          db
            .selectFrom('bill_actions')
            .select(['action_date', 'action_text', 'action_type'])
            .where('bill_id', '=', bill.id)
            .orderBy('action_date', 'desc')
            .limit(5)
            .execute(),
          db
            .selectFrom('bill_subjects')
            .select('subject')
            .where('bill_id', '=', bill.id)
            .execute(),
        ]);

        return {
          ...bill,
          _metadata: {
            cosponsors_count: cosponsors.length,
            actions_count: actions.length,
            subjects_count: subjects.length,
          },
          cosponsors,
          actions,
          subjects: subjects.map((s) => s.subject),
        };
      })
    );

    const total = await db
      .selectFrom('bills')
      .select(db.fn.count('id').as('count'))
      .executeTakeFirst();

    return new Response(
      JSON.stringify({
        bills: enrichedBills,
        pagination: {
          total: Number(total?.count || 0),
          limit,
          offset,
        },
      }),
      { headers }
    );
  }

  private async handleGetBillDetail(billId: string, headers: Record<string, string>): Promise<Response> {
    const db = this.getDb();

    const bill = await db
      .selectFrom('bills')
      .selectAll()
      .where('id', '=', billId)
      .executeTakeFirst();

    if (!bill) {
      return new Response(JSON.stringify({ error: 'Bill not found' }), {
        status: 404,
        headers,
      });
    }

    // Get related data
    const [sponsor, cosponsors, actions, subjects, textChunks] = await Promise.all([
      bill.sponsor_id
        ? db
            .selectFrom('members')
            .selectAll()
            .where('id', '=', bill.sponsor_id)
            .executeTakeFirst()
        : null,
      db
        .selectFrom('bill_cosponsors')
        .innerJoin('members', 'members.id', 'bill_cosponsors.member_id')
        .select([
          'members.id',
          'members.first_name',
          'members.last_name',
          'members.party',
          'members.state',
          'bill_cosponsors.sponsored_date',
          'bill_cosponsors.is_original_cosponsor',
        ])
        .where('bill_cosponsors.bill_id', '=', billId)
        .execute(),
      db
        .selectFrom('bill_actions')
        .selectAll()
        .where('bill_id', '=', billId)
        .orderBy('action_date', 'desc')
        .limit(20)
        .execute(),
      db
        .selectFrom('bill_subjects')
        .select('subject')
        .where('bill_id', '=', billId)
        .execute(),
      db
        .selectFrom('bill_text_chunks')
        .select(['chunk_index', 'chunk_size', 'created_at'])
        .where('bill_id', '=', billId)
        .orderBy('chunk_index', 'asc')
        .execute(),
    ]);

    // Calculate total text size from chunks
    const totalChunkSize = textChunks.reduce((sum, chunk) => sum + chunk.chunk_size, 0);

    return new Response(
      JSON.stringify({
        bill,
        sponsor,
        cosponsors,
        actions,
        subjects: subjects.map((s) => s.subject),
        textChunks: {
          count: textChunks.length,
          totalSize: totalChunkSize,
          chunks: textChunks,
        },
      }),
      { headers }
    );
  }

  private async handleGetBillChunks(billId: string, headers: Record<string, string>): Promise<Response> {
    const db = this.getDb();

    // Check if bill exists
    const bill = await db
      .selectFrom('bills')
      .select(['id', 'title'])
      .where('id', '=', billId)
      .executeTakeFirst();

    if (!bill) {
      return new Response(JSON.stringify({ error: 'Bill not found' }), {
        status: 404,
        headers,
      });
    }

    // Get all text chunks with full content
    const chunks = await db
      .selectFrom('bill_text_chunks')
      .selectAll()
      .where('bill_id', '=', billId)
      .orderBy('chunk_index', 'asc')
      .execute();

    return new Response(
      JSON.stringify({
        billId,
        billTitle: bill.title,
        totalChunks: chunks.length,
        chunks,
      }),
      { headers }
    );
  }

  private async handleGetMembers(url: URL, headers: Record<string, string>): Promise<Response> {
    const db = this.getDb();
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const chamber = url.searchParams.get('chamber');
    const state = url.searchParams.get('state');
    const party = url.searchParams.get('party');

    let query = db.selectFrom('members').selectAll();

    if (chamber) {
      query = query.where('chamber', '=', chamber);
    }

    if (state) {
      query = query.where('state', '=', state);
    }

    if (party) {
      query = query.where('party', '=', party);
    }

    const members = await query
      .orderBy('last_name', 'asc')
      .limit(limit)
      .offset(offset)
      .execute();

    const total = await db
      .selectFrom('members')
      .select(db.fn.count('id').as('count'))
      .executeTakeFirst();

    return new Response(
      JSON.stringify({
        members,
        pagination: {
          total: Number(total?.count || 0),
          limit,
          offset,
        },
      }),
      { headers }
    );
  }

  private async handleGetMemberDetail(
    memberId: string,
    headers: Record<string, string>
  ): Promise<Response> {
    const db = this.getDb();

    const member = await db
      .selectFrom('members')
      .selectAll()
      .where('id', '=', memberId)
      .executeTakeFirst();

    if (!member) {
      return new Response(JSON.stringify({ error: 'Member not found' }), {
        status: 404,
        headers,
      });
    }

    // Get sponsored bills
    const sponsoredBills = await db
      .selectFrom('bills')
      .select(['id', 'title', 'congress', 'bill_type', 'bill_number', 'introduced_date'])
      .where('sponsor_id', '=', memberId)
      .orderBy('introduced_date', 'desc')
      .limit(10)
      .execute();

    // Get cosponsored bills
    const cosponsoredBills = await db
      .selectFrom('bill_cosponsors')
      .innerJoin('bills', 'bills.id', 'bill_cosponsors.bill_id')
      .select([
        'bills.id',
        'bills.title',
        'bills.congress',
        'bills.bill_type',
        'bills.bill_number',
        'bill_cosponsors.sponsored_date',
      ])
      .where('bill_cosponsors.member_id', '=', memberId)
      .orderBy('bill_cosponsors.sponsored_date', 'desc')
      .limit(10)
      .execute();

    return new Response(
      JSON.stringify({
        member,
        sponsoredBills,
        cosponsoredBills,
        stats: {
          sponsoredCount: sponsoredBills.length,
          cosponsoredCount: cosponsoredBills.length,
        },
      }),
      { headers }
    );
  }

  private async handleGetCommittees(headers: Record<string, string>): Promise<Response> {
    const db = this.getDb();

    const committees = await db
      .selectFrom('committees')
      .selectAll()
      .orderBy('chamber', 'asc')
      .orderBy('name', 'asc')
      .execute();

    return new Response(JSON.stringify({ committees }), { headers });
  }

  private async handleTriggerIngestion(
    request: Request,
    headers: Record<string, string>
  ): Promise<Response> {
    const body: { type: 'bills' | 'members' | 'committees'; congress?: number; limit?: number } =
      (await request.json()) as { type: 'bills' | 'members' | 'committees'; congress?: number; limit?: number };

    this.env.logger.info('Admin triggered ingestion:', body);

    try {
      // Call the congress-ingestion service via public URL
      const ingestionUrl = `${body.type === 'bills' ? '/ingest/bills' : body.type === 'members' ? '/ingest/members' : '/ingest/committees'}`;

      // Use the public URL for congress-ingestion service
      const congressIngestionUrl = 'https://svc-01k9szwjxvq8db483fjmtf018p.01k66gywmx8x4r0w31fdjjfekf.lmapp.run';

      const response = await globalThis.fetch(`${congressIngestionUrl}${ingestionUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      return new Response(JSON.stringify(result), { headers });
    } catch (error) {
      this.env.logger.error('Ingestion trigger failed:', error);
      return new Response(
        JSON.stringify({
          error: 'Ingestion failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        { status: 500, headers }
      );
    }
  }

  private async handleGetIngestionStatus(headers: Record<string, string>): Promise<Response> {
    // This would ideally track ongoing ingestion jobs
    // For now, return database stats as a proxy
    return this.handleGetStats(headers);
  }

  private async handleClearData(headers: Record<string, string>): Promise<Response> {
    const db = this.getDb();

    this.env.logger.info('Clearing all bills data...');

    try {
      // Delete in correct order due to foreign key constraints
      // Delete child tables first
      await db.deleteFrom('bill_subjects').execute();
      const subjectsDeleted = await db.selectFrom('bill_subjects').select(db.fn.count('id').as('count')).executeTakeFirst();

      await db.deleteFrom('bill_actions').execute();
      const actionsDeleted = await db.selectFrom('bill_actions').select(db.fn.count('id').as('count')).executeTakeFirst();

      await db.deleteFrom('bill_cosponsors').execute();
      const cosponsorsDeleted = await db.selectFrom('bill_cosponsors').select(db.fn.count('id').as('count')).executeTakeFirst();

      await db.deleteFrom('bill_text_chunks').execute();
      const chunksDeleted = await db.selectFrom('bill_text_chunks').select(db.fn.count('id').as('count')).executeTakeFirst();

      await db.deleteFrom('bill_committees').execute();
      await db.deleteFrom('amendments').execute();

      // Delete main tables
      await db.deleteFrom('bills').execute();
      const billsDeleted = await db.selectFrom('bills').select(db.fn.count('id').as('count')).executeTakeFirst();

      await db.deleteFrom('members').execute();
      const membersDeleted = await db.selectFrom('members').select(db.fn.count('id').as('count')).executeTakeFirst();

      await db.deleteFrom('committees').execute();

      this.env.logger.info('Database cleared successfully');

      return new Response(
        JSON.stringify({
          success: true,
          message: 'All bills data cleared successfully',
          remaining: {
            bills: Number(billsDeleted?.count || 0),
            members: Number(membersDeleted?.count || 0),
            cosponsors: Number(cosponsorsDeleted?.count || 0),
            actions: Number(actionsDeleted?.count || 0),
            subjects: Number(subjectsDeleted?.count || 0),
            textChunks: Number(chunksDeleted?.count || 0),
          },
        }),
        { headers }
      );
    } catch (error) {
      this.env.logger.error('Failed to clear data:', error);
      return new Response(
        JSON.stringify({
          error: 'Failed to clear data',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        { status: 500, headers }
      );
    }
  }
}
