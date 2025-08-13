const https = require('https');

// Test the exact API endpoint that n8n is calling
const testUrl = 'https://intrend-beta.vercel.app/api/facebook/creatives/6062911982689';
const testPayload = {
  accessToken: 'test-token',
  adAccountId: 'test-account',
  dateRange: 'last_30_days'
};

const postData = JSON.stringify(testPayload);

const options = {
  hostname: 'intrend-beta.vercel.app',
  port: 443,
  path: '/api/facebook/creatives/6062911982689',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing Fetch Creative API endpoint...');
console.log('URL:', testUrl);
console.log('Payload:', JSON.stringify(testPayload, null, 2));

const req = https.request(options, (res) => {
  console.log(`📡 Response Status: ${res.statusCode}`);
  console.log(`📡 Response Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Response Body:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Raw response:', data);
    }
    
    if (res.statusCode === 200) {
      console.log('✅ API endpoint is working!');
    } else {
      console.log('❌ API endpoint returned error status');
    }
  });
});

req.on('error', (e) => {
  console.error('🚨 Request Error:', e.message);
});

req.write(postData);
req.end();
