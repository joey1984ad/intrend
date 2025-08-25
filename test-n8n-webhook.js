#!/usr/bin/env node

/**
 * Test N8N Webhook for Tokenization Issues
 * This script helps identify why "Tokenization: ❌ Not Applied" appears
 */

console.log('🔍 Testing N8N Webhook Tokenization...\n');

// Test the actual webhook endpoint
async function testWebhook() {
  const testData = {
    imageUrl: 'https://scontent.xx.fbcdn.net/v/t1.0-9/123456_789.jpg',
    creativeId: 'test-123',
    adAccountId: 'test-account',
    accessToken: 'EAA1234567890abcdef'
  };

  console.log('📤 Test Data:');
  console.log(JSON.stringify(testData, null, 2));

  try {
    // Test localhost first
    console.log('\n🌐 Testing localhost:3000...');
    const response = await fetch('http://localhost:3000/api/ai/creative-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log(`📥 Response Status: ${response.status}`);
    console.log('📥 Response Data:');
    console.log(JSON.stringify(result, null, 2));

    // Analyze the response
    console.log('\n🔍 Response Analysis:');
    console.log(`   Success: ${result.success || 'Not found'}`);
    console.log(`   Tokenization Status: ${result.tokenizationStatus || 'Not found'}`);
    console.log(`   Has Optimized Image: ${result.hasOptimizedImage || 'Not found'}`);
    console.log(`   Optimization Status: ${result.optimizationStatus || 'Not found'}`);
    
    if (result.tokenizationDetails) {
      console.log(`   Tokenization Method: ${result.tokenizationDetails.method}`);
      console.log(`   Tokenization Reason: ${result.tokenizationDetails.reason}`);
      console.log(`   Tokenization Applied: ${result.tokenizationDetails.applied}`);
    }

    // Check for errors
    if (result.error) {
      console.log(`   ❌ Error: ${result.error}`);
      console.log(`   ❌ Error Message: ${result.errorMessage || 'No message'}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused! Make sure your server is running:');
      console.log('   npm run dev');
      console.log('   or');
      console.log('   npm start');
    }
  }
}

// Also test with a simple curl command
console.log('💻 Alternative: Test with curl command:');
console.log('curl -X POST http://localhost:3000/api/ai/creative-score \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{');
console.log('    "imageUrl": "https://scontent.xx.fbcdn.net/v/t1.0-9/123456_789.jpg",');
console.log('    "creativeId": "test-123",');
console.log('    "adAccountId": "test-account",');
console.log('    "accessToken": "EAA1234567890abcdef"');
console.log('  }\'');

console.log('\n🔍 Common Issues to Check:');
console.log('1. Is your local server running? (npm run dev)');
console.log('2. Is the webhook endpoint correct? (/api/ai/creative-score)');
console.log('3. Are you getting a response from the webhook?');
console.log('4. What does the response look like?');
console.log('5. Are there any error messages?');

console.log('\n🚀 Running test...\n');

// Run the test
testWebhook().catch(console.error);
