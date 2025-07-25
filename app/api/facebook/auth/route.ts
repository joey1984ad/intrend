import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🟡 API: /api/facebook/auth called');
  try {
    const body = await request.json();
    console.log('🟡 API: Request body keys:', Object.keys(body));
    
    const { accessToken } = body;

    if (!accessToken) {
      console.log('❌ API: No access token provided');
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    console.log('🔍 API: Received access token length:', accessToken.length);
    console.log('🔍 API: Token starts with:', accessToken.substring(0, 20) + '...');

    // Use direct Graph API calls instead of Business SDK
    const baseUrl = 'https://graph.facebook.com/v23.0';

    // Get user info
    console.log('🟡 API: Fetching user info from Facebook...');
    const userResponse = await fetch(`${baseUrl}/me?access_token=${accessToken}`);
    const userData = await userResponse.json();
    console.log('🟡 API: User data response:', userData);

    if (userData.error) {
      console.error('❌ API: User API error:', userData.error);
      return NextResponse.json(
        { error: `Facebook API error: ${userData.error.message}` },
        { status: 400 }
      );
    }

    // Get user's ad accounts
    console.log('🟡 API: Fetching ad accounts from Facebook...');
    const adAccountsResponse = await fetch(
      `${baseUrl}/me/adaccounts?fields=id,name,account_status,currency,timezone_name&access_token=${accessToken}`
    );
    const adAccountsData = await adAccountsResponse.json();
    console.log('🟡 API: Ad accounts response:', adAccountsData);

    if (adAccountsData.error) {
      console.error('❌ API: Ad accounts API error:', adAccountsData.error);
      return NextResponse.json(
        { error: `Facebook API error: ${adAccountsData.error.message}` },
        { status: 400 }
      );
    }

    console.log('✅ API: Successfully processed request, returning response');
    return NextResponse.json({
      success: true,
      user: userData,
      adAccounts: adAccountsData.data || []
    });

  } catch (error: any) {
    console.error('❌ API: Facebook auth error:', error);
    
    return NextResponse.json(
      { error: 'Failed to authenticate with Facebook. Please check your permissions and try again.' },
      { status: 500 }
    );
  }
} 