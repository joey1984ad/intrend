#!/usr/bin/env node

/**
 * Check User Plan Status
 * 
 * This script checks the current user's plan status to help debug
 * why plan statuses are not updating after payment.
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking User Plan Status\n');

async function checkUserPlan() {
  try {
    // Check session API
    console.log('1️⃣ Checking session API...');
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session');
    const sessionData = await sessionResponse.json();
    
    if (sessionData.isAuthenticated) {
      console.log('✅ User is authenticated');
      console.log(`   Email: ${sessionData.user.email}`);
      console.log(`   Current Plan: ${sessionData.user.currentPlanName || 'Not set'}`);
      console.log(`   Plan ID: ${sessionData.user.currentPlanId || 'Not set'}`);
      console.log(`   Billing Cycle: ${sessionData.user.currentBillingCycle || 'Not set'}`);
      console.log(`   Status: ${sessionData.user.subscriptionStatus || 'Not set'}`);
    } else {
      console.log('❌ User is not authenticated');
    }
    
    console.log('');
    
    // Check subscription API
    if (sessionData.isAuthenticated && sessionData.user.id) {
      console.log('2️⃣ Checking subscription API...');
      const subscriptionResponse = await fetch(`http://localhost:3000/api/users/subscription?userId=${sessionData.user.id}`);
      const subscriptionData = await subscriptionResponse.json();
      
      if (subscriptionData.success) {
        if (subscriptionData.subscription) {
          console.log('✅ Subscription found in database');
          console.log(`   Plan: ${subscriptionData.subscription.planName}`);
          console.log(`   Status: ${subscriptionData.subscription.status}`);
          console.log(`   Billing Cycle: ${subscriptionData.subscription.billingCycle}`);
        } else {
          console.log('⚠️  No subscription found in database');
        }
      } else {
        console.log('❌ Failed to fetch subscription data');
      }
    }
    
    console.log('');
    
    // Test plan update
    console.log('3️⃣ Testing plan update...');
    const testEmail = sessionData.isAuthenticated ? sessionData.user.email : 'test@example.com';
    
    const updateResponse = await fetch('http://localhost:3000/api/test/update-user-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        planId: 'startup',
        planName: 'Startup',
        billingCycle: 'monthly',
        status: 'active'
      })
    });
    
    const updateData = await updateResponse.json();
    
    if (updateData.success) {
      console.log('✅ Plan update test successful');
      console.log(`   Updated to: ${updateData.user.currentPlanName} (${updateData.user.currentPlanId})`);
      console.log(`   Status: ${updateData.user.subscriptionStatus}`);
    } else {
      console.log('❌ Plan update test failed');
      console.log(`   Error: ${updateData.error}`);
    }
    
    console.log('');
    console.log('📊 Summary:');
    console.log('If the plan update test works but the UI doesn\'t show the updated plan,');
    console.log('the issue is likely with the frontend not refreshing the user context.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Visit https://localhost:3000/billing');
    console.log('2. Click "Refresh Data" button');
    console.log('3. Check if the plan status updates');
    
  } catch (error) {
    console.error('❌ Error checking user plan:', error.message);
  }
}

// Main execution
checkUserPlan().catch(console.error);
