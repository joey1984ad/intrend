#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up environment variables for N8N webhook integration...\n');

// Check if .env.local already exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('⚠️  .env.local already exists. Please manually add these variables:\n');
} else {
  console.log('📝 Creating .env.local file...\n');
}

const envContent = `# Facebook App Configuration
# Get these from https://developers.facebook.com/
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# Optional: Facebook App Domain (for production)
NEXT_PUBLIC_FACEBOOK_APP_DOMAIN=localhost

# n8n AI Creative Analyzer Integration
# The webhook URL for your n8n AI Creative Analyzer workflow
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/analyze-creatives
N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/analyze-creatives

# Database Configuration (Neon PostgreSQL)
# Get this from https://console.neon.tech/
DATABASE_URL=postgresql://username:password@hostname/database

# Vercel Blob Storage
# Get this from https://vercel.com/dashboard/stores
BLOB_READ_WRITE_TOKEN=your_blob_token_here
`;

if (!envExists) {
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local file created successfully!\n');
  } catch (error) {
    console.error('❌ Failed to create .env.local file:', error.message);
    console.log('\n📝 Please manually create .env.local with this content:\n');
    console.log(envContent);
    process.exit(1);
  }
} else {
  console.log('📝 Please add these variables to your existing .env.local file:\n');
}

console.log('🔑 Required Environment Variables:\n');
console.log('NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/analyze-creatives');
console.log('N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/analyze-creatives\n');

console.log('📋 Next Steps:');
console.log('1. Update the webhook URLs above with your actual n8n instance URL');
console.log('2. Fill in your Facebook App credentials');
console.log('3. Restart your Next.js development server');
console.log('4. Ensure n8n is running and the workflow is active');
console.log('5. Test the "🤖 Analyze" button in the Creatives tab\n');

console.log('🚀 For localhost development, you can use:');
console.log('   http://localhost:5678/webhook-test/analyze-creatives\n');

console.log('📚 See N8N_AI_SETUP_GUIDE.md for complete setup instructions');
