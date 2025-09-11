#!/usr/bin/env node

/**
 * BugX Framework: Create Sample Users Script
 * 
 * Creates sample users with new backend-compatible authentication
 * after the nuclear database reset.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../lib/db/schema.js';
import { hashPassword } from '../lib/auth/session.js';

// Database connection
const connectionString = process.env.POSTGRES_URL || 'postgresql://postgres:qOTHGZlj@127.0.0.1:5432/scholarship_tracker';
const client = postgres(connectionString);  
const db = drizzle(client);

async function createSampleUsers() {
  console.log('🔧 BugX Framework: Creating sample users with new backend authentication...');
  
  try {
    // Create password hash for all test users
    const testPasswordHash = await hashPassword('password123');
    
    const sampleUsers = [
      {
        name: 'Test Student',
        email: 'student@test.com',
        passwordHash: testPasswordHash,
        role: 'student' as const,
        country: 'United States',
        educationLevel: 'high_school' as const,
        educationalStatus: 'currently_enrolled',
        isActive: true,
        emailVerified: false
      },
      {
        name: 'Dave Tester',
        email: 'dave@brewx.com', 
        passwordHash: testPasswordHash,
        role: 'student' as const,
        country: 'United States',
        educationLevel: 'undergraduate' as const,
        educationalStatus: 'currently_enrolled',
        isActive: true,
        emailVerified: false
      },
      {
        name: 'Admin User',
        email: 'admin@test.com',
        passwordHash: testPasswordHash,
        role: 'admin' as const,
        country: 'United States', 
        educationLevel: 'graduate' as const,
        educationalStatus: 'graduated',
        isActive: true,
        emailVerified: true
      },
      {
        name: 'Parent User',
        email: 'parent@test.com',
        passwordHash: testPasswordHash,
        role: 'parent' as const,
        country: 'United States',
        educationLevel: 'undergraduate' as const,
        educationalStatus: 'graduated',
        isActive: true,
        emailVerified: true
      }
    ];
    
    console.log('  - Creating user accounts...');
    const createdUsers = await db.insert(users).values(sampleUsers).returning();
    
    console.log('✅ Sample users created successfully!');
    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('═══════════════════════════════════════════════════════');
    
    createdUsers.forEach(user => {
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔑 Password: password123`);
      console.log(`👤 Role: ${user.role}`);
      console.log(`🆔 User ID: ${user.id}`);
      console.log('───────────────────────────────────────────────────────');
    });
    
    console.log('\n🎯 Ready to test! Visit http://localhost:3000/sign-in');
    console.log('💡 All users have the same password: password123');
    
  } catch (error) {
    console.error('❌ Failed to create sample users:', error);
    throw error;
  } finally {
    await client.end();
  }
}

createSampleUsers()
  .then(() => {
    console.log('🎉 BugX Framework: Sample user creation completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 BugX Framework: Sample user creation failed:', error);
    process.exit(1);
  });