#!/usr/bin/env node

/**
 * Test Webhook Tokenization
 * This script tests your actual webhook endpoint to see what's happening
 */

const https = require('https');
const http = require('http');

console.log('🌐 Testing Webhook Tokenization...\n');

// Test data - modify these values to match your setup
const testData = {
  imageUrl: 'https://scontent.xx.fbcdn.net/v/t1.0-9/123456_789.jpg',
  creativeId: 'test-123',
  adAccountId: 'test-account',
  accessToken: 'EAA1234567890abcdef'
};

// Test different scenarios
const testScenarios = [
  {
    name: 'Facebook CDN URL with Access Token',
    data: { ...testData }
  },
  {
    name: 'Non-Facebook URL',
    data: { 
      ...testData, 
      imageUrl: 'https://example.com/test-image.jpg' 
    }
  },
  {
    name: 'Missing Access Token',
    data: { 
      ...testData, 
      accessToken: null 
    }
  },
  {
    name: 'Empty Image URL',
    data: { 
      ...testData, 
      imageUrl: '' 
    }
  }
];

// Function to make HTTP request
function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// Test function
async function testWebhook(scenario) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 Testing: ${scenario.name}`);
  console.log(`${'='.repeat(60)}`);
  
  console.log('📤 Sending data:', JSON.stringify(scenario.data, null, 2));
  
  try {
    // Test with localhost first
    const localUrl = 'http://localhost:3000/api/ai/creative-score';
    console.log(`\n🌐 Testing localhost: ${localUrl}`);
    
    const localResponse = await makeRequest(localUrl, scenario.data);
    
    console.log(`📥 Local Response Status: ${localResponse.statusCode}`);
    console.log('📥 Local Response Data:');
    console.log(JSON.stringify(localResponse.data, null, 2));
    
    // Check tokenization status
    if (localResponse.data) {
      console.log('\n🔍 Tokenization Analysis:');
      console.log(`   Tokenization Status: ${localResponse.data.tokenizationStatus || 'Not found'}`);
      console.log(`   Has Optimized Image: ${localResponse.data.hasOptimizedImage || 'Not found'}`);
      console.log(`   Optimization Status: ${localResponse.data.optimizationStatus || 'Not found'}`);
      console.log(`   Original Image URL: ${localResponse.data.originalImageUrl || 'Not found'}`);
      console.log(`   Optimized Image URL: ${localResponse.data.optimizedImageUrl || 'Not found'}`);
      
      if (localResponse.data.tokenizationDetails) {
        console.log(`   Tokenization Method: ${localResponse.data.tokenizationDetails.method}`);
        console.log(`   Tokenization Reason: ${localResponse.data.tokenizationDetails.reason}`);
        console.log(`   Tokenization Applied: ${localResponse.data.tokenizationDetails.applied}`);
      }
    }
    
  } catch (error) {
    console.error(`❌ Local test failed:`, error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure your local server is running on port 3000');
      console.log('💡 Run: npm run dev or npm start');
    }
  }
  
  // Also test with production URL if available
  try {
    const prodUrl = 'https://intrend-beta.vercel.app/api/ai/creative-score';
    console.log(`\n🌐 Testing production: ${prodUrl}`);
    
    const prodResponse = await makeRequest(prodUrl, scenario.data);
    
    console.log(`📥 Production Response Status: ${prodResponse.statusCode}`);
    console.log('📥 Production Response Data:');
    console.log(JSON.stringify(prodResponse.data, null, 2));
    
  } catch (error) {
    console.error(`❌ Production test failed:`, error.message);
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting webhook tests...\n');
  
  for (const scenario of testScenarios) {
    await testWebhook(scenario);
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ All tests completed!');
  console.log('\n📋 Summary of what to check:');
  console.log('1. Is your local server running? (npm run dev)');
  console.log('2. Are you getting proper responses?');
  console.log('3. Is tokenizationStatus showing correctly?');
  console.log('4. Are you getting optimized images?');
  console.log('\n🔧 If tokenization is still failing:');
  console.log('- Check the webhook payload in your N8N logs');
  console.log('- Verify the imageUrl field is being sent');
  console.log('- Check if accessToken is valid for Facebook URLs');
  console.log(`${'='.repeat(60)}`);
}

// Run the tests
runTests().catch(console.error);
