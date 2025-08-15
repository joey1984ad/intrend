#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing Webhook CORS and Connectivity...\n');

const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
console.log('📋 Webhook URL:', webhookUrl);

if (!webhookUrl) {
  console.log('❌ NEXT_PUBLIC_N8N_WEBHOOK_URL not found in environment');
  process.exit(1);
}

// Test different HTTP methods and headers
const tests = [
  {
    name: 'GET Request (Basic)',
    method: 'GET',
    headers: {},
    body: null
  },
  {
    name: 'POST Request (JSON)',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ test: 'data', timestamp: new Date().toISOString() })
  },
  {
    name: 'POST Request (Form Data)',
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'test=data&timestamp=' + new Date().toISOString()
  }
];

const https = require('https');
const http = require('http');

async function testWebhook(test) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Testing: ${test.name}`);
    console.log('   Method:', test.method);
    console.log('   Headers:', test.headers);
    
    try {
      const url = new URL(webhookUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const options = {
        method: test.method,
        headers: test.headers,
        timeout: 10000
      };
      
      const req = client.request(url, options, (res) => {
        console.log(`   ✅ Status: ${res.statusCode} ${res.statusMessage}`);
        console.log('   📋 Response Headers:');
        
        Object.entries(res.headers).forEach(([key, value]) => {
          console.log(`      ${key}: ${value}`);
        });
        
        // Check for CORS headers
        const corsHeaders = ['access-control-allow-origin', 'access-control-allow-methods', 'access-control-allow-headers'];
        const hasCors = corsHeaders.some(header => res.headers[header]);
        
        if (hasCors) {
          console.log('   🌐 CORS Headers: Present');
        } else {
          console.log('   ⚠️ CORS Headers: Missing (This is likely the issue)');
        }
        
        res.destroy();
        resolve({ success: true, statusCode: res.statusCode, hasCors });
      });
      
      req.on('error', (error) => {
        console.log(`   ❌ Error: ${error.message}`);
        if (error.code === 'ECONNREFUSED') {
          console.log('   💡 Server connection refused - n8n may not be running');
        } else if (error.code === 'ENOTFOUND') {
          console.log('   💡 Domain not found - check the webhook URL');
        }
        resolve({ success: false, error: error.message });
      });
      
      req.on('timeout', () => {
        console.log('   ⏰ Timeout after 10 seconds');
        req.destroy();
        resolve({ success: false, error: 'timeout' });
      });
      
      if (test.body) {
        req.write(test.body);
      }
      
      req.end();
      
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
      resolve({ success: false, error: error.message });
    }
  });
}

async function runTests() {
  console.log('🚀 Starting webhook tests...\n');
  
  let allTestsPassed = true;
  
  for (const test of tests) {
    const result = await testWebhook(test);
    if (!result.success) {
      allTestsPassed = false;
    }
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  if (allTestsPassed) {
    console.log('✅ All tests completed successfully');
    console.log('\n💡 If you still get CORS errors in the browser:');
    console.log('   1. The n8n server needs CORS configuration');
    console.log('   2. Add your domain to allowed origins in n8n');
    console.log('   3. Or use a CORS proxy for testing');
  } else {
    console.log('❌ Some tests failed');
    console.log('\n🔧 To fix CORS issues:');
    console.log('   1. Configure n8n to allow your domain');
    console.log('   2. Add CORS headers to the webhook endpoint');
    console.log('   3. Check if n8n server is running properly');
  }
  
  console.log('\n🌐 Next steps:');
  console.log('   1. Check n8n CORS settings');
  console.log('   2. Verify webhook endpoint configuration');
  console.log('   3. Test with Postman or similar tool');
}

runTests().catch(console.error);
