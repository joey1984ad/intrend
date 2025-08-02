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

    // Get user info with timeout and retry logic
    console.log('🟡 API: Fetching user info from Facebook...');
    let userResponse;
    let userData;
    
    try {
      userResponse = await fetch(`${baseUrl}/me?access_token=${accessToken}`, {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!userResponse.ok) {
        throw new Error(`HTTP ${userResponse.status}: ${userResponse.statusText}`);
      }
      
      userData = await userResponse.json();
      console.log('🟡 API: User data response:', userData);
    } catch (userError) {
      console.error('❌ API: User API error:', userError);
      return NextResponse.json(
        { error: `Failed to fetch user info: ${userError instanceof Error ? userError.message : 'Unknown error'}` },
        { status: 400 }
      );
    }

    if (userData.error) {
      console.error('❌ API: User API error:', userData.error);
      return NextResponse.json(
        { error: `Facebook API error: ${userData.error.message}` },
        { status: 400 }
      );
    }

    // Get user's ad accounts with timeout and retry logic
    console.log('🟡 API: Fetching ad accounts from Facebook...');
    let adAccountsResponse;
    let adAccountsData;
    
    try {
      adAccountsResponse = await fetch(
        `${baseUrl}/me/adaccounts?fields=id,name,account_status,currency,timezone_name&access_token=${accessToken}`,
        {
          signal: AbortSignal.timeout(15000) // 15 second timeout
        }
      );
      
      if (!adAccountsResponse.ok) {
        throw new Error(`HTTP ${adAccountsResponse.status}: ${adAccountsResponse.statusText}`);
      }
      
      adAccountsData = await adAccountsResponse.json();
      console.log('🟡 API: Ad accounts response:', adAccountsData);
    } catch (adAccountsError) {
      console.error('❌ API: Ad accounts API error:', adAccountsError);
      return NextResponse.json(
        { error: `Failed to fetch ad accounts: ${adAccountsError instanceof Error ? adAccountsError.message : 'Unknown error'}` },
        { status: 400 }
      );
    }

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
    
    let errorMessage = 'Failed to authenticate with Facebook. Please check your permissions and try again.';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout. Please check your internet connection and try again.';
    } else if (error.message) {
      errorMessage = `Authentication error: ${error.message}`;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 