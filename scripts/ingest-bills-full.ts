#!/usr/bin/env tsx
/**
 * External script for full Congressional bill ingestion
 *
 * This script runs OUTSIDE the Cloudflare Worker to avoid timeout limitations.
 * It fetches complete bill data from Congress.gov API, then POSTs to Worker in small batches.
 *
 * Usage:
 *   npm run ingest:full -- --congress=118 --limit=10
 *   npm run ingest:full -- --congress=119 --limit=50
 */

const CONGRESS_API_KEY = 'LujQ9kIn44Remaqi1i3Q8fcbeK9nA6aAZ0coUa3C';
const API_BASE = 'https://api.congress.gov/v3';
const WORKER_URL = 'https://svc-01k9szwjxvq8db483fjmtf018p.01k66gywmx8x4r0w31fdjjfekf.lmapp.run/ingest/bills';
const BATCH_SIZE = 2; // Send 2 bills at a time to avoid Worker timeout

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface BillData {
  congress: number;
  type: string;
  number: string;
  title: string;
  url: string;
  latestAction?: {
    actionDate: string;
    text: string;
  };
  introducedDate?: string;
  sponsors?: Array<{
    bioguideId: string;
    fullName: string;
    party: string;
    state: string;
  }>;
}

async function fetchFromCongressApi(endpoint: string): Promise<any> {
  const url = `${API_BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${CONGRESS_API_KEY}&format=json`;
  console.log(`Fetching: ${endpoint}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchBills(congress: number, limit: number, offset: number = 0): Promise<BillData[]> {
  const data = await fetchFromCongressApi(`/bill/${congress}?limit=${limit}&offset=${offset}`);
  return data.bills || [];
}

async function fetchBillDetail(congress: number, type: string, number: string): Promise<any> {
  const data = await fetchFromCongressApi(`/bill/${congress}/${type.toLowerCase()}/${number}`);
  return data.bill || null;
}

async function fetchBillCosponsors(congress: number, type: string, number: string): Promise<any[]> {
  try {
    const data = await fetchFromCongressApi(`/bill/${congress}/${type.toLowerCase()}/${number}/cosponsors?limit=250`);
    return data.cosponsors || [];
  } catch (error: any) {
    console.log(`  ⚠️  Error fetching cosponsors for ${congress}-${type}-${number}:`, error.message);
    return [];
  }
}

async function fetchBillActions(congress: number, type: string, number: string): Promise<any[]> {
  try {
    const data = await fetchFromCongressApi(`/bill/${congress}/${type.toLowerCase()}/${number}/actions?limit=250`);
    return data.actions || [];
  } catch (error) {
    console.log(`  ⚠️  No actions for ${congress}-${type}-${number}`);
    return [];
  }
}

async function fetchBillSubjects(congress: number, type: string, number: string): Promise<any> {
  try {
    const data = await fetchFromCongressApi(`/bill/${congress}/${type.toLowerCase()}/${number}/subjects`);
    return data.subjects || null;
  } catch (error) {
    console.log(`  ⚠️  No subjects for ${congress}-${type}-${number}`);
    return null;
  }
}

async function fetchBillText(congress: number, type: string, number: string): Promise<string | null> {
  try {
    const textData = await fetchFromCongressApi(`/bill/${congress}/${type.toLowerCase()}/${number}/text`);

    if (textData.textVersions && textData.textVersions.length > 0) {
      for (const version of textData.textVersions) {
        if (version.formats) {
          const formattedText = version.formats.find((f: any) => f.type === 'Formatted Text');

          if (formattedText && formattedText.url) {
            console.log(`  📄 Fetching full text from: ${formattedText.url}`);
            const textResponse = await fetch(formattedText.url);
            if (textResponse.ok) {
              return await textResponse.text();
            }
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.log(`  ⚠️  No full text for ${congress}-${type}-${number}`);
    return null;
  }
}

async function sendBillsToWorker(bills: any[]): Promise<any> {
  try {
    console.log(`\n📤 Sending ${bills.length} bills to Worker...`);

    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bills }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Worker returned ${response.status}: ${text}`);
    }

    const result = await response.json();
    console.log(`✅ Worker response:`, result);
    return result;
  } catch (error: any) {
    console.error(`❌ Error sending to Worker:`, error.message);
    throw error;
  }
}

