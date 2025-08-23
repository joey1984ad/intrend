#!/usr/bin/env node

/**
 * Test different error scenarios for the image proxy
 */

const http = require('http');

const testCases = [
  {
    name: 'Missing URL parameter',
    url: 'http://localhost:3000/api/proxy-image?token=test_token',
    expectedStatus: 400
  },
  {
    name: 'Missing token parameter', 
    url: 'http://localhost:3000/api/proxy-image?url=https://fbcdn.net/test.jpg',
    expectedStatus: 400
  },
  {
    name: 'Non-Facebook URL',
    url: 'http://localhost:3000/api/proxy-image?url=https://example.com/test.jpg&token=test_token',
    expectedStatus: 400
  },
  {
    name: 'Invalid Facebook URL (HTML response)',
    url: 'http://localhost:3000/api/proxy-image?url=https://fbcdn.net/test.jpg&token=test_token',
    expectedStatus: 422
  }
];

async function testScenario(testCase, index) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Test ${index + 1}: ${testCase.name}`);
    console.log(`🔗 URL: ${testCase.url}`);
    
    const urlObj = new URL(testCase.url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 3000,
      path: urlObj.pathname + urlObj.search,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      console.log(`📥 Status: ${res.statusCode} ${res.statusMessage}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === testCase.expectedStatus) {
          console.log(`✅ PASS: Got expected status ${testCase.expectedStatus}`);
        } else {
          console.log(`❌ FAIL: Expected ${testCase.expectedStatus}, got ${res.statusCode}`);
        }
        
        // Show error details for JSON responses
        if (res.headers['content-type']?.includes('application/json')) {
          try {
            const errorData = JSON.parse(data);
            console.log(`📄 Error: ${errorData.error}`);
            if (errorData.details) {
              console.log(`📄 Details: ${errorData.details}`);
            }
          } catch (e) {
            console.log('📄 Raw response:', data.substring(0, 200));
          }
        }
        
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error('❌ Network Error:', err.message);
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Image Proxy Error Scenarios\n');
  
  for (let i = 0; i < testCases.length; i++) {
    await testScenario(testCases[i], i);
  }
  
  console.log('\n🎉 All tests completed!');
}

runTests().catch(console.error);
