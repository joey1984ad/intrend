#!/usr/bin/env node

/**
 * Test script that reproduces the "undefined" status error
 * This demonstrates what was happening before the fix
 */

const http = require('http');

console.log('🧪 Reproducing "undefined" status error...\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/proxy-image?url=https://fbcdn.net/test.jpg&token=test_token',
  method: 'GET'
};

const req = http.request(options, (res) => {
  // This is the WRONG way - using res.status instead of res.statusCode
  console.log(`📥 Response Status: ${res.status} ${res.statusText}`);
  console.log(`📊 Response Headers:`, res.headers);
  
  if (res.status === 200) {
    console.log(`✅ Image proxy successful!`);
  } else {
    console.log(`❌ Image proxy failed with status: ${res.status}`);
  }
  
  // Now show the CORRECT way
  console.log('\n🔧 CORRECT VERSION:');
  console.log(`📥 Response Status: ${res.statusCode} ${res.statusMessage}`);
  
  if (res.statusCode === 200) {
    console.log(`✅ Image proxy successful!`);
  } else {
    console.log(`❌ Image proxy failed with status: ${res.statusCode}`);
  }
});

req.on('error', (err) => {
  console.error('❌ Error:', err.message);
});

req.end();
