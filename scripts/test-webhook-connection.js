#!/usr/bin/env node

/**
 * Test script to verify n8n webhook connection
 * Run this to diagnose network connectivity issues
 */

const https = require('https');
const http = require('http');

// Test configuration
const TEST_CONFIGS = [
  {
    name: 'Local n8n Webhook',
    url: 'http://localhost:5678/webhook-test/analyze-creatives',
    method: 'POST'
  },
  {
    name: 'n8n Health Check',
    url: 'http://localhost:5678/healthz',
    method: 'GET'
  },
  {
    name: 'Local Next.js App',
    url: 'http://localhost:3000',
    method: 'GET'
  }
];

async function testConnection(config) {
  return new Promise((resolve) => {
    const url = new URL(config.url);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: config.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Webhook-Test-Script/1.0'
      },
      timeout: 10000 // 10 second timeout
    };

    console.log(`\n🔍 Testing: ${config.name}`);
    console.log(`📍 URL: ${config.url}`);
    console.log(`⚡ Method: ${config.method}`);

    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ Status: ${res.statusCode} ${res.statusMessage}`);
        console.log(`📊 Response Size: ${data.length} bytes`);
        
        if (data.length > 0 && data.length < 500) {
          console.log(`📝 Response: ${data}`);
        } else if (data.length > 0) {
          console.log(`📝 Response: ${data.substring(0, 200)}...`);
        }
        
        resolve({ success: true, statusCode: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      if (error.code === 'ECONNREFUSED') {
        console.log(`💡 Hint: Service might not be running on ${url.hostname}:${url.port}`);
      } else if (error.code === 'ENOTFOUND') {
        console.log(`💡 Hint: Hostname ${url.hostname} not found`);
      } else if (error.code === 'ETIMEDOUT') {
        console.log(`💡 Hint: Request timed out - check firewall/network settings`);
      }
      resolve({ success: false, error: error.message });
    });

    req.on('timeout', () => {
      console.log(`⏰ Timeout: Request took longer than 10 seconds`);
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });

    // Send test payload for POST requests
    if (config.method === 'POST') {
      const testPayload = {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'Webhook connection test'
      };
      req.write(JSON.stringify(testPayload));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Webhook Connection Tests...\n');
  console.log('This script will test connectivity to your n8n webhook and related services.\n');

  const results = [];
  
  for (const config of TEST_CONFIGS) {
    const result = await testConnection(config);
    results.push({ ...config, result });
    
    // Add delay between tests
    if (config !== TEST_CONFIGS[TEST_CONFIGS.length - 1]) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  results.forEach(({ name, result }) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${name}`);
  });

  // Recommendations
  console.log('\n💡 Recommendations:');
  console.log('===================');
  
  const failedTests = results.filter(r => !r.result.success);
  
  if (failedTests.length === 0) {
    console.log('🎉 All tests passed! Your webhook should work correctly.');
  } else {
    failedTests.forEach(test => {
      if (test.name.includes('n8n')) {
        console.log(`🔧 For ${test.name}:`);
        console.log('   - Ensure n8n is running: npm run start (in n8n directory)');
        console.log('   - Check if workflow is activated in n8n UI');
        console.log('   - Verify webhook path: /webhook-test/analyze-creatives');
      }
      
      if (test.name.includes('Next.js')) {
        console.log(`🔧 For ${test.name}:`);
        console.log('   - Ensure Next.js dev server is running: npm run dev');
        console.log('   - Check if port 3000 is available');
      }
    });
    
    console.log('\n🌐 General Network Tips:');
    console.log('   - Check if localhost is accessible');
    console.log('   - Verify no firewall blocking localhost connections');
    console.log('   - Ensure both services are running on correct ports');
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testConnection, runTests };
