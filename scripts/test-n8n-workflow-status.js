const https = require('https');

console.log('🔍 n8n Workflow Status Check');
console.log('============================');

// Test different possible webhook configurations
const testConfigs = [
  {
    name: 'Test Webhook (POST)',
    url: 'https://n8n-meh7.onrender.com/webhook-test/analyze-creatives',
    method: 'POST'
  },
  {
    name: 'Production Webhook (POST)',
    url: 'https://n8n-meh7.onrender.com/webhook/analyze-creatives',
    method: 'POST'
  },
  {
    name: 'Test Webhook (GET)',
    url: 'https://n8n-meh7.onrender.com/webhook-test/analyze-creatives',
    method: 'GET'
  },
  {
    name: 'Production Webhook (GET)',
    url: 'https://n8n-meh7.onrender.com/webhook/analyze-creatives',
    method: 'GET'
  },
  {
    name: 'Alternative Path (POST)',
    url: 'https://n8n-meh7.onrender.com/webhook-test/creative-analysis',
    method: 'POST'
  },
  {
    name: 'Alternative Path (GET)',
    url: 'https://n8n-meh7.onrender.com/webhook-test/creative-analysis',
    method: 'GET'
  }
];

// Test payload for POST requests
const testPayload = {
  creativeId: 'test_123',
  adAccountId: 'test_account',
  imageUrl: 'https://example.com/test-image.jpg',
  creativeName: 'Test Creative',
  creativeType: 'image',
  timestamp: new Date().toISOString()
};

function makeRequest(config) {
  return new Promise((resolve) => {
    console.log(`\n📡 Testing: ${config.name}`);
    console.log(`🔗 URL: ${config.url}`);
    console.log(`📤 Method: ${config.method}`);
    
    const url = new URL(config.url);
    const postData = config.method === 'POST' ? JSON.stringify(testPayload) : '';
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: config.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'n8n-test-script/1.0'
      },
      timeout: 15000
    };
    
    if (config.method === 'POST') {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ Status: ${res.statusCode} ${res.statusMessage}`);
        console.log(`📊 Headers:`, res.headers);
        
        if (res.statusCode === 200) {
          console.log(`🎉 SUCCESS! Webhook is working`);
          console.log(`📄 Response: ${data}`);
        } else if (res.statusCode === 404) {
          console.log(`❌ Webhook endpoint not found`);
          if (data) {
            try {
              const errorData = JSON.parse(data);
              console.log(`🔍 Error details:`, errorData);
              
              if (errorData.message) {
                if (errorData.message.includes('not registered')) {
                  console.log(`💡 Issue: Workflow is not active or webhook not configured`);
                } else if (errorData.message.includes('POST requests')) {
                  console.log(`💡 Issue: Webhook only accepts GET requests`);
                } else if (errorData.message.includes('Execute workflow')) {
                  console.log(`💡 Issue: Workflow is in test mode and needs activation`);
                }
              }
            } catch (e) {
              console.log(`📄 Raw error response: ${data}`);
            }
          }
        } else {
          console.log(`⚠️ Unexpected status: ${res.statusCode}`);
          console.log(`📄 Response: ${data}`);
        }
        
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Request error: ${err.message}`);
      if (err.code === 'ECONNREFUSED') {
        console.log(`💡 Issue: Connection refused - service may be down`);
      } else if (err.code === 'ENOTFOUND') {
        console.log(`💡 Issue: Host not found - check URL`);
      } else if (err.code === 'ETIMEDOUT') {
        console.log(`💡 Issue: Request timed out`);
      }
      resolve();
    });
    
    req.on('timeout', () => {
      console.log(`⏰ Request timed out after 15 seconds`);
      req.destroy();
      resolve();
    });
    
    if (config.method === 'POST') {
      req.write(postData);
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting comprehensive webhook tests...\n');
  
  for (const config of testConfigs) {
    await makeRequest(config);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🔧 Troubleshooting Summary:');
  console.log('==========================');
  console.log('1. If all endpoints return 404:');
  console.log('   - The n8n workflow is not active');
  console.log('   - The webhook trigger node is not configured');
  console.log('   - The workflow path is incorrect');
  console.log('');
  console.log('2. If some endpoints work with GET but not POST:');
  console.log('   - The webhook is configured for GET only');
  console.log('   - Need to update webhook trigger node settings');
  console.log('');
  console.log('3. If you get "Execute workflow" messages:');
  console.log('   - The workflow is in test mode');
  console.log('   - Click "Execute workflow" button in n8n editor');
  console.log('   - Or activate the workflow permanently');
  console.log('');
  console.log('4. Next steps:');
  console.log('   - Go to https://n8n-meh7.onrender.com');
  console.log('   - Open your AI Creative Analyzer workflow');
  console.log('   - Check webhook trigger node configuration');
  console.log('   - Ensure workflow is in "Active" mode');
  console.log('   - Verify webhook path matches exactly');
}

runTests().catch(console.error);
