const { neon } = require('@neondatabase/serverless');

// Get the database URL from environment variables
const sql = neon(process.env.DATABASE_URL);

async function initPerAccountBilling() {
  try {
    console.log('🚀 Initializing Per-Account Billing Database...\n');

    // Create ad account subscriptions table
    console.log('📝 Creating ad_account_subscriptions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS ad_account_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ad_account_id VARCHAR(255) NOT NULL,
        ad_account_name VARCHAR(255) NOT NULL,
        stripe_subscription_id VARCHAR(255) UNIQUE,
        stripe_price_id VARCHAR(255) NOT NULL,
        stripe_customer_id VARCHAR(255) NOT NULL,
        plan_type VARCHAR(50) DEFAULT 'per_account',
        status VARCHAR(50) DEFAULT 'active',
        billing_cycle VARCHAR(20) DEFAULT 'monthly',
        amount_cents INTEGER NOT NULL DEFAULT 1000, -- $10.00 default
        currency VARCHAR(3) DEFAULT 'usd',
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        trial_end TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, ad_account_id)
      )
    `;
    console.log('✅ Ad account subscriptions table created successfully');

    // Create per-account billing history table
    console.log('📝 Creating per_account_billing_history table...');
    await sql`
      CREATE TABLE IF NOT EXISTS per_account_billing_history (
        id SERIAL PRIMARY KEY,
        subscription_id INTEGER REFERENCES ad_account_subscriptions(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ad_account_id VARCHAR(255) NOT NULL,
        stripe_invoice_id VARCHAR(255),
        amount_cents INTEGER NOT NULL,
        currency VARCHAR(3) DEFAULT 'usd',
        status VARCHAR(50) DEFAULT 'paid',
        billing_period_start TIMESTAMP NOT NULL,
        billing_period_end TIMESTAMP NOT NULL,
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Per-account billing history table created successfully');

    // Create per-account plan configurations table
    console.log('📝 Creating per_account_plan_configs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS per_account_plan_configs (
        id SERIAL PRIMARY KEY,
        plan_name VARCHAR(100) NOT NULL,
        plan_description TEXT,
        monthly_price_cents INTEGER NOT NULL,
        annual_price_cents INTEGER NOT NULL,
        stripe_monthly_price_id VARCHAR(255),
        stripe_annual_price_id VARCHAR(255),
        features JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Per-account plan configs table created successfully');

    // Insert default per-account plan configurations
    console.log('📝 Inserting default per-account plan configurations...');
    await sql`
      INSERT INTO per_account_plan_configs (
        plan_name, 
        plan_description, 
        monthly_price_cents, 
        annual_price_cents,
        features
      ) VALUES (
        'Per Account Basic',
        'Basic analytics and management for each Facebook ad account',
        1000, -- $10.00
        9600, -- $96.00 (20% discount)
        '["Basic analytics", "Campaign management", "Creative gallery", "Email support"]'::jsonb
      ),
      (
        'Per Account Pro',
        'Advanced analytics and management for each Facebook ad account',
        2000, -- $20.00
        19200, -- $192.00 (20% discount)
        '["Advanced analytics", "AI insights", "Custom reporting", "Priority support", "API access"]'::jsonb
      )
      ON CONFLICT DO NOTHING
    `;
    console.log('✅ Default per-account plan configurations inserted');

    // Create indexes for better performance
    console.log('📝 Creating indexes...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_ad_account_subscriptions_user_id ON ad_account_subscriptions(user_id);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_ad_account_subscriptions_ad_account_id ON ad_account_subscriptions(ad_account_id);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_ad_account_subscriptions_status ON ad_account_subscriptions(status);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_per_account_billing_history_subscription_id ON per_account_billing_history(subscription_id);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_per_account_billing_history_user_id ON per_account_billing_history(user_id);
    `;
    console.log('✅ Indexes created successfully');

    console.log('\n🎉 Per-Account Billing Database initialization completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Update your Stripe dashboard with per-account pricing');
    console.log('2. Set up environment variables for per-account Stripe price IDs');
    console.log('3. Update the Facebook auth flow to create subscriptions');
    console.log('4. Test the billing system with test accounts');

  } catch (error) {
    console.error('❌ Error initializing per-account billing database:', error);
    throw error;
  }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  initPerAccountBilling()
    .then(() => {
      console.log('✅ Per-account billing initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Per-account billing initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initPerAccountBilling };
