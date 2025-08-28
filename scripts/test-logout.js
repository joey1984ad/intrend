#!/usr/bin/env node

/**
 * Simple test script for logout functionality
 */

const https = require('https');

const BASE_URL = 'https://localhost:3001';

// Configure HTTPS to ignore self-signed certificate errors
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

console.log('🧪 Testing Logout Functionality...\n');

// Test 1: Test session API DELETE method
async function testLogoutAPI() {
  console.log('1️⃣ Testing Logout API...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/session`, { 
      method: 'DELETE' 
    });
    
    if (response.ok) {
      console.log('✅ Logout API is working');
      console.log('   Status:', response.status);
    } else {
      console.log('❌ Logout API returned error status:', response.status);
    }
  } catch (error) {
    console.log('❌ Logout API test failed:', error.message);
  }
  console.log('');
}

// Test 2: Test session API GET method
async function testSessionAPI() {
  console.log('2️⃣ Testing Session API...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/session`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Session API is working');
      console.log('   Response:', data);
    } else {
      console.log('❌ Session API returned error status:', response.status);
    }
  } catch (error) {
    console.log('❌ Session API test failed:', error.message);
  }
  console.log('');
}

// Helper function for fetch (Node.js compatibility)
async function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { ...options, agent: httpsAgent }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.resolve(jsonData)
          });
        } catch (error) {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.resolve({})
          });
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Logout Tests...\n');
  
  await testSessionAPI();
  await testLogoutAPI();
  
  console.log('🎯 Test Summary:');
  console.log('   - Check the results above for any ❌ errors');
  console.log('   - If both tests pass, the logout API is working');
  console.log('   - Test the actual logout button in the browser');
}

runTests().catch(console.error);
