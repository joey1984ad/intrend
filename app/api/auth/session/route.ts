import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/db';
import { validateSessionToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ user: null, isAuthenticated: false });
    }
    
    const payload = validateSessionToken(sessionToken);
    if (!payload) {
      return NextResponse.json({ user: null, isAuthenticated: false });
    }
    
    const user = await getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ user: null, isAuthenticated: false });
    }
    
    return NextResponse.json({
      user: {
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        company: user.company,
        provider: payload.provider,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      },
      isAuthenticated: true
    });
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { user: null, isAuthenticated: false, error: 'Session validation failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
