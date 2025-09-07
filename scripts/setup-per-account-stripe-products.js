const { neon } = require('@neondatabase/serverless');
const Stripe = require('stripe');

// Get the database URL from environment variables
const sql = neon(process.env.DATABASE_URL);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
});

async function setupPerAccountStripeProducts() {
  try {
    console.log('🚀 Setting up Per-Account Stripe Products...\n');

    // Create Per Account Basic Product
    console.log('📝 Creating Per Account Basic product...');
    const basicProduct = await stripe.products.create({
      name: 'Per Account Basic',
      description: 'Basic analytics and management for each Facebook ad account',
      metadata: {
        plan_id: 'per_account_basic',
        type: 'per_account',
        features: 'Basic analytics, Campaign management, Creative gallery, Email support, Account-specific insights'
      }
    });
    console.log('✅ Per Account Basic product created:', basicProduct.id);

    // Create Per Account Basic Monthly Price
    console.log('📝 Creating Per Account Basic Monthly price...');
    const basicMonthlyPrice = await stripe.prices.create({
      product: basicProduct.id,
      unit_amount: 1000, // $10.00
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan_id: 'per_account_basic',
        billing_cycle: 'monthly',
        type: 'per_account'
      }
    });
    console.log('✅ Per Account Basic Monthly price created:', basicMonthlyPrice.id);

    // Create Per Account Basic Annual Price
    console.log('📝 Creating Per Account Basic Annual price...');
    const basicAnnualPrice = await stripe.prices.create({
      product: basicProduct.id,
      unit_amount: 9600, // $96.00 (20% discount)
      currency: 'usd',
      recurring: {
        interval: 'year'
      },
      metadata: {
        plan_id: 'per_account_basic',
        billing_cycle: 'annual',
        type: 'per_account'
      }
    });
    console.log('✅ Per Account Basic Annual price created:', basicAnnualPrice.id);

    // Create Per Account Pro Product
    console.log('📝 Creating Per Account Pro product...');
    const proProduct = await stripe.products.create({
      name: 'Per Account Pro',
      description: 'Advanced analytics and management for each Facebook ad account',
      metadata: {
        plan_id: 'per_account_pro',
        type: 'per_account',
        features: 'Advanced analytics, AI insights, Custom reporting, Priority support, API access, Account-specific optimizations'
      }
    });
    console.log('✅ Per Account Pro product created:', proProduct.id);

    // Create Per Account Pro Monthly Price
    console.log('📝 Creating Per Account Pro Monthly price...');
    const proMonthlyPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 2000, // $20.00
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan_id: 'per_account_pro',
        billing_cycle: 'monthly',
        type: 'per_account'
      }
    });
    console.log('✅ Per Account Pro Monthly price created:', proMonthlyPrice.id);

    // Create Per Account Pro Annual Price
    console.log('📝 Creating Per Account Pro Annual price...');
    const proAnnualPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 19200, // $192.00 (20% discount)
      currency: 'usd',
      recurring: {
        interval: 'year'
      },
      metadata: {
        plan_id: 'per_account_pro',
        billing_cycle: 'annual',
        type: 'per_account'
      }
    });
    console.log('✅ Per Account Pro Annual price created:', proAnnualPrice.id);

    // Update database with Stripe price IDs
    console.log('📝 Updating database with Stripe price IDs...');
    await sql`
      UPDATE per_account_plan_configs 
      SET 
        stripe_monthly_price_id = ${basicMonthlyPrice.id},
        stripe_annual_price_id = ${basicAnnualPrice.id}
      WHERE plan_name = 'Per Account Basic'
    `;

    await sql`
      UPDATE per_account_plan_configs 
      SET 
        stripe_monthly_price_id = ${proMonthlyPrice.id},
        stripe_annual_price_id = ${proAnnualPrice.id}
      WHERE plan_name = 'Per Account Pro'
    `;
    console.log('✅ Database updated with Stripe price IDs');

    console.log('\n🎉 Per-Account Stripe Products Setup Completed Successfully!');
    console.log('\n📋 Environment Variables to Add to .env.local:');
    console.log(`STRIPE_PER_ACCOUNT_BASIC_MONTHLY_PRICE_ID=${basicMonthlyPrice.id}`);
    console.log(`STRIPE_PER_ACCOUNT_BASIC_ANNUAL_PRICE_ID=${basicAnnualPrice.id}`);
    console.log(`STRIPE_PER_ACCOUNT_PRO_MONTHLY_PRICE_ID=${proMonthlyPrice.id}`);
    console.log(`STRIPE_PER_ACCOUNT_PRO_ANNUAL_PRICE_ID=${proAnnualPrice.id}`);

    console.log('\n📊 Summary:');
    console.log(`- Per Account Basic: $10/month, $96/year`);
    console.log(`- Per Account Pro: $20/month, $192/year`);
    console.log(`- Each Facebook ad account gets its own subscription`);
    console.log(`- 20% discount for annual billing`);

  } catch (error) {
    console.error('❌ Error setting up per-account Stripe products:', error);
    throw error;
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupPerAccountStripeProducts()
    .then(() => {
      console.log('✅ Per-account Stripe products setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Per-account Stripe products setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupPerAccountStripeProducts };
