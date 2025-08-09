#!/usr/bin/env node

console.log('🧪 Testing Facebook API Setup...\n');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

console.log('📋 Environment Check:');
console.log(`   App ID: ${appId ? '✅ Configured' : '❌ Missing'}`);
console.log(`   Access Token: ${accessToken ? '✅ Configured' : '❌ Missing'}`);

if (!appId || appId === 'your_facebook_app_id_here') {
  console.log('\n❌ ERROR: Facebook App ID not configured!');
  console.log('\n🔧 To fix this:');
  console.log('1. Go to https://developers.facebook.com/');
  console.log('2. Select your app');
  console.log('3. Copy the App ID from the dashboard');
  console.log('4. Update .env.local with your real App ID');
  console.log('5. Replace "your_facebook_app_id_here" with your actual App ID');
  process.exit(1);
}

if (!accessToken) {
  console.log('\n⚠️ WARNING: Facebook Access Token not configured!');
  console.log('   This is needed for server-side API calls');
}

console.log('\n✅ Environment variables are configured correctly!');

// Test Facebook Graph API
async function testFacebookAPI() {
  console.log('\n🔍 Testing Facebook Graph API...');
  
  try {
    const response = await fetch(`https://graph.facebook.com/v23.0/${appId}?fields=id,name`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Facebook Graph API is accessible');
      console.log(`   App: ${data.name} (${data.id})`);
      return true;
    } else {
      console.log(`❌ Facebook Graph API error: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Facebook Graph API connection failed: ${error.message}`);
    return false;
  }
}

// Test development server on the correct port
async function testDevServer() {
  console.log('\n🔍 Testing development server...');
  
  // Test multiple ports since the server might be on different ports
  const ports = [3007, 3008, 3009, 3000, 3001];
  
  for (const port of ports) {
    try {
      console.log(`   Trying port ${port}...`);
      const response = await fetch(`http://localhost:${port}/api/facebook/health`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Development server is running on port ${port}`);
        console.log('   Health check response:', data);
        return { success: true, port };
      } else {
        console.log(`   Port ${port}: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`   Port ${port}: Connection failed`);
    }
  }
  
  console.log('❌ Development server not accessible on any port');
  console.log('\n🔧 To start the development server:');
  console.log('   npm run dev');
  return { success: false, port: null };
}

// Test Facebook SDK initialization
async function testFacebookSDK() {
  console.log('\n🔍 Testing Facebook SDK initialization...');
  
  try {
    // Test if the Facebook SDK script can be loaded
    const response = await fetch('https://connect.facebook.net/en_US/sdk.js');
    
    if (response.ok) {
      console.log('✅ Facebook SDK script is accessible');
      return true;
    } else {
      console.log(`❌ Facebook SDK script error: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Facebook SDK script connection failed: ${error.message}`);
    return false;
  }
}

// Main test function
async function runTests() {
  const facebookOK = await testFacebookAPI();
  const serverResult = await testDevServer();
  const sdkOK = await testFacebookSDK();
  
  console.log('\n📊 Test Results:');
  console.log('================');
  console.log(`Facebook API: ${facebookOK ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Dev Server: ${serverResult.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Facebook SDK: ${sdkOK ? '✅ PASS' : '❌ FAIL'}`);
  
  if (facebookOK && serverResult.success && sdkOK) {
    console.log('\n🎉 All tests passed! Your setup is ready.');
    console.log(`\n🌐 Next steps:`);
    console.log(`1. Open http://localhost:${serverResult.port} in your browser`);
    console.log('2. Click "Connect with Facebook"');
    console.log('3. Authorize the app');
    console.log('4. Your data should load successfully!');
  } else {
    console.log('\n⚠️ Some tests failed. Please fix the issues above.');
    
    if (!facebookOK) {
      console.log('\n🔧 Facebook API issues:');
      console.log('- Check if your App ID is correct');
      console.log('- Verify your Facebook App is active');
      console.log('- Ensure your App is not in development mode (if testing with non-developer accounts)');
    }
    
    if (!serverResult.success) {
      console.log('\n🔧 Development server issues:');
      console.log('- Make sure npm run dev is running');
      console.log('- Check if the correct port is being used');
      console.log('- Look for any error messages in the terminal');
    }
    
    if (!sdkOK) {
      console.log('\n🔧 Facebook SDK issues:');
      console.log('- Check your internet connection');
      console.log('- Verify Facebook CDN is accessible');
      console.log('- Check if any firewall is blocking the connection');
    }
  }
}

runTests().catch(console.error);
