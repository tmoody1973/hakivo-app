import { NextResponse } from 'next/server';

const BILL_INDEXER_URL = process.env.NEXT_PUBLIC_BILL_INDEXER_URL || 'https://svc-01k9w79y36nzgnsndq5vadj25m.01k66gywmx8x4r0w31fdjjfekf.lmapp.run';

export async function GET(
  request: Request,
  context: { params: Promise<{ key: string }> }
) {
  try {
    // In Next.js 15+, params is a Promise
    const params = await context.params;
    const key = params.key;

    console.log('Content API proxy - key:', key);

    // The key will be URL-encoded, so we need to decode it
    const decodedKey = decodeURIComponent(key);

    console.log('Content API proxy - decoded key:', decodedKey);
    console.log('Content API proxy - fetching from:', `${BILL_INDEXER_URL}/content/${encodeURIComponent(decodedKey)}`);

    const response = await fetch(`${BILL_INDEXER_URL}/content/${encodeURIComponent(decodedKey)}`, {
      method: 'GET',
    });

    console.log('Content API proxy - response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Content API proxy - error response:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch content', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error proxying to bill-indexer content:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get content', details: String(error) },
      { status: 500 }
    );
  }
}
