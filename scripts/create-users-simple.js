const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const bcrypt = require('bcrypt');

// Database connection string from environment
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL or POSTGRES_URL environment variable is required');
  process.exit(1);
}

console.log('🔄 Connecting to database...');

const client = postgres(connectionString);
const db = drizzle(client);

async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

async function createTestUsers() {
  try {
    console.log('🔄 Creating test users...');
    
    // Test users data
    const testUsers = [
      {
        email: 'user1@stp.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User1',
        role: 'student',
        educationLevel: 'undergraduate',
        graduationYear: 2025,
        school: 'University of California, Berkeley'
      },
      {
        email: 'user2@stp.com', 
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'student',
        educationLevel: 'graduate',
        graduationYear: 2024,
        school: 'Stanford University'
      },
      {
        email: 'user3@stp.com',
        password: 'password123', 
        firstName: 'Mike',
        lastName: 'Johnson',
        role: 'parent',
        educationLevel: null,
        graduationYear: null,
        school: null
      }
    ];

    for (const userData of testUsers) {
      console.log(`🔄 Creating user: ${userData.email}`);
      
      const passwordHash = await hashPassword(userData.password);
      const fullName = `${userData.firstName} ${userData.lastName}`;
      
      // Use raw SQL to insert user
      await client`
        INSERT INTO users (
          email, 
          password_hash, 
          name, 
          role, 
          education_level, 
          graduation_year, 
          school, 
          is_active,
          created_at,
          updated_at
        ) VALUES (
          ${userData.email},
          ${passwordHash},
          ${fullName},
          ${userData.role},
          ${userData.educationLevel},
          ${userData.graduationYear},
          ${userData.school},
          true,
          NOW(),
          NOW()
        )
        ON CONFLICT (email) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          education_level = EXCLUDED.education_level,
          graduation_year = EXCLUDED.graduation_year,
          school = EXCLUDED.school,
          updated_at = NOW()
      `;
      
      console.log(`✅ Created/updated user: ${userData.email}`);
    }

    console.log('✅ All test users created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the script
createTestUsers();