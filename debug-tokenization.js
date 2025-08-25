#!/usr/bin/env node

/**
 * Debug Script for Tokenization Issues
 * This script tests the tokenization logic to identify why "Tokenization: ❌ Not Applied" appears
 */

console.log('🔍 Debugging Tokenization Issues...\n');

// Test cases to simulate different scenarios
const testCases = [
  {
    name: 'Facebook CDN URL with Access Token',
    data: {
      imageUrl: 'https://scontent.xx.fbcdn.net/v/t1.0-9/123456_789.jpg',
      accessToken: 'EAA1234567890abcdef',
      creativeId: 'test-123',
      adAccountId: 'test-account'
    }
  },
  {
    name: 'Facebook CDN URL without Access Token',
    data: {
      imageUrl: 'https://scontent.xx.fbcdn.net/v/t1.0-9/123456_789.jpg',
      accessToken: null,
      creativeId: 'test-123',
      adAccountId: 'test-account'
    }
  },
  {
    name: 'Non-Facebook URL',
    data: {
      imageUrl: 'https://example.com/test-image.jpg',
      accessToken: 'EAA1234567890abcdef',
      creativeId: 'test-123',
      adAccountId: 'test-account'
    }
  },
  {
    name: 'Missing Image URL',
    data: {
      imageUrl: null,
      accessToken: 'EAA1234567890abcdef',
      creativeId: 'test-123',
      adAccountId: 'test-account'
    }
  },
  {
    name: 'Empty Image URL',
    data: {
      imageUrl: '',
      accessToken: 'EAA1234567890abcdef',
      creativeId: 'test-123',
      adAccountId: 'test-account'
    }
  }
];

// Simulate the tokenization logic from your workflow
function simulateTokenization(data) {
  const sessionId = `debug_${Date.now()}`;
  
  console.log(`🔍 [${sessionId}] Testing tokenization logic...`);
  console.log(`📊 Input data:`, JSON.stringify(data, null, 2));

  // Extract image URL from the data
  let imageUrl = data.imageUrl || data.thumbnailUrl || data.creativeUrl;
  
  if (!imageUrl) {
    console.log(`⚠️ [${sessionId}] No image URL found, skipping tokenization`);
    return {
      tokenizedUrl: null,
      tokenizationStatus: 'skipped',
      reason: 'No image URL provided',
      tokenizationDetails: {
        applied: false,
        method: 'none',
        reason: 'No image URL provided',
        timestamp: new Date().toISOString()
      }
    };
  }

  console.log(`🔗 [${sessionId}] Original image URL:`, imageUrl);

  // Check if this is a Facebook CDN URL that needs tokenization
  const isFacebookUrl = imageUrl.includes('fbcdn.net') || 
                        imageUrl.includes('facebook.com') || 
                        imageUrl.includes('instagram.com') ||
                        imageUrl.includes('cdninstagram.com') ||
                        imageUrl.includes('scontent.xx.fbcdn.net') ||
                        imageUrl.includes('scontent.cdninstagram.com');

  let tokenizedUrl = imageUrl;
  let tokenizationApplied = false;
  let tokenizationMethod = 'none';
  let tokenizationReason = 'No tokenization needed';

  if (isFacebookUrl && data.accessToken) {
    console.log(`🔑 [${sessionId}] Facebook URL detected, applying access token...`);
    
    // Check if URL already has an access token
    if (!imageUrl.includes('access_token=')) {
      const separator = imageUrl.includes('?') ? '&' : '?';
      tokenizedUrl = `${imageUrl}${separator}access_token=${data.accessToken}`;
      tokenizationApplied = true;
      tokenizationMethod = 'facebook_cdn';
      tokenizationReason = 'Facebook CDN URL tokenized with access token';
      
      console.log(`✅ [${sessionId}] Access token added to Facebook URL`);
      console.log(`🔗 [${sessionId}] Tokenized URL:`, tokenizedUrl.substring(0, 100) + '...');
    } else {
      console.log(`ℹ️ [${sessionId}] URL already contains access token`);
      tokenizationMethod = 'already_tokenized';
      tokenizationReason = 'URL already contains access token';
    }
  } else if (isFacebookUrl && !data.accessToken) {
    console.warn(`⚠️ [${sessionId}] Facebook URL detected but no access token provided`);
    tokenizationMethod = 'facebook_no_token';
    tokenizationReason = 'Facebook URL detected but no access token available';
    
    // Try to use the original URL anyway
    tokenizedUrl = imageUrl;
  } else {
    console.log(`ℹ️ [${sessionId}] Non-Facebook URL, no tokenization needed`);
    tokenizationMethod = 'non_facebook';
    tokenizationReason = 'Non-Facebook URL, no tokenization required';
    
    // For non-Facebook URLs, we can still proceed with optimization
    tokenizedUrl = imageUrl;
  }

  // Prepare the enhanced data with detailed tokenization results
  const enhancedData = {
    tokenizedUrl: tokenizedUrl,
    originalUrl: imageUrl,
    tokenizationStatus: tokenizationApplied ? 'success' : 'skipped',
    tokenizationMethod: tokenizationMethod,
    tokenizationApplied: tokenizationApplied,
    tokenizationReason: tokenizationReason,
    isFacebookUrl: isFacebookUrl,
    hasAccessToken: !!data.accessToken,
    
    // Enhanced tokenization details
    tokenizationDetails: {
      applied: tokenizationApplied,
      method: tokenizationMethod,
      reason: tokenizationReason,
      originalUrl: imageUrl,
      tokenizedUrl: tokenizedUrl,
      isFacebookUrl: isFacebookUrl,
      hasAccessToken: !!data.accessToken,
      timestamp: new Date().toISOString()
    }
  };

  console.log(`✅ [${sessionId}] URL tokenization completed successfully`);
  console.log(`📊 [${sessionId}] Tokenization details:`, {
    status: enhancedData.tokenizationStatus,
    method: enhancedData.tokenizationMethod,
    applied: enhancedData.tokenizationApplied,
    reason: enhancedData.tokenizationReason,
    isFacebook: enhancedData.isFacebookUrl,
    hasToken: enhancedData.hasAccessToken
  });

  return enhancedData;
}

