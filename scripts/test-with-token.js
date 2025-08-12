const http = require('http');
const fs = require('fs');

console.log('🔍 Testing Local Facebook Creatives API with Token');
console.log('================================================');

// Read the Facebook access token from .env.local
let accessToken = '';
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const tokenMatch = envContent.match(/FACEBOOK_ACCESS_TOKEN=([^\s\n]+)/);
  if (tokenMatch) {
    accessToken = tokenMatch[1];
    console.log('✅ Facebook access token found');
  } else {
    console.log('❌ Facebook access token not found in .env.local');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Error reading .env.local:', error.message);
  process.exit(1);
}

// Test your local API endpoint with the token
const testUrl = `http://localhost:3000/api/facebook/creatives/6062911982689?access_token=${accessToken}`;

console.log(`📡 Testing: ${testUrl.replace(accessToken, '***TOKEN_HIDDEN***')}`);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: `/api/facebook/creatives/6062911982689?access_token=${accessToken}`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'n8n-test-script/1.0'
  },
  timeout: 15000
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
      console.log('\n🎉 SUCCESS! Local API is working with token');
      console.log('💡 Use this URL in your n8n workflow:');
      console.log(`   http://localhost:3000/api/facebook/creatives/{{ $json.creativeId }}`);
      console.log('\n💡 And add this header:');
      console.log(`   Authorization: Bearer {{ $json.facebookAccessToken }}`);
    } else if (res.statusCode === 401) {
      console.log('\n❌ Unauthorized - Check your Facebook access token');
    } else if (res.statusCode === 404) {
      console.log('\n❌ API endpoint not found');
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
  }
});

req.on('timeout', () => {
  console.log('⏰ Request timed out after 15 seconds');
  req.destroy();
});

req.end();

console.log('⏳ Testing local API endpoint with Facebook token...');
