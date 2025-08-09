const fs = require('fs');
const path = require('path');

console.log('🔍 Facebook Connection Test\n');

// Read environment variables
const envPath = path.join(process.cwd(), '.env.local');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const FB_APP_ID = envVars.NEXT_PUBLIC_FACEBOOK_APP_ID;

console.log('📋 Quick Connection Test:');
console.log(`✅ App ID: ${FB_APP_ID ? FB_APP_ID.substring(0, 8) + '...' : '❌ Not found'}`);

if (!FB_APP_ID || FB_APP_ID === 'your-facebook-app-id') {
  console.log('\n❌ CONNECTION FAILURE: Facebook App ID not configured');
  console.log('\n🔧 To fix this:');
  console.log('1. Go to https://developers.facebook.com/');
  console.log('2. Create a new app or select an existing one');
  console.log('3. Copy the App ID from the app dashboard');
  console.log('4. Update your .env.local file:');
  console.log('   NEXT_PUBLIC_FACEBOOK_APP_ID=your_actual_app_id_here');
  console.log('\n📖 See FACEBOOK_APP_SETUP_QUICK.md for detailed instructions');
  process.exit(1);
}

console.log('\n✅ App ID is configured');

// Test the app ID format
if (!/^\d+$/.test(FB_APP_ID)) {
  console.log('\n❌ CONNECTION FAILURE: Invalid App ID format');
  console.log('App ID should be a numeric string');
  process.exit(1);
}

console.log('✅ App ID format is valid');

// Check if the app is likely to be in development mode
console.log('\n🔍 App Status Check:');
console.log('⚠️  Your app might be in development mode');
console.log('   - Facebook apps start in development mode');
console.log('   - Only developers and test users can access them');
console.log('   - You need to make the app public for general use');

console.log('\n🔧 To check/fix app status:');
console.log('1. Go to https://developers.facebook.com/');
console.log('2. Select your app');
console.log('3. Go to App Review → Make [App Name] public?');
console.log('4. Follow the review process');

console.log('\n🔍 Common Connection Issues:');
console.log('1. App in development mode (most common)');
console.log('2. Domain not configured in app settings');
console.log('3. Missing required permissions');
console.log('4. Access token expired');
console.log('5. Rate limiting');

console.log('\n🎯 Next Steps:');
console.log('1. Check browser console for specific error messages');
console.log('2. Verify app is in Live mode');
console.log('3. Test with a valid access token');
console.log('4. Check Facebook App Dashboard for errors');

console.log('\n📚 Helpful Resources:');
console.log('- FACEBOOK_QUICK_FIX.md: Quick troubleshooting');
console.log('- FACEBOOK_APP_SETUP_QUICK.md: Setup guide');
console.log('- FACEBOOK_PERMISSIONS_CHECKLIST.md: Required permissions');

console.log('\n✅ Connection test completed');
console.log('If you\'re still having issues, check the browser console for specific error messages'); 