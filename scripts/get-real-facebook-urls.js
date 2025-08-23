#!/usr/bin/env node

/**
 * Extract Real Facebook Image URLs for Testing
 * This script helps you find actual Facebook image URLs to test with
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Finding Real Facebook Image URLs for Testing\n');

// Check for database files or data exports
const dataSources = [
  'data/',
  'exports/',
  '*.json',
  '*.csv',
  '*.sqlite',
  '*.db'
];

console.log('📁 Looking for data sources...');

// Look for JSON files that might contain Facebook URLs
const jsonFiles = [];
const searchDirs = ['.', 'data', 'exports', 'backups'];

searchDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        if (file.endsWith('.json') && file.includes('facebook')) {
          jsonFiles.push(path.join(dir, file));
        }
      });
    } catch (e) {
      // Directory might not be readable
    }
  }
});

if (jsonFiles.length > 0) {
  console.log('📄 Found potential data files:');
  jsonFiles.forEach(file => console.log(`   ${file}`));
  
  // Try to extract URLs from the first file
  const firstFile = jsonFiles[0];
  console.log(`\n🔍 Analyzing ${firstFile}...`);
  
  try {
    const content = fs.readFileSync(firstFile, 'utf8');
    const data = JSON.parse(content);
    
    // Look for image URLs in the data
    const imageUrls = [];
    
    function extractUrls(obj, path = '') {
      if (typeof obj === 'string' && obj.includes('fbcdn.net')) {
        imageUrls.push({ url: obj, path: path });
      } else if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => {
          extractUrls(obj[key], path ? `${path}.${key}` : key);
        });
      }
    }
    
    extractUrls(data);
    
    if (imageUrls.length > 0) {
      console.log(`✅ Found ${imageUrls.length} Facebook image URLs:`);
      imageUrls.slice(0, 10).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.url}`);
        console.log(`      Path: ${item.path}`);
      });
      
      if (imageUrls.length > 10) {
        console.log(`   ... and ${imageUrls.length - 10} more`);
      }
      
      // Save the URLs to a test file
      const testUrls = imageUrls.map(item => item.url);
      fs.writeFileSync('test-urls.json', JSON.stringify(testUrls, null, 2));
      console.log('\n💾 Saved URLs to test-urls.json for easy testing');
      
    } else {
      console.log('❌ No Facebook image URLs found in this file');
    }
    
  } catch (e) {
    console.log('❌ Could not parse file:', e.message);
  }
  
} else {
  console.log('❌ No Facebook data files found');
}

console.log('\n📋 How to Get Real Facebook Image URLs:');
console.log('1. Check your Facebook Ads Manager for active ad creatives');
console.log('2. Look at your Facebook Business Manager assets');
console.log('3. Check your database for stored creative URLs');
console.log('4. Use Facebook Graph API to fetch ad creative data');
console.log('5. Look at your webhook data for recent ad updates');

console.log('\n🔧 Quick Test with Sample URLs:');
console.log('If you have real URLs, you can test them like this:');
console.log('node scripts/test-real-facebook-images.js');

console.log('\n💡 Tip: Facebook image URLs typically look like:');
console.log('   https://scontent-lax3-2.xx.fbcdn.net/v/t39.30808-6/...');
console.log('   https://scontent-lax3-1.xx.fbcdn.net/v/t39.30808-6/...');
console.log('   https://fbcdn.net/...');
