#!/usr/bin/env node

console.log('🔍 Checking Environment Variables...\n');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('📋 Environment Variables:');
console.log('========================');

const vars = [
  'NEXT_PUBLIC_FACEBOOK_APP_ID',
  'FACEBOOK_APP_SECRET',
  'FACEBOOK_ACCESS_TOKEN',
  'NEXT_PUBLIC_FACEBOOK_APP_DOMAIN'
];

vars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    if (value === 'your_facebook_app_id_here' || value === 'your_facebook_app_secret_here') {
      console.log(`❌ ${varName}: Using placeholder value`);
    } else {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    }
  } else {
    console.log(`❌ ${varName}: Not set`);
  }
});

console.log('\n🔧 To fix Facebook SDK connection:');
console.log('1. Get your Facebook App ID from https://developers.facebook.com/');
console.log('2. Update .env.local with your real App ID');
console.log('3. Replace "your_facebook_app_id_here" with your actual App ID');
console.log('4. Restart the development server');

// Check if we can access the Facebook Graph API
const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
if (appId && appId !== 'your_facebook_app_id_here') {
  console.log('\n🧪 Testing Facebook Graph API...');
  
  fetch(`https://graph.facebook.com/v23.0/${appId}?fields=id,name`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        console.log(`❌ Facebook API Error: ${data.error.message}`);
      } else {
        console.log(`✅ Facebook API OK: ${data.name} (${data.id})`);
      }
    })
    .catch(error => {
      console.log(`❌ Facebook API Connection Failed: ${error.message}`);
    });
} else {
  console.log('\n❌ Cannot test Facebook API - App ID not configured');
}
