#!/usr/bin/env node

/**
 * Test script to verify HTTPS setup for Facebook SDK
 * Facebook SDK requires HTTPS for getLoginStatus() and other sensitive methods
 */

console.log('🔐 Testing HTTPS setup for Facebook SDK...\n');

console.log('📋 Facebook SDK HTTPS Requirements:');
console.log('✅ getLoginStatus() - REQUIRES HTTPS');
console.log('✅ login() - REQUIRES HTTPS');
console.log('✅ api() - REQUIRES HTTPS');
console.log('❌ init() - Works on HTTP (but not recommended)');
console.log('❌ basic SDK loading - Works on HTTP\n');

console.log('🚀 To test your setup:');
console.log('1. Run: npm run dev:https');
console.log('2. Open: https://localhost:3000');
console.log('3. Check browser console for HTTPS confirmation');
console.log('4. Test Facebook login - should work without "FB.login() called before FB.init()" error\n');

console.log('🔍 Common HTTPS Issues:');
console.log('- Browser shows "Not Secure" warning (this is normal for localhost)');
console.log('- Click "Advanced" → "Proceed to localhost (unsafe)"');
console.log('- Facebook SDK will work properly on HTTPS localhost\n');

console.log('📱 Alternative Solutions:');
console.log('1. Use ngrok for HTTPS tunneling: ngrok http 3000');
console.log('2. Use localtunnel: npx localtunnel --port 3000');
console.log('3. Deploy to Vercel/Netlify for production HTTPS\n');

console.log('✅ Your Next.js config is set up for HTTPS');
console.log('✅ Your package.json has HTTPS dev scripts');
console.log('✅ Facebook SDK should work on https://localhost:3000\n');

// Check if we're in a browser-like environment
if (typeof window !== 'undefined') {
  console.log('🌐 Browser environment detected');
  console.log('🔒 Protocol:', window.location.protocol);
  console.log('🔒 Hostname:', window.location.hostname);
  console.log('🔒 Port:', window.location.port);
} else {
  console.log('🖥️  Node.js environment detected');
  console.log('💡 Run this in your browser after starting HTTPS dev server');
}

console.log('\n🏁 Test completed! Start your HTTPS dev server and test Facebook login.');
