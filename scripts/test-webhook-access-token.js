#!/usr/bin/env node

const fs = require('fs');
const https = require('https');
const http = require('http');

console.log('🔍 Testing webhook access token functionality...\n');

// Read the Facebook access token from .env.local
let accessToken = '';
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const tokenMatch = envContent.match(/FACEBOOK_ACCESS_TOKEN=([^\s\n]+)/);
  if (tokenMatch) {
    accessToken = tokenMatch[1];
    console.log('✅ Facebook access token found');
  } else {
    console.log('❌ Facebook access token not found in .env.local');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Error reading .env.local:', error.message);
  process.exit(1);
}

// Read the webhook URL from .env.local
let webhookUrl = '';
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const webhookMatch = envContent.match(/NEXT_PUBLIC_N8N_WEBHOOK_URL=([^\s\n]+)/);
  if (webhookMatch) {
    webhookUrl = webhookMatch[1];
    console.log('✅ Webhook URL found:', webhookUrl);
  } else {
    console.log('❌ Webhook URL not found in .env.local');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Error reading .env.local:', error.message);
  process.exit(1);
}

// Test payload with access token
const testPayload = {
  creativeId: 'test_123',
  adAccountId: 'act_test_account',
  accessToken: accessToken, // ✅ This should now be included
  imageUrl: 'https://example.com/test-image.jpg',
  creativeName: 'Test Creative',
  creativeType: 'image',
  timestamp: new Date().toISOString(),
  test: false // Set to false to trigger actual AI analysis
};

console.log('📦 Test payload prepared:');
console.log('  - Creative ID:', testPayload.creativeId);
console.log('  - Ad Account ID:', testPayload.adAccountId);
console.log('  - Access Token:', testPayload.accessToken ? 'Present (' + testPayload.accessToken.substring(0, 10) + '...)' : 'MISSING');
console.log('  - Image URL:', testPayload.imageUrl);
console.log('  - Creative Name:', testPayload.creativeName);
console.log('  - Creative Type:', testPayload.creativeType);
console.log('  - Timestamp:', testPayload.timestamp);
console.log('  - Test Mode:', testPayload.test);

// Parse the webhook URL
const url = new URL(webhookUrl);
const isHttps = url.protocol === 'https:';
const client = isHttps ? https : http;

const postData = JSON.stringify(testPayload);

const options = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'webhook-test-script/1.0'
  },
  timeout: 30000
};

console.log(`\n📡 Sending test request to: ${webhookUrl}`);
console.log(`   Hostname: ${url.hostname}`);
console.log(`   Port: ${url.port || (isHttps ? 443 : 80)}`);
console.log(`   Path: ${url.pathname}`);
console.log(`   Protocol: ${url.protocol}`);

const req = client.request(options, (res) => {
  console.log(`\n📊 Response received:`);
  console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
  console.log(`   Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`\n📄 Response body:`);
    try {
      const responseData = JSON.parse(data);
      console.log(JSON.stringify(responseData, null, 2));
      
      if (responseData.error) {
        console.log('\n❌ Webhook returned an error:', responseData.error);
        if (responseData.message) {
          console.log('   Message:', responseData.message);
        }
        if (responseData.receivedData) {
          console.log('   Received data:', responseData.receivedData);
        }
      } else {
        console.log('\n✅ Webhook call successful!');
        console.log('   The access token was received and processed correctly.');
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
    
    console.log('\n🔍 Analysis:');
    if (res.statusCode === 200) {
      console.log('✅ HTTP 200 - Request successful');
      if (data.includes('access token') || data.includes('accessToken')) {
        console.log('✅ Response mentions access token - good sign');
      } else {
        console.log('⚠️ Response doesn\'t mention access token - check n8n logs');
      }
    } else if (res.statusCode === 400) {
      console.log('❌ HTTP 400 - Bad request (likely missing required fields)');
    } else if (res.statusCode === 401) {
      console.log('❌ HTTP 401 - Unauthorized (access token issue)');
    } else if (res.statusCode === 500) {
      console.log('❌ HTTP 500 - Server error (check n8n workflow)');
    } else {
      console.log(`⚠️ HTTP ${res.statusCode} - Unexpected status`);
    }
  });
});

req.on('error', (err) => {
  console.error('\n❌ Request error:', err.message);
  if (err.code === 'ECONNREFUSED') {
    console.log('   💡 This usually means n8n is not running.');
    console.log('   💡 Start n8n with: n8n start');
  } else if (err.code === 'ENOTFOUND') {
    console.log('   💡 This usually means the hostname cannot be resolved.');
    console.log('   💡 Check your webhook URL configuration.');
  }
});

req.on('timeout', () => {
  console.error('\n⏰ Request timed out (30s)');
  req.destroy();
});

req.write(postData);
req.end();

console.log('\n⏳ Waiting for response...');
