/**
 * Facebook Configuration Diagnostic Script
 * This script helps identify Facebook SDK configuration issues
 */

console.log('🔍 Facebook Configuration Diagnostic Tool');
console.log('==========================================\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('NEXT_PUBLIC_FACEBOOK_APP_ID:', process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'not set');

// Check if App ID is valid
const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
if (!appId || appId === 'your_facebook_app_id_here' || appId === 'your-facebook-app-id') {
  console.log('❌ ERROR: Facebook App ID is not properly configured!');
  console.log('   Please update your .env.local file with a valid Facebook App ID');
  console.log('   Follow the setup guide: FACEBOOK_APP_SETUP_QUICK.md');
  process.exit(1);
}

// Validate App ID format (Facebook App IDs are typically numeric)
if (!/^\d+$/.test(appId)) {
  console.log('⚠️  WARNING: Facebook App ID should be numeric');
  console.log('   Current App ID:', appId);
}

console.log('✅ Facebook App ID is configured');

// Check for common issues
console.log('\n🔍 Common Issues Check:');

// Check if running in development
if (process.env.NODE_ENV === 'development') {
  console.log('✅ Running in development mode');
  console.log('   Make sure your Facebook App is configured for localhost');
} else {
  console.log('✅ Running in production mode');
  console.log('   Make sure your Facebook App domain is configured correctly');
}

// Check for HTTPS in production
if (process.env.NODE_ENV === 'production') {
  console.log('⚠️  REMINDER: Facebook requires HTTPS in production');
}

// Check for popup blockers
console.log('\n🔍 Browser Configuration:');
console.log('   - Ensure popup blockers are disabled for this site');
console.log('   - Check browser console for any JavaScript errors');
console.log('   - Verify internet connection');

// Check Facebook App settings
console.log('\n🔍 Facebook App Settings to Verify:');
console.log('   1. App is in Development mode (for testing)');
console.log('   2. Valid OAuth redirect URIs are configured');
console.log('   3. Required permissions are added:');
console.log('      - ads_read');
console.log('      - ads_management');
console.log('      - read_insights');
console.log('      - pages_read_engagement');
console.log('      - business_management');
console.log('      - pages_show_list');

// Check for .env.local file
const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('✅ .env.local file exists');
} else {
  console.log('❌ .env.local file not found');
  console.log('   Please create .env.local with your Facebook App ID');
}

console.log('\n🎯 Next Steps:');
console.log('   1. If App ID is not configured, update .env.local');
console.log('   2. Restart the development server');
console.log('   3. Clear browser cache and cookies');
console.log('   4. Try connecting to Facebook again');

console.log('\n📚 Documentation:');
console.log('   - FACEBOOK_APP_SETUP_QUICK.md');
console.log('   - FACEBOOK_APP_SETUP.md');
console.log('   - https://developers.facebook.com/');

console.log('\n✅ Diagnostic complete!'); 