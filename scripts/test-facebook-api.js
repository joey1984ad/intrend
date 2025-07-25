const bizSdk = require('facebook-nodejs-business-sdk');

// Test Facebook API integration
async function testFacebookAPI() {
  try {
    console.log('🔍 Testing Facebook API integration...');
    
    // You'll need to get a valid access token from Facebook Graph Explorer
    // Go to: https://developers.facebook.com/tools/explorer/
    // Select your app and get a user access token with ads_read permission
    
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    
    if (!accessToken) {
      console.log('❌ No Facebook access token found');
      console.log('📝 To get an access token:');
      console.log('1. Go to https://developers.facebook.com/tools/explorer/');
      console.log('2. Select your app');
      console.log('3. Add these permissions: ads_read, ads_management, read_insights');
      console.log('4. Generate access token');
      console.log('5. Set FACEBOOK_ACCESS_TOKEN in your .env file');
      return;
    }

    console.log('✅ Access token found');

    // Test different initialization methods
    let api;
    try {
      console.log('🔄 Trying direct initialization...');
      api = bizSdk.FacebookAdsApi.init(accessToken);
      console.log('✅ Direct initialization successful');
    } catch (initError) {
      console.log('⚠️  Direct init failed, trying getInstance method');
      try {
        bizSdk.FacebookAdsApi.init(accessToken);
        api = bizSdk.FacebookAdsApi.getInstance();
        console.log('✅ getInstance initialization successful');
      } catch (getInstanceError) {
        console.log('❌ Both initialization methods failed');
        console.error('Init error:', initError.message);
        console.error('GetInstance error:', getInstanceError.message);
        return;
      }
    }

    // Test 1: Get user info
    console.log('\n📊 Testing: Get user info...');
    try {
      const userResponse = await api.call(
        ['GET', '/me'],
        {},
        { access_token: accessToken }
      );
      console.log('✅ User info retrieved:', userResponse.data.name);
    } catch (error) {
      console.log('❌ Failed to get user info:', error.message);
      return;
    }

    // Test 2: Get ad accounts
    console.log('\n📊 Testing: Get ad accounts...');
    try {
      const adAccountsResponse = await api.call(
        ['GET', '/me/adaccounts'],
        {
          fields: ['id', 'name', 'account_status', 'currency', 'timezone_name']
        },
        { access_token: accessToken }
      );
      console.log('✅ Ad accounts retrieved:', adAccountsResponse.data.length, 'accounts');
      
      if (adAccountsResponse.data.length === 0) {
        console.log('⚠️  No ad accounts found. This might be because:');
        console.log('   - User has no ad accounts');
        console.log('   - Missing ads_management permission');
        console.log('   - Account not properly set up');
      }
    } catch (error) {
      console.log('❌ Failed to get ad accounts:', error.message);
      if (error.message.includes('permission')) {
        console.log('💡 This might be a permission issue. Check that you have:');
        console.log('   - ads_read permission');
        console.log('   - ads_management permission');
        console.log('   - read_insights permission');
      }
      return;
    }

    // Test 3: Get insights for first ad account (if available)
    if (adAccountsResponse.data.length > 0) {
      console.log('\n📊 Testing: Get insights for first ad account...');
      try {
        const insightsResponse = await api.call(
          ['GET', `/${adAccountsResponse.data[0].id}/insights`],
          {
            fields: ['impressions', 'clicks', 'spend', 'reach'],
            time_range: { since: 'last_30d', until: 'today' }
          },
          { access_token: accessToken }
        );
        console.log('✅ Insights retrieved:', insightsResponse.data.length, 'records');
      } catch (error) {
        console.log('❌ Failed to get insights:', error.message);
      }
    }

    console.log('\n🎉 Facebook API test completed successfully!');
    console.log('✅ Your app should now work with Facebook integration');

  } catch (error) {
    console.error('❌ Facebook API test failed:', error);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your access token is valid');
    console.log('2. Verify your app has the required permissions');
    console.log('3. Make sure your app is properly configured');
    console.log('4. Check if your account has ad accounts');
  }
}

// Run the test
testFacebookAPI(); 