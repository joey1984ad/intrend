import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Add unique constraint to facebook_sessions table
    try {
      await sql`ALTER TABLE facebook_sessions ADD CONSTRAINT facebook_sessions_user_id_unique UNIQUE (user_id)`;
      console.log('✅ Added unique constraint to facebook_sessions table');
    } catch (error) {
      console.log('ℹ️ Unique constraint already exists or could not be added');
    }

    // Recreate tables with proper constraints
    await sql`DROP TABLE IF EXISTS campaign_data CASCADE`;
    await sql`DROP TABLE IF EXISTS metrics_cache CASCADE`;
    await sql`DROP TABLE IF EXISTS facebook_sessions CASCADE`;

    // Recreate facebook_sessions with unique constraint
    await sql`
      CREATE TABLE facebook_sessions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL UNIQUE,
        access_token TEXT NOT NULL,
        ad_account_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Recreate campaign_data
    await sql`
      CREATE TABLE campaign_data (
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

    // Recreate metrics_cache
    await sql`
      CREATE TABLE metrics_cache (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES facebook_sessions(id),
        metric_name VARCHAR(100) NOT NULL,
        metric_value TEXT NOT NULL,
        date_range VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('✅ Database migration completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully'
    });
  } catch (error) {
    console.error('❌ Database migration error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to migrate database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 