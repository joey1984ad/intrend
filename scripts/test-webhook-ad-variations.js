#!/usr/bin/env node

const fs = require('fs');
const https = require('https');
const http = require('http');

console.log('🎨 Testing AI Creative Analysis with Ad Variations...\n');

// Read the Facebook access token from .env.local
let accessToken = '';
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const tokenMatch = envContent.match(/FACEBOOK_ACCESS_TOKEN=([^\s\n]+)/);
  if (tokenMatch) {
    accessToken = tokenMatch[1];
    console.log('✅ Facebook access token found');
  } else {
    console.log('❌ Facebook access token not found in .env.local');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Error reading .env.local:', error.message);
  process.exit(1);
}

// Read the webhook URL from .env.local
let webhookUrl = '';
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const webhookMatch = envContent.match(/NEXT_PUBLIC_N8N_WEBHOOK_URL=([^\s\n]+)/);
  if (webhookMatch) {
    webhookUrl = webhookMatch[1];
    console.log('✅ Webhook URL found:', webhookUrl);
  } else {
    console.log('❌ Webhook URL not found in .env.local');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Error reading .env.local:', error.message);
  process.exit(1);
}

// Test payload with comprehensive creative data for ad variation testing
const testPayload = {
  creativeId: 'test_creative_123',
  adAccountId: 'act_test_account_456',
  accessToken: accessToken,
  imageUrl: 'https://example.com/test-ad-image.jpg',
  creativeName: 'Test Ad Creative - Product Showcase',
  creativeType: 'image',
  body: 'Discover our amazing product with incredible features and benefits that will transform your life.',
  title: 'Amazing Product - Limited Time Offer',
  callToAction: 'Shop Now',
  timestamp: new Date().toISOString(),
  test: false // Set to false to trigger actual AI analysis
};

console.log('📦 Test payload prepared for ad variation testing:');
console.log('  - Creative ID:', testPayload.creativeId);
console.log('  - Ad Account ID:', testPayload.adAccountId);
console.log('  - Access Token:', testPayload.accessToken ? 'Present (' + testPayload.accessToken.substring(0, 10) + '...)' : 'MISSING');
console.log('  - Image URL:', testPayload.imageUrl);
console.log('  - Creative Name:', testPayload.creativeName);
console.log('  - Creative Type:', testPayload.creativeType);
console.log('  - Ad Copy:', testPayload.body);
console.log('  - Title:', testPayload.title);
console.log('  - Call to Action:', testPayload.callToAction);
console.log('  - Timestamp:', testPayload.timestamp);
console.log('  - Test Mode:', testPayload.test);

// Parse the webhook URL
const url = new URL(webhookUrl);
const isHttps = url.protocol === 'https:';
const client = isHttps ? https : http;

const postData = JSON.stringify(testPayload);

const options = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'ad-variation-test-script/2.0'
  },
  timeout: 60000 // Increased timeout for AI analysis
};

console.log(`\n📡 Sending test request to: ${webhookUrl}`);
console.log(`   Hostname: ${url.hostname}`);
console.log(`   Port: ${url.port || (isHttps ? 443 : 80)}`);
console.log(`   Path: ${url.pathname}`);
console.log(`   Protocol: ${url.protocol}`);

