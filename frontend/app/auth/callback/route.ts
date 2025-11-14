import { NextRequest, NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';
import jwt from 'jsonwebtoken';

const workos = new WorkOS(process.env.WORKOS_API_KEY);
const JWT_SECRET = process.env.JWT_SECRET || 'hakivo-jwt-secret-change-in-production';
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;

/**
 * OAuth Callback Route - Direct WorkOS API
 *
 * This route handles the redirect back from WorkOS after OAuth authentication.
 * Uses direct WorkOS API to exchange code for user profile, then creates a
 * custom JWT session cookie.
 *
 * Flow:
 * 1. Exchange authorization code for user profile
 * 2. Sync user to hakivo-db (create or update)
 * 3. Create JWT session token
 * 4. Set HTTP-only session cookie
 * 5. Redirect to dashboard or onboarding based on completion status
 *
 * Query Parameters:
 * - code: Authorization code from WorkOS OAuth
 * - state: CSRF token (optional)
 *
 * Example: GET /auth/callback?code=abc123&state=xyz789
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    console.error('No authorization code provided');
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  try {
    // Use auth-service callback to create/update user in database
    // Auth service handles: code exchange, user creation, and session management
    const authCallbackResponse = await fetch(`${AUTH_SERVICE_URL}/auth/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!authCallbackResponse.ok) {
      console.error('Failed to process auth callback:', await authCallbackResponse.text());
      return NextResponse.redirect(new URL('/login?error=sync_failed', request.url));
    }

    const authData = await authCallbackResponse.json();
    console.log('User authenticated via auth-service:', authData.user);

    // Use the session token from auth-service
    const sessionToken = authData.session.token;

    // Redirect based on onboarding status
    const redirectUrl = authData.user.onboardingCompleted
      ? new URL('/dashboard', request.url)
      : new URL('/onboarding', request.url);

    // Create response with redirect and set session cookie
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set('hakivo_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
}
