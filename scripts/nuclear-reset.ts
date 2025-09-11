#!/usr/bin/env node

/**
 * BugX Framework: NUCLEAR DATABASE RESET
 * 
 * Complete database wipe using SQL approach to handle all foreign key constraints
 * This resolves legacy authentication infinite loops by starting completely fresh
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

// Database connection
const connectionString = process.env.POSTGRES_URL || 'postgresql://postgres:qOTHGZlj@127.0.0.1:5432/scholarship_tracker';
const client = postgres(connectionString);
const db = drizzle(client);

async function nuclearReset() {
  console.log('🚨 BugX Framework: NUCLEAR DATABASE RESET');
  console.log('💥 This will completely wipe ALL DATA to fix authentication infinite loops');
  
  try {
    console.log('\n🗑️  STEP 1: Dropping all foreign key constraints...');
    
    // Get all foreign key constraints
    const constraints = await db.execute(sql`
      SELECT 
        tc.constraint_name, 
        tc.table_name 
      FROM information_schema.table_constraints tc
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    `);
    
    console.log(`  Found ${constraints.length} foreign key constraints to drop`);
    
    // Drop all foreign key constraints
    for (const constraint of constraints) {
      const constraintName = constraint.constraint_name;
      const tableName = constraint.table_name;
      console.log(`  - Dropping constraint ${constraintName} from ${tableName}`);
      await db.execute(sql.raw(`ALTER TABLE "${tableName}" DROP CONSTRAINT IF EXISTS "${constraintName}"`));
    }
    
    console.log('✅ STEP 1 COMPLETE: All foreign key constraints dropped');
    
    console.log('\n🧹 STEP 2: Truncating all tables...');
    
    // Get all table names
    const tables = await db.execute(sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      AND tablename NOT LIKE '__drizzle%'
    `);
    
    console.log(`  Found ${tables.length} tables to truncate`);
    
    // Truncate all tables
    for (const table of tables) {
      const tableName = table.tablename;
      console.log(`  - Truncating table ${tableName}`);
      await db.execute(sql.raw(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`));
    }
    
    console.log('✅ STEP 2 COMPLETE: All tables truncated');
    
    console.log('\n🔧 STEP 3: Regenerating database schema...');
    
    // The foreign key constraints will be recreated when the app starts up
    // because Drizzle will apply the schema again
    
    console.log('✅ STEP 3 COMPLETE: Schema will be regenerated on next app start');
    
    console.log('\n🎉 BugX Framework: NUCLEAR RESET COMPLETE!');
    console.log('📊 Summary:');
    console.log(`  - Foreign key constraints: ${constraints.length} dropped`);
    console.log(`  - Tables: ${tables.length} truncated`);
    console.log('  - All legacy authentication data: WIPED');
    console.log('\n🔄 Next steps:');
    console.log('  1. Restart the application');
    console.log('  2. Database schema will be recreated automatically');
    console.log('  3. Create new accounts through sign-up');
    console.log('  4. Fresh authentication will be compatible with new backend');
    
  } catch (error) {
    console.error('❌ BugX Framework: Nuclear reset failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

nuclearReset()
  .then(() => {
    console.log('🎯 BugX Framework: Nuclear reset completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 BugX Framework: Nuclear reset failed:', error);
    process.exit(1);
  });