// Run all test cases
console.log('🧪 Running Tokenization Tests...\n');

testCases.forEach((testCase, index) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`${'='.repeat(60)}`);
  
  try {
    const result = simulateTokenization(testCase.data);
    
    console.log(`\n📋 Test Result Summary:`);
    console.log(`   Status: ${result.tokenizationStatus}`);
    console.log(`   Method: ${result.tokenizationMethod}`);
    console.log(`   Applied: ${result.tokenizationApplied}`);
    console.log(`   Reason: ${result.tokenizationReason}`);
    console.log(`   Is Facebook URL: ${result.isFacebookUrl}`);
    console.log(`   Has Access Token: ${result.hasAccessToken}`);
    
    if (result.tokenizedUrl) {
      console.log(`   Tokenized URL: ${result.tokenizedUrl.substring(0, 100)}...`);
    }
    
  } catch (error) {
    console.error(`❌ Test failed with error:`, error.message);
  }
});

console.log(`\n${'='.repeat(60)}`);
console.log('🔍 Debug Analysis Complete');
console.log('📝 Check the results above to identify tokenization issues');
console.log('💡 Common issues:');
console.log('   - Missing or invalid imageUrl in webhook data');
console.log('   - Facebook URLs without access tokens');
console.log('   - Malformed URL formats');
console.log('   - Missing required fields in webhook payload');
console.log(`${'='.repeat(60)}`);

// Test the actual webhook endpoint
console.log('\n🌐 Testing Actual Webhook Endpoint...');
console.log('To test your actual endpoint, run:');
console.log('curl -X POST http://localhost:3000/api/ai/creative-score \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{');
console.log('    "imageUrl": "https://scontent.xx.fbcdn.net/v/t1.0-9/test.jpg",');
console.log('    "creativeId": "test-123",');
console.log('    "adAccountId": "test-account",');
console.log('    "accessToken": "EAA1234567890abcdef"');
console.log('  }\'');
