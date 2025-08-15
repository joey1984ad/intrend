const https = require('https');

console.log('🔍 Testing remote n8n webhook connectivity...\n');

const webhookUrl = 'https://n8n-meh7.onrender.com/webhook/analyze-creatives';
const testPayload = {
  test: true,
  timestamp: new Date().toISOString(),
  message: 'Webhook connection test',
  webhookUrl: webhookUrl,
  executionMode: 'production'
};

console.log(`📡 Testing webhook: ${webhookUrl}`);
console.log(`📦 Test payload:`, JSON.stringify(testPayload, null, 2));

const postData = JSON.stringify(testPayload);

const options = {
  hostname: 'n8n-meh7.onrender.com',
  port: 443,
  path: '/webhook/analyze-creatives',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'n8n-test-script/1.0'
  },
  timeout: 15000
};

console.log('\n🚀 Sending test request...');

const req = https.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode} ${res.statusMessage}`);
  console.log(`📊 Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📄 Response body: ${data}`);
    
    if (res.statusCode === 200) {
      console.log('\n🎉 SUCCESS! Remote webhook is working');
      try {
        const responseData = JSON.parse(data);
        console.log('📋 Parsed response:', responseData);
        
        if (responseData.test) {
          console.log('✅ Test request was properly handled');
        }
      } catch (e) {
        console.log('📝 Response is not JSON, but webhook is responding');
      }
    } else {
      console.log(`❌ Unexpected response status: ${res.statusCode}`);
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
  console.error('⏰ Request timed out');
  req.destroy();
});

req.write(postData);
req.end();

console.log('\n⏳ Waiting for response...');
