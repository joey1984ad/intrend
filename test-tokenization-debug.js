#!/usr/bin/env node

/**
 * Debug Tokenization Issue
 * Tests why tokenizedUrl is returning null
 */

const https = require('https');

console.log('🔍 Debugging tokenizedUrl = null issue...\n');

// Test different scenarios
const testScenarios = [
  {
    name: 'Facebook CDN URL with Access Token',
    data: {
      imageUrl: 'https://scontent.xx.fbcdn.net/v/t1.0-9/123456_789.jpg',
      creativeId: 'test-123',
      adAccountId: 'test-account',
      accessToken: 'EAA1234567890abcdef'
    }
  },
  {
    name: 'Facebook CDN URL without Access Token',
    data: {
      imageUrl: 'https://scontent.xx.fbcdn.net/v/t1.0-9/123456_789.jpg',
      creativeId: 'test-123',
      adAccountId: 'test-account',
      accessToken: null
    }
  },
  {
    name: 'Non-Facebook URL',
    data: {
      imageUrl: 'https://example.com/test-image.jpg',
      creativeId: 'test-123',
      adAccountId: 'test-account',
      accessToken: 'EAA1234567890abcdef'
    }
  }
];

async function testScenario(scenario) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 Testing: ${scenario.name}`);
  console.log(`${'='.repeat(60)}`);
  
  console.log('📤 Input Data:');
  console.log(JSON.stringify(scenario.data, null, 2));

  const postData = JSON.stringify(scenario.data);
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/analyze-creatives',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    },
    rejectUnauthorized: false
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`\n📥 Response Status: ${res.statusCode}`);
          console.log('📥 Response Data:');
          console.log(JSON.stringify(result, null, 2));
          
          // Check tokenization specifically
          console.log('\n🔍 Tokenization Analysis:');
          console.log(`   tokenizedUrl: ${result.tokenizedUrl}`);
          console.log(`   tokenizationStatus: ${result.tokenizationStatus}`);
          console.log(`   tokenizationMethod: ${result.tokenizationMethod}`);
          console.log(`   tokenizationApplied: ${result.tokenizationApplied}`);
          console.log(`   tokenizationReason: ${result.tokenizationReason}`);
          
          if (result.tokenizationDetails) {
            console.log(`   tokenizationDetails.tokenizedUrl: ${result.tokenizationDetails.tokenizedUrl}`);
            console.log(`   tokenizationDetails.applied: ${result.tokenizationDetails.applied}`);
            console.log(`   tokenizationDetails.method: ${result.tokenizationDetails.method}`);
            console.log(`   tokenizationDetails.reason: ${result.tokenizationDetails.reason}`);
          }
          
          // Check for null values
          if (result.tokenizedUrl === null) {
            console.log('\n❌ ISSUE FOUND: tokenizedUrl is null!');
            console.log('   This should not happen - tokenizedUrl should always have a value');
          } else if (result.tokenizedUrl === undefined) {
            console.log('\n❌ ISSUE FOUND: tokenizedUrl is undefined!');
            console.log('   This should not happen - tokenizedUrl should always have a value');
          } else {
            console.log('\n✅ SUCCESS: tokenizedUrl has a value');
            console.log(`   Value: ${result.tokenizedUrl}`);
          }
          
          resolve(result);
          
        } catch (error) {
          console.error('❌ Failed to parse response:', error.message);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

async function runAllTests() {
  console.log('🚀 Running all test scenarios...\n');
  
  for (const scenario of testScenarios) {
    try {
      await testScenario(scenario);
      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Test failed:`, error.message);
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('🔍 Debug Analysis Complete');
  console.log('📝 Check the results above to identify why tokenizedUrl is null');
  console.log('💡 Common causes:');
  console.log('   - Missing or invalid imageUrl in webhook data');
  console.log('   - Error in tokenization logic');
  console.log('   - Response structure issue');
  console.log(`${'='.repeat(60)}`);
}

// Run the tests
runAllTests().catch(console.error);
