#!/usr/bin/env node

/**
 * Simple test for proxy-image API
 */

const http = require('http');

console.log('🧪 Testing proxy-image API...');

// Test the API endpoint
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/proxy-image?url=https://fbcdn.net/test.jpg&token=test_token',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`📥 Status: ${res.statusCode}`);
  console.log(`📊 Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📄 Response length: ${data.length}`);
    if (data.length < 1000) {
      console.log(`📄 Response preview: ${data.substring(0, 500)}`);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Error:', err.message);
});

req.on('timeout', () => {
  console.error('⏰ Timeout');
  req.destroy();
});

req.end();
