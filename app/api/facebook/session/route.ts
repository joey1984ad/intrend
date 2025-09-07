import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Get the database URL from environment variables
const sql = neon(process.env.DATABASE_URL!);

interface FacebookSession {
  accessToken: string;
  userId: string;
  adAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 API: Getting Facebook session for user:', userId);

    const result = await sql`
      SELECT access_token, user_id, ad_account_id, created_at, updated_at
      FROM facebook_sessions
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC
      LIMIT 1
    `;

    if (!result || result.length === 0) {
      console.log('ℹ️ API: No Facebook session found for user:', userId);
      return NextResponse.json({
        success: true,
        hasSession: false,
        session: null
      });
    }

    const session = result[0];
    console.log('✅ API: Facebook session found for user:', userId);

    const facebookSession: FacebookSession = {
      accessToken: session.access_token,
      userId: session.user_id,
      adAccountId: session.ad_account_id,
      createdAt: session.created_at,
      updatedAt: session.updated_at
    };

    return NextResponse.json({
      success: true,
      hasSession: true,
      session: facebookSession
    });

  } catch (error) {
    console.error('❌ API: Error getting Facebook session:', error);
    return NextResponse.json(
      { error: 'Failed to get Facebook session' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, accessToken, adAccountId } = body;

    if (!userId || !accessToken) {
      return NextResponse.json(
        { error: 'User ID and access token are required' },
        { status: 400 }
      );
    }

    console.log('💾 API: Updating Facebook session for user:', userId);

    const result = await sql`
      UPDATE facebook_sessions
      SET access_token = ${accessToken},
          ad_account_id = ${adAccountId || null},
          updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING access_token, user_id, ad_account_id, created_at, updated_at
    `;

    if (result.rows.length === 0) {
      console.log('⚠️ API: No existing session to update for user:', userId);
      return NextResponse.json(
        { error: 'No existing session found to update' },
        { status: 404 }
      );
    }

    const session = result.rows[0];
    console.log('✅ API: Facebook session updated for user:', userId);

    const facebookSession: FacebookSession = {
      accessToken: session.access_token,
      userId: session.user_id,
      adAccountId: session.ad_account_id,
      createdAt: session.created_at,
      updatedAt: session.updated_at
    };

    return NextResponse.json({
      success: true,
      session: facebookSession
    });

  } catch (error) {
    console.error('❌ API: Error updating Facebook session:', error);
    return NextResponse.json(
      { error: 'Failed to update Facebook session' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('🗑️ API: Deleting Facebook session for user:', userId);

    const result = await sql`
      DELETE FROM facebook_sessions
      WHERE user_id = ${userId}
    `;

    console.log('✅ API: Facebook session deleted for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Facebook session deleted successfully'
    });

  } catch (error) {
    console.error('❌ API: Error deleting Facebook session:', error);
    return NextResponse.json(
      { error: 'Failed to delete Facebook session' },
      { status: 500 }
    );
  }
}
