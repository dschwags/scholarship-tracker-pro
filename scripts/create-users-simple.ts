import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { users, type NewUser } from '../lib/db/schema';

// Database connection string from environment
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL or POSTGRES_URL environment variable is required');
  process.exit(1);
}

console.log('🔄 Connecting to database...');

const client = postgres(connectionString);
const db = drizzle(client);

async function hashPassword(password: string) {
  return hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

async function createTestUsers() {
  try {
    console.log('🔄 Creating test users...');
    
    // Test users data
    const testUsersData = [
      {
        email: 'user1@stp.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User1',
        role: 'student' as const,
        educationLevel: 'undergraduate' as const,
        graduationYear: 2025,
        school: 'University of California, Berkeley'
      },
      {
        email: 'user2@stp.com', 
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'student' as const,
        educationLevel: 'graduate' as const,
        graduationYear: 2024,
        school: 'Stanford University'
      },
      {
        email: 'user3@stp.com',
        password: 'password123', 
        firstName: 'Mike',
        lastName: 'Johnson',
        role: 'parent' as const,
        educationLevel: null,
        graduationYear: null,
        school: null
      }
    ];

    for (const userData of testUsersData) {
      console.log(`🔄 Creating user: ${userData.email}`);
      
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(sql`${users.email} = ${userData.email}`)
        .limit(1);

      if (existingUser.length > 0) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        continue;
      }
      
      const passwordHash = await hashPassword(userData.password);
      const fullName = `${userData.firstName} ${userData.lastName}`;
      
      const newUser: NewUser = {
        email: userData.email,
        passwordHash: passwordHash,
        name: fullName,
        role: userData.role,
        educationLevel: userData.educationLevel,
        graduationYear: userData.graduationYear,
        school: userData.school,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.insert(users).values(newUser);
      
      console.log(`✅ Created user: ${userData.email}`);
    }

    console.log('✅ All test users created successfully!');
    
    // Verify users were created
    console.log('\n📋 Verifying created users:');
    const allUsers = await db.select({ 
      id: users.id, 
      email: users.email, 
      name: users.name, 
      role: users.role 
    }).from(users);
    
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.name}) - ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Import sql from drizzle-orm
import { sql } from 'drizzle-orm';

// Run the script
createTestUsers();