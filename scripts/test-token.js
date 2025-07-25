const bizSdk = require('facebook-nodejs-business-sdk');
require('dotenv').config();

async function testToken() {
  const token = process.env.FACEBOOK_ACCESS_TOKEN;
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
  
  console.log('🔍 Testing Facebook Configuration...');
  console.log('App ID:', appId);
  console.log('Token found:', !!token);
  console.log('Token length:', token ? token.length : 'undefined');
  console.log('Token starts with:', token ? token.substring(0, 20) + '...' : 'undefined');
  
  if (!token) {
    console.log('❌ No token found in .env file');
    return;
  }
  
  try {
    // Test with direct API call first
    console.log('\n🔄 Testing direct API call...');
    const response = await fetch(`https://graph.facebook.com/v23.0/me?access_token=${token}`);
    const data = await response.json();
    
    if (data.error) {
      console.log('❌ Direct API call failed:', data.error);
    } else {
      console.log('✅ Direct API call successful:', data.name);
    }
    
    // Test with Business SDK
    console.log('\n🔄 Testing Business SDK...');
    const api = bizSdk.FacebookAdsApi.init(token);
    
    const user = await api.call(
      ['GET', '/me'],
      {},
      { access_token: token }
    );
    
    console.log('✅ Business SDK successful:', user.data.name);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testToken(); 