#!/usr/bin/env node

const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
});

async function setupStripeProducts() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY is not configured in .env.local');
    process.exit(1);
  }

  console.log('🚀 Setting up Stripe products and prices...\n');

  try {
    // Create Free Plan Product
    console.log('📦 Creating Free Plan product...');
    const freeProduct = await stripe.products.create({
      name: 'Free Plan',
      description: 'Perfect for small agencies and freelancers',
      metadata: {
        plan_id: 'free',
        features: 'Up to 3 ad accounts, Basic performance dashboard, Creative gallery access, Email support, Basic analytics'
      }
    });
    console.log(`✅ Created Free product: ${freeProduct.id}`);

    // Create Startup Plan Product
    console.log('📦 Creating Startup Plan product...');
    const startupProduct = await stripe.products.create({
      name: 'Startup Plan',
      description: 'Ideal for growing agencies and marketing teams',
      metadata: {
        plan_id: 'startup',
        features: 'Up to 10 ad accounts, Advanced performance dashboard, Creative gallery access, Priority email support, Advanced analytics, Custom reporting, Team collaboration'
      }
    });
    console.log(`✅ Created Startup product: ${startupProduct.id}`);

    // Create Pro Plan Product
    console.log('📦 Creating Pro Plan product...');
    const proProduct = await stripe.products.create({
      name: 'Pro Plan',
      description: 'Built for large agencies and enterprise teams',
      metadata: {
        plan_id: 'pro',
        features: 'Unlimited ad accounts, Enterprise dashboard, Creative gallery access, 24/7 phone support, Advanced analytics, Custom reporting, Team collaboration, API access, Custom integrations'
      }
    });
    console.log(`✅ Created Pro product: ${proProduct.id}`);

    console.log('\n💰 Creating prices for all products...\n');

    // Create Free Plan Prices (Free - no Stripe price needed)
    console.log('💵 Free Plan is free - no Stripe price needed');

    // Create Startup Plan Prices
    console.log('💵 Creating Startup Plan prices...');
    const startupMonthlyPrice = await stripe.prices.create({
      product: startupProduct.id,
      unit_amount: 1000, // $10.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan_id: 'startup',
        billing_cycle: 'monthly',
        plan_name: 'Startup'
      }
    });
    console.log(`✅ Created Startup monthly price: ${startupMonthlyPrice.id}`);

    const startupAnnualPrice = await stripe.prices.create({
      product: startupProduct.id,
      unit_amount: 9600, // $96.00 in cents (20% discount)
      currency: 'usd',
      recurring: {
        interval: 'year'
      },
      metadata: {
        plan_id: 'startup',
        billing_cycle: 'annual',
        plan_name: 'Startup'
      }
    });
    console.log(`✅ Created Startup annual price: ${startupAnnualPrice.id}`);

    // Create Pro Plan Prices
    console.log('💵 Creating Pro Plan prices...');
    const proMonthlyPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 2000, // $20.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan_id: 'pro',
        billing_cycle: 'monthly',
        plan_name: 'Pro'
      }
    });
    console.log(`✅ Created Pro monthly price: ${proMonthlyPrice.id}`);

    const proAnnualPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 19200, // $192.00 in cents (20% discount)
      currency: 'usd',
      recurring: {
        interval: 'year'
      },
      metadata: {
        plan_id: 'pro',
        billing_cycle: 'annual',
        plan_name: 'Pro'
      }
    });
    console.log(`✅ Created Pro annual price: ${proAnnualPrice.id}`);

    console.log('\n🎉 Stripe products and prices created successfully!');
    console.log('\n📋 Add these price IDs to your .env.local file:\n');

    console.log('# Stripe Price IDs');
    console.log(`STRIPE_FREE_MONTHLY_PRICE_ID=free`);
    console.log(`STRIPE_FREE_ANNUAL_PRICE_ID=free`);
    console.log(`STRIPE_STARTUP_MONTHLY_PRICE_ID=${startupMonthlyPrice.id}`);
    console.log(`STRIPE_STARTUP_ANNUAL_PRICE_ID=${startupAnnualPrice.id}`);
    console.log(`STRIPE_PRO_MONTHLY_PRICE_ID=${proMonthlyPrice.id}`);
    console.log(`STRIPE_PRO_ANNUAL_PRICE_ID=${proAnnualPrice.id}`);

    console.log('\n💡 Note: Free plan is free, so you can use "free" as the price ID or leave it empty.');
    console.log('\n🔄 After adding these to .env.local, restart your development server.');

  } catch (error) {
    console.error('❌ Error setting up Stripe products:', error.message);
    if (error.code === 'authentication_failed') {
      console.error('💡 Make sure your STRIPE_SECRET_KEY is correct and has the right permissions');
    }
    process.exit(1);
  }
}

if (require.main === module) {
  setupStripeProducts().catch(console.error);
}

module.exports = { setupStripeProducts };
