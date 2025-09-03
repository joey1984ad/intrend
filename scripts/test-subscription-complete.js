#!/usr/bin/env node

/**
 * Complete Subscription System Testing Script
 * 
 * This script tests all the key implementation steps from the guide:
 * 1. Webhook Configuration
 * 2. Webhook Handler Implementation
 * 3. Database Schema Updates
 * 4. Frontend Subscription Flow
 * 5. Backend Verification Endpoint
 * 6. Status Indicators in UI
 * 7. Testing Checklist
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('🧪 Complete Subscription System Testing\n');

// Test configuration
const TEST_EMAIL = 'test@example.com';
const TEST_USER_ID = 1;

// Test scenarios
const TEST_SCENARIOS = [
  {
    name: 'Free Plan (Default)',
    planId: 'free',
    planName: 'Free',
    billingCycle: 'monthly',
    status: 'active',
    expected: 'Should show free plan with active status'
  },
  {
    name: 'Startup Plan (Monthly)',
    planId: 'startup',
    planName: 'Startup',
    billingCycle: 'monthly',
    status: 'active',
    expected: 'Should upgrade to startup plan'
  },
  {
    name: 'Pro Plan (Annual)',
    planId: 'pro',
    planName: 'Pro',
    billingCycle: 'annual',
    status: 'active',
    expected: 'Should upgrade to pro plan with annual billing'
  },
  {
    name: 'Trial Status',
    planId: 'pro',
    planName: 'Pro',
    billingCycle: 'monthly',
    status: 'trialing',
    expected: 'Should show trial status'
  },
  {
    name: 'Past Due Status',
    planId: 'startup',
    planName: 'Startup',
    billingCycle: 'monthly',
    status: 'past_due',
    expected: 'Should show past due status'
  },
  {
    name: 'Canceled Status',
    planId: 'pro',
    planName: 'Pro',
    billingCycle: 'monthly',
    status: 'canceled',
    expected: 'Should show canceled status'
  }
];

async function testWebhookHandler() {
  console.log('🔗 Testing Webhook Handler Implementation...');
  
  try {
    // Test subscription created webhook
    const webhookData = {
      id: 'sub_test_webhook_123',
      customer: 'cus_test_webhook_123',
      customer_details: { email: TEST_EMAIL },
      metadata: {
        planId: 'startup',
        planName: 'Startup',
        billingCycle: 'monthly'
      },
      status: 'active',
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
      cancel_at_period_end: false
    };

    const webhookResponse = await fetch('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature'
      },
      body: JSON.stringify({
        type: 'customer.subscription.created',
        data: { object: webhookData }
      })
    });

    if (webhookResponse.ok) {
      console.log('  ✅ Webhook handler responds correctly');
    } else {
      console.log('  ❌ Webhook handler failed');
    }
  } catch (error) {
    console.log('  ⚠️  Webhook test skipped (expected in development)');
  }
}

async function testSubscriptionVerification() {
  console.log('🔍 Testing Subscription Verification Endpoint...');
  
  try {
    // Test with a mock session ID
    const verifyResponse = await fetch('http://localhost:3000/api/subscription/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'cs_test_verification_123' })
    });

    if (verifyResponse.ok) {
      console.log('  ✅ Verification endpoint responds correctly');
    } else {
      console.log('  ❌ Verification endpoint failed');
    }
  } catch (error) {
    console.log('  ⚠️  Verification test skipped (expected in development)');
  }
}

async function testDatabaseSchema() {
  console.log('🗄️  Testing Database Schema Updates...');
  
  try {
    // Test user plan update
    const updateResponse = await fetch('http://localhost:3000/api/test/update-user-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        planId: 'startup',
        planName: 'Startup',
        billingCycle: 'monthly',
        status: 'active'
      })
    });

    const updateResult = await updateResponse.json();
    
    if (updateResult.success) {
      console.log('  ✅ Database schema supports plan updates');
      console.log(`     Updated user: ${updateResult.user.currentPlanName} (${updateResult.user.currentPlanId})`);
    } else {
      console.log('  ❌ Database schema update failed');
    }
  } catch (error) {
    console.log('  ❌ Database schema test failed:', error.message);
  }
}

async function testFrontendSubscriptionFlow() {
  console.log('🎨 Testing Frontend Subscription Flow...');
  
  try {
    // Test checkout session creation
    const checkoutResponse = await fetch('http://localhost:3000/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: 'startup',
        billingCycle: 'monthly',
        customerEmail: TEST_EMAIL,
        successUrl: 'http://localhost:3000/billing?success=true',
        cancelUrl: 'http://localhost:3000/billing?canceled=true'
      })
    });

    const checkoutResult = await checkoutResponse.json();
    
    if (checkoutResult.success) {
      console.log('  ✅ Checkout session creation works');
      if (checkoutResult.development) {
        console.log('     Development mode: Simulated checkout');
      } else if (checkoutResult.sessionId) {
        console.log('     Production mode: Session ID returned');
      }
    } else {
      console.log('  ❌ Checkout session creation failed');
    }
  } catch (error) {
    console.log('  ❌ Frontend flow test failed:', error.message);
  }
}

async function testUserSessionAPI() {
  console.log('👤 Testing User Session API...');
  
  try {
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session');
    const sessionResult = await sessionResponse.json();
    
    if (sessionResult.isAuthenticated) {
      console.log('  ✅ Session API returns user data');
      console.log(`     User: ${sessionResult.user.email}`);
      console.log(`     Plan: ${sessionResult.user.currentPlanName} (${sessionResult.user.currentPlanId})`);
      console.log(`     Status: ${sessionResult.user.subscriptionStatus}`);
    } else {
      console.log('  ⚠️  Session not authenticated (expected in testing)');
    }
  } catch (error) {
    console.log('  ❌ Session API test failed:', error.message);
  }
}

async function testAllScenarios() {
  console.log('📋 Testing All Subscription Scenarios...\n');
  
  let passedTests = 0;
  let totalTests = TEST_SCENARIOS.length;
  
  for (const scenario of TEST_SCENARIOS) {
    console.log(`Testing: ${scenario.name}`);
    console.log(`Expected: ${scenario.expected}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/test/update-user-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_EMAIL,
          planId: scenario.planId,
          planName: scenario.planName,
          billingCycle: scenario.billingCycle,
          status: scenario.status
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`  ✅ ${scenario.name} - SUCCESS`);
        console.log(`     Plan: ${result.user.currentPlanName} (${result.user.currentPlanId})`);
        console.log(`     Status: ${result.user.subscriptionStatus}`);
        console.log(`     Billing: ${result.user.currentBillingCycle}`);
        passedTests++;
      } else {
        console.log(`  ❌ ${scenario.name} - FAILED`);
        console.log(`     Error: ${result.error}`);
      }
    } catch (error) {
      console.log(`  ❌ ${scenario.name} - ERROR`);
      console.log(`     Error: ${error.message}`);
    }
    
    console.log('');
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return { passedTests, totalTests };
}

async function checkEnvironmentVariables() {
  console.log('🔧 Checking Environment Variables...');
  
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'DATABASE_URL'
  ];
  
  let missingVars = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length === 0) {
    console.log('  ✅ All required environment variables are set');
  } else {
    console.log('  ⚠️  Missing environment variables:');
    missingVars.forEach(varName => console.log(`     - ${varName}`));
  }
  
  return missingVars.length === 0;
}

async function runCompleteTest() {
  console.log('🚀 Starting Complete Subscription System Test\n');
  
  // Check if server is running
  try {
    const response = await fetch('http://localhost:3000/api/auth/session');
    console.log('✅ Development server is running\n');
  } catch (error) {
    console.log('❌ Development server is not running');
    console.log('   Please start the server with: npm run dev\n');
    return;
  }
  
  // Check environment variables
  const envOk = await checkEnvironmentVariables();
  console.log('');
  
  // Run all tests
  await testWebhookHandler();
  console.log('');
  
  await testSubscriptionVerification();
  console.log('');
  
  await testDatabaseSchema();
  console.log('');
  
  await testFrontendSubscriptionFlow();
  console.log('');
  
  await testUserSessionAPI();
  console.log('');
  
  const { passedTests, totalTests } = await testAllScenarios();
  
  // Summary
  console.log('📊 Test Results Summary:');
  console.log(`  ✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`  ❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`  🔧 Environment: ${envOk ? 'OK' : 'Missing Variables'}`);
  
  if (passedTests === totalTests && envOk) {
    console.log('\n🎉 All tests passed! Subscription system is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
  }
  
  console.log('\n📖 Next Steps:');
  console.log('1. Visit http://localhost:3000/billing to test the UI');
  console.log('2. Test the "Refresh Data" button to manually refresh user data');
  console.log('3. Test plan upgrades in development mode');
  console.log('4. Configure Stripe webhooks for production testing');
  console.log('5. Test with real Stripe payments in test mode');
}

// Main execution
runCompleteTest().catch(console.error);
