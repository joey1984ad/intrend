#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 Setting up mkcert for local HTTPS development...\n');

// Check if mkcert is installed
try {
  const mkcertVersion = execSync('mkcert -version', { encoding: 'utf8' });
  console.log(`✅ mkcert is installed: ${mkcertVersion.trim()}`);
} catch (error) {
  console.log('❌ mkcert is not installed or not in PATH');
  console.log('\n📥 Please install mkcert first:');
  console.log('1. Download from: https://github.com/FiloSottile/mkcert/releases');
  console.log('2. Add to PATH or place in project directory');
  console.log('3. Run this script again\n');
  process.exit(1);
}

// Check if certificates already exist
const certPath = path.join(__dirname, '..', 'localhost+2.pem');
const keyPath = path.join(__dirname, '..', 'localhost+2-key.pem');

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  console.log('✅ SSL certificates already exist');
} else {
  console.log('🔑 Generating SSL certificates...');
  
  try {
    // Install root CA
    console.log('📋 Installing root CA...');
    execSync('mkcert -install', { stdio: 'inherit' });
    
    // Generate certificates for localhost
    console.log('🔐 Generating certificates for localhost...');
    execSync('mkcert localhost 127.0.0.1 ::1', { stdio: 'inherit' });
    
    console.log('✅ SSL certificates generated successfully!');
  } catch (error) {
    console.error('❌ Failed to generate certificates:', error.message);
    process.exit(1);
  }
}

// Verify Next.js config
const nextConfigPath = path.join(__dirname, '..', 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  const configContent = fs.readFileSync(nextConfigPath, 'utf8');
  if (configContent.includes('localhost+2.pem')) {
    console.log('✅ Next.js config is properly configured for HTTPS');
  } else {
    console.log('⚠️  Next.js config needs HTTPS configuration');
    console.log('   Please ensure next.config.js includes SSL certificate paths');
  }
} else {
  console.log('⚠️  next.config.js not found');
}

console.log('\n🚀 Setup complete! You can now run:');
console.log('   npm run dev:mkcert');
console.log('\n🌐 Your app will be available at: https://localhost:3000');
console.log('🔐 Facebook SDK login should now work properly!');
