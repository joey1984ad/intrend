#!/usr/bin/env node

/**
 * Stripe Checkout Debug Script
 * 
 * This script helps debug the "Failed to create checkout session" error by:
 * 1. Checking environment variables
 * 2. Validating Stripe configuration
 * 3. Testing plan retrieval
 * 4. Simulating checkout session creation
 */

import { neon } from '@neondatabase/serverless';
import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Database connection
const sql = neon(process.env.DATABASE_URL || '');

// Stripe instance
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    })
  : null;

// Pricing plans configuration
const PRICING_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    monthly: {
      price: 0,
      stripePriceId: 'free',
    },
    annual: {
      price: 0,
      stripePriceId: 'free',
    },
  },
  startup: {
    id: 'startup',
    name: 'Startup',
    monthly: {
      price: 10,
      stripePriceId: process.env.STRIPE_STARTUP_MONTHLY_PRICE_ID || null,
    },
    annual: {
      price: 96,
      stripePriceId: process.env.STRIPE_STARTUP_ANNUAL_PRICE_ID || null,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthly: {
      price: 20,
      stripePriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || null,
    },
    annual: {
      price: 192,
      stripePriceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || null,
    },
  }
};

// Helper function to get plan
const getPlan = (planId, billingCycle) => {
  const plan = PRICING_PLANS[planId];
  if (!plan) return null;
  
  return {
    ...plan,
    currentPricing: plan[billingCycle],
  };
};

