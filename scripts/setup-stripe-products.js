#!/usr/bin/env node

/**
 * Stripe Products and Prices Setup Script
 * 
 * This script creates the necessary Stripe products and prices for your pricing plans.
 * It will output the price IDs that you need to add to your .env.local file.
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Stripe instance
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    })
  : null;

// Pricing plans configuration
const PRICING_PLANS = {
  startup: {
    name: 'Startup Plan',
    description: 'Ideal for growing agencies and marketing teams',
    monthly: {
      price: 1000, // $10.00 in cents
      interval: 'month'
    },
    annual: {
      price: 9600, // $96.00 in cents (20% discount)
      interval: 'year'
    }
  },
  pro: {
    name: 'Pro Plan',
    description: 'Built for large agencies and enterprise teams',
    monthly: {
      price: 2000, // $20.00 in cents
      interval: 'month'
    },
    annual: {
      price: 19200, // $192.00 in cents (20% discount)
      interval: 'year'
    }
  }
};

async function setupStripeProducts() {
  console.log('🚀 Stripe Products and Prices Setup\n');
  
  if (!stripe) {
    console.log('❌ Stripe instance not created - missing STRIPE_SECRET_KEY');
    console.log('Please add your Stripe secret key to .env.local');
    return;
  }
  
  console.log('✅ Stripe instance created successfully\n');
  
  const createdPrices = {};
  
  for (const [planId, plan] of Object.entries(PRICING_PLANS)) {
    console.log(`📦 Setting up ${plan.name}...`);
    
    try {
      // Create product
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: {
          planId: planId
        }
      });
      
      console.log(`   ✅ Product created: ${product.id}`);
      
      // Create monthly price
      const monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.monthly.price,
        currency: 'usd',
        recurring: {
          interval: plan.monthly.interval
        },
        metadata: {
          planId: planId,
          billingCycle: 'monthly'
        }
      });
      
      console.log(`   ✅ Monthly price created: ${monthlyPrice.id} ($${plan.monthly.price / 100}/month)`);
      
      // Create annual price
      const annualPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.annual.price,
        currency: 'usd',
        recurring: {
          interval: plan.annual.interval
        },
        metadata: {
          planId: planId,
          billingCycle: 'annual'
        }
      });
      
      console.log(`   ✅ Annual price created: ${annualPrice.id} ($${plan.annual.price / 100}/year)`);
      
      // Store the price IDs
      createdPrices[planId] = {
        productId: product.id,
        monthlyPriceId: monthlyPrice.id,
        annualPriceId: annualPrice.id
      };
      
    } catch (error) {
      console.log(`   ❌ Failed to create ${plan.name}: ${error.message}`);
    }
    
    console.log('');
  }
  
  // Output environment variables
  console.log('📋 Environment Variables to Add to .env.local:');
  console.log('===============================================');
  console.log('');
  
  for (const [planId, prices] of Object.entries(createdPrices)) {
    const envVarPrefix = planId.toUpperCase();
    console.log(`# ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`);
    console.log(`STRIPE_${envVarPrefix}_MONTHLY_PRICE_ID=${prices.monthlyPriceId}`);
    console.log(`STRIPE_${envVarPrefix}_ANNUAL_PRICE_ID=${prices.annualPriceId}`);
    console.log('');
  }
  
  // Summary
  console.log('📊 Setup Summary:');
  console.log('==================');
  console.log(`✅ Created ${Object.keys(createdPrices).length} products`);
  console.log(`✅ Created ${Object.keys(createdPrices).length * 2} prices`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Copy the environment variables above to your .env.local file');
  console.log('2. Restart your development server');
  console.log('3. Test the checkout process');
  console.log('');
  console.log('💡 Note: The Free plan doesn\'t need Stripe integration since it\'s $0');
}

// Run the setup script
setupStripeProducts().catch(console.error);
