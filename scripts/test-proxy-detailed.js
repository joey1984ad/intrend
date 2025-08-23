#!/usr/bin/env node

/**
 * Detailed test for proxy-image API to debug the HTML response issue
 */

const http = require('http');

console.log('🔍 Detailed proxy-image API test...');

// Test URLs - first one will fail (HTML), second one should work if it's a real image
const testUrls = [
  'https://fbcdn.net/test.jpg', // This will fail (HTML response)
  'https://scontent-lax3-2.xx.fbcdn.net/v/t45.1600-4/12345678_123456789012345_1234567890_n.jpg' // This might work
];

async function testUrl(url, index) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Test ${index + 1}: ${url}`);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/proxy-image?url=${encodeURIComponent(url)}&token=test_token`,
      method: 'GET',
      timeout: 10000
    };

    const req = http.request(options, (res) => {
      console.log(`📥 Status: ${res.statusCode}`);
      console.log(`📊 Content-Type: ${res.headers['content-type']}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📄 Response length: ${data.length}`);
        
        if (res.statusCode === 200 && res.headers['content-type']?.startsWith('image/')) {
          console.log('✅ SUCCESS: API returned an image!');
        } else if (res.statusCode === 422) {
          console.log('⚠️  EXPECTED: API properly rejected non-image content');
          try {
            const errorData = JSON.parse(data);
            console.log(`📄 Error details: ${errorData.details}`);
          } catch (e) {
            console.log('📄 Raw error response:', data);
          }
        } else {
          console.log('❌ UNEXPECTED: API returned unexpected response');
          if (data.length < 500) {
            console.log(`📄 Response: ${data}`);
          }
        }
        
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error('❌ Error:', err.message);
      resolve();
    });

    req.on('timeout', () => {
      console.error('⏰ Timeout');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  for (let i = 0; i < testUrls.length; i++) {
    await testUrl(testUrls[i], i);
  }
  
  console.log('\n🎉 Testing completed!');
  console.log('\n📋 Summary:');
  console.log('- Test 1 should return 422 (HTML content rejected)');
  console.log('- Test 2 might return 200 (if real image) or 422 (if URL expired)');
}

runTests().catch(console.error);
