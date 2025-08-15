#!/usr/bin/env node

const fs = require('fs');
const https = require('https');
const http = require('http');

console.log('🔍 Debugging webhook data flow...\n');

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

// Test payload that matches exactly what your frontend sends
const testPayload = {
  creativeId: "test_creative_123",
  adAccountId: "act_test_456",
  accessToken: accessToken,
  imageUrl: "https://example.com/test-image.jpg",
  creativeName: "Test Creative",
  creativeType: "image",
  timestamp: new Date().toISOString()
};

console.log('\n📦 Test payload being sent:');
console.log(JSON.stringify(testPayload, null, 2));

console.log('\n🔍 Key fields check:');
console.log('✅ creativeId:', testPayload.creativeId);
console.log('✅ adAccountId:', testPayload.adAccountId);
console.log('✅ accessToken:', testPayload.accessToken ? `Present (${testPayload.accessToken.substring(0, 10)}...)` : 'MISSING');
console.log('✅ imageUrl:', testPayload.imageUrl);
console.log('✅ creativeName:', testPayload.creativeName);
console.log('✅ creativeType:', testPayload.creativeType);

// Determine if URL is HTTP or HTTPS
const isHttps = webhookUrl.startsWith('https://');
const client = isHttps ? https : http;

// Prepare the request
const postData = JSON.stringify(testPayload);
const url = new URL(webhookUrl);

const options = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'Debug-Script/1.0'
  }
};

console.log('\n🌐 Making request to:');
console.log('Hostname:', options.hostname);
console.log('Port:', options.port);
console.log('Path:', options.path);
console.log('Method:', options.method);

const req = client.request(options, (res) => {
  console.log('\n📡 Response received:');
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📄 Response body:');
    try {
      const parsed = JSON.parse(responseData);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Raw response:', responseData);
    }
    
    if (res.statusCode === 200) {
      console.log('\n✅ Webhook call successful!');
    } else {
      console.log('\n❌ Webhook call failed with status:', res.statusCode);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Request error:', error.message);
});

req.on('timeout', () => {
  console.error('\n⏰ Request timeout');
  req.destroy();
});

// Set timeout
req.setTimeout(30000);

// Send the request
req.write(postData);
req.end();

console.log('\n⏳ Request sent, waiting for response...');
