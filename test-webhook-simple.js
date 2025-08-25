#!/usr/bin/env node

/**
 * Simple Webhook Test
 * Tests the new /api/analyze-creatives endpoint
 */

const http = require('http');

console.log('🧪 Testing New Webhook Endpoint...\n');

const testData = {
  imageUrl: 'https://scontent.xx.fbcdn.net/v/t1.0-9/123456_789.jpg',
  creativeId: 'test-123',
  adAccountId: 'test-account',
  accessToken: 'EAA1234567890abcdef'
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
    try {
      const result = JSON.parse(data);
      console.log('\n📥 Response Data:');
      console.log(JSON.stringify(result, null, 2));
      
      // Analyze the response
      console.log('\n🔍 Response Analysis:');
      console.log(`   Success: ${result.success || 'Not found'}`);
      console.log(`   Tokenization Status: ${result.tokenizationStatus || 'Not found'}`);
      console.log(`   Has Optimized Image: ${result.hasOptimizedImage || 'Not found'}`);
      console.log(`   Optimization Status: ${result.optimizationStatus || 'Not found'}`);
      console.log(`   Score: ${result.score || 'Not found'}/10`);
      
      if (result.tokenizationDetails) {
        console.log(`   Tokenization Method: ${result.tokenizationDetails.method}`);
        console.log(`   Tokenization Reason: ${result.tokenizationDetails.reason}`);
        console.log(`   Tokenization Applied: ${result.tokenizationDetails.applied}`);
      }
      
      // Check if tokenization is working
      if (result.tokenizationStatus === 'success') {
        console.log('\n✅ SUCCESS: Tokenization is working!');
        console.log(`   Original URL: ${result.originalImageUrl}`);
        console.log(`   Tokenized URL: ${result.tokenizedUrl}`);
      } else if (result.tokenizationStatus === 'skipped') {
        console.log('\nℹ️ INFO: Tokenization was skipped (this is normal for non-Facebook URLs)');
        console.log(`   Reason: ${result.tokenizationReason}`);
      } else {
        console.log('\n❌ ISSUE: Tokenization status unclear');
        console.log(`   Status: ${result.tokenizationStatus}`);
      }
      
    } catch (error) {
      console.log('\n📥 Raw Response (not JSON):');
      console.log(data);
      console.error('\n❌ Failed to parse JSON:', error.message);
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