async function fetchCompleteBill(bill: BillData): Promise<any> {
  const billId = `${bill.congress}-${bill.type}-${bill.number}`;
  console.log(`\n🔄 Processing ${billId}: ${bill.title.substring(0, 60)}...`);

  // Fetch detailed bill information
  console.log(`  1️⃣  Fetching bill details...`);
  const detail = await fetchBillDetail(bill.congress, bill.type, bill.number);
  await sleep(1000);

  // Fetch cosponsors
  console.log(`  2️⃣  Fetching cosponsors...`);
  const cosponsors = await fetchBillCosponsors(bill.congress, bill.type, bill.number);
  console.log(`     Found ${cosponsors.length} cosponsors`);
  await sleep(1000);

  // Fetch actions
  console.log(`  3️⃣  Fetching actions...`);
  const actions = await fetchBillActions(bill.congress, bill.type, bill.number);
  console.log(`     Found ${actions.length} actions`);
  await sleep(1000);

  // Fetch subjects
  console.log(`  4️⃣  Fetching subjects...`);
  const subjects = await fetchBillSubjects(bill.congress, bill.type, bill.number);
  if (subjects) {
    console.log(`     Policy Area: ${subjects.policyArea?.name || 'None'}`);
    console.log(`     Legislative Subjects: ${subjects.legislativeSubjects?.length || 0}`);
  }
  await sleep(1000);

  // Fetch full text
  console.log(`  5️⃣  Fetching full text...`);
  const fullText = await fetchBillText(bill.congress, bill.type, bill.number);
  if (fullText) {
    console.log(`     Full text: ${fullText.length} characters`);
  }
  await sleep(1000);

  // Combine all data
  return {
    ...bill,
    detail,
    cosponsors,
    actions,
    subjects,
    fullText
  };
}

async function main() {
  const args = process.argv.slice(2);
  let congress = 119;
  let limit = 10;

  for (const arg of args) {
    if (arg.startsWith('--congress=')) {
      congress = parseInt(arg.split('=')[1] || '119');
    } else if (arg.startsWith('--limit=')) {
      limit = parseInt(arg.split('=')[1] || '10');
    }
  }

  console.log(`\n🚀 Starting full bill ingestion`);
  console.log(`   Congress: ${congress}`);
  console.log(`   Limit: ${limit}`);
  console.log(`   Batch Size: ${BATCH_SIZE}`);
  console.log(`   Mode: FULL SYNC (all data)\n`);

  // Fetch bills list
  console.log(`Fetching ${limit} bills from Congress ${congress}...`);
  const bills = await fetchBills(congress, limit);
  console.log(`Found ${bills.length} bills to process\n`);

  let processed = 0;
  let errors = 0;
  let batch: any[] = [];

  for (const bill of bills) {
    try {
      // Fetch complete bill data
      const completeBill = await fetchCompleteBill(bill);
      batch.push(completeBill);

      // Send batch when it reaches BATCH_SIZE
      if (batch.length >= BATCH_SIZE) {
        await sendBillsToWorker(batch);
        processed += batch.length;
        batch = [];
        await sleep(2000); // Wait between batches
      }
    } catch (error) {
      console.error(`❌ Error processing bill:`, error);
      errors++;
    }
  }

  // Send remaining bills
  if (batch.length > 0) {
    try {
      await sendBillsToWorker(batch);
      processed += batch.length;
    } catch (error) {
      console.error(`❌ Error sending final batch:`, error);
      errors++;
    }
  }

  console.log(`\n✅ Ingestion complete!`);
  console.log(`   Processed: ${processed}`);
  console.log(`   Errors: ${errors}\n`);
}

main().catch(console.error);
