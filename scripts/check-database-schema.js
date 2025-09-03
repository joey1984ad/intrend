#!/usr/bin/env node

const { sql } = require('@neondatabase/serverless');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function checkAndCreateTables() {
  try {
    console.log('🔍 Checking database schema...');

    // Check if invoices table exists
    const invoicesCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'invoices'
      );
    `;
    
    if (!invoicesCheck[0]?.exists) {
      console.log('📋 Creating invoices table...');
      await sql`
        CREATE TABLE invoices (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          stripe_invoice_id TEXT UNIQUE NOT NULL,
          stripe_subscription_id TEXT NOT NULL,
          amount_paid INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'pending',
          invoice_number TEXT,
          invoice_pdf_url TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `;
      console.log('✅ Invoices table created');
    } else {
      console.log('✅ Invoices table already exists');
    }

    // Check if subscriptions table exists
    const subscriptionsCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions'
      );
    `;
    
    if (!subscriptionsCheck[0]?.exists) {
      console.log('📋 Creating subscriptions table...');
      await sql`
        CREATE TABLE subscriptions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          stripe_subscription_id TEXT UNIQUE NOT NULL,
          stripe_customer_id TEXT NOT NULL,
          plan_id TEXT NOT NULL,
          plan_name TEXT NOT NULL,
          billing_cycle TEXT NOT NULL DEFAULT 'monthly',
          status TEXT NOT NULL DEFAULT 'active',
          current_period_start TIMESTAMP,
          current_period_end TIMESTAMP,
          trial_end TIMESTAMP,
          cancel_at_period_end BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `;
      console.log('✅ Subscriptions table created');
    } else {
      console.log('✅ Subscriptions table already exists');
    }

    // Check if payment_methods table exists
    const paymentMethodsCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'payment_methods'
      );
    `;
    
    if (!paymentMethodsCheck[0]?.exists) {
      console.log('📋 Creating payment_methods table...');
      await sql`
        CREATE TABLE payment_methods (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          stripe_payment_method_id TEXT UNIQUE NOT NULL,
          type TEXT NOT NULL,
          last4 TEXT,
          brand TEXT,
          exp_month INTEGER,
          exp_year INTEGER,
          is_default BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `;
      console.log('✅ Payment methods table created');
    } else {
      console.log('✅ Payment methods table already exists');
    }

    // Check if users table has the necessary columns
    const usersColumnsCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
      AND column_name IN ('current_plan_id', 'current_plan_name', 'current_billing_cycle', 'subscription_status');
    `;
    
    const existingColumns = usersColumnsCheck.map(row => row.column_name);
    const requiredColumns = ['current_plan_id', 'current_plan_name', 'current_billing_cycle', 'subscription_status'];
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('📋 Adding missing columns to users table...');
      
      for (const column of missingColumns) {
        let columnType = 'TEXT';
        if (column === 'subscription_status') {
          columnType = 'TEXT DEFAULT \'inactive\'';
        }
        
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${sql(column)} ${sql(columnType)}`;
        console.log(`✅ Added column: ${column}`);
      }
    } else {
      console.log('✅ Users table has all required columns');
    }

    console.log('🎉 Database schema check complete!');
    
    // Show some sample data
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const subscriptionCount = await sql`SELECT COUNT(*) as count FROM subscriptions`;
    const invoiceCount = await sql`SELECT COUNT(*) as count FROM invoices`;
    
    console.log('\n📊 Database Summary:');
    console.log(`- Users: ${userCount[0]?.count || 0}`);
    console.log(`- Subscriptions: ${subscriptionCount[0]?.count || 0}`);
    console.log(`- Invoices: ${invoiceCount[0]?.count || 0}`);

  } catch (error) {
    console.error('❌ Error checking database schema:', error);
    process.exit(1);
  }
}

checkAndCreateTables();
