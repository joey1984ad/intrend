const http = require('http');

console.log('🔍 Testing Local Facebook Creatives API');
console.log('=====================================');

// Test your local API endpoint
const testUrl = 'http://localhost:3000/api/facebook/creatives/6062911982689';

console.log(`📡 Testing: ${testUrl}`);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/facebook/creatives/6062911982689',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'n8n-test-script/1.0'
  },
  timeout: 10000
};

const req = http.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode} ${res.statusMessage}`);
  console.log(`📊 Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📄 Response: ${data}`);
    
    if (res.statusCode === 200) {
      console.log('\n🎉 SUCCESS! Local API is working');
      console.log('💡 Use this URL in your n8n workflow:');
      console.log(`   http://localhost:3000/api/facebook/creatives/{{ $json.creativeId }}`);
    } else if (res.statusCode === 404) {
      console.log('\n❌ API endpoint not found');
      console.log('💡 Check if your Next.js app is running on port 3000');
      console.log('💡 Verify the API route exists: app/api/facebook/creatives/[creativeId]/route.ts');
    } else {
      console.log(`\n⚠️ Unexpected status: ${res.statusCode}`);
    }
  });
});

req.on('error', (err) => {
  console.log(`❌ Request error: ${err.message}`);
  if (err.code === 'ECONNREFUSED') {
    console.log('\n💡 Connection refused - Your Next.js app is not running');
    console.log('💡 Start your app with: npm run dev');
  } else if (err.code === 'ENOTFOUND') {
    console.log('\n💡 Host not found - Check your localhost configuration');
  }
});

req.on('timeout', () => {
  console.log('⏰ Request timed out after 10 seconds');
  req.destroy();
});

req.end();

console.log('⏳ Testing local API endpoint...');
