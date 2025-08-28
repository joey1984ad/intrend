#!/usr/bin/env node
const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
});

async function cleanupStripeProducts() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY is not configured in .env.local');
    process.exit(1);
  }

  console.log('🧹 Cleaning up Stripe products and prices...\n');

  try {
    // List all products
    const products = await stripe.products.list({ limit: 100 });
    console.log(`Found ${products.data.length} products in Stripe\n`);

    // List all prices
    const prices = await stripe.prices.list({ limit: 100 });
    console.log(`Found ${prices.data.length} prices in Stripe\n`);

    // Deactivate all old prices first
    console.log('🗑️  Deactivating old prices...');
    for (const price of prices.data) {
      if (price.active) {
        console.log(`Deactivating price: ${price.id} (${price.unit_amount / 100} ${price.currency})`);
        await stripe.prices.update(price.id, { active: false });
      }
    }

    // Deactivate all old products
    console.log('\n🗑️  Deactivating old products...');
    for (const product of products.data) {
      if (product.active) {
        console.log(`Deactivating product: ${product.id} (${product.name})`);
        await stripe.products.update(product.id, { active: false });
      }
    }

    console.log('\n✅ Cleanup completed!');
    console.log('🔄 Now run: npm run setup:stripe');
    console.log('💡 This will create fresh products with correct pricing');

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  cleanupStripeProducts().catch(console.error);
}

module.exports = { cleanupStripeProducts };
