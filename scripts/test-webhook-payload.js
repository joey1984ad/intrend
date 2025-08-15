#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing Webhook Payload...\n');

const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
console.log('📋 Webhook URL:', webhookUrl);

if (!webhookUrl) {
  console.log('❌ NEXT_PUBLIC_N8N_WEBHOOK_URL not found');
  process.exit(1);
}

// Test payload that matches what your frontend should send
const testPayload = {
  creativeId: "6062911982689",
  adAccountId: "test_account_123",
  accessToken: "EAAFeUYIEjjkBPMGj0ZB3bBOOTezkYdbZCW10KZCMADV0FXUdqW9hxbRAWa1Qy9oyYqTIiyNzWZAdsi0xVJZAZBDxHCfMEeej2uTilZAbHrnZCgZC8MJmL4pv3S4eaMyX4DBdxtmRoHrN4wTqQcFE7TFjLeGRjvZAbduB3ENtKi3hyCZCvuzeSYV9JslkD6UG9V5l02EgUoYoy8ZCX8ZAyz7BW1cdN0ErWEYStMorcX2nHByIRtLzT",
  imageUrl: "https://example.com/test-image.jpg",
  creativeName: "Test Creative",
  creativeType: "IMAGE",
  timestamp: new Date().toISOString(),
  sessionId: "test_session_" + Date.now(),
  userAgent: "Node.js Test Script",
  pageUrl: "http://localhost:3000"
};

const https = require('https');

function testWebhookPayload() {
  return new Promise((resolve) => {
    console.log('🧪 Testing webhook with payload:');
    console.log('   Creative ID:', testPayload.creativeId);
    console.log('   Access Token:', testPayload.accessToken ? 'Present (' + testPayload.accessToken.substring(0, 10) + '...)' : 'MISSING');
    console.log('   Ad Account ID:', testPayload.adAccountId);
    
    const postData = JSON.stringify(testPayload);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 15000
    };
    
    const req = https.request(webhookUrl, options, (res) => {
      console.log(`\n   ✅ Response Status: ${res.statusCode} ${res.statusMessage}`);
      console.log('   📋 Response Headers:');
      
      Object.entries(res.headers).forEach(([key, value]) => {
        console.log(`      ${key}: ${value}`);
      });
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\n   📄 Response Body:');
        try {
          const jsonResponse = JSON.parse(data);
          console.log('      Parsed JSON:', JSON.stringify(jsonResponse, null, 2));
        } catch (error) {
          console.log('      Raw response:', data);
        }
        
        res.destroy();
        resolve({ 
          success: true, 
          statusCode: res.statusCode, 
          response: data,
          hasCors: !!res.headers['access-control-allow-origin']
        });
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
  console.log('🚀 Starting webhook payload test...\n');
  
  const result = await testWebhookPayload();
  
  console.log('\n📊 Test Results:');
  console.log('================');
  
  if (result.success) {
    if (result.statusCode === 200) {
      console.log('🎉 SUCCESS: Webhook responded successfully!');
      console.log('\n💡 This means:');
      console.log('   1. CORS is working (no more NetworkError)');
      console.log('   2. Webhook is receiving the payload');
      console.log('   3. The issue might be in the workflow logic');
      
      if (result.response) {
        console.log('\n🔍 Check the response above for any error messages');
        console.log('   Look for issues with access token or creative ID');
      }
      
    } else {
      console.log(`⚠️ Webhook responded with status: ${result.statusCode}`);
      console.log('\n🔍 Check the response body above for error details');
    }
    
    if (result.hasCors) {
      console.log('\n✅ CORS headers are present - browser requests should work!');
    } else {
      console.log('\n⚠️ CORS headers are missing - browser requests may still fail');
    }
    
  } else {
    console.log('❌ Test failed:', result.error);
    console.log('\n🔧 Possible issues:');
    console.log('   1. n8n server is not running');
    console.log('   2. Webhook endpoint is incorrect');
    console.log('   3. Network connectivity issues');
  }
  
  console.log('\n🌐 Next steps:');
  console.log('   1. Check n8n workflow execution logs');
  console.log('   2. Verify the access token is being passed correctly');
  console.log('   3. Test the AI analysis in your browser');
}

runTest().catch(console.error);
