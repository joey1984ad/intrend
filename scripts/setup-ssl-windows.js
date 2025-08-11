#!/usr/bin/env node

/**
 * Windows SSL Certificate Setup Script
 * Generates proper HTTPS certificates for localhost development
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 Setting up SSL certificates for localhost HTTPS...\n');

// Check if mkcert is installed
let mkcertInstalled = false;
try {
  const mkcertVersion = execSync('mkcert -version', { encoding: 'utf8' });
  console.log(`✅ mkcert is installed: ${mkcertVersion.trim()}`);
  mkcertInstalled = true;
} catch (error) {
  console.log('❌ mkcert is not installed');
}

if (!mkcertInstalled) {
  console.log('\n📥 Installing mkcert...');
  console.log('\n🔧 For Windows, you need to install mkcert manually:');
  console.log('1. Download from: https://github.com/FiloSottile/mkcert/releases');
  console.log('2. Download the Windows executable (mkcert-v1.4.4-windows-amd64.exe)');
  console.log('3. Rename it to "mkcert.exe"');
  console.log('4. Place it in a folder in your PATH (e.g., C:\\Windows\\System32)');
  console.log('5. Or place it in your project directory');
  console.log('\n💡 Alternative: Use Chocolatey package manager:');
  console.log('   choco install mkcert');
  console.log('\n💡 Alternative: Use Scoop package manager:');
  console.log('   scoop install mkcert');
  
  // Check if mkcert.exe exists in current directory
  const localMkcert = path.join(__dirname, '..', 'mkcert.exe');
  if (fs.existsSync(localMkcert)) {
    console.log('\n✅ Found mkcert.exe in project directory');
    console.log('🔧 Using local mkcert.exe...');
    try {
      const version = execSync(`"${localMkcert}" -version`, { encoding: 'utf8' });
      console.log(`✅ Local mkcert version: ${version.trim()}`);
      mkcertInstalled = true;
    } catch (error) {
      console.log('❌ Local mkcert failed to run');
    }
  }
}

if (!mkcertInstalled) {
  console.log('\n❌ Please install mkcert first, then run this script again');
  process.exit(1);
}

// Generate certificates
console.log('\n🔑 Generating SSL certificates...');

try {
  // Install root CA
  console.log('📋 Installing root CA...');
  execSync('mkcert -install', { stdio: 'inherit' });
  
  // Generate certificates for localhost
  console.log('🔐 Generating certificates for localhost...');
  execSync('mkcert localhost 127.0.0.1 ::1', { stdio: 'inherit' });
  
  console.log('✅ SSL certificates generated successfully!');
  
  // Check if certificates exist
  const certPath = path.join(__dirname, '..', 'localhost+2.pem');
  const keyPath = path.join(__dirname, '..', 'localhost+2-key.pem');
  
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    console.log('✅ Certificate files created:');
    console.log(`   Certificate: ${certPath}`);
    console.log(`   Private Key: ${keyPath}`);
  }
  
} catch (error) {
  console.error('❌ Failed to generate certificates:', error.message);
  process.exit(1);
}

// Update Next.js config
console.log('\n🔧 Updating Next.js configuration...');
const nextConfigPath = path.join(__dirname, '..', 'next.config.js');

try {
  let configContent = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Check if HTTPS config already exists
  if (configContent.includes('localhost+2.pem')) {
    console.log('✅ Next.js config already has SSL certificate paths');
  } else {
    // Add HTTPS configuration
    const httpsConfig = `
const fs = require('fs');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // HTTPS configuration for local development
  server: {
    https: {
      key: fs.readFileSync(path.join(__dirname, 'localhost+2-key.pem')),
      cert: fs.readFileSync(path.join(__dirname, 'localhost+2.pem')),
    },
  },
  
  // Handle redirects
  async redirects() {
    return [];
  },
};

module.exports = nextConfig;`;
    
    fs.writeFileSync(nextConfigPath, httpsConfig);
    console.log('✅ Next.js config updated with SSL certificates');
  }
  
} catch (error) {
  console.error('❌ Failed to update Next.js config:', error.message);
}

console.log('\n🎉 SSL setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Restart your Next.js development server');
console.log('2. Run: npm run dev');
console.log('3. Access: https://localhost:3000');
console.log('4. Accept the security warning (this is normal for localhost)');
console.log('5. Facebook SDK will work perfectly with HTTPS!');
console.log('\n💡 Note: The security warning is normal for localhost HTTPS');
console.log('   Click "Advanced" → "Proceed to localhost (unsafe)"');
