#!/usr/bin/env node

/**
 * Fetch Real Facebook Ad Creative URLs
 * Uses Facebook Graph API to get actual image URLs for testing
 */

const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

if (!accessToken) {
  console.error('❌ FACEBOOK_ACCESS_TOKEN not found in .env.local');
  process.exit(1);
}

async function fetchAdCreatives() {
  try {
    console.log('🔍 Fetching Facebook Ad Creatives...\n');
    
    // First, get ad accounts
    const accountsResponse = await fetch(`https://graph.facebook.com/v18.0/me/adaccounts?access_token=${accessToken}&fields=id,name,account_status`);
    
    if (!accountsResponse.ok) {
      throw new Error(`Failed to fetch ad accounts: ${accountsResponse.status}`);
    }
    
    const accountsData = await accountsResponse.json();
    console.log(`📊 Found ${accountsData.data.length} ad accounts`);
    
    if (accountsData.data.length === 0) {
      console.log('❌ No ad accounts found. Make sure your token has ads_read permission.');
      return;
    }
    
    // Use the first active ad account
    const adAccount = accountsData.data.find(acc => acc.account_status === 1);
    if (!adAccount) {
      console.log('❌ No active ad accounts found');
      return;
    }
    
    console.log(`✅ Using ad account: ${adAccount.name} (${adAccount.id})`);
    
    // Get ads from this account
    const adsResponse = await fetch(`https://graph.facebook.com/v18.0/${adAccount.id}/ads?access_token=${accessToken}&fields=id,name,creative{id,image_url,thumbnail_url,object_story_spec}&limit=10`);
    
    if (!adsResponse.ok) {
      throw new Error(`Failed to fetch ads: ${adsResponse.status}`);
    }
    
    const adsData = await adsResponse.json();
    console.log(`📊 Found ${adsData.data.length} ads`);
    
    if (adsData.data.length === 0) {
      console.log('❌ No ads found in this account');
      return;
    }
    
    // Extract image URLs from creatives
    const imageUrls = [];
    
    adsData.data.forEach(ad => {
      if (ad.creative) {
        const creative = ad.creative;
        if (creative.image_url) {
          imageUrls.push({
            adId: ad.id,
            adName: ad.name,
            creativeId: creative.id,
            imageUrl: creative.image_url,
            type: 'image_url'
          });
        }
        if (creative.thumbnail_url) {
          imageUrls.push({
            adId: ad.id,
            adName: ad.name,
            creativeId: creative.id,
            imageUrl: creative.thumbnail_url,
            type: 'thumbnail_url'
          });
        }
      }
    });
    
    if (imageUrls.length === 0) {
      console.log('❌ No image URLs found in ad creatives');
      return;
    }
    
    console.log(`✅ Found ${imageUrls.length} image URLs:`);
    imageUrls.forEach((item, index) => {
      console.log(`\n${index + 1}. Ad: ${item.adName} (${item.adId})`);
      console.log(`   Creative: ${item.creativeId}`);
      console.log(`   Type: ${item.type}`);
      console.log(`   URL: ${item.imageUrl}`);
    });
    
    // Save URLs for testing
    const testData = {
      timestamp: new Date().toISOString(),
      adAccount: adAccount.id,
      imageUrls: imageUrls
    };
    
    fs.writeFileSync('real-facebook-urls.json', JSON.stringify(testData, null, 2));
    console.log('\n💾 Saved URLs to real-facebook-urls.json');
    
    // Create a test script with these URLs
    const testScript = `#!/usr/bin/env node

/**
 * Test Image Proxy with Real Facebook URLs
 * Generated from Facebook API data
 */

const http = require('http');
require('dotenv').config({ path: '.env.local' });

const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
const testUrls = ${JSON.stringify(imageUrls.map(item => item.imageUrl), null, 2)};

async function testRealUrl(url, index) {
  return new Promise((resolve) => {
    console.log(\`\\n🧪 Test \${index + 1}: \${url.substring(0, 60)}...\`);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: \`/api/proxy-image?url=\${encodeURIComponent(url)}&token=\${encodeURIComponent(accessToken)}\`,
      method: 'GET',
      timeout: 15000
    };

    const req = http.request(options, (res) => {
      console.log(\`📥 Status: \${res.statusCode} \${res.statusMessage}\`);
      console.log(\`📊 Content-Type: \${res.headers['content-type']}\`);
      
      let data = Buffer.alloc(0);
      res.on('data', (chunk) => {
        data = Buffer.concat([data, chunk]);
      });
      
      res.on('end', () => {
        if (res.statusCode === 200 && res.headers['content-type']?.startsWith('image/')) {
          console.log('✅ SUCCESS: Image proxied successfully!');
          console.log(\`📏 Size: \${data.length} bytes\`);
        } else if (res.statusCode === 403) {
          console.log('🔒 FORBIDDEN: Facebook denied access');
        } else if (res.statusCode === 422) {
          console.log('⚠️  UNPROCESSABLE: Non-image content');
        } else {
          console.log(\`❌ Unexpected: \${res.statusCode}\`);
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

async function runTests() {
  console.log('🧪 Testing Image Proxy with Real Facebook URLs\\n');
  
  for (let i = 0; i < testUrls.length; i++) {
    await testRealUrl(testUrls[i], i);
  }
  
  console.log('\\n🎉 Testing completed!');
}

runTests().catch(console.error);
`;
    
    fs.writeFileSync('test-real-urls.js', testScript);
    console.log('💾 Created test-real-urls.js for easy testing');
    
    console.log('\n🔧 To test these URLs, run:');
    console.log('   node test-real-urls.js');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('403')) {
      console.log('\n💡 This might be a permissions issue. Check:');
      console.log('   1. Token has ads_read permission');
      console.log('   2. Token is not expired');
      console.log('   3. App has been approved for ads access');
    }
  }
}

// Check if fetch is available
if (typeof fetch === 'undefined') {
  console.error('❌ Fetch not available. This script requires Node.js 18+ or a fetch polyfill.');
  process.exit(1);
}

fetchAdCreatives();
