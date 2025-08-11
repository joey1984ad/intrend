#!/usr/bin/env node

/**
 * Setup script for ngrok HTTPS tunneling
 * This provides a real HTTPS URL for Facebook SDK testing
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Setting up ngrok for HTTPS tunneling...\n');

// Check if ngrok is installed
try {
  const ngrokVersion = execSync('ngrok version', { encoding: 'utf8' });
  console.log(`✅ ngrok is installed: ${ngrokVersion.trim()}`);
} catch (error) {
  console.log('❌ ngrok is not installed');
  console.log('\n📥 Installing ngrok...');
  
  try {
    // Install ngrok globally
    execSync('npm install -g ngrok', { stdio: 'inherit' });
    console.log('✅ ngrok installed successfully');
  } catch (installError) {
    console.log('❌ Failed to install ngrok via npm');
    console.log('\n📥 Please install ngrok manually:');
    console.log('1. Download from: https://ngrok.com/download');
    console.log('2. Extract to a folder in your PATH');
    console.log('3. Run this script again\n');
    process.exit(1);
  }
}

console.log('\n🔧 ngrok setup complete!');
console.log('\n📋 Usage Instructions:');
console.log('1. Start your Next.js server: npm run dev');
console.log('2. In another terminal, run: ngrok http 3000');
console.log('3. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)');
console.log('4. Use that URL to test Facebook SDK');
console.log('\n💡 Benefits:');
console.log('- Real HTTPS certificate (no browser warnings)');
console.log('- Public URL for testing');
console.log('- Facebook SDK will work perfectly');
console.log('\n⚠️  Note: ngrok URLs change each time you restart ngrok');
console.log('   Keep the terminal open to maintain the same URL');
