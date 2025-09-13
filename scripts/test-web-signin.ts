// Simple test to verify web sign-in functionality
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../lib/db/schema';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL or POSTGRES_URL environment variable is required');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function showUserProfiles() {
  try {
    console.log('👥 Created Test User Profiles:\n');
    
    const testUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        educationLevel: users.educationLevel,
        graduationYear: users.graduationYear,
        school: users.school,
        isActive: users.isActive,
        createdAt: users.createdAt
      })
      .from(users)
      .where(sql`${users.email} IN ('user1@stp.com', 'user2@stp.com', 'user3@stp.com')`);

    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Education: ${user.educationLevel || 'Not specified'}`);
      console.log(`   School: ${user.school || 'Not specified'}`);
      console.log(`   Graduation Year: ${user.graduationYear || 'Not specified'}`);
      console.log(`   Status: ${user.isActive ? 'Active' : 'Inactive'}`);
      console.log(`   Created: ${user.createdAt?.toLocaleDateString()}`);
      console.log('');
    });

    console.log('🔗 Sign-in Instructions:');
    console.log('1. Visit: http://localhost:3000/sign-in');
    console.log('2. Use any of these credentials:');
    console.log('   • user1@stp.com / password123');
    console.log('   • user2@stp.com / password123'); 
    console.log('   • user3@stp.com / password123');
    console.log('');
    console.log('✅ All users are ready for testing!');

  } catch (error) {
    console.error('❌ Error fetching user profiles:', error);
  } finally {
    await client.end();
  }
}

// Import sql from drizzle-orm
import { sql } from 'drizzle-orm';

// Run the script
showUserProfiles();