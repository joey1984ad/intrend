#!/usr/bin/env node

/**
 * Test script to verify the webhook endpoint works with required fields
 */

const http = require('http');

console.log('🧪 Testing Webhook Endpoint with Required Fields...\n');

const testData = {
  creativeId: 'test-123',
  adAccountId: 'test-account',
  imageUrl: 'https://example.com/test.jpg'
  // Note: accessToken is now optional
};

console.log('📤 Test Data:');
console.log(JSON.stringify(testData, null, 2));

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/analyze-creatives',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('\n🌐 Making request to:', `http://${options.hostname}:${options.port}${options.path}`);

const req = http.request(options, (res) => {
  console.log(`📥 Response Status: ${res.statusCode}`);
  console.log(`📥 Response Headers:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📥 Response Data:');
    console.log('Raw response length:', data.length);
    
    if (data.length === 0) {
      console.log('❌ Empty response received');
      return;
    }
    
    try {
      const result = JSON.parse(data);
      console.log('✅ Parsed JSON response:');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('\n🎉 SUCCESS: Webhook is working!');
      } else {
        console.log('\n⚠️ Response indicates an issue:', result.error || result.message);
      }
      
    } catch (error) {
      console.log('\n❌ Failed to parse JSON:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Request failed:', error.message);
  
  if (error.code === 'ECONNREFUSED') {
    console.log('\n💡 Connection refused! Make sure your server is running:');
    console.log('   npm run dev');
  }
});

req.write(postData);
req.end();

console.log('\n⏳ Waiting for response...');
