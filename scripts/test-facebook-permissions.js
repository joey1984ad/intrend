const fetch = require('node-fetch');

// Test Facebook permissions and identify missing ones
async function testFacebookPermissions() {
  console.log('🔍 Testing Facebook App Permissions...\n');

  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN_HERE';
  
  if (accessToken === 'YOUR_ACCESS_TOKEN_HERE') {
    console.log('❌ Please set FACEBOOK_ACCESS_TOKEN environment variable');
    console.log('   Example: FACEBOOK_ACCESS_TOKEN=your_token_here node scripts/test-facebook-permissions.js\n');
    return;
  }

  console.log('🔑 Access Token (first 20 chars):', accessToken.substring(0, 20) + '...\n');

  try {
    // Test 1: Basic user info
    console.log('📋 Test 1: Basic user info...');
    const meResponse = await fetch(
      'https://graph.facebook.com/v18.0/me?fields=id,name',
      {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );

    if (!meResponse.ok) {
      const errorData = await meResponse.json();
      console.log('❌ Basic user info failed:', errorData);
      return;
    }

    const meData = await meResponse.json();
    console.log('✅ Basic user info successful:', { userId: meData.id, userName: meData.name });

    // Test 2: Check permissions
    console.log('\n📋 Test 2: Checking permissions...');
    const permissionsResponse = await fetch(
      'https://graph.facebook.com/v18.0/me/permissions',
      {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );

    if (!permissionsResponse.ok) {
      const errorData = await permissionsResponse.json();
      console.log('❌ Permissions check failed:', errorData);
      return;
    }

    const permissionsData = await permissionsResponse.json();
    const permissions = permissionsData.data || [];
    
    console.log('📋 All permissions:');
    permissions.forEach(p => {
      const status = p.status === 'granted' ? '✅' : '❌';
      console.log(`  ${status} ${p.permission}: ${p.status}`);
    });

    // Check required permissions
    const requiredPermissions = ['ads_read', 'read_insights', 'pages_read_engagement'];
    const missingPermissions = requiredPermissions.filter(req => 
      !permissions.some(p => p.permission === req && p.status === 'granted')
    );

    if (missingPermissions.length > 0) {
      console.log('\n❌ Missing required permissions:', missingPermissions);
      console.log('\n🔧 To fix this:');
      console.log('1. Go to developers.facebook.com');
      console.log('2. Select your app');
      console.log('3. Go to App Review → Permissions and Features');
      console.log('4. Request these permissions:');
      missingPermissions.forEach(p => console.log(`   - ${p}`));
      console.log('5. Submit for review');
    } else {
      console.log('\n✅ All required permissions are granted!');
    }

    // Test 3: Try Ads Library access
    console.log('\n📋 Test 3: Testing Ads Library access...');
    const adsResponse = await fetch(
      'https://graph.facebook.com/v18.0/ads_archive?search_terms=test&limit=1',
      {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );

    if (!adsResponse.ok) {
      const errorData = await adsResponse.json();
      console.log('❌ Ads Library access failed:', {
        status: adsResponse.status,
        error: errorData.error?.message || 'Unknown error'
      });
      
      if (errorData.error?.code === 190) {
        console.log('\n🔧 This suggests a permissions issue. Please:');
        console.log('1. Check that your app is in "Live" mode');
        console.log('2. Ensure ads_read permission is granted');
        console.log('3. Verify the app is approved for business use');
      }
    } else {
      const adsData = await adsResponse.json();
      console.log('✅ Ads Library access successful!');
      console.log('📊 Found', adsData.data?.length || 0, 'ads');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testFacebookPermissions().catch(console.error);
