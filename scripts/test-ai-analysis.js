#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

console.log('🤖 Testing AI Analysis Configuration...\n');

// Test configuration
const testConfig = {
  webhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL,
  facebookToken: process.env.FACEBOOK_ACCESS_TOKEN,
  facebookAppId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
  databaseUrl: process.env.DATABASE_URL
};

console.log('📋 Configuration Check:');
console.log('=======================');

Object.entries(testConfig).forEach(([key, value]) => {
  if (value) {
    const displayValue = key.includes('TOKEN') || key.includes('SECRET') || key.includes('KEY') 
      ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
      : value;
    console.log(`✅ ${key}: ${displayValue}`);
  } else {
    console.log(`❌ ${key}: MISSING`);
  }
});

// Test n8n webhook connectivity
async function testWebhookConnectivity() {
  console.log('\n🌐 Testing n8n Webhook Connectivity...');
  console.log('=====================================');
  
  if (!testConfig.webhookUrl) {
    console.log('❌ No webhook URL configured');
    return false;
  }
  
  try {
    const url = new URL(testConfig.webhookUrl);
    console.log(`📍 Webhook URL: ${url.protocol}//${url.host}${url.pathname}`);
    
    const https = require('https');
    const http = require('http');
    const client = url.protocol === 'https:' ? https : http;
    
    return new Promise((resolve) => {
      const req = client.request(url, { 
        method: 'GET', 
        timeout: 10000,
        headers: {
          'User-Agent': 'AI-Analysis-Test/1.0'
        }
      }, (res) => {
        console.log(`✅ Server Response: ${res.statusCode} ${res.statusMessage}`);
        console.log(`📊 Headers: ${JSON.stringify(res.headers, null, 2)}`);
        resolve(true);
      });
      
      req.on('error', (error) => {
        if (error.code === 'ECONNREFUSED') {
          console.log('❌ Connection refused - n8n server not running');
          console.log('💡 Start n8n with: n8n start');
        } else {
          console.log('❌ Connection error:', error.message);
        }
        resolve(false);
      });
      
      req.on('timeout', () => {
        console.log('⏰ Connection timeout');
        resolve(false);
      });
      
      req.end();
    });
    
  } catch (error) {
    console.log('❌ Invalid webhook URL:', error.message);
    return false;
  }
}

// Test Facebook API connectivity
async function testFacebookAPI() {
  console.log('\n📘 Testing Facebook API Connectivity...');
  console.log('======================================');
  
  if (!testConfig.facebookToken) {
    console.log('❌ No Facebook access token configured');
    return false;
  }
  
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${testConfig.facebookToken}`);
    const data = await response.json();
    
    if (data.error) {
      console.log('❌ Facebook API error:', data.error.message);
      return false;
    } else {
      console.log('✅ Facebook API: Connected successfully');
      console.log(`👤 User: ${data.name} (ID: ${data.id})`);
      return true;
    }
  } catch (error) {
    console.log('❌ Facebook API test failed:', error.message);
    return false;
  }
}

// Test database connectivity
async function testDatabase() {
  console.log('\n🗄️ Testing Database Connectivity...');
  console.log('==================================');
  
  if (!testConfig.databaseUrl) {
    console.log('❌ No database URL configured');
    return false;
  }
  
  try {
    // Basic URL validation
    if (testConfig.databaseUrl.includes('postgres')) {
      console.log('✅ Database URL: PostgreSQL format detected');
      console.log('ℹ️ Note: Full connectivity test requires database server access');
      return true;
    } else {
      console.log('❌ Database URL: Invalid format');
      return false;
    }
  } catch (error) {
    console.log('❌ Database test failed:', error.message);
    return false;
  }
}

// Test AI analysis endpoint
async function testAIAnalysisEndpoint() {
  console.log('\n🤖 Testing AI Analysis Endpoint...');
  console.log('==================================');
  
  try {
    // Test the creative score endpoint
    const testUrl = 'http://localhost:3000/api/ai/creative-score';
    console.log(`📍 Testing endpoint: ${testUrl}`);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ AI Analysis endpoint: Responding');
      const data = await response.json();
      console.log(`📊 Response: ${JSON.stringify(data, null, 2)}`);
      return true;
    } else {
      console.log(`❌ AI Analysis endpoint: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Connection refused - Next.js server not running');
      console.log('💡 Start server with: npm run dev');
    } else {
      console.log('❌ AI Analysis endpoint test failed:', error.message);
    }
    return false;
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting AI Analysis Tests...\n');
  
  const results = {
    webhook: await testWebhookConnectivity(),
    facebook: await testFacebookAPI(),
    database: await testDatabase(),
    aiEndpoint: await testAIAnalysisEndpoint()
  };
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${test.toUpperCase()}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 SUCCESS: All tests passed!');
    console.log('🚀 Your AI analysis should work properly now.');
    console.log('\n💡 Next steps:');
    console.log('1. Open your app in the browser');
    console.log('2. Navigate to a creative with image type');
    console.log('3. Click the "🤖 AI Analysis" button');
    console.log('4. Check the debug panel for detailed logs');
  } else {
    console.log('\n⚠️ Some tests failed. Please fix the issues above.');
    console.log('\n🔧 Common fixes:');
    console.log('- Ensure n8n is running: n8n start');
    console.log('- Check your .env.local file has all required variables');
    console.log('- Restart your Next.js server: npm run dev');
    console.log('- Verify Facebook access token is valid');
  }
  
  console.log('\n✨ AI Analysis test complete!');
}

// Run the tests
runTests().catch(console.error);
