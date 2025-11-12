#!/usr/bin/env tsx
/**
 * External Bill Ingestion Script
 * Based on docs/fetch-bills.ts pattern
 *
 * Fetches bills from Congress.gov API and stores them via POST /api/bills
 * Respects 1 request/second rate limit
 *
 * Usage:
 *   npm run fetch:bills                    # Fetch current Congress (119)
 *   npm run fetch:bills -- --congress=118  # Fetch specific Congress
 *   npm run fetch:bills -- --all           # Fetch all recent Congresses (115-119)
 *   npm run fetch:bills -- --limit=500     # Limit total bills to fetch
 *   npm run fetch:bills -- --full          # Fetch summaries + full text (SLOW!)
 */

import {
  fetchRecentBills,
  fetchBillSummary,
  fetchBillText,
  fetchBillCosponsors,
  fetchBillActions,
  fetchBillSubjects,
  fetchBillDetails
} from '../lib/congress-api';

interface FetchOptions {
  congresses: number[];
  batchSize: number;
  maxBillsPerCongress?: number;
  startOffset?: number;
  storageServiceUrl: string;
  fetchFullText: boolean;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Smart text chunking for large bill texts
 * Chunks at paragraph boundaries when possible, falls back to sentences
 */
function chunkText(text: string, maxChunkSize: number = 50000): string[] {
  const chunks: string[] = [];

  // If text is small enough, return as single chunk
  if (text.length <= maxChunkSize) {
    return [text];
  }

  // Split by paragraphs first (double newlines)
  const paragraphs = text.split(/\n\n+/);

  let currentChunk = '';

  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed max size
    if (currentChunk.length + paragraph.length + 2 > maxChunkSize) {
      // If current chunk has content, save it
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }

      // If single paragraph is too large, split by sentences
      if (paragraph.length > maxChunkSize) {
        const sentences = paragraph.split(/(?<=[.!?])\s+/);

        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length + 1 > maxChunkSize) {
            if (currentChunk.length > 0) {
              chunks.push(currentChunk.trim());
              currentChunk = '';
            }

            // If single sentence is STILL too large, hard split
            if (sentence.length > maxChunkSize) {
              for (let i = 0; i < sentence.length; i += maxChunkSize) {
                chunks.push(sentence.substring(i, i + maxChunkSize));
              }
            } else {
              currentChunk = sentence;
            }
          } else {
            currentChunk += (currentChunk.length > 0 ? ' ' : '') + sentence;
          }
        }
      } else {
        currentChunk = paragraph;
      }
    } else {
      currentChunk += (currentChunk.length > 0 ? '\n\n' : '') + paragraph;
    }
  }

  // Add final chunk if any
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Generate policy area using AI when Congress.gov doesn't provide one
 */
