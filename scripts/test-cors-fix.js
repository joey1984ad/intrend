#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing CORS Fix...\n');

const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
console.log('📋 Testing webhook URL:', webhookUrl);

if (!webhookUrl) {
  console.log('❌ NEXT_PUBLIC_N8N_WEBHOOK_URL not found');
  process.exit(1);
}

// Test payload similar to your app
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

function testCORS() {
  return new Promise((resolve) => {
    console.log('🧪 Testing POST request with CORS headers...');
    
    const postData = JSON.stringify(testPayload);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      },
      timeout: 10000
    };
    
    const req = https.request(webhookUrl, options, (res) => {
      console.log(`   ✅ Status: ${res.statusCode} ${res.statusMessage}`);
      console.log('   📋 Response Headers:');
      
      // Check for CORS headers
      const corsHeaders = {
        'access-control-allow-origin': res.headers['access-control-allow-origin'],
        'access-control-allow-methods': res.headers['access-control-allow-methods'],
        'access-control-allow-headers': res.headers['access-control-allow-headers'],
        'access-control-allow-credentials': res.headers['access-control-allow-credentials']
      };
      
      Object.entries(res.headers).forEach(([key, value]) => {
        console.log(`      ${key}: ${value}`);
      });
      
      // Check if CORS is properly configured
      const hasCorsOrigin = corsHeaders['access-control-allow-origin'];
      const hasCorsMethods = corsHeaders['access-control-allow-methods'];
      
      if (hasCorsOrigin && hasCorsMethods) {
        console.log('\n🎉 CORS is properly configured!');
        console.log('   ✅ Access-Control-Allow-Origin:', hasCorsOrigin);
        console.log('   ✅ Access-Control-Allow-Methods:', hasCorsMethods);
        console.log('\n💡 Your AI analysis should now work in the browser!');
      } else {
        console.log('\n⚠️ CORS headers are missing or incomplete');
        console.log('   ❌ Access-Control-Allow-Origin:', hasCorsOrigin || 'Missing');
        console.log('   ❌ Access-Control-Allow-Methods:', hasCorsMethods || 'Missing');
        console.log('\n🔧 You still need to configure CORS in n8n');
      }
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (data) {
          console.log('   📄 Response Body:', data);
        }
        res.destroy();
        resolve({ 
          success: true, 
          statusCode: res.statusCode, 
          hasCors: !!(hasCorsOrigin && hasCorsMethods),
          corsHeaders 
        });
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Error: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      console.log('   ⏰ Timeout after 10 seconds');
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });
    
    req.write(postData);
    req.end();
  });
}

async function runTest() {
  console.log('🚀 Starting CORS test...\n');
  
  const result = await testCORS();
  
  console.log('\n📊 Test Results:');
  console.log('================');
  
  if (result.success) {
    if (result.hasCors) {
      console.log('🎉 SUCCESS: CORS is properly configured!');
      console.log('\n🚀 Next steps:');
      console.log('   1. Test the AI analysis in your browser');
      console.log('   2. The "NetworkError" should be resolved');
      console.log('   3. Your webhook calls should work properly');
    } else {
      console.log('❌ CORS is still not configured properly');
      console.log('\n🔧 You need to:');
      console.log('   1. Configure CORS in n8n settings');
      console.log('   2. Add CORS headers to your webhook workflow');
      console.log('   3. Or set CORS environment variables');
    }
  } else {
    console.log('❌ Test failed:', result.error);
  }
  
  console.log('\n🌐 CORS Configuration Guide:');
  console.log('   1. Go to n8n settings and find CORS section');
  console.log('   2. Add your domains to allowed origins');
  console.log('   3. Allow POST method and required headers');
  console.log('   4. Test again with this script');
}

runTest().catch(console.error);
