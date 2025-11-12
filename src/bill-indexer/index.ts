/**
 * Bill Indexer Service
 *
 * Indexes bills from the database into the SmartBucket for semantic search.
 * Provides endpoints to:
 * - Trigger bulk indexing
 * - Check indexing status
 * - Re-index specific bills
 */

import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import { DB } from '../db/hakivoDb/types';

type D1Database = any;

interface BillRecord {
  id: string;
  congress: number;
  bill_type: string;
  bill_number: number;
  title: string;
  summary: string | null;
  full_text: string | null;
  sponsor_id: string | null;
  introduced_date: string | null;
  latest_action_date: string | null;
  latest_action_text: string | null;
  policy_area: string | null;
  status: string | null;
  first_name?: string | null;
  last_name?: string | null;
  sponsor_party?: string | null;
  sponsor_state?: string | null;
}

interface R2ObjectBody {
  body: ReadableStream;
  bodyUsed: boolean;
  text(): Promise<string>;
  json(): Promise<any>;
  arrayBuffer(): Promise<ArrayBuffer>;
}

interface SmartBucket {
  put(key: string, value: string | ArrayBuffer, options?: { metadata?: Record<string, string> }): Promise<void>;
  get(key: string): Promise<R2ObjectBody | null>;
  list(options?: { prefix?: string; limit?: number }): Promise<{
    objects: Array<{
      key: string;
      version: string;
      size: number;
      etag: string;
      httpEtag: string;
      uploaded: string;
      httpMetadata: Record<string, any>;
      customMetadata: Record<string, any>;
      storageClass: string;
    }>
  }>;
}

interface Env {
  HAKIVO_DB: D1Database;
  BILLS_BUCKET: SmartBucket;
}

export default class BillIndexerService extends Service<Env> {
  /**
   * Main request handler
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // POST /index - Start indexing bills
      if (path === '/index' && request.method === 'POST') {
        return await this.handleIndex(request, corsHeaders);
      }

      // GET /status - Check indexing status
      if (path === '/status' && request.method === 'GET') {
        return await this.handleStatus(corsHeaders);
      }

      // POST /reindex/:billId - Re-index a specific bill
      if (path.startsWith('/reindex/') && request.method === 'POST') {
        const billId = path.split('/')[2];
        if (!billId) {
          return new Response(
            JSON.stringify({ error: 'Bill ID is required' }),
            { status: 400, headers: corsHeaders }
          );
        }
        return await this.handleReindex(billId, corsHeaders);
      }

      // GET /list - List indexed bills (for debugging)
      if (path === '/list' && request.method === 'GET') {
        return await this.handleList(corsHeaders);
      }

      // GET /content/:key - Get content of a specific indexed bill
      if (path.startsWith('/content/') && request.method === 'GET') {
        const key = decodeURIComponent(path.substring('/content/'.length));
        if (!key) {
          return new Response(
            JSON.stringify({ error: 'Key is required' }),
            { status: 400, headers: corsHeaders }
          );
        }
        return await this.handleGetContent(key, corsHeaders);
      }

      return new Response(
        JSON.stringify({ error: 'Not found' }),
        { status: 404, headers: corsHeaders }
      );
    } catch (error) {
      console.error('Error in bill-indexer:', error);
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
        { status: 500, headers: corsHeaders }
      );
    }
  }

  /**
   * Get Kysely database instance
   */
  private getDb(): Kysely<DB> {
    return new Kysely<DB>({
      dialect: new D1Dialect({ database: this.env.HAKIVO_DB }),
    });
  }