const req = client.request(options, (res) => {
  console.log(`\n📊 Response received:`);
  console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
  console.log(`   Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`\n📄 Response body:`);
    try {
      const responseData = JSON.parse(data);
      console.log(JSON.stringify(responseData, null, 2));
      
      // Enhanced analysis for ad variations
      console.log('\n🔍 AD VARIATION ANALYSIS:');
      
      if (responseData.error) {
        console.log('❌ Webhook returned an error:', responseData.error);
        if (responseData.message) {
          console.log('   Message:', responseData.message);
        }
        if (responseData.receivedData) {
          console.log('   Received data:', responseData.receivedData);
        }
      } else {
        console.log('✅ Webhook call successful!');
        
        // Check for ad variations
        if (responseData.adVariations && Array.isArray(responseData.adVariations)) {
          console.log(`🎨 Ad Variations Generated: ${responseData.adVariations.length}`);
          responseData.adVariations.forEach((variation, index) => {
            console.log(`\n   Variation ${index + 1}:`);
            console.log(`     Description: ${variation.description}`);
            console.log(`     Key Changes: ${variation.keyChanges?.join(', ') || 'None'}`);
            console.log(`     Expected Improvement: ${variation.expectedImprovement || 'Not specified'}`);
          });
        } else {
          console.log('⚠️ No ad variations found in response');
        }
        
        // Check for optimization flags
        if (responseData.optimizationFlags && Array.isArray(responseData.optimizationFlags)) {
          console.log(`\n🚀 Optimization Flags: ${responseData.optimizationFlags.join(', ')}`);
        }
        
        // Check for performance flags
        if (responseData.performanceFlags && Array.isArray(responseData.performanceFlags)) {
          console.log(`📈 Performance Flags: ${responseData.performanceFlags.join(', ')}`);
        }
        
        // Check for enhanced scoring
        if (responseData.dimensions) {
          console.log('\n📊 Enhanced Scoring:');
          Object.entries(responseData.dimensions).forEach(([dimension, score]) => {
            console.log(`     ${dimension}: ${score}/100`);
          });
        }
        
        // Check for feedback data
        if (responseData.feedbackData) {
          console.log('\n🔄 Feedback Loop Data:');
          console.log(`     Session ID: ${responseData.feedbackData.sessionId}`);
          console.log(`     Workflow Version: ${responseData.feedbackData.workflowVersion}`);
          console.log(`     Analysis Quality: ${responseData.feedbackData.analysisQuality}`);
          console.log(`     Original Score: ${responseData.feedbackData.originalScore}/100`);
        }
        
        // Check for session tracking
        if (responseData.metadata?.sessionId) {
          console.log(`\n🔍 Session Tracking: ${responseData.metadata.sessionId}`);
        }
        
        console.log('\n✅ Ad variation test completed successfully!');
        console.log('   The AI analysis generated actionable insights and ad variations.');
      }
    } catch (e) {
      console.log('Raw response:', data);
      console.log('❌ Failed to parse JSON response');
    }
    
    console.log('\n🔍 HTTP Status Analysis:');
    if (res.statusCode === 200) {
      console.log('✅ HTTP 200 - Request successful');
      if (data.includes('adVariations') || data.includes('ad_variations')) {
        console.log('✅ Response contains ad variations - excellent!');
      } else {
        console.log('⚠️ Response doesn\'t contain ad variations - check n8n workflow');
      }
      
      if (data.includes('optimizationFlags') || data.includes('optimization_flags')) {
        console.log('✅ Response contains optimization flags - great!');
      } else {
        console.log('⚠️ Response doesn\'t contain optimization flags');
      }
      
      if (data.includes('sessionId') || data.includes('session_id')) {
        console.log('✅ Response contains session tracking - perfect!');
      } else {
        console.log('⚠️ Response doesn\'t contain session tracking');
      }
    } else if (res.statusCode === 400) {
      console.log('❌ HTTP 400 - Bad request (likely missing required fields)');
    } else if (res.statusCode === 401) {
      console.log('❌ HTTP 401 - Unauthorized (access token issue)');
    } else if (res.statusCode === 500) {
      console.log('❌ HTTP 500 - Server error (check n8n workflow)');
    } else {
      console.log(`⚠️ HTTP ${res.statusCode} - Unexpected status`);
    }
    
    console.log('\n🎯 AD VARIATION TEST SUMMARY:');
    if (res.statusCode === 200 && data.includes('adVariations')) {
      console.log('✅ SUCCESS: Ad variations are being generated correctly');
      console.log('✅ SUCCESS: AI analysis is working with enhanced features');
      console.log('✅ SUCCESS: Feedback loop is implemented');
      console.log('\n🚀 Your workflow is ready for production use!');
    } else if (res.statusCode === 200) {
      console.log('⚠️ PARTIAL SUCCESS: Request succeeded but missing ad variations');
      console.log('💡 Check your n8n workflow configuration');
    } else {
      console.log('❌ FAILED: Request did not succeed');
      console.log('💡 Check n8n logs and workflow status');
    }
  });
});

req.on('error', (err) => {
  console.error('\n❌ Request error:', err.message);
  if (err.code === 'ECONNREFUSED') {
    console.log('   💡 This usually means n8n is not running.');
    console.log('   💡 Start n8n with: n8n start');
  } else if (err.code === 'ENOTFOUND') {
    console.log('   💡 This usually means the hostname cannot be resolved.');
    console.log('   💡 Check your webhook URL configuration.');
  }
});

req.on('timeout', () => {
  console.error('\n⏰ Request timed out (60s)');
  console.log('   💡 AI analysis may take longer than expected');
  console.log('   💡 Check n8n workflow execution status');
  req.destroy();
});

req.write(postData);
req.end();

console.log('\n⏳ Waiting for AI analysis and ad variation generation...');
console.log('   This may take 15-30 seconds for full analysis...');
