#!/usr/bin/env node

/**
 * Test script for Google Authentication
 * This script tests the OAuth flow and session management
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';

console.log('🧪 Testing Google Authentication Flow...\n');

// Test 1: Check if session API is accessible
async function testSessionAPI() {
  console.log('1️⃣ Testing Session API...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/session`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Session API is accessible');
      console.log('   Response:', data);
    } else {
      console.log('❌ Session API returned error:', data);
    }
  } catch (error) {
    console.log('❌ Session API test failed:', error.message);
  }
  console.log('');
}

// Test 2: Check if Google OAuth callback route exists
async function testGoogleCallbackRoute() {
  console.log('2️⃣ Testing Google OAuth Callback Route...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/google/callback`);
    
    // Should redirect or return some response
    if (response.status === 302 || response.status === 200) {
      console.log('✅ Google OAuth callback route is accessible');
      console.log('   Status:', response.status);
    } else {
      console.log('❌ Google OAuth callback route returned unexpected status:', response.status);
    }
  } catch (error) {
    console.log('❌ Google OAuth callback test failed:', error.message);
  }
  console.log('');
}

// Test 3: Check environment variables
function testEnvironmentVariables() {
  console.log('3️⃣ Testing Environment Variables...');
  
  const requiredVars = [
    'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_ID', 
    'GOOGLE_CLIENT_SECRET',
    'JWT_SECRET'
  ];
  
  let allPresent = true;
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName} is set`);
    } else {
      console.log(`❌ ${varName} is missing`);
      allPresent = false;
    }
  });
  
  if (allPresent) {
    console.log('✅ All required environment variables are present');
  } else {
    console.log('❌ Some environment variables are missing');
  }
  console.log('');
}

// Test 4: Check database connection
async function testDatabaseConnection() {
  console.log('4️⃣ Testing Database Connection...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/users/profile?userId=1`);
    
    if (response.ok) {
      console.log('✅ Database connection is working');
    } else if (response.status === 404) {
      console.log('✅ Database connection is working (user not found is expected)');
    } else {
      console.log('❌ Database connection test failed with status:', response.status);
    }
  } catch (error) {
    console.log('❌ Database connection test failed:', error.message);
  }
  console.log('');
}

// Test 5: Check if app is running
async function testAppRunning() {
  console.log('5️⃣ Testing if App is Running...');
  
  try {
    const response = await fetch(`${BASE_URL}`);
    
    if (response.ok) {
      console.log('✅ App is running and accessible');
    } else {
      console.log('❌ App returned unexpected status:', response.status);
    }
  } catch (error) {
    console.log('❌ App test failed:', error.message);
    console.log('   Make sure your app is running on:', BASE_URL);
  }
  console.log('');
}

// Helper function for fetch (Node.js compatibility)
async function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.request(url, options, (res) => {
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

// Run all tests
async function runTests() {
  console.log('🚀 Starting Google Authentication Tests...\n');
  
  await testAppRunning();
  await testSessionAPI();
  await testGoogleCallbackRoute();
  testEnvironmentVariables();
  await testDatabaseConnection();
  
  console.log('🎯 Test Summary:');
  console.log('   - Check the results above for any ❌ errors');
  console.log('   - Make sure your app is running on:', BASE_URL);
  console.log('   - Verify environment variables are set correctly');
  console.log('   - Test the actual OAuth flow manually');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
