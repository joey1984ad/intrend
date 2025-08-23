#!/usr/bin/env node

/**
 * Auto-Detect Facebook Image URLs
 * Automatically finds Facebook image URLs in your existing data
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Auto-Detecting Facebook Image URLs...\n');

// Files to search for Facebook URLs
const searchFiles = [
  'Main Ai Creative Analysis.json',
  '.env.local',
  // Add more files as needed
];

// Directories to search recursively
const searchDirs = [
  'components/',
  'app/',
  'lib/',
  'scripts/',
  // Add more directories as needed
];

// Facebook URL patterns to detect
const facebookPatterns = [
  /https:\/\/scontent-[^\/]+\.xx\.fbcdn\.net\/[^"'\s]+/g,
  /https:\/\/fbcdn\.net\/[^"'\s]+/g,
  /https:\/\/instagram\.com\/[^"'\s]+/g,
  /https:\/\/cdninstagram\.com\/[^"'\s]+/g,
  /https:\/\/igcdn\.com\/[^"'\s]+/g,
  /https:\/\/fbsbx\.com\/[^"'\s]+/g,
  /https:\/\/facebook\.com\/[^"'\s]+/g,
  /https:\/\/fb\.com\/[^"'\s]+/g
];

let allFoundUrls = new Set();

// Search in specific files
function searchInFiles() {
  console.log('📁 Searching in specific files...');
  
  searchFiles.forEach(filename => {
    if (fs.existsSync(filename)) {
      console.log(`   🔍 Scanning: ${filename}`);
      try {
        const content = fs.readFileSync(filename, 'utf8');
        extractUrlsFromContent(content, filename);
      } catch (error) {
        console.log(`      ❌ Error reading ${filename}: ${error.message}`);
      }
    } else {
      console.log(`   ⚠️  File not found: ${filename}`);
    }
  });
}

// Search in directories recursively
function searchInDirectories() {
  console.log('\n📁 Searching in directories recursively...');
  
  searchDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`   🔍 Scanning: ${dir}`);
      searchDirectoryRecursively(dir);
    } else {
      console.log(`   ⚠️  Directory not found: ${dir}`);
    }
  });
}

// Recursively search a directory
function searchDirectoryRecursively(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .git
        if (!item.startsWith('.') && item !== 'node_modules') {
          searchDirectoryRecursively(fullPath);
        }
      } else if (stat.isFile()) {
        // Check if it's a text-based file
        const ext = path.extname(item).toLowerCase();
        const textExtensions = ['.js', '.ts', '.tsx', '.jsx', '.json', '.md', '.txt', '.env', '.yml', '.yaml'];
        
        if (textExtensions.includes(ext) || item.includes('facebook') || item.includes('creative')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            extractUrlsFromContent(content, fullPath);
          } catch (error) {
            // Skip binary files
          }
        }
      }
    });
  } catch (error) {
    // Skip directories we can't read
  }
}

// Extract URLs from content
function extractUrlsFromContent(content, sourceFile) {
  facebookPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(url => {
        // Clean up the URL (remove trailing punctuation)
        const cleanUrl = url.replace(/[.,;!?]+$/, '');
        allFoundUrls.add(cleanUrl);
        console.log(`      ✅ Found: ${cleanUrl.substring(0, 60)}...`);
      });
    }
  });
}

// Generate test script with found URLs
function generateTestScript() {
  if (allFoundUrls.size === 0) {
    console.log('\n❌ No Facebook image URLs found automatically');
    console.log('💡 You may need to:');
    console.log('   1. Check if your data files contain Facebook URLs');
    console.log('   2. Use the manual method (edit test-custom-urls.js)');
    console.log('   3. Get URLs from Facebook Ads Manager directly');
    return;
  }
  
  console.log(`\n🎉 Found ${allFoundUrls.size} Facebook image URLs automatically!`);
  
  // Convert Set to Array
  const urlArray = Array.from(allFoundUrls);
  
  // Save URLs to JSON file
  const urlsData = {
    timestamp: new Date().toISOString(),
    totalUrls: urlArray.length,
    urls: urlArray
  };
  
  fs.writeFileSync('auto-detected-urls.json', JSON.stringify(urlsData, null, 2));
  console.log('💾 Saved URLs to: auto-detected-urls.json');
  
  // Generate test script
  const testScript = `#!/usr/bin/env node

/**
 * Auto-Generated Test Script for Facebook Image URLs
 * Generated on: ${new Date().toISOString()}
 * Total URLs: ${urlArray.length}
 */

const http = require('http');
require('dotenv').config({ path: '.env.local' });

const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

if (!accessToken) {
  console.error('❌ FACEBOOK_ACCESS_TOKEN not found in .env.local');
  process.exit(1);
}

// Auto-detected Facebook image URLs
const autoDetectedUrls = ${JSON.stringify(urlArray, null, 2)};

console.log('🔑 Using Facebook Access Token:', accessToken.substring(0, 20) + '...');
console.log('📏 Token Length:', accessToken.length);
console.log('🔍 Auto-detected URLs:', autoDetectedUrls.length);
console.log('');

async function testAutoDetectedUrl(url, index) {
  return new Promise((resolve) => {
    console.log(\`\\n🧪 Test \${index + 1}/\${autoDetectedUrls.length}: Auto-Detected URL\`);
    console.log(\`🔗 URL: \${url.substring(0, 80)}...\`);
    
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
          
          // Save the image
          const filename = \`auto-test-image-\${index + 1}.jpg\`;
          require('fs').writeFileSync(filename, data);
          console.log(\`💾 Image saved as: \${filename}\`);
          
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

async function runAutoTests() {
  console.log('🧪 Testing Image Proxy with Auto-Detected Facebook URLs\\n');
  
  for (let i = 0; i < autoDetectedUrls.length; i++) {
    await testAutoDetectedUrl(autoDetectedUrls[i], i);
  }
  
  console.log('\\n🎉 Auto-testing completed!');
  console.log(\`📊 Results: Tested \${autoDetectedUrls.length} URLs\`);
}

runAutoTests().catch(console.error);
`;
  
  fs.writeFileSync('test-auto-detected-urls.js', testScript);
  console.log('💾 Generated test script: test-auto-detected-urls.js');
  
  console.log('\n🔧 To test all auto-detected URLs, run:');
  console.log('   node test-auto-detected-urls.js');
  
  console.log('\n📋 Summary:');
  console.log(`   - Found ${allFoundUrls.length} Facebook image URLs`);
  console.log('   - Saved to: auto-detected-urls.json');
  console.log('   - Generated test script: test-auto-detected-urls.js');
}

// Run the auto-detection
console.log('🚀 Starting auto-detection...\n');

searchInFiles();
searchInDirectories();
generateTestScript();
