const { neon } = require('@neondatabase/serverless');

// Get the database URL from environment variables
const sql = neon(process.env.DATABASE_URL);

async function initMultiAccountBilling() {
  try {
    console.log('🚀 Initializing Multi-Account Billing Database...\n');

    // Create ad accounts table
    console.log('📝 Creating ad_accounts table...');
    await sql`
      CREATE TABLE IF NOT EXISTS ad_accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        account_name VARCHAR(255) NOT NULL,
        account_id VARCHAR(255) UNIQUE,
        platform VARCHAR(50) DEFAULT 'facebook',
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Ad accounts table created successfully');

    // Create billing cycles table
    console.log('📝 Creating billing_cycles table...');
    await sql`
      CREATE TABLE IF NOT EXISTS billing_cycles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        period_start TIMESTAMP NOT NULL,
        period_end TIMESTAMP NOT NULL,
        total_accounts INTEGER DEFAULT 0,
        amount_charged DECIMAL(10,2) DEFAULT 0.00,
        status VARCHAR(50) DEFAULT 'pending',
        stripe_invoice_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Billing cycles table created successfully');

    // Create indexes for better performance
    console.log('📝 Creating indexes...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_ad_accounts_user_id ON ad_accounts(user_id);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_ad_accounts_status ON ad_accounts(status);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_billing_cycles_user_id ON billing_cycles(user_id);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_billing_cycles_status ON billing_cycles(status);
    `;
    console.log('✅ Indexes created successfully');

    // Insert sample data for testing (optional)
    console.log('📝 Inserting sample data...');
    
    // Get a sample user
    const users = await sql`SELECT id, email FROM users LIMIT 1`;
    
    if (users.length > 0) {
      const sampleUserId = users[0].id;
      
      // Insert sample ad accounts
      await sql`
        INSERT INTO ad_accounts (user_id, account_name, account_id, platform, status)
        VALUES 
          (${sampleUserId}, 'Sample Business Account', 'act_123456789', 'facebook', 'active'),
          (${sampleUserId}, 'Test Campaign Account', 'act_987654321', 'facebook', 'active')
        ON CONFLICT (account_id) DO NOTHING
      `;
      
      // Insert sample billing cycle
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      
      await sql`
        INSERT INTO billing_cycles (user_id, period_start, period_end, total_accounts, amount_charged, status)
        VALUES (${sampleUserId}, ${now}, ${nextMonth}, 2, 20.00, 'pending')
        ON CONFLICT DO NOTHING
      `;
      
      console.log('✅ Sample data inserted successfully');
    } else {
      console.log('⚠️  No users found, skipping sample data insertion');
    }

    console.log('\n🎉 Multi-Account Billing Database initialization completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   • ad_accounts table created');
    console.log('   • billing_cycles table created');
    console.log('   • Performance indexes created');
    console.log('   • Sample data inserted (if users exist)');
    console.log('\n💡 Next steps:');
    console.log('   1. Configure Stripe metered billing product');
    console.log('   2. Set up webhook endpoints for billing events');
    console.log('   3. Test the account management system');
    console.log('   4. Configure monthly billing cron job');

  } catch (error) {
    console.error('❌ Error initializing multi-account billing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initMultiAccountBilling();
