#!/usr/bin/env node

/**
 * Auto-Generated Test Script for Facebook Image URLs
 * Generated on: 2025-08-20T06:40:31.528Z
 * Total URLs: 17
 */

const http = require('http');
require('dotenv').config({ path: '.env.local' });

const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

if (!accessToken) {
  console.error('❌ FACEBOOK_ACCESS_TOKEN not found in .env.local');
  process.exit(1);
}

// Auto-detected Facebook image URLs
const autoDetectedUrls = [
  "https://scontent-lax3-2.xx.fbcdn.net/v/t39.30808-6/YOUR_ACTUAL_IMAGE_ID_n.jpg",
  "https://scontent-lax3-2.xx.fbcdn.net/v/t39.30808-6/...`",
  "https://scontent-lax3-2.xx.fbcdn.net/v/t39.30808-6/",
  "https://scontent-lax3-1.xx.fbcdn.net/v/t39.30808-6/",
  "https://fbcdn.net/",
  "https://scontent-lax3-2.xx.fbcdn.net/v/t45.1600-4/12520972_6040172128089_551339318_n.png?stp=dst-jpg_tt6&_nc_cat=100&ccb=1-7&_nc_sid=890911&_nc_ohc=552PYkuqCWMQ7kNvwE3sBNC&_nc_oc=AdmgC1TP59tWCtCP62IoAKxGSTR3HUdU1UEPVYARtdluOUcd2ihwLz_5BSLw0AM36f4&_nc_zt=1&_nc_ht=scontent-lax3-2.xx&edm=AOgd6ZUEAAAA&_nc_gid=sghkxeauLJiRO7B0absfhw&oh=00_AfWhzTZFHVnfOUzt-U6kBKBFmgoOOoWQ8YSWUXRfzaGauw&oe=68AB2751",
  "https://fbcdn.net/test-image.jpg",
  "https://fbcdn.net/real-image.jpg",
  "https://scontent-lax3-2.xx.fbcdn.net/v/t45.1600-4/test_image.png",
  "https://fbcdn.net/test_image.jpg",
  "https://instagram.com/test_image.jpg",
  "https://scontent-lax3-2.xx.fbcdn.net/v/t45.1600-4/12345678_123456789012345_1234567890_n.jpg",
  "https://fbcdn.net/test.jpg",
  "https://fbcdn.net/test.jpg&token=test_token",
  "https://scontent-lax3-2.xx.fbcdn.net/v/t39.30808-6/123456789_123456789012345_1234567890123456789_n.jpg",
  "https://scontent-lax3-1.xx.fbcdn.net/v/t39.30808-6/987654321_987654321098765_9876543210987654321_n.jpg",
  "https://scontent-lax3-2.xx.fbcdn.net/v/t39.30808-6/555666777_555666777888999_555666777888999000_n.jpg"
];

console.log('🔑 Using Facebook Access Token:', accessToken.substring(0, 20) + '...');
console.log('📏 Token Length:', accessToken.length);
console.log('🔍 Auto-detected URLs:', autoDetectedUrls.length);
console.log('');

async function testAutoDetectedUrl(url, index) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Test ${index + 1}/${autoDetectedUrls.length}: Auto-Detected URL`);
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
      
      let data = Buffer.alloc(0);
      res.on('data', (chunk) => {
        data = Buffer.concat([data, chunk]);
      });
      
      res.on('end', () => {
        if (res.statusCode === 200 && res.headers['content-type']?.startsWith('image/')) {
          console.log('✅ SUCCESS: Image proxied successfully!');
          console.log(`📏 Size: ${data.length} bytes`);
          
          // Save the image
          const filename = `auto-test-image-${index + 1}.jpg`;
          require('fs').writeFileSync(filename, data);
          console.log(`💾 Image saved as: ${filename}`);
          
        } else if (res.statusCode === 403) {
          console.log('🔒 FORBIDDEN: Facebook denied access');
        } else if (res.statusCode === 422) {
          console.log('⚠️  UNPROCESSABLE: Non-image content');
        } else {
          console.log(`❌ Unexpected: ${res.statusCode}`);
        }
        
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error('❌ Error:', err.message);
      resolve();
    });

    req.end();
  });
}

async function runAutoTests() {
  console.log('🧪 Testing Image Proxy with Auto-Detected Facebook URLs\n');
  
  for (let i = 0; i < autoDetectedUrls.length; i++) {
    await testAutoDetectedUrl(autoDetectedUrls[i], i);
  }
  
  console.log('\n🎉 Auto-testing completed!');
  console.log(`📊 Results: Tested ${autoDetectedUrls.length} URLs`);
}

runAutoTests().catch(console.error);
