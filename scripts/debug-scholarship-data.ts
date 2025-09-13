import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, scholarships, applications } from '../lib/db/schema';
import { eq, sql } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL or POSTGRES_URL environment variable is required');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function debugScholarshipData() {
  try {
    console.log('🔍 Debugging scholarship data visibility...\n');
    
    // Check if scholarships exist
    const scholarshipCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(scholarships);
    
    console.log(`📊 Total scholarships in database: ${scholarshipCount[0].count}`);
    
    // List all scholarships
    const allScholarships = await db
      .select({
        id: scholarships.id,
        title: scholarships.title,
        amount: scholarships.amount,
        status: scholarships.status,
        deadline: scholarships.applicationDeadline,
        educationLevel: scholarships.educationLevel
      })
      .from(scholarships)
      .limit(5);
    
    console.log('\n📋 Sample scholarships:');
    allScholarships.forEach(s => {
      console.log(`   ${s.id}: ${s.title} - $${s.amount} (${s.status}) - ${s.educationLevel}`);
    });
    
    // Check applications for each test user
    const testUsers = await db
      .select()
      .from(users)
      .where(sql`${users.email} IN ('user1@stp.com', 'user2@stp.com', 'user3@stp.com')`);
    
    console.log('\n👥 Test user applications:');
    
    for (const user of testUsers) {
      console.log(`\n${user.name} (${user.email}):`);
      
      const userApplications = await db
        .select({
          appId: applications.id,
          scholarshipId: applications.scholarshipId,
          status: applications.status,
          scholarshipTitle: scholarships.title,
          scholarshipAmount: scholarships.amount
        })
        .from(applications)
        .leftJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
        .where(eq(applications.userId, user.id))
        .limit(10);
      
      console.log(`   Applications count: ${userApplications.length}`);
      
      userApplications.forEach(app => {
        console.log(`   - ${app.scholarshipTitle} ($${app.scholarshipAmount}) - ${app.status}`);
      });
    }
    
    // Check if there are any data integrity issues
    console.log('\n🔍 Data integrity check:');
    
    // Applications without scholarships
    const orphanApps = await client`
      SELECT COUNT(*) as count 
      FROM applications a 
      LEFT JOIN scholarships s ON a.scholarship_id = s.id 
      WHERE s.id IS NULL
    `;
    console.log(`   Orphan applications: ${orphanApps[0].count}`);
    
    // Applications for test users
    const testUserApps = await client`
      SELECT COUNT(*) as count 
      FROM applications a 
      JOIN users u ON a.user_id = u.id 
      WHERE u.email IN ('user1@stp.com', 'user2@stp.com', 'user3@stp.com')
    `;
    console.log(`   Test user applications: ${testUserApps[0].count}`);
    
    // Active scholarships
    const activeScholarships = await client`
      SELECT COUNT(*) as count 
      FROM scholarships 
      WHERE status = 'active'
    `;
    console.log(`   Active scholarships: ${activeScholarships[0].count}`);
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await client.end();
  }
}

debugScholarshipData();