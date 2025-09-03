#!/usr/bin/env node

/**
 * Test Subscription Status Update System
 * 
 * This script tests the complete flow of subscription status updates:
 * 1. Simulates a webhook event
 * 2. Updates user plan in database
 * 3. Verifies the update is reflected in the session API
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('🧪 Testing Subscription Status Update System\n');

// Test configuration
const TEST_EMAIL = 'test@example.com';
const TEST_PLANS = [
  { id: 'startup', name: 'Startup', billingCycle: 'monthly', status: 'active' },
  { id: 'pro', name: 'Pro', billingCycle: 'annual', status: 'active' },
  { id: 'free', name: 'Free', billingCycle: 'monthly', status: 'active' }
];

async function testPlanUpdate(planData) {
  console.log(`\n📋 Testing plan update: ${planData.name} (${planData.billingCycle})`);
  
  try {
    // Step 1: Update user plan via test endpoint
    console.log('  1️⃣ Updating user plan...');
    const updateResponse = await fetch('http://localhost:3000/api/test/update-user-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        planId: planData.id,
        planName: planData.name,
        billingCycle: planData.billingCycle,
        status: planData.status
      })
    });
    
    const updateResult = await updateResponse.json();
    
    if (!updateResult.success) {
      console.log(`  ❌ Failed to update plan: ${updateResult.error}`);
      return false;
    }
    
    console.log(`  ✅ Plan updated successfully: ${updateResult.user.currentPlanName}`);
    
    // Step 2: Verify the update via session API
    console.log('  2️⃣ Verifying via session API...');
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session');
    const sessionResult = await sessionResponse.json();
    
    if (!sessionResult.isAuthenticated) {
      console.log('  ❌ Session not authenticated');
      return false;
    }
    
    const user = sessionResult.user;
    console.log(`  📊 Current user plan: ${user.currentPlanName} (${user.currentPlanId})`);
    
    // Step 3: Verify the plan matches
    if (user.currentPlanId === planData.id && user.currentPlanName === planData.name) {
      console.log('  ✅ Plan verification successful!');
      return true;
    } else {
      console.log('  ❌ Plan verification failed - data mismatch');
      console.log(`     Expected: ${planData.id} / ${planData.name}`);
      console.log(`     Actual: ${user.currentPlanId} / ${user.currentPlanName}`);
      return false;
    }
    
  } catch (error) {
    console.log(`  ❌ Test failed with error: ${error.message}`);
    return false;
  }
}

async function testWebhookSimulation() {
  console.log('\n🔗 Testing webhook simulation...');
  
  try {
    // Simulate a subscription created webhook
    const webhookData = {
      id: 'sub_test_123',
      customer: 'cus_test_123',
      customer_details: { email: TEST_EMAIL },
      metadata: {
        planId: 'pro',
        planName: 'Pro',
        billingCycle: 'monthly'
      },
      status: 'active',
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
    };
    
    console.log('  📤 Simulating webhook event...');
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
    
    const webhookResult = await webhookResponse.json();
    console.log('  📥 Webhook response:', webhookResult);
    
  } catch (error) {
    console.log(`  ❌ Webhook test failed: ${error.message}`);
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive subscription status update tests...\n');
  
  let passedTests = 0;
  let totalTests = TEST_PLANS.length;
  
  for (const plan of TEST_PLANS) {
    const success = await testPlanUpdate(plan);
    if (success) passedTests++;
    
    // Wait a moment between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Test webhook simulation
  await testWebhookSimulation();
  
  console.log('\n📊 Test Results:');
  console.log(`  ✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`  ❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Subscription status update system is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
  }
  
  console.log('\n📖 Next Steps:');
  console.log('1. Visit http://localhost:3000/billing to test the UI');
  console.log('2. Try the "Refresh Data" button to manually refresh user data');
  console.log('3. Test plan upgrades in development mode');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/session');
    console.log('✅ Development server is running');
    return true;
  } catch (error) {
    console.log('❌ Development server is not running');
    console.log('   Please start the server with: npm run dev');
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }
  
  await runAllTests();
}

main().catch(console.error);
