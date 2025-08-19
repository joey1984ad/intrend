const https = require('https');

console.log('🧪 Testing webhook after workflow deployment...\n');

const webhookUrl = 'https://n8n-meh7.onrender.com/webhook/analyze-creatives';

// Test 1: Test request
console.log('📋 Test 1: Testing webhook with test data...');
const testPayload = {
  test: true,
  timestamp: new Date().toISOString(),
  message: 'Webhook connection test'
};

// Test 2: Real AI analysis request
console.log('📋 Test 2: Testing webhook with real AI analysis data...');
const realPayload = {
  creativeId: 'test_creative_123',
  adAccountId: 'act_test_account',
  accessToken: 'test_access_token_123',
  imageUrl: 'https://example.com/test-image.jpg',
  creativeName: 'Test Creative for AI Analysis',
  creativeType: 'image',
  dateRange: 'last_30_days',
  timestamp: new Date().toISOString(),
  test: false
};

async function testWebhook(payload, testName) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    
    const options = {
      hostname: 'n8n-meh7.onrender.com',
      port: 443,
      path: '/webhook/analyze-creatives',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'n8n-deployment-test/1.0'
      },
      timeout: 15000
    };

    console.log(`\n🚀 ${testName}: Sending request...`);
    console.log(`📦 Payload:`, JSON.stringify(payload, null, 2));

    const req = https.request(options, (res) => {
      console.log(`✅ ${testName}: Status: ${res.statusCode} ${res.statusMessage}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📄 ${testName}: Response body length: ${data.length} characters`);
        
        if (res.statusCode === 200) {
          if (data && data.trim()) {
            console.log(`🎉 ${testName}: SUCCESS! Webhook returned data`);
            try {
              const responseData = JSON.parse(data);
              console.log(`📋 ${testName}: Parsed response:`, JSON.stringify(responseData, null, 2));
              
              if (responseData.status === 'success' || responseData.success) {
                console.log(`✅ ${testName}: Test passed successfully`);
              } else if (responseData.error) {
                console.log(`⚠️ ${testName}: Test returned error:`, responseData.error);
              }
            } catch (e) {
              console.log(`❌ ${testName}: Response is not valid JSON:`, e.message);
            }
          } else {
            console.log(`❌ ${testName}: FAILED - Webhook returned empty response`);
            console.log(`🔧 This means the workflow is still not properly configured`);
          }
        } else {
          console.log(`❌ ${testName}: Unexpected status: ${res.statusCode}`);
        }
        
        resolve({ statusCode: res.statusCode, data: data });
      });
    });

    req.on('error', (err) => {
      console.error(`❌ ${testName}: Request error:`, err.message);
      reject(err);
    });

    req.on('timeout', () => {
      console.error(`⏰ ${testName}: Request timed out`);
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  try {
    console.log('🔍 Starting webhook tests...\n');
    
    // Test 1: Test request
    await testWebhook(testPayload, 'TEST REQUEST');
    
    // Wait a moment between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Real AI analysis request
    await testWebhook(realPayload, 'REAL AI ANALYSIS');
    
    console.log('\n📊 Test Summary:');
    console.log('✅ If both tests show "SUCCESS", your workflow is working!');
    console.log('❌ If any test shows "FAILED", check the deployment guide');
    console.log('🔧 If tests show errors, check the n8n workflow configuration');
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
}

// Run the tests
runTests();

