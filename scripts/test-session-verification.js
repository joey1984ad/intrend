#!/usr/bin/env node

const https = require('https');

const sessionId = 'cs_test_a1ZHef4X47R3MjB0E6JCm8FY8WqqqlQ97gIeOCCotHLQ3gQlO6KhNYMzBg';

console.log('🔍 Testing session verification for:', sessionId);

const postData = JSON.stringify({ sessionId });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/subscription/verify',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('✅ Verification result:', result);
    } catch (error) {
      console.log('❌ Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.write(postData);
req.end();
