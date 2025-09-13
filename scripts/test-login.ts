import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { users } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

// Database connection string from environment
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL or POSTGRES_URL environment variable is required');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function testUserLogin(email: string, password: string) {
  try {
    console.log(`🔐 Testing login for: ${email}`);
    
    // Find user by email
    const foundUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (foundUser.length === 0) {
      console.log(`❌ User not found: ${email}`);
      return false;
    }

    const user = foundUser[0];
    console.log(`✅ User found: ${user.name} (${user.role})`);

    // Verify password
    const isPasswordValid = await verify(user.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if (isPasswordValid) {
      console.log(`✅ Password verification successful for ${email}`);
      return true;
    } else {
      console.log(`❌ Password verification failed for ${email}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error testing login for ${email}:`, error);
    return false;
  }
}

async function testAllUsers() {
  console.log('🧪 Testing login functionality for all created users\n');
  
  const testUsers = [
    { email: 'user1@stp.com', password: 'password123' },
    { email: 'user2@stp.com', password: 'password123' },
    { email: 'user3@stp.com', password: 'password123' }
  ];

  let successCount = 0;
  
  for (const testUser of testUsers) {
    const success = await testUserLogin(testUser.email, testUser.password);
    if (success) successCount++;
    console.log(''); // Add spacing between tests
  }

  console.log(`📊 Test Results: ${successCount}/${testUsers.length} users can sign in successfully`);
  
  if (successCount === testUsers.length) {
    console.log('🎉 All test users can sign in successfully!');
  } else {
    console.log('⚠️  Some users failed to sign in. Please check the above errors.');
  }
  
  await client.end();
}

// Run the test
testAllUsers();