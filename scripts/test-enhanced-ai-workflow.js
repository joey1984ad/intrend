#!/usr/bin/env node

/**
 * Test Enhanced AI Creative Analysis Workflow
 * Tests the new 3-node solution with ChatGPT integration
 */

const https = require('https');
const http = require('http');

console.log('🚀 Testing Enhanced AI Creative Analysis Workflow');
console.log('================================================\n');

// Configuration
const config = {
  webhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://n8n-meh7.onrender.com/webhook/analyze-creatives',
  testMode: true
};

// Test payload with realistic creative data
const testPayload = {
  creativeId: 'test_enhanced_123',
  adAccountId: 'act_test_account',
  accessToken: 'test_access_token_123',
  imageUrl: 'https://fbcdn.net/test-image.jpg',
  creativeName: 'Test Enhanced Creative',
  creativeType: 'image',
  test: true
};

// Real payload for actual AI analysis
const realPayload = {
  creativeId: 'real_enhanced_456',
  adAccountId: 'act_real_account',
  accessToken: 'real_access_token_456',
  imageUrl: 'https://fbcdn.net/real-image.jpg',
  creativeName: 'Real Enhanced Creative',
  creativeType: 'image',
  test: false
};

function makeRequest(config, payload, isTest = true) {
  return new Promise((resolve) => {
    const url = new URL(config.webhookUrl);
    const postData = JSON.stringify(payload);
    
    console.log(`📡 Testing: ${isTest ? 'Test Mode' : 'Real AI Analysis'}`);
    console.log(`🔗 URL: ${config.webhookUrl}`);
    console.log(`📤 Payload:`, JSON.stringify(payload, null, 2));
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'enhanced-ai-test-script/1.0'
      },
      timeout: 60000 // 60 second timeout for AI analysis
    };
    
    const protocol = url.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📥 Response Status: ${res.status} ${res.statusText}`);
        console.log(`📊 Response Headers:`, res.headers);
        
        try {
          const jsonData = JSON.parse(data);
          console.log(`✅ Response Data:`, JSON.stringify(jsonData, null, 2));
          
          // Validate enhanced response structure
          validateEnhancedResponse(jsonData, isTest);
          
        } catch (parseError) {
          console.log(`❌ Response is not valid JSON:`, data);
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.error(`❌ Request Error:`, err.message);
      console.log('   💡 Check your webhook URL and n8n instance status');
      resolve();
    });
    
    req.on('timeout', () => {
      console.error('\n⏰ Request timed out (60s)');
      console.log('   💡 AI analysis may take longer than expected');
      console.log('   💡 Check n8n workflow execution status');
      req.destroy();
      resolve();
    });
    
    req.write(postData);
    req.end();
  });
}

function validateEnhancedResponse(data, isTest) {
  console.log(`🔍 Validating ${isTest ? 'Test' : 'Enhanced AI'} Response...`);
  
  if (isTest) {
    // Test mode validation
    if (data.status === 'success' && data.message) {
      console.log('✅ Test mode response is valid');
    } else {
      console.log('❌ Test mode response is invalid');
    }
    return;
  }
  
  // Enhanced AI response validation
  const requiredFields = [
    'id', 'name', 'status', 'imageUrl', 'tokenizedImageUrl',
    'chatgptAnalysis', 'imageAnalysis', 'processingMetadata'
  ];
  
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length === 0) {
    console.log('✅ Enhanced AI response has all required fields');
    
    // Validate ChatGPT analysis
    if (data.chatgptAnalysis && data.chatgptAnalysis.success) {
      console.log('✅ ChatGPT analysis completed successfully');
      console.log(`   Model: ${data.chatgptAnalysis.model}`);
      console.log(`   Analysis: ${data.chatgptAnalysis.analysis.substring(0, 100)}...`);
    } else {
      console.log('❌ ChatGPT analysis failed or missing');
    }
    
    // Validate image processing
    if (data.imageAnalysis && data.tokenizedImageUrl) {
      console.log('✅ Image processing completed successfully');
      console.log(`   Original URL: ${data.imageAnalysis.originalUrl}`);
      console.log(`   Tokenized URL: ${data.tokenizedImageUrl}`);
      console.log(`   Processing Status: ${data.imageAnalysis.analysisStatus}`);
    } else {
      console.log('❌ Image processing failed or missing');
    }
    
    // Validate processing metadata
    if (data.processingMetadata) {
      console.log('✅ Processing metadata available');
      console.log(`   Processing ID: ${data.processingMetadata.processingId}`);
      console.log(`   Tokenization: ${data.processingMetadata.tokenizationSuccess ? 'Success' : 'Failed'}`);
      console.log(`   ChatGPT Integration: ${data.processingMetadata.chatgptIntegration ? 'Active' : 'Inactive'}`);
    } else {
      console.log('❌ Processing metadata missing');
    }
    
  } else {
    console.log('❌ Enhanced AI response missing required fields:', missingFields);
  }
}

async function runTests() {
  console.log('🧪 Running Enhanced AI Workflow Tests...\n');
  
  // Test 1: Test Mode
  await makeRequest(config, testPayload, true);
  
  // Test 2: Real AI Analysis (if you have real credentials)
  if (process.env.TEST_REAL_ANALYSIS === 'true') {
    console.log('⚠️  Running real AI analysis test...');
    await makeRequest(config, realPayload, false);
  } else {
    console.log('ℹ️  Skipping real AI analysis test. Set TEST_REAL_ANALYSIS=true to enable.');
  }
  
  console.log('🎉 Enhanced AI Workflow testing completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Check your n8n workflow execution logs');
  console.log('2. Verify ChatGPT API integration is working');
  console.log('3. Test image tokenization and processing');
  console.log('4. Check frontend integration in your website');
}

// Run tests
runTests().catch(console.error);