async function generatePolicyArea(title: string, summary: string | null, subjects: string[]): Promise<string | null> {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    console.warn('⚠️  ANTHROPIC_API_KEY not set, skipping AI policy area generation');
    return null;
  }

  try {
    // Build context for AI
    const context = [
      `Bill Title: ${title}`,
      summary ? `Summary: ${summary.substring(0, 500)}` : null,
      subjects.length > 0 ? `Legislative Subjects: ${subjects.slice(0, 5).join(', ')}` : null,
    ].filter(Boolean).join('\n\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: `Analyze this Congressional bill and classify it into ONE primary policy area. Choose from standard Congressional policy areas like: Agriculture and Food, Armed Forces and National Security, Civil Rights and Liberties, Commerce, Crime and Law Enforcement, Economics and Public Finance, Education, Energy, Environmental Protection, Foreign Trade and International Finance, Government Operations and Politics, Health, Housing and Community Development, Immigration, Labor and Employment, Law, Native Americans, Public Lands and Natural Resources, Science and Technology, Social Welfare, Sports and Recreation, Taxation, Transportation and Public Works, Water Resources Development.

${context}

Respond with ONLY the policy area name (2-5 words), nothing else.`
        }]
      })
    });

    if (!response.ok) {
      console.warn(`⚠️  AI policy area generation failed: ${response.statusText}`);
      return null;
    }

    const data = await response.json() as any;
    const policyArea = data.content?.[0]?.text?.trim();

    if (policyArea && policyArea.length > 0) {
      return policyArea;
    }

    return null;
  } catch (error) {
    console.warn('⚠️  Error generating policy area:', error);
    return null;
  }
}

/**
 * Store bill in database via POST /api/bills
 */
async function storeBill(bill: any, storageServiceUrl: string, fetchFullText: boolean): Promise<boolean> {
  try {
    const billId = `${bill.congress}-${bill.type}-${bill.number}`;

    // Optionally fetch ALL metadata
    let summary = null;
    let fullText = null;
    let cosponsors: any[] = [];
    let cosponsorCount = 0;
    let actions: any[] = [];
    let policyArea = null;
    let subjects: string[] = [];
    let sponsor: any = null;

    if (fetchFullText) {
      console.log(`   📄 Fetching complete details for ${billId}...`);

      // Fetch bill details (includes sponsor information)
      const billDetails = await fetchBillDetails(bill.congress, bill.type, bill.number);
      if (billDetails && billDetails.sponsor) {
        sponsor = billDetails.sponsor;
      }
      await sleep(400); // Reduced rate limit delay

      // Fetch summary
      summary = await fetchBillSummary(bill.congress, bill.type, bill.number);
      await sleep(400); // Reduced rate limit delay

      // Fetch full text HTML
      fullText = await fetchBillText(bill.congress, bill.type, bill.number);
      await sleep(400);

      // Fetch cosponsors
      const fetchedCosponsors = await fetchBillCosponsors(bill.congress, bill.type, bill.number);
      if (fetchedCosponsors && fetchedCosponsors.length > 0) {
        cosponsors = fetchedCosponsors;
        cosponsorCount = cosponsors.length;
      }
      await sleep(400);

      // Fetch actions/history
      const fetchedActions = await fetchBillActions(bill.congress, bill.type, bill.number);
      if (fetchedActions && fetchedActions.length > 0) {
        actions = fetchedActions;
      }
      await sleep(400);

      // Fetch subjects (policy area + legislative subjects)
      const fetchedSubjects = await fetchBillSubjects(bill.congress, bill.type, bill.number);
      if (fetchedSubjects) {
        policyArea = fetchedSubjects.policyArea;
        subjects = fetchedSubjects.legislativeSubjects;
      }
      await sleep(400);

      // If no policy area from Congress.gov, generate one using AI
      if (!policyArea && (summary || subjects.length > 0)) {
        console.log(`   🤖 Generating AI policy area for ${billId}...`);
        policyArea = await generatePolicyArea(bill.title, summary, subjects);
        if (policyArea) {
          console.log(`   ✨ AI generated policy area: ${policyArea}`);
        }
      }
    }

    // Chunk large full text for storage
    let fullTextChunks: string[] | null = null;
    let shouldChunk = false;

    if (fullText && fullText.length > 1_000_000) {
      // Text is >1MB, chunk it
      console.log(`   📦 Chunking ${Math.round(fullText.length / 1024)}KB text into manageable pieces...`);
      fullTextChunks = chunkText(fullText, 50000); // 50KB chunks
      shouldChunk = true;
      console.log(`   ✂️  Created ${fullTextChunks.length} chunks`);
    }

    // POST to storage endpoint
    const response = await fetch(`${storageServiceUrl}/api/bills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: billId,
        congress: bill.congress,
        billType: bill.type,
        billNumber: bill.number,
        title: bill.title,
        summary: summary,
        fullText: shouldChunk ? null : fullText, // Only store full text if not chunked
        fullTextChunks: shouldChunk ? fullTextChunks : null, // Send chunks if text is large
        // Use detailed sponsor info from fetchBillDetails if available, fallback to basic bill data
        sponsorBioguideId: sponsor?.bioguideId || bill.sponsors?.[0]?.bioguideId || null,
        sponsorName: sponsor?.fullName || bill.sponsors?.[0]?.fullName || null,
        sponsorFirstName: sponsor?.firstName || null,
        sponsorLastName: sponsor?.lastName || null,
        sponsorParty: sponsor?.party || bill.sponsors?.[0]?.party || null,
        sponsorState: sponsor?.state || bill.sponsors?.[0]?.state || null,
        sponsorDistrict: sponsor?.district || null,
        introducedDate: bill.introducedDate || null,
        latestActionDate: bill.latestAction?.actionDate || null,
        latestActionText: bill.latestAction?.text || null,
        status: 'introduced',
        policyArea: policyArea,
        issueCategories: subjects.length > 0 ? subjects : [],
        cosponsorCount: cosponsorCount,
        cosponsors: cosponsors,
        actions: actions,
        congressGovUrl: bill.url || null,
      })
    });

    if (response.ok) {
      if (fetchFullText && fullText) {
        console.log(`   ✅ Stored ${billId}: ${Math.round(fullText.length / 1024)}KB text, ${cosponsorCount} cosponsors, ${actions.length} actions, ${subjects.length} subjects`);
      } else {
        console.log(`   ✅ Stored ${billId}`);
      }
      return true;
    } else {
      const error = await response.text();

      // Check if it's a duplicate error (UNIQUE constraint failed)
      if (error.includes('UNIQUE constraint') || error.includes('SQLITE_CONSTRAINT')) {
        console.log(`   ⏭️  Skipped ${billId} (already exists)`);
        return true; // Treat as success - bill already stored
      }

      console.warn(`⚠️  Failed to store ${billId}: ${error}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error storing bill:`, error);
    return false;
  }
}

/**
 * Fetch all bills from a single Congress
 */
