#!/usr/bin/env node

/**
 * Initialize Stripe Database Schema
 * 
 * This script creates all the necessary tables for Stripe integration
 * including users, subscriptions, invoices, and payment methods.
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function initStripeDatabase() {
  try {
    console.log('🚀 Initializing Stripe database schema...\n');

    // Create users table
    console.log('📝 Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        company VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Users table created successfully');

    // Create Stripe customers table
    console.log('📝 Creating Stripe customers table...');
    await sql`
      CREATE TABLE IF NOT EXISTS stripe_customers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Stripe customers table created successfully');

    // Create subscriptions table
    console.log('📝 Creating subscriptions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
        stripe_customer_id VARCHAR(255) NOT NULL,
        plan_id VARCHAR(100) NOT NULL,
        plan_name VARCHAR(100) NOT NULL,
        billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
        status VARCHAR(50) NOT NULL,
        current_period_start TIMESTAMP NOT NULL,
        current_period_end TIMESTAMP NOT NULL,
        cancel_at_period_end BOOLEAN DEFAULT FALSE,
        trial_end TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Subscriptions table created successfully');

    // Create invoices table
    console.log('📝 Creating invoices table...');
    await sql`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        stripe_invoice_id VARCHAR(255) UNIQUE NOT NULL,
        subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE,
        amount_paid INTEGER NOT NULL,
        currency VARCHAR(3) DEFAULT 'usd',
        status VARCHAR(50) NOT NULL,
        invoice_pdf_url TEXT,
        invoice_number VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Invoices table created successfully');

    // Create payment methods table
    console.log('📝 Creating payment methods table...');
    await sql`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        stripe_payment_method_id VARCHAR(255) UNIQUE NOT NULL,
        type VARCHAR(50) NOT NULL,
        last4 VARCHAR(4),
        brand VARCHAR(50),
        exp_month INTEGER,
        exp_year INTEGER,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Payment methods table created successfully');

    // Create indexes for performance
    console.log('📝 Creating database indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers (user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions (user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices (user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods (user_id)`;
    console.log('✅ Database indexes created successfully');

    // Create sample user for testing
    console.log('📝 Creating sample user...');
    try {
      const sampleUser = await sql`
        INSERT INTO users (email, first_name, last_name, company)
        VALUES ('test@example.com', 'Test', 'User', 'Test Company')
        ON CONFLICT (email) DO NOTHING
        RETURNING id, email
      `;
      
      if (sampleUser.length > 0) {
        console.log('✅ Sample user created:', sampleUser[0].email);
      } else {
        console.log('ℹ️ Sample user already exists');
      }
    } catch (error) {
      console.log('ℹ️ Sample user creation skipped:', error.message);
    }

    console.log('\n🎉 Stripe database schema initialized successfully!');
    console.log('\n📋 Tables created:');
    console.log('   • users');
    console.log('   • stripe_customers');
    console.log('   • subscriptions');
    console.log('   • invoices');
    console.log('   • payment_methods');
    console.log('\n🔍 Next steps:');
    console.log('   1. Set up your Stripe account and get API keys');
    console.log('   2. Create products and prices in Stripe Dashboard');
    console.log('   3. Update your .env.local with Stripe configuration');
    console.log('   4. Test the integration with test cards');

  } catch (error) {
    console.error('\n❌ Error initializing Stripe database:', error);
    process.exit(1);
  }
}

// Run the initialization
if (require.main === module) {
  initStripeDatabase()
    .then(() => {
      console.log('\n✨ Database initialization complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initStripeDatabase };
