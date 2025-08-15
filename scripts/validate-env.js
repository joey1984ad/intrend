#!/usr/bin/env node

require('dotenv').config({ path: '.env' });

console.log('🔍 Validating environment configuration for AI Analysis...\n');

// Required environment variables for AI analysis to work
const requiredVars = [
  ['NEXT_PUBLIC_FACEBOOK_APP_ID', 'Facebook App ID for authentication'],
  ['FACEBOOK_ACCESS_TOKEN', 'Facebook access token for API calls'],
  ['NEXT_PUBLIC_N8N_WEBHOOK_URL', 'n8n webhook URL for AI analysis'],
  ['DATABASE_URL', 'Database connection string'],
  ['BLOB_READ_WRITE_TOKEN', 'Vercel Blob storage token']
];

// Optional but recommended variables
const optionalVars = [
  ['NEXT_PUBLIC_FACEBOOK_APP_DOMAIN', 'Facebook app domain'],
  ['N8N_HOST', 'n8n host URL'],
  ['N8N_API_KEY', 'n8n API key']
];

let allRequiredValid = true;
let missingVars = [];

console.log('📋 Required Environment Variables:');
console.log('================================');

requiredVars.forEach(([varName, description]) => {
  const value = process.env[varName];
  if (value && value.trim() !== '') {
    // Mask sensitive values
    const displayValue = varName.includes('TOKEN') || varName.includes('SECRET') || varName.includes('KEY') 
      ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`❌ ${varName}: MISSING - ${description}`);
    allRequiredValid = false;
    missingVars.push(varName);
  }
});

console.log('\n📋 Optional Environment Variables:');
console.log('==================================');

optionalVars.forEach(([varName, description]) => {
  const value = process.env[varName];
  if (value && value.trim() !== '') {
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`⚠️ ${varName}: Not set - ${description}`);
  }
});

// Validate specific configurations
console.log('\n🔧 Configuration Validation:');
console.log('============================');

// Check Facebook configuration
const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
if (facebookAppId && facebookAppId.length > 10) {
  console.log('✅ Facebook App ID: Valid format');
} else {
  console.log('❌ Facebook App ID: Invalid format');
  allRequiredValid = false;
}

// Check n8n webhook URL
const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
if (webhookUrl) {
  try {
    new URL(webhookUrl);
    console.log('✅ n8n Webhook URL: Valid URL format');
    
    if (webhookUrl.includes('localhost')) {
      console.log('ℹ️ n8n Webhook URL: Local development mode');
    } else if (webhookUrl.includes('https://')) {
      console.log('ℹ️ n8n Webhook URL: Production mode');
    }
  } catch (error) {
    console.log('❌ n8n Webhook URL: Invalid URL format');
    allRequiredValid = false;
  }
} else {
  console.log('❌ n8n Webhook URL: Missing');
  allRequiredValid = false;
}

// Check database URL
const dbUrl = process.env.DATABASE_URL;
if (dbUrl && dbUrl.includes('postgres')) {
  console.log('✅ Database URL: PostgreSQL format detected');
} else {
  console.log('❌ Database URL: Invalid or missing');
  allRequiredValid = false;
}

// Check access token
const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
if (accessToken && accessToken.length > 100) {
  console.log('✅ Facebook Access Token: Valid length');
} else {
  console.log('❌ Facebook Access Token: Invalid or missing');
  allRequiredValid = false;
}

// Summary
console.log('\n📊 Validation Summary:');
console.log('======================');

if (allRequiredValid) {
  console.log('🎉 SUCCESS: All required environment variables are properly configured!');
  console.log('\n🚀 Your AI analysis should work now. Next steps:');
  console.log('1. Restart your Next.js development server');
  console.log('2. Ensure n8n is running on the configured URL');
  console.log('3. Test the AI analysis feature in your app');
} else {
  console.log('❌ FAILED: Some required environment variables are missing or invalid.');
  console.log('\n🔧 Missing variables:');
  missingVars.forEach(varName => {
    const description = requiredVars.find(([name]) => name === varName)?.[1] || 'No description';
    console.log(`   - ${varName}: ${description}`);
  });
  
  console.log('\n💡 To fix this:');
  console.log('1. Update your .env.local file with the missing variables');
  console.log('2. Run this validation script again');
  console.log('3. Restart your development server');
}

// Test n8n connectivity if webhook URL is configured
if (webhookUrl && allRequiredValid) {
  console.log('\n🌐 Testing n8n connectivity...');
  
  const https = require('https');
  const http = require('http');
  
  try {
    const url = new URL(webhookUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const req = client.request(url, { method: 'GET', timeout: 5000 }, (res) => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        console.log('✅ n8n server: Responding (status:', res.statusCode, ')');
      } else {
        console.log('⚠️ n8n server: Responding with status:', res.statusCode);
      }
      // Close the response to prevent hanging
      res.destroy();
      process.exit(0);
    });
    
    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ n8n server: Connection refused - server may not be running');
        console.log('💡 Start n8n with: n8n start');
      } else {
        console.log('❌ n8n server: Connection error:', error.message);
      }
      process.exit(0);
    });
    
    req.on('timeout', () => {
      console.log('⏰ n8n server: Connection timeout');
      req.destroy();
      process.exit(0);
    });
    
    req.end();
    
    // Force exit after 6 seconds to prevent hanging
    setTimeout(() => {
      console.log('⏰ Forcing exit to prevent hanging...');
      process.exit(0);
    }, 6000);
    
  } catch (error) {
    console.log('❌ n8n connectivity test failed:', error.message);
    process.exit(0);
  }
}

console.log('\n✨ Environment validation complete!');
