import { neon } from '@neondatabase/serverless';

// Get the database URL from environment variables
const sql = neon(process.env.DATABASE_URL!);

// Database schema and initialization
export async function initDatabase() {
  try {
    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS facebook_sessions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL UNIQUE,
        access_token TEXT NOT NULL,
        ad_account_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

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

    // Cache creatives payloads per ad account and date range
    await sql`
      CREATE TABLE IF NOT EXISTS creatives_cache (
        id SERIAL PRIMARY KEY,
        ad_account_id VARCHAR(255) NOT NULL,
        date_range VARCHAR(20) NOT NULL,
        payload JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Helpful index for TTL lookups
    await sql`CREATE INDEX IF NOT EXISTS idx_creatives_cache_key ON creatives_cache (ad_account_id, date_range)`;

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
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

export { sql }; 

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