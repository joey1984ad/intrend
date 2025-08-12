const https = require('https');

console.log('🔍 Testing Working GET Webhook Endpoint');
console.log('======================================');

const webhookUrl = 'https://n8n-meh7.onrender.com/webhook/analyze-creatives';

console.log(`📡 Testing GET request to: ${webhookUrl}`);

const options = {
  hostname: 'n8n-meh7.onrender.com',
  port: 443,
  path: '/webhook/analyze-creatives',
  method: 'GET',
  headers: {
    'User-Agent': 'n8n-test-script/1.0',
    'Accept': 'application/json'
  },
  timeout: 15000
};

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
      console.log('\n🎉 SUCCESS! GET endpoint is working');
      
      if (data) {
        try {
          const responseData = JSON.parse(data);
          console.log('📋 Parsed response:', responseData);
          
          // Check if this is a webhook configuration response
          if (responseData.webhookId || responseData.methods || responseData.path) {
            console.log('💡 This appears to be a webhook configuration endpoint');
          }
        } catch (e) {
          console.log('📝 Response is not JSON, treating as plain text');
        }
      }
      
      console.log('\n🔧 Next Steps:');
      console.log('1. Go to https://n8n-meh7.onrender.com');
      console.log('2. Open your AI Creative Analyzer workflow');
      console.log('3. Find the webhook trigger node');
      console.log('4. Change HTTP method from GET to POST');
      console.log('5. Or add POST as an additional allowed method');
      console.log('6. Save and activate the workflow');
      
    } else {
      console.log('❌ Unexpected response status');
    }
  });
});

req.on('error', (err) => {
  console.error(`❌ Request error: ${err.message}`);
});

req.on('timeout', () => {
  console.error('⏰ Request timed out');
  req.destroy();
});

req.end();

console.log('⏳ Sending GET request...');
