import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db';
import { createSessionToken, createSecureCookie } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/signup?error=oauth_error`
    );
  }

  if (!code) {
    console.error('No authorization code received from Google');
    return NextResponse.redirect(
      `${request.nextUrl.origin}/signup?error=no_auth_code`
    );
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
        redirect_uri: `${request.nextUrl.origin}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to exchange authorization code for token');
      return NextResponse.redirect(
        `${request.nextUrl.origin}/signup?error=token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Get user information from Google
    const userResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!userResponse.ok) {
      console.error('Failed to get user information from Google');
      return NextResponse.redirect(
        `${request.nextUrl.origin}/signup?error=user_info_failed`
      );
    }

    const userData = await userResponse.json();
    console.log('Google user data:', userData);

    // Check if user exists in database
    let user = await getUserByEmail(userData.email);
    
    if (!user) {
      // Create new user
      user = await createUser(
        userData.email,
        userData.given_name,
        userData.family_name,
        undefined // company
      );
      console.log('Created new user:', user);
    } else {
      console.log('User already exists:', user);
    }

    if (!user) {
      throw new Error('Failed to create or retrieve user');
    }

    // Create session token
    const sessionToken = createSessionToken({
      userId: user.id,
      email: user.email,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
      provider: 'google'
    });

    // Redirect to dashboard with session token
    const response = NextResponse.redirect(`${request.nextUrl.origin}/dashboard`);
    const cookie = createSecureCookie('session_token', sessionToken);
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    
    console.log('User authenticated successfully, redirecting to dashboard');
    return response;

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/signup?error=google_auth_failed`
    );
  }
}
