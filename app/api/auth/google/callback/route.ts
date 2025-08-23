import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/signup?error=google_auth_failed', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/signup?error=no_auth_code', request.url));
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      return NextResponse.redirect(new URL('/signup?error=token_exchange_failed', request.url));
    }

    // Get user info using access token
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      console.error('User info fetch failed:', userData);
      return NextResponse.redirect(new URL('/signup?error=user_info_failed', request.url));
    }

    // Here you would typically:
    // 1. Check if user exists in your database
    // 2. Create new user if they don't exist
    // 3. Set up session/token
    // 4. Redirect to dashboard

    console.log('Google user data:', userData);

    // For now, redirect to dashboard with user data in query params
    // In production, you'd set up proper session management
    return NextResponse.redirect(new URL(`/dashboard?google_user=${encodeURIComponent(JSON.stringify(userData))}`, request.url));

  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(new URL('/signup?error=oauth_error', request.url));
  }
}
