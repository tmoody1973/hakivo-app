import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const USER_PROFILE_SERVICE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Complete onboarding - Mark user's onboarding as completed
 *
 * POST /api/profile/onboarding
 *
 * Sets onboarding_completed = true in database
 */
export async function POST(request: NextRequest) {
  try {
    // Get session token from cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('hakivo_session');

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      );
    }

    // Forward to user-profile service with authorization
    const response = await fetch(`${USER_PROFILE_SERVICE_URL}/profile/onboarding`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionCookie.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to complete onboarding:', errorText);
      return NextResponse.json(
        { error: 'Failed to complete onboarding' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
