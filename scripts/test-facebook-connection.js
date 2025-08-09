#!/usr/bin/env node

/**
 * Test script to verify Facebook SDK connection
 * This script helps debug Facebook SDK connection issues
 */

const https = require('https');
const http = require('http');

console.log('🔍 Testing Facebook SDK Connection...\n');

// Test 1: Check if Facebook SDK can be loaded
console.log('1️⃣ Testing Facebook SDK script loading...');
const testSDKLoading = () => {
  return new Promise((resolve, reject) => {
    const req = https.get('https://connect.facebook.net/en_US/sdk.js', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200 && data.includes('FB.init')) {
          console.log('✅ Facebook SDK script loads successfully');
          resolve(true);
        } else {
          console.log('❌ Facebook SDK script failed to load properly');
          reject(new Error('SDK script not valid'));
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Failed to load Facebook SDK script:', error.message);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('SDK script load timeout'));
    });
  });
};

// Test 2: Check Facebook Graph API connectivity
console.log('2️⃣ Testing Facebook Graph API connectivity...');
const testGraphAPI = () => {
  return new Promise((resolve, reject) => {
    const req = https.get('https://graph.facebook.com/v23.0/', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Facebook Graph API is accessible');
          resolve(true);
        } else {
          console.log('❌ Facebook Graph API returned status:', res.statusCode);
          reject(new Error(`Graph API status: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Failed to connect to Facebook Graph API:', error.message);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Graph API connection timeout'));
    });
  });
};

// Test 3: Check environment variables
console.log('3️⃣ Checking environment variables...');
const checkEnvironment = () => {
  const requiredVars = [
    'NEXT_PUBLIC_FACEBOOK_APP_ID'
  ];
  
  const missing = [];
  const present = [];
  
  requiredVars.forEach(varName => {
    if (process.env[varName] && process.env[varName] !== 'your-facebook-app-id') {
      present.push(varName);
    } else {
      missing.push(varName);
    }
  });
  
  if (present.length > 0) {
    console.log('✅ Found environment variables:', present.join(', '));
  }
  
  if (missing.length > 0) {
    console.log('❌ Missing environment variables:', missing.join(', '));
    console.log('   Please check your .env.local file');
  }
  
  return missing.length === 0;
};

// Test 4: Check local API endpoint
console.log('4️⃣ Testing local API endpoint...');
const testLocalAPI = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000/api/facebook/auth', (res) => {
      if (res.statusCode === 405) {
        // 405 Method Not Allowed is expected for GET request to POST endpoint
        console.log('✅ Local API endpoint is accessible (405 expected for GET)');
        resolve(true);
      } else if (res.statusCode === 404) {
        console.log('❌ Local API endpoint not found (404)');
        reject(new Error('API endpoint not found'));
      } else {
        console.log('⚠️ Local API endpoint returned status:', res.statusCode);
        resolve(true);
      }
    });
    
    req.on('error', (error) => {
      console.log('❌ Failed to connect to local API:', error.message);
      console.log('   Make sure your Next.js development server is running');
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Local API connection timeout'));
    });
  });
};

// Run all tests
async function runTests() {
  const results = {
    sdkLoading: false,
    graphAPI: false,
    environment: false,
    localAPI: false
  };
  
  try {
    results.sdkLoading = await testSDKLoading();
  } catch (error) {
    console.log('   Error:', error.message);
  }
  
  try {
    results.graphAPI = await testGraphAPI();
  } catch (error) {
    console.log('   Error:', error.message);
  }
  
  results.environment = checkEnvironment();
  
  try {
    results.localAPI = await testLocalAPI();
  } catch (error) {
    console.log('   Error:', error.message);
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${test}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\nOverall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Facebook SDK should work properly.');
  } else {
    console.log('⚠️ Some tests failed. Check the issues above.');
    
    if (!results.environment) {
      console.log('\n💡 To fix environment issues:');
      console.log('   1. Create a .env.local file in your project root');
      console.log('   2. Add: NEXT_PUBLIC_FACEBOOK_APP_ID=your_actual_app_id');
      console.log('   3. Restart your development server');
    }
    
    if (!results.localAPI) {
      console.log('\n💡 To fix local API issues:');
      console.log('   1. Make sure your Next.js server is running: npm run dev');
      console.log('   2. Check that the server is running on port 3000');
    }
  }
}

// Run the tests
runTests().catch(console.error); 