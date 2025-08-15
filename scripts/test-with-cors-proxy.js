#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing webhook with CORS proxy...\n');

const originalUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
const corsProxyUrl = 'https://cors-anywhere.herokuapp.com/';

console.log('📋 Original URL:', originalUrl);
console.log('🌐 CORS Proxy URL:', corsProxyUrl);
console.log('🔗 Proxied URL:', corsProxyUrl + originalUrl);

// Test data similar to what your app would send
const testPayload = {
  creativeId: "6062911982689",
  adAccountId: "test_account",
  accessToken: "test_token",
  imageUrl: "https://example.com/test-image.jpg",
  creativeName: "Test Creative",
  creativeType: "IMAGE",
  timestamp: new Date().toISOString(),
  sessionId: "test_session",
  userAgent: "Node.js Test Script",
  pageUrl: "http://localhost:3000"
};

const https = require('https');

function testWithProxy() {
  return new Promise((resolve) => {
    const url = corsProxyUrl + originalUrl;
    console.log(`\n🧪 Testing with CORS proxy: ${url}`);
    
    const postData = JSON.stringify(testPayload);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Origin': 'http://localhost:3000'
      },
      timeout: 15000
    };
    
    const req = https.request(url, options, (res) => {
      console.log(`   ✅ Status: ${res.statusCode} ${res.statusMessage}`);
      console.log('   📋 Response Headers:');
      
      Object.entries(res.headers).forEach(([key, value]) => {
        console.log(`      ${key}: ${value}`);
      });
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('   📄 Response Body:', data);
        res.destroy();
        resolve({ success: true, statusCode: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Error: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      console.log('   ⏰ Timeout after 15 seconds');
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });
    
    req.write(postData);
    req.end();
  });
}

async function runTest() {
  console.log('🚀 Starting CORS proxy test...\n');
  
  const result = await testWithProxy();
  
  console.log('\n📊 Test Results:');
  console.log('================');
  
  if (result.success) {
    console.log('✅ CORS proxy test successful!');
    console.log('\n💡 This confirms the webhook works, but CORS is blocking browser requests');
    console.log('\n🔧 To fix permanently:');
    console.log('   1. Configure n8n to allow your domain');
    console.log('   2. Add CORS headers to the webhook endpoint');
    console.log('   3. Or use a CORS proxy in production (not recommended)');
    
    console.log('\n🌐 Temporary solution for development:');
    console.log('   Use a CORS proxy like: https://cors-anywhere.herokuapp.com/');
    console.log('   Or configure your n8n instance properly');
    
  } else {
    console.log('❌ CORS proxy test failed');
    console.log('   Error:', result.error);
    console.log('\n🔧 The issue might be:');
    console.log('   1. n8n server is not responding properly');
    console.log('   2. Webhook endpoint is misconfigured');
    console.log('   3. Authentication issues');
  }
}

runTest().catch(console.error);
