const https = require('https');

console.log('🔍 Testing n8n webhook with real AI analysis data...\n');

const webhookUrl = 'https://n8n-meh7.onrender.com/webhook/analyze-creatives';
const realPayload = {
  creativeId: 'test_creative_123',
  adAccountId: 'act_test_account',
  accessToken: 'test_access_token_123',
  imageUrl: 'https://example.com/test-image.jpg',
  creativeName: 'Test Creative for AI Analysis',
  creativeType: 'image',
  dateRange: 'last_30_days',
  timestamp: new Date().toISOString(),
  test: false // This should trigger the real AI analysis workflow
};

console.log(`📡 Testing webhook: ${webhookUrl}`);
console.log(`📦 Real payload (not test):`, JSON.stringify(realPayload, null, 2));

const postData = JSON.stringify(realPayload);

const options = {
  hostname: 'n8n-meh7.onrender.com',
  port: 443,
  path: '/webhook/analyze-creatives',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'n8n-real-test-script/1.0'
  },
  timeout: 30000 // 30 second timeout for AI analysis
};

console.log('\n🚀 Sending real AI analysis request...');
console.log('⚠️ This should trigger the full AI analysis workflow, not just a test response');

const req = https.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode} ${res.statusMessage}`);
  console.log(`📊 Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📄 Response body length: ${data.length} characters`);
    console.log(`📄 Response body: "${data}"`);
    
    if (res.statusCode === 200) {
      if (data && data.trim()) {
        console.log('\n🎉 SUCCESS! Webhook returned data');
        try {
          const responseData = JSON.parse(data);
          console.log('📋 Parsed response:', JSON.stringify(responseData, null, 2));
          
          if (responseData.success) {
            console.log('✅ AI analysis completed successfully');
          } else if (responseData.error) {
            console.log('❌ AI analysis failed:', responseData.error);
          }
        } catch (e) {
          console.log('❌ Response is not valid JSON:', e.message);
          console.log('📝 Raw response:', data);
        }
      } else {
        console.log('\n❌ PROBLEM: Webhook returned empty response');
        console.log('🔧 This suggests the n8n workflow is not properly configured');
        console.log('📋 Check your n8n workflow:');
        console.log('   1. Is the workflow ACTIVE?');
        console.log('   2. Is the webhook response node properly configured?');
        console.log('   3. Are all workflow nodes connected correctly?');
      }
    } else {
      console.log(`❌ Unexpected response status: ${res.statusCode}`);
      console.log('📝 Response body:', data);
    }
  });
});

req.on('error', (err) => {
  console.error(`❌ Request error: ${err.message}`);
  console.log('\n🔧 Troubleshooting tips:');
  console.log('1. Check if n8n service is running on render.com');
  console.log('2. Verify the webhook path is correct');
  console.log('3. Check if the service is accessible from your location');
});

req.on('timeout', () => {
  console.error('⏰ Request timed out after 30 seconds');
  console.log('⚠️ AI analysis might be taking longer than expected');
  req.destroy();
});

req.write(postData);
req.end();

console.log('\n⏳ Waiting for AI analysis response...');
console.log('⏱️ This may take 10-30 seconds for full AI analysis');