async function debugStripeCheckout() {
  console.log('🔍 Stripe Checkout Debug Script\n');
  
  // 1. Check environment variables
  console.log('1. Environment Variables Check:');
  console.log('================================');
  
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'DATABASE_URL'
  ];
  
  const stripePriceEnvVars = [
    'STRIPE_STARTUP_MONTHLY_PRICE_ID',
    'STRIPE_STARTUP_ANNUAL_PRICE_ID',
    'STRIPE_PRO_MONTHLY_PRICE_ID',
    'STRIPE_PRO_ANNUAL_PRICE_ID'
  ];
  
  let envIssues = 0;
  
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (!value || value === `your_${envVar.toLowerCase()}_here`) {
      console.log(`❌ ${envVar}: Missing or placeholder value`);
      envIssues++;
    } else {
      console.log(`✅ ${envVar}: Configured`);
    }
  }
  
  console.log('\nStripe Price IDs:');
  for (const envVar of stripePriceEnvVars) {
    const value = process.env[envVar];
    if (!value || value === `your_${envVar.toLowerCase()}_here`) {
      console.log(`❌ ${envVar}: Missing or placeholder value`);
      envIssues++;
    } else {
      console.log(`✅ ${envVar}: ${value}`);
    }
  }
  
  if (envIssues > 0) {
    console.log(`\n⚠️  Found ${envIssues} environment variable issues`);
  }
  
  // 2. Check Stripe configuration
  console.log('\n2. Stripe Configuration Check:');
  console.log('===============================');
  
  if (!stripe) {
    console.log('❌ Stripe instance not created - missing STRIPE_SECRET_KEY');
    return;
  }
  
  console.log('✅ Stripe instance created successfully');
  
  // 3. Test Stripe API connection
  console.log('\n3. Stripe API Connection Test:');
  console.log('===============================');
  
  try {
    const account = await stripe.accounts.retrieve();
    console.log('✅ Stripe API connection successful');
    console.log(`   Account ID: ${account.id}`);
    console.log(`   Account Type: ${account.type}`);
  } catch (error) {
    console.log('❌ Stripe API connection failed');
    console.log(`   Error: ${error.message}`);
    return;
  }
  
  // 4. Check existing products and prices
  console.log('\n4. Existing Stripe Products and Prices:');
  console.log('========================================');
  
  try {
    const products = await stripe.products.list({ limit: 10 });
    console.log(`Found ${products.data.length} products:`);
    
    for (const product of products.data) {
      console.log(`\n📦 Product: ${product.name} (${product.id})`);
      console.log(`   Description: ${product.description || 'No description'}`);
      
      const prices = await stripe.prices.list({ product: product.id });
      console.log(`   Prices: ${prices.data.length}`);
      
      for (const price of prices.data) {
        console.log(`     - ${price.id}: $${price.unit_amount / 100}/${price.recurring?.interval || 'one-time'}`);
      }
    }
  } catch (error) {
    console.log('❌ Failed to retrieve products and prices');
    console.log(`   Error: ${error.message}`);
  }
  
  // 5. Test plan retrieval
  console.log('\n5. Plan Retrieval Test:');
  console.log('=======================');
  
  const testPlans = [
    { planId: 'startup', billingCycle: 'monthly' },
    { planId: 'startup', billingCycle: 'annual' },
    { planId: 'pro', billingCycle: 'monthly' },
    { planId: 'pro', billingCycle: 'annual' }
  ];
  
  for (const testPlan of testPlans) {
    const plan = getPlan(testPlan.planId, testPlan.billingCycle);
    if (plan) {
      console.log(`✅ ${testPlan.planId} ${testPlan.billingCycle}: $${plan.currentPricing.price}`);
      console.log(`   Stripe Price ID: ${plan.currentPricing.stripePriceId || 'NOT CONFIGURED'}`);
    } else {
      console.log(`❌ ${testPlan.planId} ${testPlan.billingCycle}: Plan not found`);
    }
  }
  
  // 6. Test checkout session creation
  console.log('\n6. Checkout Session Creation Test:');
  console.log('===================================');
  
  const testCases = [
    { planId: 'startup', billingCycle: 'monthly', customerEmail: 'test@example.com' },
    { planId: 'pro', billingCycle: 'annual', customerEmail: 'test@example.com' }
  ];
  
  for (const testCase of testCases) {
    console.log(`\nTesting: ${testCase.planId} ${testCase.billingCycle}`);
    
    try {
      // Get plan
      const plan = getPlan(testCase.planId, testCase.billingCycle);
      if (!plan) {
        console.log('❌ Plan not found');
        continue;
      }
      
      // Check if it's a free plan
      if (plan.currentPricing.price === 0 || plan.currentPricing.stripePriceId === 'free') {
        console.log('✅ Free plan - no checkout session needed');
        continue;
      }
      
      // Check if Stripe price ID is configured
      if (!plan.currentPricing.stripePriceId || plan.currentPricing.stripePriceId === 'free') {
        console.log('❌ Stripe price ID not configured');
        continue;
      }
      
      // Try to create checkout session
      const sessionConfig = {
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.currentPricing.stripePriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
        metadata: {
          planId: plan.id,
          planName: plan.name,
          billingCycle: testCase.billingCycle,
        },
        subscription_data: {
          metadata: {
            planId: plan.id,
            planName: plan.name,
            billingCycle: testCase.billingCycle,
          },
        },
        customer_email: testCase.customerEmail,
      };
      
      const session = await stripe.checkout.sessions.create(sessionConfig);
      console.log('✅ Checkout session created successfully');
      console.log(`   Session ID: ${session.id}`);
      console.log(`   URL: ${session.url}`);
      
    } catch (error) {
      console.log('❌ Failed to create checkout session');
      console.log(`   Error: ${error.message}`);
      
      if (error.type === 'StripeInvalidRequestError') {
        console.log(`   Code: ${error.code}`);
        console.log(`   Param: ${error.param}`);
      }
    }
  }
  
  // 7. Database connection test
  console.log('\n7. Database Connection Test:');
  console.log('============================');
  
  try {
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful');
    console.log(`   Current time: ${result[0].current_time}`);
  } catch (error) {
    console.log('❌ Database connection failed');
    console.log(`   Error: ${error.message}`);
  }
  
  console.log('\n🔍 Debug Summary:');
  console.log('=================');
  console.log('If you see any ❌ errors above, those need to be fixed before checkout will work.');
  console.log('\nCommon fixes:');
  console.log('1. Set up Stripe price IDs in your .env.local file');
  console.log('2. Create products and prices in your Stripe dashboard');
  console.log('3. Ensure your Stripe secret key is correct');
  console.log('4. Check that your database connection is working');
}

// Run the debug script
debugStripeCheckout().catch(console.error);
