#!/usr/bin/env node

console.log('🧪 Quick Facebook SDK Test...\n');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

console.log('📋 Current App ID:', appId);

if (!appId || appId === 'your_facebook_app_id_here') {
  console.log('\n❌ ERROR: Facebook App ID not updated!');
  console.log('\n🔧 You need to:');
  console.log('1. Go to https://developers.facebook.com/');
  console.log('2. Copy your App ID');
  console.log('3. Open .env.local in your text editor');
  console.log('4. Replace "your_facebook_app_id_here" with your real App ID');
  console.log('5. Save the file and restart the server');
  process.exit(1);
}

console.log('✅ App ID looks good! Testing connection...');

// Test Facebook Graph API
fetch(`https://graph.facebook.com/v23.0/${appId}?fields=id,name`)
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      console.log(`❌ Facebook API Error: ${data.error.message}`);
      console.log('\n🔧 Possible issues:');
      console.log('- App ID is incorrect');
      console.log('- App is in development mode');
      console.log('- App is not active');
    } else {
      console.log(`✅ Facebook API OK: ${data.name} (${data.id})`);
      console.log('\n🎉 Your Facebook SDK should work now!');
      console.log('\n🌐 Next steps:');
      console.log('1. Open http://localhost:3000 in your browser');
      console.log('2. Click "Connect with Facebook"');
      console.log('3. The Facebook login should work');
    }
  })
  .catch(error => {
    console.log(`❌ Connection failed: ${error.message}`);
    console.log('\n🔧 Check your internet connection');
  });
