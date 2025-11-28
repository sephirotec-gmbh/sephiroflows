/**
 * Database Migration Script
 * Run with: npm run migrate
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from '../config/database';

const runMigration = async () => {
  try {
    console.log('Running database migration...');

    // Read migration file
    const migrationPath = join(__dirname, '../../migrations/001_init_schema.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    // Execute migration
    await pool.query(sql);

    console.log('✅ Migration completed successfully');
    
    // Test by querying companies
    const result = await pool.query('SELECT COUNT(*) FROM companies');
    console.log(`   Companies in database: ${result.rows[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
