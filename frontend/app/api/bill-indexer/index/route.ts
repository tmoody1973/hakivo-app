import { NextRequest, NextResponse } from 'next/server';

const BILL_INDEXER_URL = process.env.NEXT_PUBLIC_BILL_INDEXER_URL || 'https://svc-01k9w79y36nzgnsndq5vadj25m.01k66gywmx8x4r0w31fdjjfekf.lmapp.run';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BILL_INDEXER_URL}/index`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error proxying to bill-indexer:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to proxy request' },
      { status: 500 }
    );
  }
}
