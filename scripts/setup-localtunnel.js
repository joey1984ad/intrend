#!/usr/bin/env node

/**
 * Setup script for localtunnel HTTPS tunneling
 * Alternative to ngrok for creating HTTPS tunnels
 */

const { execSync } = require('child_process');

console.log('🚀 Setting up localtunnel for HTTPS tunneling...\n');

// Check if localtunnel is installed
try {
  const localtunnelVersion = execSync('npx localtunnel --version', { encoding: 'utf8' });
  console.log(`✅ localtunnel is available via npx`);
} catch (error) {
  console.log('❌ localtunnel not available');
  console.log('\n📥 localtunnel will be installed automatically when you run it');
}

console.log('\n🔧 localtunnel setup complete!');
console.log('\n📋 Usage Instructions:');
console.log('1. Start your Next.js server: npm run dev');
console.log('2. In another terminal, run: npx localtunnel --port 3000');
console.log('3. Copy the HTTPS URL (e.g., https://abc123.loca.lt)');
console.log('4. Use that URL to test Facebook SDK');
console.log('\n💡 Benefits:');
console.log('- Real HTTPS certificate (no browser warnings)');
console.log('- Public URL for testing');
console.log('- Facebook SDK will work perfectly');
console.log('- No installation required (uses npx)');
console.log('\n⚠️  Note: localtunnel URLs change each time you restart');
console.log('   Keep the terminal open to maintain the same URL');
console.log('\n🚀 Ready to use! Run: npx localtunnel --port 3000');
