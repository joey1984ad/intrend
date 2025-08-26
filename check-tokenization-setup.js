#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking Tokenization Setup...\n');

// Check required variables for tokenization
const requiredVars = {
  'FACEBOOK_ACCESS_TOKEN': 'Required for Facebook CDN URL tokenization',
  'NEXT_PUBLIC_N8N_WEBHOOK_URL': 'Required for AI analysis workflow',
  'OPENAI_API_KEY': 'Required for real AI image optimization'
};

let missingVars = [];
let allGood = true;

console.log('📋 Required Environment Variables:');
console.log('================================');

Object.entries(requiredVars).forEach(([varName, description]) => {
  const value = process.env[varName];
  if (value && value.trim() !== '') {
    // Mask sensitive values
    const displayValue = varName.includes('TOKEN') || varName.includes('KEY') 
      ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`❌ ${varName}: MISSING - ${description}`);
    missingVars.push(varName);
    allGood = false;
  }
});

console.log('\n🔧 Tokenization Status:');
console.log('========================');

if (allGood) {
  console.log('✅ All required variables are set!');
  console.log('✅ Tokenization should work properly');
  console.log('✅ Try AI analysis again');
} else {
  console.log('❌ Missing required variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}: ${requiredVars[varName]}`);
  });
  
  console.log('\n📝 To fix tokenization:');
  console.log('1. Add missing variables to .env.local');
  console.log('2. Restart your development server');
  console.log('3. Try AI analysis again');
}

console.log('\n💡 Quick Fix:');
console.log('==============');
console.log('Add these to your .env.local file:');

if (!process.env.FACEBOOK_ACCESS_TOKEN) {
  console.log('FACEBOOK_ACCESS_TOKEN=your_facebook_access_token_here');
}
if (!process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL) {
  console.log('NEXT_PUBLIC_N8N_WEBHOOK_URL=https://n8n-meh7.onrender.com/webhook/analyze-creatives');
}
if (!process.env.OPENAI_API_KEY) {
  console.log('OPENAI_API_KEY=your_openai_api_key_here');
}

console.log('\n🔄 After adding variables:');
console.log('1. Save .env.local');
console.log('2. Restart: npm run dev');
console.log('3. Test AI analysis again');
