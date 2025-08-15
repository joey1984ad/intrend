#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Finding the correct n8n webhook URL...\n');

const baseUrl = 'https://n8n-meh7.onrender.com';
const commonPaths = [
  '/webhook/analyze-creatives',
  '/webhook/creative-analysis',
  '/webhook/ai-analysis',
  '/webhook/facebook-creatives',
  '/webhook/test',
  '/webhook',
  '/api/webhook/analyze-creatives',
  '/api/creative-analysis',
  '/api/ai-analysis'
];

const https = require('https');

async function testPath(path) {
  return new Promise((resolve) => {
    const url = baseUrl + path;
    console.log(`🧪 Testing: ${url}`);
    
    const req = https.request(url, { method: 'GET', timeout: 5000 }, (res) => {
      console.log(`   ✅ Status: ${res.statusCode} ${res.statusMessage}`);
      
      if (res.statusCode === 200) {
        console.log(`   🎯 FOUND WORKING ENDPOINT: ${path}`);
        console.log(`   📋 Headers:`, res.headers);
      } else if (res.statusCode === 404) {
        console.log(`   ❌ Not found`);
      } else {
        console.log(`   ⚠️ Status: ${res.statusCode}`);
      }
      
      res.destroy();
      resolve({ path, statusCode: res.statusCode, working: res.statusCode === 200 });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Error: ${error.message}`);
      resolve({ path, error: error.message, working: false });
    });
    
    req.on('timeout', () => {
      console.log(`   ⏰ Timeout`);
      req.destroy();
      resolve({ path, error: 'timeout', working: false });
    });
    
    req.end();
  });
}

async function findWorkingWebhook() {
  console.log('🚀 Testing common n8n webhook paths...\n');
  
  const results = [];
  
  for (const path of commonPaths) {
    const result = await testPath(path);
    results.push(result);
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 Results Summary:');
  console.log('===================');
  
  const workingEndpoints = results.filter(r => r.working);
  
  if (workingEndpoints.length > 0) {
    console.log('✅ Working endpoints found:');
    workingEndpoints.forEach(endpoint => {
      console.log(`   🌐 ${baseUrl}${endpoint.path}`);
    });
    
    console.log('\n💡 Update your .env.local file with the working URL:');
    console.log(`   NEXT_PUBLIC_N8N_WEBHOOK_URL=${baseUrl}${workingEndpoints[0].path}`);
    
  } else {
    console.log('❌ No working webhook endpoints found');
    console.log('\n🔧 Next steps:');
    console.log('   1. Check if n8n is running at:', baseUrl);
    console.log('   2. Verify the webhook workflow is active');
    console.log('   3. Check n8n webhook configuration');
    console.log('   4. Look for different webhook paths in your n8n instance');
  }
  
  console.log('\n🌐 Manual check:');
  console.log('   1. Go to:', baseUrl);
  console.log('   2. Look for "Webhooks" or "Triggers" section');
  console.log('   3. Find the correct webhook URL for creative analysis');
}

findWorkingWebhook().catch(console.error);
