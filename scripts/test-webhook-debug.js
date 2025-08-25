#!/usr/bin/env node

/**
 * Webhook Debugging Script
 * Tests the analyze-creatives endpoint to identify JSON response issues
 */

const https = require('https');
const http = require('http');

// Configuration
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/analyze-creatives';
const IS_HTTPS = WEBHOOK_URL.startsWith('https://');

// Test data
const testPayload = {
  test: true,
  webhookUrl: WEBHOOK_URL,
  executionMode: 'debug',
  accessToken: 'test-token-123',
  creativeId: 'test-creative-456',
  adAccountId: 'test-account-789',
  imageUrl: 'https://example.com/test-image.jpg',
  creativeType: 'image'
};

function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (IS_HTTPS ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      }
    };

    const client = IS_HTTPS ? https : http;
    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`\n📡 Response Status: ${res.statusCode}`);
        console.log(`📡 Response Headers:`, res.headers);
        
        if (responseData) {
          console.log(`📡 Response Body Length: ${responseData.length} characters`);
          console.log(`📡 Response Body:`, responseData);
          
          try {
            const parsed = JSON.parse(responseData);
            console.log(`✅ JSON Parsed Successfully:`, parsed);
          } catch (parseError) {
            console.log(`❌ JSON Parse Error:`, parseError.message);
            console.log(`❌ Raw Response:`, responseData);
          }
        } else {
          console.log(`❌ No response body received`);
        }
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseData
        });
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Request Error:`, error.message);
      reject(error);
    });

    req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Webhook Debug Tests...\n');
  console.log(`🎯 Target URL: ${WEBHOOK_URL}`);
  console.log(`🔒 Protocol: ${IS_HTTPS ? 'HTTPS' : 'HTTP'}`);
  console.log(`📦 Test Payload:`, JSON.stringify(testPayload, null, 2));
  
  try {
    console.log('\n📤 Sending test request...');
    const response = await makeRequest(WEBHOOK_URL, testPayload);
    
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Status Code: ${response.statusCode}`);
    console.log(`✅ Response Received: ${response.body ? 'Yes' : 'No'}`);
    console.log(`✅ Response Length: ${response.body ? response.body.length : 0} characters`);
    
    if (response.body) {
      try {
        JSON.parse(response.body);
        console.log(`✅ JSON Valid: Yes`);
      } catch (e) {
        console.log(`❌ JSON Valid: No - ${e.message}`);
      }
    }
    
  } catch (error) {
    console.error(`\n❌ Test Failed:`, error.message);
  }
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { makeRequest, runTests };