async function fetchCongress(
  congress: number,
  options: FetchOptions
): Promise<{ fetched: number; stored: number }> {
  console.log(`\n📋 Fetching bills from Congress ${congress}...`);

  let offset = options.startOffset || 0;
  let totalFetched = 0;
  let totalStored = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      // Check if we've hit the limit
      if (options.maxBillsPerCongress && totalFetched >= options.maxBillsPerCongress) {
        console.log(`✅ Reached limit of ${options.maxBillsPerCongress} bills for Congress ${congress}`);
        break;
      }

      // Fetch batch
      console.log(`   Fetching bills ${offset}-${offset + options.batchSize}...`);
      const bills = await fetchRecentBills({
        congress,
        limit: options.batchSize,
        offset,
        sort: 'updateDate+desc'
      });

      if (bills.length === 0) {
        console.log(`✅ No more bills found for Congress ${congress}`);
        hasMore = false;
        break;
      }

      totalFetched += bills.length;

      // Store each bill
      for (const bill of bills) {
        const stored = await storeBill(bill, options.storageServiceUrl, options.fetchFullText);
        if (stored) totalStored++;
      }

      console.log(`   ✅ Fetched ${bills.length} bills, stored ${totalStored}/${totalFetched}`);

      // Check if we got fewer bills than requested (means we're at the end)
      if (bills.length < options.batchSize) {
        console.log(`✅ Reached end of bills for Congress ${congress}`);
        hasMore = false;
        break;
      }

      offset += options.batchSize;

      // Rate limit: Wait 1 second between requests
      await sleep(300);

    } catch (error: any) {
      console.error(`❌ Error fetching bills from Congress ${congress}:`, error.message);

      // If it's a rate limit error, wait longer
      if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        console.log('⏳ Rate limit hit, waiting 3 seconds...');
        await sleep(3000);
      } else {
        // For other errors, continue to next batch
        offset += options.batchSize;
        await sleep(300);
      }
    }
  }

  return { fetched: totalFetched, stored: totalStored };
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting automated bill fetching...\n');

  // Parse command line arguments
  const args = process.argv.slice(2);
  const flags = {
    congress: args.find(arg => arg.startsWith('--congress='))?.split('=')[1],
    all: args.includes('--all'),
    limit: args.find(arg => arg.startsWith('--limit='))?.split('=')[1],
    offset: args.find(arg => arg.startsWith('--offset='))?.split('=')[1],
    full: args.includes('--full'),
  };

  // Determine which Congresses to fetch
  let congresses: number[];
  if (flags.all) {
    // Fetch recent 5 Congresses (2017-2026)
    congresses = [119, 118, 117, 116, 115];
    console.log('📚 Fetching all recent Congresses: 115-119 (2017-2026)');
  } else if (flags.congress) {
    congresses = [parseInt(flags.congress, 10)];
    console.log(`📚 Fetching Congress ${flags.congress}`);
  } else {
    // Default: current Congress
    congresses = [119];
    console.log('📚 Fetching current Congress: 119 (2025-2026)');
  }

  const maxBillsPerCongress = flags.limit ? parseInt(flags.limit, 10) : undefined;
  if (maxBillsPerCongress) {
    console.log(`📊 Limit: ${maxBillsPerCongress} bills per Congress`);
  }

  if (flags.full) {
    console.log('📄 Full mode: Fetching ALL metadata (bill details, summary, full text, cosponsors, actions, subjects)');
    console.log('⚠️  VERY SLOW - 7 API calls per bill! ~18 seconds per bill with rate limiting');
  }

  // Get storage service URL
  const storageServiceUrl = process.env.BILL_STORAGE_SERVICE_URL;
  if (!storageServiceUrl) {
    console.error('❌ BILL_STORAGE_SERVICE_URL not set in environment');
    process.exit(1);
  }

  console.log(`🔗 Storage service: ${storageServiceUrl}\n`);

  const startOffset = flags.offset ? parseInt(flags.offset, 10) : 0;
  if (startOffset > 0) {
    console.log(`⏩ Starting from offset: ${startOffset}`);
  }

  const options: FetchOptions = {
    congresses,
    batchSize: 100,
    maxBillsPerCongress,
    startOffset,
    storageServiceUrl,
    fetchFullText: flags.full
  };

  // Fetch each Congress
  const startTime = Date.now();
  let grandTotalFetched = 0;
  let grandTotalStored = 0;

  for (const congress of congresses) {
    const { fetched, stored } = await fetchCongress(congress, options);
    grandTotalFetched += fetched;
    grandTotalStored += stored;
  }

  const duration = Math.round((Date.now() - startTime) / 1000);

  console.log('\n' + '='.repeat(60));
  console.log('✨ Bill fetching complete!');
  console.log('='.repeat(60));
  console.log(`📊 Total bills fetched: ${grandTotalFetched}`);
  console.log(`💾 Total bills stored: ${grandTotalStored}`);
  console.log(`⏱️  Duration: ${duration} seconds (${Math.round(duration / 60)} minutes)`);
  console.log(`⚡ Average: ${Math.round(grandTotalFetched / duration)} bills/second`);
  console.log('='.repeat(60));
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
