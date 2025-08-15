#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up environment configuration for AI Analysis...\n');

// Check if .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local');
const envProductionPath = path.join(process.cwd(), '.env.production');

// Function to create/update .env.local
function setupEnvLocal() {
  console.log('📝 Setting up .env.local for local development...');
  
  const envLocalContent = `# Facebook App Configuration for Localhost Development
NEXT_PUBLIC_FACEBOOK_APP_ID=385179143409209
FACEBOOK_APP_SECRET=141abb7ae8ad164748c83704c24f8f60
FACEBOOK_ACCESS_TOKEN=EAAFeUYIEjjkBPMGj0ZB3bBOOTezkYdbZCW10KZCMADV0FXUdqW9hxbRAWa1Qy9oyYqTIiyNzWZAdsi0xVJZAZBDxHCfMEeej2uTilZAbHrnZCgZC8MJmL4pv3S4eaMyX4DBdxtmRoHrN4wTqQcFE7TFjLeGRjvZAbduB3ENtKi3hyCZCvuzeSYV9JslkD6UG9V5l02EgUoYoy8ZCX8ZAyz7BW1cdN0ErWEYStMorcX2nHByIRtLzT

NEXT_PUBLIC_FACEBOOK_APP_DOMAIN=localhost

# Database Configuration (Neon PostgreSQL)
DATABASE_URL=postgres://neondb_owner:npg_nEZkr6g8XpzM@ep-shiny-voice-ad2t4p46-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_ii3W1LqA3ocpHyIQ_XL1XbQxebBmRIEj1TINjEXaBJgIJea

# n8n Configuration
N8N_HOST=http://localhost:5678
N8N_API_KEY=__n8n_BLANK_VALUE_e5362baf-c777-4d57-a609-6eaf1f9e87f6

# n8n AI Creative Analyzer Integration - Local Development
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/analyze-creatives
`;

  try {
    fs.writeFileSync(envLocalPath, envLocalContent);
    console.log('✅ .env.local created/updated successfully');
  } catch (error) {
    console.error('❌ Error creating .env.local:', error.message);
  }
}

// Function to create .env.production
function setupEnvProduction() {
  console.log('📝 Setting up .env.production for production...');
  
  const envProductionContent = `# Facebook App Configuration for Production
NEXT_PUBLIC_FACEBOOK_APP_ID=your_production_app_id_here
FACEBOOK_APP_SECRET=your_production_app_secret_here
FACEBOOK_ACCESS_TOKEN=your_production_access_token_here

NEXT_PUBLIC_FACEBOOK_APP_DOMAIN=your-domain.com

# Database Configuration (Production)
DATABASE_URL=postgresql://username:password@hostname/database

# Vercel Blob Storage (Production)
BLOB_READ_WRITE_TOKEN=your_production_blob_token_here

# n8n Configuration (Production)
N8N_HOST=https://your-n8n-domain.com
N8N_API_KEY=your_production_n8n_api_key_here

# n8n AI Creative Analyzer Integration - Production
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-domain.com/webhook/analyze-creatives

# Additional Production Settings
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
`;

  try {
    fs.writeFileSync(envProductionPath, envProductionContent);
    console.log('✅ .env.production created successfully');
  } catch (error) {
    console.error('❌ Error creating .env.production:', error.message);
  }
}

// Function to validate environment setup
function validateSetup() {
  console.log('\n🔍 Validating environment setup...');
  
  const requiredVars = [
    'NEXT_PUBLIC_FACEBOOK_APP_ID',
    'FACEBOOK_ACCESS_TOKEN',
    'NEXT_PUBLIC_N8N_WEBHOOK_URL',
    'DATABASE_URL'
  ];
  
  let allValid = true;
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Configured`);
    } else {
      console.log(`❌ ${varName}: Missing`);
      allValid = false;
    }
  });
  
  if (allValid) {
    console.log('\n🎉 All required environment variables are configured!');
  } else {
    console.log('\n⚠️ Some environment variables are missing. Please check your .env.local file.');
  }
  
  return allValid;
}

// Main execution
async function main() {
  try {
    setupEnvLocal();
    setupEnvProduction();
    
    console.log('\n📋 Next steps:');
    console.log('1. Review and update the generated .env.local file with your actual values');
    console.log('2. Update .env.production with your production values');
    console.log('3. Restart your Next.js development server');
    console.log('4. Ensure n8n is running on http://localhost:5678');
    console.log('5. Test the AI analysis feature');
    
    console.log('\n🔧 To test the setup, run:');
    console.log('npm run dev');
    console.log('Then try the AI analysis feature in your app.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
main();