  /**
   * Handle bulk indexing request
   */
  private async handleIndex(request: Request, headers: Record<string, string>): Promise<Response> {
    const body = await request.json() as { limit?: number; offset?: number; batchSize?: number };
    const { limit = 100, offset = 0, batchSize = 10 } = body;

    const db = this.getDb();

    // Fetch bills with full text
    const rawBills = await db
      .selectFrom('bills as b')
      .leftJoin('members as m', 'b.sponsor_id', 'm.id')
      .select([
        'b.id',
        'b.congress',
        'b.bill_type',
        'b.bill_number',
        'b.title',
        'b.summary',
        'b.full_text',
        'b.sponsor_id',
        'b.introduced_date',
        'b.latest_action_date',
        'b.latest_action_text',
        'b.policy_area',
        'b.status',
        'm.first_name',
        'm.last_name',
        'm.party as sponsor_party',
        'm.state as sponsor_state',
      ])
      .where('b.full_text', 'is not', null)
      .where(db.fn('length', ['full_text']), '>', 100)
      .orderBy('b.congress', 'desc')
      .orderBy('b.introduced_date', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();

    const bills = rawBills as unknown as BillRecord[];

    if (bills.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No bills to index', indexed: 0, failed: 0 }),
        { headers }
      );
    }

    // Index bills in batches
    let indexed = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < bills.length; i += batchSize) {
      const batch = bills.slice(i, i + batchSize);

      for (const bill of batch) {
        try {
          await this.indexBillToSmartBucket(bill);
          indexed++;
        } catch (error) {
          failed++;
          errors.push(`${bill.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Small delay between batches
      if (i + batchSize < bills.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Indexing complete',
        indexed,
        failed,
        total: bills.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers }
    );
  }

  /**
   * Handle status check request
   */
  private async handleStatus(headers: Record<string, string>): Promise<Response> {
    try {
      // List objects in the bucket to get indexed count
      let indexedCount = 0;
      try {
        const result = await this.env.BILLS_BUCKET.list({ prefix: 'bills/', limit: 1000 });
        indexedCount = result?.objects?.length || 0;
      } catch (listError) {
        console.error('Error listing bucket:', listError);
        // Continue with indexedCount = 0
      }

      // Get total bills with full text from database
      const db = this.getDb();
      const totalResult = await db
        .selectFrom('bills')
        .select(db.fn.count<number>('id').as('total'))
        .where('full_text', 'is not', null)
        .where(db.fn('length', ['full_text']), '>', 100)
        .executeTakeFirst();

      const totalBills = totalResult?.total || 0;

      return new Response(
        JSON.stringify({
          indexed: indexedCount,
          total: totalBills,
          remaining: totalBills - indexedCount,
          percentComplete: totalBills > 0 ? Math.round((indexedCount / totalBills) * 100) : 0,
        }),
        { headers }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Failed to get status',
        }),
        { status: 500, headers }
      );
    }
  }

  /**
   * Handle re-index specific bill request
   */
  private async handleReindex(billId: string, headers: Record<string, string>): Promise<Response> {
    const db = this.getDb();

    // Fetch the bill
    const rawBills = await db
      .selectFrom('bills as b')
      .leftJoin('members as m', 'b.sponsor_id', 'm.id')
      .select([
        'b.id',
        'b.congress',
        'b.bill_type',
        'b.bill_number',
        'b.title',
        'b.summary',
        'b.full_text',
        'b.sponsor_id',
        'b.introduced_date',
        'b.latest_action_date',
        'b.latest_action_text',
        'b.policy_area',
        'b.status',
        'm.first_name',
        'm.last_name',
        'm.party as sponsor_party',
        'm.state as sponsor_state',
      ])
      .where('b.id', '=', billId)
      .executeTakeFirst();

    if (!rawBills) {
      return new Response(
        JSON.stringify({ error: 'Bill not found' }),
        { status: 404, headers }
      );
    }

    const bill = rawBills as unknown as BillRecord;

    if (!bill.full_text || bill.full_text.length <= 100) {
      return new Response(
        JSON.stringify({ error: 'Bill has no full text to index' }),
        { status: 400, headers }
      );
    }

    try {
      await this.indexBillToSmartBucket(bill);
      return new Response(
        JSON.stringify({ message: 'Bill re-indexed successfully', billId }),
        { headers }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Failed to re-index bill',
        }),
        { status: 500, headers }
      );
    }
  }

  /**
   * Index a single bill to SmartBucket
   */
  private async indexBillToSmartBucket(bill: BillRecord): Promise<void> {
    // Create document content optimized for semantic search
    const documentContent = this.createDocumentContent(bill);

    // Combine first and last name
    const sponsorName = bill.first_name && bill.last_name
      ? `${bill.first_name} ${bill.last_name}`
      : '';

    // Create metadata for filtering and display
    const metadata = {
      bill_id: bill.id,
      congress: bill.congress.toString(),
      bill_type: bill.bill_type,
      bill_number: bill.bill_number.toString(),
      title: bill.title,
      summary: bill.summary || '',
      sponsor_name: sponsorName,
      sponsor_party: bill.sponsor_party || '',
      sponsor_state: bill.sponsor_state || '',
      introduced_date: bill.introduced_date || '',
      latest_action_date: bill.latest_action_date || '',
      latest_action_text: bill.latest_action_text || '',
      policy_area: bill.policy_area || '',
      status: bill.status || '',
      full_text_length: bill.full_text?.length.toString() || '0',
    };

    // Object key in SmartBucket
    const objectKey = `bills/${bill.congress}/${bill.bill_type}-${bill.bill_number}.txt`;

    // Create full document with metadata as frontmatter
    const fullDocument = [
      '---',
      'METADATA:',
      JSON.stringify(metadata, null, 2),
      '---',
      '',
      documentContent,
    ].join('\n');

    // Upload to SmartBucket (SmartBucket automatically indexes for semantic search)
    await this.env.BILLS_BUCKET.put(objectKey, fullDocument, { metadata });
  }

  /**
   * Create document content optimized for semantic search
   */
  private createDocumentContent(bill: BillRecord): string {
    const parts: string[] = [];

    // Bill identifier
    parts.push(`Bill: ${bill.congress}-${bill.bill_type}-${bill.bill_number}`);
    parts.push('');

    // Title
    parts.push(`Title: ${bill.title}`);
    parts.push('');

    // Sponsor information
    if (bill.first_name && bill.last_name) {
      const sponsorName = `${bill.first_name} ${bill.last_name}`;
      parts.push(`Sponsor: ${sponsorName} (${bill.sponsor_party}-${bill.sponsor_state})`);
      parts.push('');
    }

    // Policy area
    if (bill.policy_area) {
      parts.push(`Policy Area: ${bill.policy_area}`);
      parts.push('');
    }

    // Summary
    if (bill.summary) {
      parts.push('Summary:');
      parts.push(bill.summary);
      parts.push('');
    }

    // Latest action
    if (bill.latest_action_text) {
      parts.push(`Latest Action (${bill.latest_action_date}): ${bill.latest_action_text}`);
      parts.push('');
    }

    // Full text (truncated if too long - SmartBucket will handle chunking)
    if (bill.full_text) {
      parts.push('Full Text:');
      // Limit to first 50,000 characters to avoid token limits
      const truncatedText =
        bill.full_text.length > 50000
          ? bill.full_text.substring(0, 50000) + '\n\n[Text truncated...]'
          : bill.full_text;
      parts.push(truncatedText);
    }

    return parts.join('\n');
  }

  /**
   * Handle list request - List indexed bills for debugging
   */
  private async handleList(headers: Record<string, string>): Promise<Response> {
    try {
      const result = await this.env.BILLS_BUCKET.list({ prefix: 'bills/', limit: 100 });

      const bills = result?.objects?.map((obj) => ({
        name: obj.key,
        // Extract congress, type, number from path like "bills/119/hr-1234.txt"
        path: obj.key,
        size: obj.size,
        uploaded: obj.uploaded,
      })) || [];

      return new Response(
        JSON.stringify({
          count: bills.length,
          bills,
          rawResult: result,
        }),
        { headers }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Failed to list bills',
          details: String(error),
        }),
        { status: 500, headers }
      );
    }
  }

  /**
   * Handle get content request - Fetch content of a specific indexed bill
   */
  private async handleGetContent(key: string, headers: Record<string, string>): Promise<Response> {
    try {
      // Fetch content from SmartBucket
      const object = await this.env.BILLS_BUCKET.get(key);

      if (!object) {
        return new Response(
          JSON.stringify({ error: 'Content not found' }),
          { status: 404, headers }
        );
      }

      // Get text content from the R2 object
      const content = await object.text();

      return new Response(
        JSON.stringify({
          key,
          content,
        }),
        { headers }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Failed to get content',
          details: String(error),
        }),
        { status: 500, headers }
      );
    }
  }
}
