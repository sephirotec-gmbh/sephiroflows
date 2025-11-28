/**
 * Database Seeding Script
 * Adds sample data for testing
 */

import bcrypt from 'bcrypt';
import { pool, query } from '../config/database';

const seed = async () => {
  try {
    console.log('Seeding database...');

    // Check if demo company already exists
    const existingCompany = await query(
      "SELECT id FROM companies WHERE slug = 'demo'"
    );

    if (existingCompany.rows.length > 0) {
      console.log('⚠️  Demo company already exists, skipping seed');
      process.exit(0);
    }

    // Create demo company
    const companyResult = await query(
      "INSERT INTO companies (name, slug, status) VALUES ('Demo Company', 'demo', 'active') RETURNING id"
    );
    const companyId = companyResult.rows[0].id;
    console.log('✅ Created demo company');

    // Create demo user (password: demo123)
    const passwordHash = await bcrypt.hash('demo123', 10);
    await query(
      `INSERT INTO users (company_id, email, name, password_hash, can_edit_workflows, can_execute_workflows, can_manage_credentials)
       VALUES ($1, $2, $3, $4, true, true, true)`,
      [companyId, 'demo@sephiroflows.app', 'Demo User', passwordHash]
    );
    console.log('✅ Created demo user (email: demo@sephiroflows.app, password: demo123)');

    console.log('✅ Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
