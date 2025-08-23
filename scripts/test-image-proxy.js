#!/usr/bin/env node

/**
 * Test Image Proxy API
 * Tests the new /api/proxy-image endpoint for Facebook CDN images
 */

const https = require('https');
const http = require('http');

console.log('🖼️ Testing Image Proxy API');
console.log('============================\n');

// Configuration
const config = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  testMode: true
};

// Test Facebook CDN URLs
const testUrls = [
  'https://scontent-lax3-2.xx.fbcdn.net/v/t45.1600-4/test_image.png',
  'https://fbcdn.net/test_image.jpg',
  'https://instagram.com/test_image.jpg'
];

// Mock access token (replace with real one for testing)
const mockAccessToken = 'test_access_token_123';

function testImageProxy(imageUrl, accessToken) {
  return new Promise((resolve) => {
    const proxyUrl = `${config.baseUrl}/api/proxy-image?url=${encodeURIComponent(imageUrl)}&token=${encodeURIComponent(accessToken)}`;
    
    console.log(`📡 Testing Image Proxy:`, imageUrl);
    console.log(`🔗 Proxy URL:`, proxyUrl);
    
    const url = new URL(proxyUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'User-Agent': 'image-proxy-test-script/1.0'
      },
      timeout: 10000
    };
    
    const protocol = url.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      console.log(`📥 Response Status: ${res.statusCode} ${res.statusMessage}`);
      console.log(`📊 Response Headers:`, res.headers);
      
      if (res.statusCode === 200) {
        console.log(`✅ Image proxy successful!`);
        console.log(`   Content-Type: ${res.headers['content-type']}`);
        console.log(`   Content-Length: ${res.headers['content-length']}`);
        console.log(`   Cache-Control: ${res.headers['cache-control']}`);
      } else {
        console.log(`❌ Image proxy failed with status: ${res.statusCode}`);
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
      resolve();
    });
    
    req.on('error', (err) => {
      console.error(`❌ Request Error:`, err.message);
      console.log('   💡 Check if your Next.js server is running');
      resolve();
    });
    
    req.on('timeout', () => {
      console.error('\n⏰ Request timed out (10s)');
      console.log('   💡 Check if your image proxy API is responding');
      req.destroy();
      resolve();
    });
    
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Running Image Proxy Tests...\n');
  
  // Test each Facebook CDN URL
  for (const imageUrl of testUrls) {
    await testImageProxy(imageUrl, mockAccessToken);
  }
  
  console.log('🎉 Image Proxy testing completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Start your Next.js development server');
  console.log('2. Test with real Facebook access tokens');
  console.log('3. Verify images display in your frontend');
  console.log('4. Check browser network tab for proxy requests');
}

// Run tests
runTests().catch(console.error);
