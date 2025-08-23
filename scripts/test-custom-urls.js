#!/usr/bin/env node

/**
 * Test Image Proxy with Custom Facebook URLs
 * Paste your real Facebook image URLs here for testing
 */

const http = require('http');
require('dotenv').config({ path: '.env.local' });

const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

if (!accessToken) {
  console.error('❌ FACEBOOK_ACCESS_TOKEN not found in .env.local');
  process.exit(1);
}

// PASTE YOUR REAL FACEBOOK IMAGE URLS HERE
const customUrls = [
  // Replace these with actual URLs from your Facebook ads/creatives
  'https://scontent-lax3-2.xx.fbcdn.net/v/t45.1600-4/12520972_6040172128089_551339318_n.png?stp=dst-jpg_tt6&_nc_cat=100&ccb=1-7&_nc_sid=890911&_nc_ohc=552PYkuqCWMQ7kNvwE3sBNC&_nc_oc=AdmgC1TP59tWCtCP62IoAKxGSTR3HUdU1UEPVYARtdluOUcd2ihwLz_5BSLw0AM36f4&_nc_zt=1&_nc_ht=scontent-lax3-2.xx&edm=AOgd6ZUEAAAA&_nc_gid=sghkxeauLJiRO7B0absfhw&oh=00_AfWhzTZFHVnfOUzt-U6kBKBFmgoOOoWQ8YSWUXRfzaGauw&oe=68AB2751',
  // Add more URLs as needed
];

console.log('🔑 Using Facebook Access Token:', accessToken.substring(0, 20) + '...');
console.log('📏 Token Length:', accessToken.length);
console.log('');

if (customUrls[0].includes('YOUR_ACTUAL_IMAGE_ID')) {
  console.log('⚠️  Please edit this script and replace the placeholder URLs with real Facebook image URLs');
  console.log('💡 You can get these URLs from:');
  console.log('   - Facebook Ads Manager → Your Ads → Creative Preview');
  console.log('   - Facebook Business Manager → Assets → Ad Creatives');
  console.log('   - Your webhook data or database');
  console.log('');
  console.log('📝 Edit the customUrls array in scripts/test-custom-urls.js');
  process.exit(1);
}

async function testCustomUrl(url, index) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Test ${index + 1}: Custom Facebook Image`);
    console.log(`🔗 URL: ${url.substring(0, 80)}...`);
    
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
          const filename = `custom-test-image-${index + 1}.jpg`;
          require('fs').writeFileSync(filename, data);
          console.log(`💾 Image saved as: ${filename}`);
          
          // Check file size
          const stats = require('fs').statSync(filename);
          console.log(`📁 File size: ${stats.size} bytes`);
          
        } else if (res.statusCode === 403) {
          console.log('🔒 FORBIDDEN: Facebook denied access');
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

async function runTests() {
  console.log('🧪 Testing Image Proxy with Custom Facebook URLs\n');
  
  for (let i = 0; i < customUrls.length; i++) {
    await testCustomUrl(customUrls[i], i);
  }
  
  console.log('\n🎉 Testing completed!');
  console.log('\n📋 Results:');
  console.log('- ✅ 200: Image successfully proxied');
  console.log('- 🔒 403: Facebook denied access (check token/URL)');
  console.log('- ⚠️  422: Non-image content returned');
  console.log('- ❌ Other: Unexpected error');
}

runTests().catch(console.error);
