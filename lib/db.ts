import { neon } from '@neondatabase/serverless';

// Get the database URL from environment variables
const sql = neon(process.env.DATABASE_URL!);

// Database schema and initialization
export async function initDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        company VARCHAR(255),
        current_plan_id VARCHAR(100) DEFAULT 'free',
        current_plan_name VARCHAR(100) DEFAULT 'Free',
        current_billing_cycle VARCHAR(20) DEFAULT 'monthly',
        subscription_status VARCHAR(50) DEFAULT 'inactive',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create Stripe customers table
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

    // Create subscriptions table
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

    // Create invoices table
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

    // Create payment methods table
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

    // Create Facebook sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS facebook_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        access_token TEXT NOT NULL,
        ad_account_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create campaign data table
    await sql`
      CREATE TABLE IF NOT EXISTS campaign_data (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES facebook_sessions(id),
        campaign_id VARCHAR(255) NOT NULL,
        campaign_name VARCHAR(500),
        clicks INTEGER DEFAULT 0,
        impressions INTEGER DEFAULT 0,
        reach INTEGER DEFAULT 0,
        spend DECIMAL(10,2) DEFAULT 0,
        cpc DECIMAL(10,2) DEFAULT 0,
        cpm DECIMAL(10,2) DEFAULT 0,
        ctr VARCHAR(10) DEFAULT '0%',
        status VARCHAR(50),
        objective VARCHAR(100),
        date_range VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create metrics cache table
    await sql`
      CREATE TABLE IF NOT EXISTS metrics_cache (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES facebook_sessions(id),
        metric_name VARCHAR(100) NOT NULL,
        metric_value TEXT NOT NULL,
        date_range VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create creatives cache table
    await sql`
      CREATE TABLE IF NOT EXISTS creatives_cache (
        id SERIAL PRIMARY KEY,
        ad_account_id VARCHAR(255) NOT NULL,
        date_range VARCHAR(20) NOT NULL,
        payload JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create AI creative scores table
    await sql`
      CREATE TABLE IF NOT EXISTS ai_creative_scores (
        id SERIAL PRIMARY KEY,
        creative_id VARCHAR(255) NOT NULL,
        ad_account_id VARCHAR(255) NOT NULL,
        score DECIMAL(3,2) NOT NULL CHECK (score >= 0 AND score <= 10),
        analysis_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers (user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions (user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices (user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods (user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_creatives_cache_key ON creatives_cache (ad_account_id, date_range)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_creative_scores_creative_id ON ai_creative_scores (creative_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_creative_scores_ad_account_id ON ai_creative_scores (ad_account_id)`;

    console.log('✅ Database initialized successfully with new schema');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// User management functions
export async function createUser(email: string, firstName?: string, lastName?: string, company?: string) {
  try {
    const result = await sql`
      INSERT INTO users (email, first_name, last_name, company)
      VALUES (${email}, ${firstName}, ${lastName}, ${company})
      RETURNING id, email, first_name, last_name, company, created_at
    `;
    return result[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function getUserById(userId: number) {
  try {
    const result = await sql`
      SELECT * FROM users WHERE id = ${userId}
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

export async function updateUser(userId: number, updates: Partial<{ firstName: string; lastName: string; company: string }>) {
  try {
    const result = await sql`
      UPDATE users 
      SET 
        first_name = COALESCE(${updates.firstName}, first_name),
        last_name = COALESCE(${updates.lastName}, last_name),
        company = COALESCE(${updates.company}, company),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
      RETURNING *
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function updateUserPlan(userId: number, planData: {
  planId: string;
  planName: string;
  billingCycle: 'monthly' | 'annual';
  status: string;
}) {
  try {
    const result = await sql`
      UPDATE users 
      SET 
        current_plan_id = ${planData.planId},
        current_plan_name = ${planData.planName},
        current_billing_cycle = ${planData.billingCycle},
        subscription_status = ${planData.status},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
      RETURNING *
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Error updating user plan:', error);
    throw error;
  }
}

// Stripe customer management
export async function createStripeCustomer(userId: number, stripeCustomerId: string, email: string) {
  try {
    const result = await sql`
      INSERT INTO stripe_customers (user_id, stripe_customer_id, email)
      VALUES (${userId}, ${stripeCustomerId}, ${email})
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
}

export async function getStripeCustomerByUserId(userId: number) {
  try {
    const result = await sql`
      SELECT * FROM stripe_customers WHERE user_id = ${userId}
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Error getting Stripe customer:', error);
    return null;
  }
}

// Subscription management
export async function createSubscription(subscriptionData: {
  userId: number;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  planId: string;
  planName: string;
  billingCycle: 'monthly' | 'annual';
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
}) {
  try {
    const result = await sql`
      INSERT INTO subscriptions (
        user_id, stripe_subscription_id, stripe_customer_id, plan_id, plan_name,
        billing_cycle, status, current_period_start, current_period_end, trial_end
      )
      VALUES (
        ${subscriptionData.userId}, ${subscriptionData.stripeSubscriptionId},
        ${subscriptionData.stripeCustomerId}, ${subscriptionData.planId},
        ${subscriptionData.planName}, ${subscriptionData.billingCycle},
        ${subscriptionData.status}, ${subscriptionData.currentPeriodStart},
        ${subscriptionData.currentPeriodEnd}, ${subscriptionData.trialEnd}
      )
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

export async function updateSubscription(stripeSubscriptionId: string, updates: Partial<{
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  planId?: string;
  planName?: string;
  billingCycle?: string;
}>) {
  try {
    const result = await sql`
      UPDATE subscriptions 
      SET 
        status = COALESCE(${updates.status}, status),
        current_period_start = COALESCE(${updates.currentPeriodStart}, current_period_start),
        current_period_end = COALESCE(${updates.currentPeriodEnd}, current_period_end),
        cancel_at_period_end = COALESCE(${updates.cancelAtPeriodEnd}, cancel_at_period_end),
        trial_end = COALESCE(${updates.trialEnd}, trial_end),
        plan_id = COALESCE(${updates.planId}, plan_id),
        plan_name = COALESCE(${updates.planName}, plan_name),
        billing_cycle = COALESCE(${updates.billingCycle}, billing_cycle),
        updated_at = CURRENT_TIMESTAMP
      WHERE stripe_subscription_id = ${stripeSubscriptionId}
      RETURNING *
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

export async function getSubscriptionByUserId(userId: number) {
  try {
    const result = await sql`
      SELECT * FROM subscriptions 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  try {
    const result = await sql`
      SELECT * FROM subscriptions 
      WHERE stripe_subscription_id = ${stripeSubscriptionId}
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Error getting subscription by Stripe ID:', error);
    return null;
  }
}

// Invoice management
export async function createInvoice(invoiceData: {
  userId: number;
  stripeInvoiceId: string;
  subscriptionId: number;
  amountPaid: number;
  currency: string;
  status: string;
  invoicePdfUrl?: string;
  invoiceNumber?: string;
}) {
  try {
    const result = await sql`
      INSERT INTO invoices (
        user_id, stripe_invoice_id, subscription_id, amount_paid, currency,
        status, invoice_pdf_url, invoice_number
      )
      VALUES (
        ${invoiceData.userId}, ${invoiceData.stripeInvoiceId},
        ${invoiceData.subscriptionId}, ${invoiceData.amountPaid},
        ${invoiceData.currency}, ${invoiceData.status},
        ${invoiceData.invoicePdfUrl}, ${invoiceData.invoiceNumber}
      )
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}

export async function getInvoicesByUserId(userId: number) {
  try {
    const result = await sql`
      SELECT * FROM invoices 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `;
    return result;
  } catch (error) {
    console.error('Error getting invoices:', error);
    return [];
  }
}

// Payment method management
export async function createPaymentMethod(paymentMethodData: {
  userId: number;
  stripePaymentMethodId: string;
  type: string;
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  isDefault?: boolean;
}) {
  try {
    // If this is the first payment method, make it default
    if (paymentMethodData.isDefault !== false) {
      const existingMethods = await sql`
        SELECT COUNT(*) as count FROM payment_methods WHERE user_id = ${paymentMethodData.userId}
      `;
      if (existingMethods[0]?.count === 0) {
        paymentMethodData.isDefault = true;
      }
    }

    const result = await sql`
      INSERT INTO payment_methods (
        user_id, stripe_payment_method_id, type, last4, brand, exp_month, exp_year, is_default
      )
      VALUES (
        ${paymentMethodData.userId}, ${paymentMethodData.stripePaymentMethodId},
        ${paymentMethodData.type}, ${paymentMethodData.last4}, ${paymentMethodData.brand},
        ${paymentMethodData.expMonth}, ${paymentMethodData.expYear}, ${paymentMethodData.isDefault || false}
      )
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Error creating payment method:', error);
    throw error;
  }
}

export async function getPaymentMethodsByUserId(userId: number) {
  try {
    const result = await sql`
      SELECT * FROM payment_methods 
      WHERE user_id = ${userId} 
      ORDER BY is_default DESC, created_at DESC
    `;
    return result;
  } catch (error) {
    console.error('Error getting payment methods:', error);
    return [];
  }
}

export async function deletePaymentMethod(paymentMethodId: number) {
  try {
    const result = await sql`
      DELETE FROM payment_methods 
      WHERE id = ${paymentMethodId}
      RETURNING *
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
}

// Session management
export async function saveFacebookSession(userId: string, accessToken: string, adAccountId?: string) {
  try {
    // First, try to add the unique constraint if it doesn't exist
    try {
      await sql`ALTER TABLE facebook_sessions ADD CONSTRAINT facebook_sessions_user_id_unique UNIQUE (user_id)`;
    } catch (constraintError) {
      // Constraint might already exist, ignore the error
      console.log('Unique constraint already exists or could not be added');
    }

    const result = await sql`
      INSERT INTO facebook_sessions (user_id, access_token, ad_account_id)
      VALUES (${userId}, ${accessToken}, ${adAccountId})
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        access_token = EXCLUDED.access_token,
        ad_account_id = EXCLUDED.ad_account_id,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `;
    return result[0]?.id;
  } catch (error) {
    console.error('Error saving Facebook session:', error);
    throw error;
  }
}

export async function getFacebookSession(userId: string) {
  try {
    const result = await sql`
      SELECT * FROM facebook_sessions 
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC 
      LIMIT 1
    `;
    return result[0];
  } catch (error) {
    console.error('Error getting Facebook session:', error);
    return null;
  }
}

// Campaign data management
export async function saveCampaignData(sessionId: number, campaigns: any[], dateRange: string) {
  try {
    // Clear existing data for this session and date range
    await sql`
      DELETE FROM campaign_data 
      WHERE session_id = ${sessionId} AND date_range = ${dateRange}
    `;

    // Insert new campaign data
    for (const campaign of campaigns) {
      await sql`
        INSERT INTO campaign_data (
          session_id, campaign_id, campaign_name, clicks, impressions, 
          reach, spend, cpc, cpm, ctr, status, objective, date_range
        ) VALUES (
          ${sessionId}, 
          ${campaign.id}, 
          ${campaign.name || 'Unknown'}, 
          ${parseInt(campaign.insights?.clicks || 0)}, 
          ${parseInt(campaign.insights?.impressions || 0)}, 
          ${parseInt(campaign.insights?.reach || 0)}, 
          ${parseFloat(campaign.insights?.spend || 0)}, 
          ${parseFloat(campaign.insights?.cpc || 0)}, 
          ${parseFloat(campaign.insights?.cpm || 0)}, 
          ${campaign.insights?.ctr || '0%'}, 
          ${campaign.status || 'UNKNOWN'}, 
          ${campaign.objective || 'UNKNOWN'}, 
          ${dateRange}
        )
      `;
    }

    console.log(`✅ Saved ${campaigns.length} campaigns for date range ${dateRange}`);
  } catch (error) {
    console.error('Error saving campaign data:', error);
    throw error;
  }
}

export async function getCampaignData(sessionId: number, dateRange: string) {
  try {
    const result = await sql`
      SELECT * FROM campaign_data 
      WHERE session_id = ${sessionId} AND date_range = ${dateRange}
      ORDER BY spend DESC
    `;
    return result;
  } catch (error) {
    console.error('Error getting campaign data:', error);
    return [];
  }
}

// Metrics cache management
export async function saveMetricsCache(sessionId: number, metrics: any[], dateRange: string) {
  try {
    // Clear existing metrics for this session and date range
    await sql`
      DELETE FROM metrics_cache 
      WHERE session_id = ${sessionId} AND date_range = ${dateRange}
    `;

    // Insert new metrics
    for (const metric of metrics) {
      await sql`
        INSERT INTO metrics_cache (session_id, metric_name, metric_value, date_range)
        VALUES (${sessionId}, ${metric.label}, ${metric.value}, ${dateRange})
      `;
    }

    console.log(`✅ Saved ${metrics.length} metrics for date range ${dateRange}`);
  } catch (error) {
    console.error('Error saving metrics cache:', error);
    throw error;
  }
}

export async function getMetricsCache(sessionId: number, dateRange: string) {
  try {
    const result = await sql`
      SELECT metric_name, metric_value FROM metrics_cache 
      WHERE session_id = ${sessionId} AND date_range = ${dateRange}
    `;
    return result;
  } catch (error) {
    console.error('Error getting metrics cache:', error);
    return [];
  }
}

// --- Creatives cache (persistent) ---
export async function saveCreativesCache(adAccountId: string, dateRange: string, payload: any) {
  try {
    // Upsert by key (ad_account_id, date_range)
    await sql`
      INSERT INTO creatives_cache (ad_account_id, date_range, payload, created_at)
      VALUES (${adAccountId}, ${dateRange}, ${JSON.stringify(payload)}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO NOTHING
    `;

    // Clean older duplicates, keep the newest
    await sql`
      DELETE FROM creatives_cache a
      USING creatives_cache b
      WHERE a.ad_account_id = b.ad_account_id
        AND a.date_range = b.date_range
        AND a.created_at < b.created_at
    `;
  } catch (error) {
    console.error('Error saving creatives cache:', error);
  }
}

export async function getCreativesCache(adAccountId: string, dateRange: string, maxAgeHours: number) {
  try {
    const rows = await sql`
      SELECT payload, created_at
      FROM creatives_cache
      WHERE ad_account_id = ${adAccountId}
        AND date_range = ${dateRange}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) return null;
    const createdAt = new Date(row.created_at).getTime();
    const ageMs = Date.now() - createdAt;
    const ttlMs = Math.max(0, Number(maxAgeHours) || 0) * 60 * 60 * 1000;
    if (ttlMs > 0 && ageMs < ttlMs) {
      return row.payload;
    }
    return null;
  } catch (error) {
    console.error('Error reading creatives cache:', error);
    return null;
  }
}

// AI Creative Score management
export async function saveAICreativeScore(creativeId: string, adAccountId: string, score: number, analysisData?: any) {
  try {
    const result = await sql`
      INSERT INTO ai_creative_scores (creative_id, ad_account_id, score, analysis_data)
      VALUES (${creativeId}, ${adAccountId}, ${score}, ${analysisData ? JSON.stringify(analysisData) : null})
      ON CONFLICT (creative_id, ad_account_id) 
      DO UPDATE SET 
        score = EXCLUDED.score,
        analysis_data = EXCLUDED.analysis_data,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `;
    return result[0]?.id;
  } catch (error) {
    console.error('Error saving AI creative score:', error);
    throw error;
  }
}

export async function getAICreativeScore(creativeId: string, adAccountId: string) {
  try {
    const result = await sql`
      SELECT score, analysis_data, created_at, updated_at
      FROM ai_creative_scores 
      WHERE creative_id = ${creativeId} AND ad_account_id = ${adAccountId}
      ORDER BY updated_at DESC 
      LIMIT 1
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Error getting AI creative score:', error);
    return null;
  }
}

// --- Multi-Account Billing Functions ---

export async function createAdAccount(userId: number, accountName: string, accountId?: string, platform: string = 'facebook') {
  try {
    const result = await sql`
      INSERT INTO ad_accounts (user_id, account_name, account_id, platform, status)
      VALUES (${userId}, ${accountName}, ${accountId || null}, ${platform}, 'active')
      RETURNING id, account_name, account_id, platform, status, created_at
    `;
    return result[0];
  } catch (error) {
    console.error('Error creating ad account:', error);
    throw error;
  }
}

export async function getAdAccounts(userId: number) {
  try {
    const result = await sql`
      SELECT id, account_name, account_id, platform, status, created_at
      FROM ad_accounts 
      WHERE user_id = ${userId} AND status = 'active'
      ORDER BY created_at DESC
    `;
    return result;
  } catch (error) {
    console.error('Error getting ad accounts:', error);
    return [];
  }
}

export async function updateAdAccount(accountId: number, updates: any) {
  try {
    const result = await sql`
      UPDATE ad_accounts 
      SET 
        account_name = COALESCE(${updates.account_name}, account_name),
        status = COALESCE(${updates.status}, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${accountId}
      RETURNING id, account_name, account_id, platform, status, updated_at
    `;
    return result[0];
  } catch (error) {
    console.error('Error updating ad account:', error);
    throw error;
  }
}

export async function deleteAdAccount(accountId: number) {
  try {
    const result = await sql`
      UPDATE ad_accounts 
      SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${accountId}
      RETURNING id, account_name
    `;
    return result[0];
  } catch (error) {
    console.error('Error deleting ad account:', error);
    throw error;
  }
}

export async function getActiveAdAccounts(userId: number) {
  try {
    const result = await sql`
      SELECT id, account_name, account_id, platform, status, created_at
      FROM ad_accounts 
      WHERE user_id = ${userId} AND status = 'active'
      ORDER BY created_at DESC
    `;
    return result;
  } catch (error) {
    console.error('Error getting active ad accounts:', error);
    return [];
  }
}

export async function createBillingCycle(userId: number, periodStart: Date, periodEnd: Date, totalAccounts: number, amountCharged: number) {
  try {
    const result = await sql`
      INSERT INTO billing_cycles (user_id, period_start, period_end, total_accounts, amount_charged, status)
      VALUES (${userId}, ${periodStart}, ${periodEnd}, ${totalAccounts}, ${amountCharged}, 'pending')
      RETURNING id, period_start, period_end, total_accounts, amount_charged, status, created_at
    `;
    return result[0];
  } catch (error) {
    console.error('Error creating billing cycle:', error);
    throw error;
  }
}

export async function updateBillingCycle(billingCycleId: number, updates: any) {
  try {
    const result = await sql`
      UPDATE billing_cycles 
      SET 
        total_accounts = COALESCE(${updates.total_accounts}, total_accounts),
        amount_charged = COALESCE(${updates.amount_charged}, amount_charged),
        status = COALESCE(${updates.status}, status),
        stripe_invoice_id = COALESCE(${updates.stripe_invoice_id}, stripe_invoice_id),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${billingCycleId}
      RETURNING id, period_start, period_end, total_accounts, amount_charged, status, stripe_invoice_id, updated_at
    `;
    return result[0];
  } catch (error) {
    console.error('Error updating billing cycle:', error);
    throw error;
  }
}

export async function getLatestBillingCycle(userId: number) {
  try {
    const result = await sql`
      SELECT id, period_start, period_end, total_accounts, amount_charged, status, stripe_invoice_id, created_at
      FROM billing_cycles 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Error getting latest billing cycle:', error);
    return null;
  }
}

export async function getBillingHistory(userId: number, limit: number = 10) {
  try {
    const result = await sql`
      SELECT id, period_start, period_end, total_accounts, amount_charged, status, stripe_invoice_id, created_at
      FROM billing_cycles 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return result;
  } catch (error) {
    console.error('Error getting billing history:', error);
    return [];
  }
}

export { sql };