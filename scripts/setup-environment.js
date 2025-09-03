#!/usr/bin/env node

/**
 * Environment Setup Script
 * 
 * This script helps you set up the required environment variables for the subscription system.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Environment Setup for Subscription System\n');

// Check if .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local');
const envLocalNewPath = path.join(process.cwd(), 'env.local.new');

if (fs.existsSync(envLocalPath)) {
  console.log('✅ .env.local file exists');
  
  // Read and check current configuration
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_STARTUP_MONTHLY_PRICE_ID',
    'STRIPE_STARTUP_ANNUAL_PRICE_ID',
    'STRIPE_PRO_MONTHLY_PRICE_ID',
    'STRIPE_PRO_ANNUAL_PRICE_ID',
    'DATABASE_URL'
  ];
  
  console.log('\n📋 Checking required environment variables:');
  
  let missingVars = [];
  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=your_`)) {
      console.log(`  ✅ ${varName} - Configured`);
    } else {
      console.log(`  ❌ ${varName} - Missing or not configured`);
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log(`\n⚠️  Missing ${missingVars.length} required environment variables:`);
    missingVars.forEach(varName => {
      console.log(`  - ${varName}`);
    });
    
    console.log('\n📝 To fix this:');
    console.log('1. Copy the template from env.local.new');
    console.log('2. Replace the placeholder values with your actual Stripe and database credentials');
    console.log('3. Restart your development server');
  } else {
    console.log('\n🎉 All required environment variables are configured!');
  }
  
} else {
  console.log('❌ .env.local file not found');
  
  if (fs.existsSync(envLocalNewPath)) {
    console.log('\n📝 To create .env.local:');
    console.log('1. Copy env.local.new to .env.local');
    console.log('2. Replace the placeholder values with your actual credentials');
    console.log('3. Restart your development server');
    
    console.log('\n📋 Required Stripe Configuration:');
    console.log('- STRIPE_SECRET_KEY: Your Stripe secret key (starts with sk_test_ or sk_live_)');
    console.log('- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Your Stripe publishable key (starts with pk_test_ or pk_live_)');
    console.log('- STRIPE_WEBHOOK_SECRET: Your webhook endpoint secret (starts with whsec_)');
    console.log('- STRIPE_STARTUP_MONTHLY_PRICE_ID: Price ID for Startup monthly plan (starts with price_)');
    console.log('- STRIPE_STARTUP_ANNUAL_PRICE_ID: Price ID for Startup annual plan (starts with price_)');
    console.log('- STRIPE_PRO_MONTHLY_PRICE_ID: Price ID for Pro monthly plan (starts with price_)');
    console.log('- STRIPE_PRO_ANNUAL_PRICE_ID: Price ID for Pro annual plan (starts with price_)');
    console.log('- DATABASE_URL: Your PostgreSQL database connection string');
  } else {
    console.log('❌ env.local.new template not found');
  }
}

console.log('\n🔗 Helpful Links:');
console.log('- Stripe Dashboard: https://dashboard.stripe.com/');
console.log('- Stripe Price IDs: https://dashboard.stripe.com/products');
console.log('- Webhook Setup: https://dashboard.stripe.com/webhooks');

console.log('\n📖 Next Steps:');
console.log('1. Set up your environment variables');
console.log('2. Create Stripe products and prices');
console.log('3. Set up webhook endpoint');
console.log('4. Test the subscription system');
