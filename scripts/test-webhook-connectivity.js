const https = require('https');
const http = require('http');

// Test the webhook URL from your .env.local
const webhookUrl = 'https://n8n-meh7.onrender.com/webhook-test/analyze-creatives';

console.log('🔍 Testing webhook connectivity...');
console.log(`📡 URL: ${webhookUrl}`);

// Parse the URL to determine protocol
const url = new URL(webhookUrl);
const isHttps = url.protocol === 'https:';

// Create test payload similar to what the app sends
const testPayload = {
  creativeId: 'test_123',
  adAccountId: 'test_account',
  imageUrl: 'https://example.com/test-image.jpg',
  creativeName: 'Test Creative',
  creativeType: 'image',
  timestamp: new Date().toISOString(),
  sessionId: 'test_session',
  userAgent: 'Test Script',
  pageUrl: 'http://localhost:3000'
};

const postData = JSON.stringify(testPayload);

// Set up request options
const options = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  },
  timeout: 10000 // 10 second timeout
};

console.log('📤 Sending test request...');

// Make the request
const client = isHttps ? https : http;
const req = client.request(options, (res) => {
  console.log(`✅ Response received: ${res.statusCode} ${res.statusMessage}`);
  console.log(`📊 Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📄 Response body:`, data);
    console.log('✅ Webhook test completed successfully');
  });
});

req.on('error', (err) => {
  console.error(`❌ Request error:`, err.message);
  console.error(`🔍 Error details:`, err);
});

req.on('timeout', () => {
  console.error('⏰ Request timed out after 10 seconds');
  req.destroy();
});

req.write(postData);
req.end();

console.log('⏳ Waiting for response...');

