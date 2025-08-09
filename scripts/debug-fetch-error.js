#!/usr/bin/env node

const https = require('https');
const http = require('http');

console.log('🔍 Debug: Testing Facebook API endpoints...\n');

// Test 1: Check if development server is running
async function testDevServer() {
  console.log('1️⃣ Testing development server...');
  
  const ports = [3000, 3001];
  
  for (const port of ports) {
    try {
      const response = await fetch(`http://localhost:${port}/api/facebook/health`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Port ${port}: Server is running`);
        console.log(`   Health check response:`, data);
        return port;
      } else {
        console.log(`❌ Port ${port}: Server responded with status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Port ${port}: Connection failed - ${error.message}`);
    }
  }
  
  return null;
}

// Test 2: Check environment variables
function checkEnvironment() {
  console.log('\n2️⃣ Checking environment variables...');
  
  const requiredVars = [
    'NEXT_PUBLIC_FACEBOOK_APP_ID',
    'FACEBOOK_APP_SECRET'
  ];
  
  let missingVars = [];
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value === 'your_facebook_app_id_here' || value === 'your_facebook_app_secret_here') {
      missingVars.push(varName);
      console.log(`❌ ${varName}: Not configured or using placeholder`);
    } else {
      console.log(`✅ ${varName}: Configured (${value.substring(0, 10)}...)`);
    }
  }
  
  return missingVars;
}

// Test 3: Test Facebook Graph API directly
async function testFacebookAPI() {
  console.log('\n3️⃣ Testing Facebook Graph API...');
  
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
  
  if (!appId || appId === 'your_facebook_app_id_here') {
    console.log('❌ Cannot test Facebook API - App ID not configured');
    return false;
  }
  
  try {
    // Test basic Graph API endpoint
    const response = await fetch(`https://graph.facebook.com/v23.0/${appId}?fields=id,name`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Facebook Graph API is accessible');
      console.log(`   App info: ${data.name} (${data.id})`);
      return true;
    } else {
      console.log(`❌ Facebook Graph API error: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Facebook Graph API connection failed: ${error.message}`);
    return false;
  }
}

// Test 4: Check for common issues
function checkCommonIssues() {
  console.log('\n4️⃣ Checking for common issues...');
  
  const issues = [];
  
  // Check if we're in a browser-like environment
  if (typeof window !== 'undefined') {
    console.log('⚠️ Running in browser environment');
  } else {
    console.log('✅ Running in Node.js environment');
  }
  
  // Check Node.js version
  const nodeVersion = process.version;
  console.log(`✅ Node.js version: ${nodeVersion}`);
  
  // Check if fetch is available
  if (typeof fetch === 'undefined') {
    console.log('❌ Fetch API not available - Node.js version might be too old');
    issues.push('Fetch API not available');
  } else {
    console.log('✅ Fetch API is available');
  }
  
  return issues;
}

// Main debug function
async function debugFetchError() {
  console.log('🚀 Starting fetch error debug...\n');
  
  // Test 1: Development server
  const activePort = await testDevServer();
  
  // Test 2: Environment variables
  const missingVars = checkEnvironment();
  
  // Test 3: Facebook API
  const facebookAccessible = await testFacebookAPI();
  
  // Test 4: Common issues
  const commonIssues = checkCommonIssues();
  
  // Summary
  console.log('\n📋 SUMMARY:');
  console.log('==========');
  
  if (activePort) {
    console.log(`✅ Development server running on port ${activePort}`);
  } else {
    console.log('❌ Development server not accessible');
  }
  
  if (missingVars.length === 0) {
    console.log('✅ All environment variables configured');
  } else {
    console.log(`❌ Missing environment variables: ${missingVars.join(', ')}`);
  }
  
  if (facebookAccessible) {
    console.log('✅ Facebook Graph API accessible');
  } else {
    console.log('❌ Facebook Graph API not accessible');
  }
  
  if (commonIssues.length === 0) {
    console.log('✅ No common issues detected');
  } else {
    console.log(`⚠️ Common issues: ${commonIssues.join(', ')}`);
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('==================');
  
  if (!activePort) {
    console.log('1. Start the development server: npm run dev');
  }
  
  if (missingVars.length > 0) {
    console.log('2. Configure missing environment variables in .env.local');
    console.log('   Copy from env.example and fill in your Facebook App credentials');
  }
  
  if (!facebookAccessible) {
    console.log('3. Check Facebook App configuration:');
    console.log('   - Ensure App ID is correct');
    console.log('   - Check if App is in development mode');
    console.log('   - Verify domain settings');
  }
  
  console.log('\n🔧 Next steps:');
  console.log('1. Open browser console (F12)');
  console.log('2. Try to connect with Facebook');
  console.log('3. Look for specific error messages');
  console.log('4. Check Network tab for failed requests');
}

// Run the debug
debugFetchError().catch(console.error);
