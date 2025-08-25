const fetch = require('node-fetch');

// Test Facebook Ads Library API access
async function testFacebookAdsLibrary() {
  console.log('🧪 Testing Facebook Ads Library API...\n');

  // You'll need to replace this with a real access token for testing
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN_HERE';
  
  if (accessToken === 'YOUR_ACCESS_TOKEN_HERE') {
    console.log('❌ Please set FACEBOOK_ACCESS_TOKEN environment variable or update the script');
    console.log('   Example: FACEBOOK_ACCESS_TOKEN=your_token_here node scripts/test-facebook-ads-library.js\n');
    return;
  }

  console.log('🔑 Access Token (first 20 chars):', accessToken.substring(0, 20) + '...\n');

  try {
    // Test 1: Validate access token
    console.log('📋 Test 1: Validating access token...');
    const meResponse = await fetch(
      'https://graph.facebook.com/v18.0/me?fields=id,name,permissions',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!meResponse.ok) {
      const errorData = await meResponse.json();
      console.log('❌ Token validation failed:', errorData);
      return;
    }

    const meData = await meResponse.json();
    console.log('✅ Token validation successful:', { 
      userId: meData.id, 
      userName: meData.name 
    });

    // Check permissions
    const permissions = meData.permissions?.data || [];
    const hasAdsRead = permissions.some((p: any) => p.permission === 'ads_read' && p.status === 'granted');
    const hasReadInsights = permissions.some((p: any) => p.permission === 'read_insights' && p.status === 'granted');
    
    console.log('🔐 Permissions:', { hasAdsRead, hasReadInsights });
    console.log('📋 All permissions:', permissions.map((p: any) => `${p.permission}: ${p.status}`));
    console.log('');

    if (!hasAdsRead) {
      console.log('❌ Missing required permission: ads_read');
      console.log('   Please reconnect your Facebook account with the necessary permissions\n');
      return;
    }

    // Test 2: Test Ads Library API with simple search
    console.log('📋 Test 2: Testing Ads Library API...');
    const searchParams = new URLSearchParams({
      search_terms: 'facebook ads',
      limit: '5',
      offset: '0'
    });

    const adsResponse = await fetch(
      `https://graph.facebook.com/v18.0/ads_archive?${searchParams}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!adsResponse.ok) {
      const errorData = await adsResponse.json();
      console.log('❌ Ads Library API failed:', {
        status: adsResponse.status,
        statusText: adsResponse.statusText,
        error: errorData
      });
      
      // Check response headers for more details
      console.log('📋 Response headers:', Object.fromEntries(adsResponse.headers.entries()));
      return;
    }

    const adsData = await adsResponse.json();
    console.log('✅ Ads Library API successful!');
    console.log('📊 Found', adsData.data?.length || 0, 'ads');
    console.log('📊 Total count:', adsData.summary?.total_count || 'Unknown');
    
    if (adsData.data && adsData.data.length > 0) {
      console.log('📋 Sample ad:', {
        id: adsData.data[0].id,
        pageName: adsData.data[0].page_name,
        adType: adsData.data[0].ad_type
      });
    }

    console.log('\n🎉 All tests passed! The Facebook Ads Library API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testFacebookAdsLibrary().catch(console.error);
