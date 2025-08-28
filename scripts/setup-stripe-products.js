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
    // Create Starter Plan Product
    console.log('📦 Creating Starter Plan product...');
    const starterProduct = await stripe.products.create({
      name: 'Starter Plan',
      description: 'Perfect for small agencies and freelancers',
      metadata: {
        plan_id: 'starter',
        features: 'Up to 3 ad accounts, Basic performance dashboard, Creative gallery access, Email support, Basic analytics'
      }
    });
    console.log(`✅ Created Starter product: ${starterProduct.id}`);

    // Create Professional Plan Product
    console.log('📦 Creating Professional Plan product...');
    const professionalProduct = await stripe.products.create({
      name: 'Professional Plan',
      description: 'Ideal for growing agencies and marketing teams',
      metadata: {
        plan_id: 'professional',
        features: 'Up to 10 ad accounts, Advanced performance dashboard, Creative gallery access, Priority email support, Advanced analytics, Custom reporting, Team collaboration'
      }
    });
    console.log(`✅ Created Professional product: ${professionalProduct.id}`);

    // Create Enterprise Plan Product
    console.log('📦 Creating Enterprise Plan product...');
    const enterpriseProduct = await stripe.products.create({
      name: 'Enterprise Plan',
      description: 'Built for large agencies and enterprise teams',
      metadata: {
        plan_id: 'enterprise',
        features: 'Unlimited ad accounts, Enterprise dashboard, Creative gallery access, 24/7 phone support, Advanced analytics, Custom reporting, Team collaboration, API access, Custom integrations'
      }
    });
    console.log(`✅ Created Enterprise product: ${enterpriseProduct.id}`);

    console.log('\n💰 Creating prices for all products...\n');

    // Create Starter Plan Prices (Free - no Stripe price needed)
    console.log('💵 Starter Plan is free - no Stripe price needed');

    // Create Professional Plan Prices
    console.log('💵 Creating Professional Plan prices...');
    const professionalMonthlyPrice = await stripe.prices.create({
      product: professionalProduct.id,
      unit_amount: 2900, // $29.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan_id: 'professional',
        billing_cycle: 'monthly',
        plan_name: 'Professional'
      }
    });
    console.log(`✅ Created Professional monthly price: ${professionalMonthlyPrice.id}`);

    const professionalAnnualPrice = await stripe.prices.create({
      product: professionalProduct.id,
      unit_amount: 29000, // $290.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'year'
      },
      metadata: {
        plan_id: 'professional',
        billing_cycle: 'annual',
        plan_name: 'Professional'
      }
    });
    console.log(`✅ Created Professional annual price: ${professionalAnnualPrice.id}`);

    // Create Enterprise Plan Prices
    console.log('💵 Creating Enterprise Plan prices...');
    const enterpriseMonthlyPrice = await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 9900, // $99.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan_id: 'enterprise',
        billing_cycle: 'monthly',
        plan_name: 'Enterprise'
      }
    });
    console.log(`✅ Created Enterprise monthly price: ${enterpriseMonthlyPrice.id}`);

    const enterpriseAnnualPrice = await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 99000, // $990.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'year'
      },
      metadata: {
        plan_id: 'enterprise',
        billing_cycle: 'annual',
        plan_name: 'Enterprise'
      }
    });
    console.log(`✅ Created Enterprise annual price: ${enterpriseAnnualPrice.id}`);

    console.log('\n🎉 Stripe products and prices created successfully!');
    console.log('\n📋 Add these price IDs to your .env.local file:\n');

    console.log('# Stripe Price IDs');
    console.log(`STRIPE_STARTER_MONTHLY_PRICE_ID=free`);
    console.log(`STRIPE_STARTER_ANNUAL_PRICE_ID=free`);
    console.log(`STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID=${professionalMonthlyPrice.id}`);
    console.log(`STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID=${professionalAnnualPrice.id}`);
    console.log(`STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=${enterpriseMonthlyPrice.id}`);
    console.log(`STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=${enterpriseAnnualPrice.id}`);

    console.log('\n💡 Note: Starter plan is free, so you can use "free" as the price ID or leave it empty.');
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
