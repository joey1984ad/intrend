#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// New Stripe price IDs from the setup script
const NEW_PRICE_IDS = {
  STRIPE_STARTER_MONTHLY_PRICE_ID: 'free',
  STRIPE_STARTER_ANNUAL_PRICE_ID: 'free',
  STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID: 'price_1S11b1ANcZDuq7213uaqs6rr',
  STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID: 'price_1S11b1ANcZDuq721CxBHEy5F',
  STRIPE_ENTERPRISE_MONTHLY_PRICE_ID: 'price_1S11b1ANcZDuq7211N4sQR8X',
  STRIPE_ENTERPRISE_ANNUAL_PRICE_ID: 'price_1S11b1ANcZDuq721anWxi6r5'
};

async function updateStripePrices() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  try {
    // Read the current .env.local file
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    console.log('🔄 Updating Stripe price IDs in .env.local...\n');
    
    // Update each price ID
    Object.entries(NEW_PRICE_IDS).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*`, 'm');
      const newLine = `${key}=${value}`;
      
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, newLine);
        console.log(`✅ Updated ${key}=${value}`);
      } else {
        // Add the line if it doesn't exist
        envContent += `\n${newLine}`;
        console.log(`➕ Added ${key}=${value}`);
      }
    });
    
    // Write the updated content back to the file
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n🎉 Successfully updated .env.local with new Stripe price IDs!');
    console.log('\n📋 New price IDs:');
    Object.entries(NEW_PRICE_IDS).forEach(([key, value]) => {
      console.log(`   ${key}=${value}`);
    });
    
    console.log('\n🔄 Please restart your development server for changes to take effect.');
    
  } catch (error) {
    console.error('❌ Error updating .env.local:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  updateStripePrices().catch(console.error);
}

module.exports = { updateStripePrices };
