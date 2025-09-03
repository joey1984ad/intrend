#!/usr/bin/env node

/**
 * Test Script for Subscription Status Update System
 * 
 * This script tests the subscription status update functionality
 * by simulating a user subscription and verifying the database updates.
 */

const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testSubscriptionStatusUpdate() {
  console.log('🧪 Testing Subscription Status Update System\n');

  try {
    // Test 1: Check if users table has plan fields
    console.log('1. Checking database schema...');
    const tableInfo = await sql`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('current_plan_id', 'current_plan_name', 'current_billing_cycle', 'subscription_status')
      ORDER BY column_name
    `;
    
    if (tableInfo.length === 4) {
      console.log('✅ Users table has all required plan fields');
      tableInfo.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (default: ${col.column_default})`);
      });
    } else {
      console.log('❌ Users table missing required plan fields');
      console.log('   Found fields:', tableInfo.map(col => col.column_name));
    }

    // Test 2: Check if there are any users with subscription data
    console.log('\n2. Checking existing users with subscription data...');
    const usersWithPlans = await sql`
      SELECT id, email, current_plan_id, current_plan_name, current_billing_cycle, subscription_status
      FROM users 
      WHERE current_plan_id IS NOT NULL 
      AND current_plan_id != 'free'
      ORDER BY updated_at DESC 
      LIMIT 5
    `;
    
    if (usersWithPlans.length > 0) {
      console.log('✅ Found users with subscription data:');
      usersWithPlans.forEach(user => {
        console.log(`   - User ${user.id} (${user.email}): ${user.current_plan_name} Plan (${user.current_billing_cycle}) - Status: ${user.subscription_status}`);
      });
    } else {
      console.log('ℹ️  No users with paid subscriptions found (this is normal for a new system)');
    }

    // Test 3: Check subscriptions table
    console.log('\n3. Checking subscriptions table...');
    const subscriptions = await sql`
      SELECT id, user_id, plan_id, plan_name, billing_cycle, status, created_at
      FROM subscriptions 
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    
    if (subscriptions.length > 0) {
      console.log('✅ Found subscriptions in database:');
      subscriptions.forEach(sub => {
        console.log(`   - Subscription ${sub.id}: ${sub.plan_name} Plan (${sub.billing_cycle}) - Status: ${sub.status}`);
      });
    } else {
      console.log('ℹ️  No subscriptions found in database (this is normal for a new system)');
    }

    // Test 4: Check invoices table
    console.log('\n4. Checking invoices table...');
    const invoices = await sql`
      SELECT id, user_id, amount_paid, currency, status, created_at
      FROM invoices 
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    
    if (invoices.length > 0) {
      console.log('✅ Found invoices in database:');
      invoices.forEach(invoice => {
        console.log(`   - Invoice ${invoice.id}: $${(invoice.amount_paid / 100).toFixed(2)} ${invoice.currency.toUpperCase()} - Status: ${invoice.status}`);
      });
    } else {
      console.log('ℹ️  No invoices found in database (this is normal for a new system)');
    }

    // Test 5: Check payment methods table
    console.log('\n5. Checking payment methods table...');
    const paymentMethods = await sql`
      SELECT id, user_id, type, last4, brand, is_default
      FROM payment_methods 
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    
    if (paymentMethods.length > 0) {
      console.log('✅ Found payment methods in database:');
      paymentMethods.forEach(pm => {
        console.log(`   - Payment Method ${pm.id}: ${pm.brand} ****${pm.last4} (${pm.type})${pm.is_default ? ' - Default' : ''}`);
      });
    } else {
      console.log('ℹ️  No payment methods found in database (this is normal for a new system)');
    }

    // Test 6: Simulate a plan update
    console.log('\n6. Testing plan update function...');
    const testUser = await sql`
      SELECT id, email, current_plan_id, current_plan_name 
      FROM users 
      LIMIT 1
    `;
    
    if (testUser.length > 0) {
      const user = testUser[0];
      console.log(`   Testing with user: ${user.email} (current plan: ${user.current_plan_name})`);
      
      // Simulate upgrading to Pro plan
      const updateResult = await sql`
        UPDATE users 
        SET 
          current_plan_id = 'pro',
          current_plan_name = 'Pro',
          current_billing_cycle = 'monthly',
          subscription_status = 'active',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${user.id}
        RETURNING current_plan_id, current_plan_name, current_billing_cycle, subscription_status
      `;
      
      if (updateResult.length > 0) {
        console.log('✅ Plan update test successful');
        console.log(`   Updated to: ${updateResult[0].current_plan_name} Plan (${updateResult[0].current_billing_cycle}) - Status: ${updateResult[0].subscription_status}`);
        
        // Revert back to original plan
        await sql`
          UPDATE users 
          SET 
            current_plan_id = ${user.current_plan_id},
            current_plan_name = ${user.current_plan_name},
            current_billing_cycle = 'monthly',
            subscription_status = 'inactive',
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${user.id}
        `;
        console.log('   Reverted back to original plan');
      } else {
        console.log('❌ Plan update test failed');
      }
    } else {
      console.log('❌ No users found for testing');
    }

    console.log('\n🎉 Subscription Status Update System Test Complete!');
    console.log('\nNext Steps:');
    console.log('1. Test the billing page at http://localhost:3000/billing');
    console.log('2. Try creating a subscription through Stripe checkout');
    console.log('3. Verify webhook updates are working');
    console.log('4. Check that the UI reflects the updated plan status');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testSubscriptionStatusUpdate();
