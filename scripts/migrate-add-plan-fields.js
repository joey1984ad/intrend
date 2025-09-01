#!/usr/bin/env node

/**
 * Database Migration Script
 * 
 * This script adds plan-related fields to the existing users table.
 */

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL || '');

async function migrateAddPlanFields() {
  console.log('🔄 Starting database migration to add plan fields...\n');

  try {
    // Check if columns already exist
    const existingColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('current_plan_id', 'current_plan_name', 'current_billing_cycle', 'subscription_status')
    `;

    const existingColumnNames = existingColumns.map(col => col.column_name);
    console.log('Existing plan-related columns:', existingColumnNames);

    // Add columns if they don't exist
    const columnsToAdd = [
      { name: 'current_plan_id', type: 'VARCHAR(100) DEFAULT \'free\'' },
      { name: 'current_plan_name', type: 'VARCHAR(100) DEFAULT \'Free\'' },
      { name: 'current_billing_cycle', type: 'VARCHAR(20) DEFAULT \'monthly\'' },
      { name: 'subscription_status', type: 'VARCHAR(50) DEFAULT \'inactive\'' }
    ];

    for (const column of columnsToAdd) {
      if (!existingColumnNames.includes(column.name)) {
        console.log(`Adding column: ${column.name}`);
        await sql`ALTER TABLE users ADD COLUMN ${sql.unsafe(column.name)} ${sql.unsafe(column.type)}`;
        console.log(`✅ Added column: ${column.name}`);
      } else {
        console.log(`⏭️  Column already exists: ${column.name}`);
      }
    }

    // Update existing users to have default plan values
    console.log('\nUpdating existing users with default plan values...');
    const updateResult = await sql`
      UPDATE users 
      SET 
        current_plan_id = COALESCE(current_plan_id, 'free'),
        current_plan_name = COALESCE(current_plan_name, 'Free'),
        current_billing_cycle = COALESCE(current_billing_cycle, 'monthly'),
        subscription_status = COALESCE(subscription_status, 'inactive')
      WHERE current_plan_id IS NULL 
         OR current_plan_name IS NULL 
         OR current_billing_cycle IS NULL 
         OR subscription_status IS NULL
    `;
    console.log(`✅ Updated ${updateResult.rowCount} users with default plan values`);

    // Verify the migration
    console.log('\nVerifying migration...');
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const sampleUsers = await sql`SELECT id, email, current_plan_id, current_plan_name, current_billing_cycle, subscription_status FROM users LIMIT 5`;
    
    console.log(`Total users: ${userCount[0].count}`);
    console.log('Sample users with plan data:');
    sampleUsers.forEach(user => {
      console.log(`  - User ${user.id} (${user.email}): ${user.current_plan_name} (${user.current_billing_cycle}) - ${user.subscription_status}`);
    });

    console.log('\n🎉 Migration completed successfully!');
    console.log('\nPlan fields added to users table:');
    console.log('  - current_plan_id: The plan ID (free, startup, pro)');
    console.log('  - current_plan_name: The plan name (Free, Startup, Pro)');
    console.log('  - current_billing_cycle: The billing cycle (monthly, annual)');
    console.log('  - subscription_status: The subscription status (active, canceled, etc.)');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateAddPlanFields().catch(console.error);
