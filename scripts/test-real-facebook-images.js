#!/usr/bin/env node

/**
 * Test Image Proxy with Real Facebook Image URLs
 * Uses real Facebook access token to test actual image proxying
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

if (!accessToken) {
  console.error('❌ FACEBOOK_ACCESS_TOKEN not found in .env.local');
  console.log('💡 Please set your Facebook access token in .env.local');
  process.exit(1);
}

console.log('🔑 Using Facebook Access Token:', accessToken.substring(0, 20) + '...');
console.log('📏 Token Length:', accessToken.length);
console.log('');

// Test with real Facebook image URLs
const testUrls = [
  // Real Facebook CDN URLs (these are examples - you'll need to replace with actual URLs)
  'https://scontent-lax3-2.xx.fbcdn.net/v/t39.30808-6/123456789_123456789012345_1234567890123456789_n.jpg',
  'https://scontent-lax3-1.xx.fbcdn.net/v/t39.30808-6/987654321_987654321098765_9876543210987654321_n.jpg',
  'https://scontent-lax3-2.xx.fbcdn.net/v/t39.30808-6/555666777_555666777888999_555666777888999000_n.jpg'
];

async function testRealImage(url, index) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Test ${index + 1}: Real Facebook Image`);
    console.log(`🔗 URL: ${url}`);
    
    const proxyUrl = `http://localhost:3000/api/proxy-image?url=${encodeURIComponent(url)}&token=${encodeURIComponent(accessToken)}`;
    console.log(`🔗 Proxy URL: ${proxyUrl.substring(0, 80)}...`);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/proxy-image?url=${encodeURIComponent(url)}&token=${encodeURIComponent(accessToken)}`,
      method: 'GET',
      timeout: 15000
    };

    const req = http.request(options, (res) => {
      console.log(`📥 Status: ${res.statusCode} ${res.statusMessage}`);
      console.log(`📊 Content-Type: ${res.headers['content-type']}`);
      console.log(`📏 Content-Length: ${res.headers['content-length'] || 'chunked'}`);
      
      let data = Buffer.alloc(0);
      res.on('data', (chunk) => {
        data = Buffer.concat([data, chunk]);
      });
      
      res.on('end', () => {
        console.log(`📄 Response size: ${data.length} bytes`);
        
        if (res.statusCode === 200 && res.headers['content-type']?.startsWith('image/')) {
          console.log('✅ SUCCESS: Image proxied successfully!');
          
          // Save the image to verify it's actually an image
          const filename = `test-image-${index + 1}.jpg`;
          fs.writeFileSync(filename, data);
          console.log(`💾 Image saved as: ${filename}`);
          
          // Check file size
          const stats = fs.statSync(filename);
          console.log(`📁 File size: ${stats.size} bytes`);
          
        } else if (res.statusCode === 403) {
          console.log('🔒 FORBIDDEN: Facebook denied access (URL might be expired or token invalid)');
          if (data.length < 500) {
            console.log(`📄 Error details: ${data.toString()}`);
          }
        } else if (res.statusCode === 422) {
          console.log('⚠️  UNPROCESSABLE: Facebook returned non-image content');
          if (data.length < 500) {
            console.log(`📄 Error details: ${data.toString()}`);
          }
        } else {
          console.log(`❌ UNEXPECTED: Status ${res.statusCode}`);
          if (data.length < 500) {
            console.log(`📄 Response: ${data.toString()}`);
          }
        }
        
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error('❌ Network Error:', err.message);
      resolve();
    });

    req.on('timeout', () => {
      console.error('⏰ Timeout (15s)');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function testWithRealToken() {
  console.log('🧪 Testing Image Proxy with Real Facebook Access Token\n');
  
  // First, test if the token is valid by making a simple Facebook API call
  console.log('🔍 Testing Facebook API access...');
  try {
    const response = await fetch('https://graph.facebook.com/me?access_token=' + accessToken);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Facebook API access confirmed');
      console.log(`👤 User ID: ${data.id}`);
      console.log(`👤 Name: ${data.name}`);
    } else {
      console.log('⚠️  Facebook API access failed, but token might still work for images');
    }
  } catch (error) {
    console.log('⚠️  Could not test Facebook API access:', error.message);
  }
  
  console.log('');
  
  // Test each image URL
  for (let i = 0; i < testUrls.length; i++) {
    await testRealImage(testUrls[i], i);
  }
  
  console.log('\n🎉 Testing completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Replace the test URLs with actual Facebook image URLs from your ads/creatives');
  console.log('2. Check the saved image files to verify they contain actual images');
  console.log('3. Test with different types of Facebook content (ads, posts, etc.)');
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.log('⚠️  Fetch not available, skipping Facebook API test');
  testRealImage(testUrls[0], 0).then(() => {
    console.log('\n🎉 Basic testing completed!');
  });
} else {
  testWithRealToken().catch(console.error);
}
