import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../lib/db/schema';
import { eq, sql } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL or POSTGRES_URL environment variable is required');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

// Sample financial data for each user
const financialGoals = {
  'user1@stp.com': {
    gpa: '3.75',
    major: 'Computer Science',
    preferences: {
      financialGoals: {
        totalNeed: 40000,
        coveredSoFar: 15000,
        targetApplications: 15,
        preferredScholarshipTypes: ['merit-based', 'STEM', 'academic'],
        deadlinePreference: 'early',
        notes: 'Focused on STEM scholarships and academic excellence awards. Targeting high-value opportunities.'
      },
      searchFilters: {
        minAmount: 2000,
        maxGpa: 4.0,
        fieldOfStudy: 'STEM',
        educationLevel: 'undergraduate'
      },
      notifications: {
        deadlineReminders: true,
        newScholarships: true,
        statusUpdates: true
      }
    }
  },
  'user2@stp.com': {
    gpa: '3.85',
    major: 'Psychology',
    preferences: {
      financialGoals: {
        totalNeed: 35000,
        coveredSoFar: 20000,
        targetApplications: 12,
        preferredScholarshipTypes: ['graduate', 'research', 'academic'],
        deadlinePreference: 'rolling',
        notes: 'Graduate student seeking research-focused funding. Interested in fellowships and research grants.'
      },
      searchFilters: {
        minAmount: 3000,
        maxGpa: 4.0,
        fieldOfStudy: 'Psychology',
        educationLevel: 'graduate'
      },
      notifications: {
        deadlineReminders: true,
        newScholarships: true,
        statusUpdates: true
      }
    }
  },
  'user3@stp.com': {
    gpa: null,
    major: null,
    preferences: {
      financialGoals: {
        totalNeed: 25000,
        coveredSoFar: 5000,
        targetApplications: 10,
        preferredScholarshipTypes: ['parent', 'family', 'need-based'],
        deadlinePreference: 'flexible',
        notes: 'Parent seeking support for continuing education while raising family. Interested in family-friendly and flexible programs.'
      },
      searchFilters: {
        minAmount: 1000,
        maxGpa: 3.5,
        fieldOfStudy: 'Any',
        educationLevel: 'undergraduate'
      },
      notifications: {
        deadlineReminders: true,
        newScholarships: false,
        statusUpdates: true
      },
      parentInfo: {
        numberOfChildren: 2,
        childrenAges: [16, 14],
        workSchedule: 'part-time',
        supportNeeds: ['childcare', 'flexible-scheduling', 'online-options']
      }
    }
  }
};

async function updateUserFinancialData() {
  console.log('💰 Adding financial goals and preferences to test users...\n');
  
  for (const [email, data] of Object.entries(financialGoals)) {
    console.log(`👤 Updating ${email}...`);
    
    const updateData: any = {
      updatedAt: new Date()
    };
    
    if (data.gpa) {
      updateData.gpa = data.gpa;
    }
    
    if (data.major) {
      updateData.major = data.major;
    }
    
    if (data.preferences) {
      updateData.preferences = data.preferences;
    }
    
    await db
      .update(users)
      .set(updateData)
      .where(eq(users.email, email));
    
    console.log(`   ✅ Updated financial goals and preferences`);
    
    if (data.gpa) {
      console.log(`   📊 GPA: ${data.gpa}`);
    }
    
    if (data.major) {
      console.log(`   🎓 Major: ${data.major}`);
    }
    
    console.log(`   💰 Financial Need: $${data.preferences.financialGoals.totalNeed.toLocaleString()}`);
    console.log(`   ✅ Covered So Far: $${data.preferences.financialGoals.coveredSoFar.toLocaleString()}`);
    console.log(`   🎯 Target Applications: ${data.preferences.financialGoals.targetApplications}`);
    console.log(`   📝 Notes: ${data.preferences.financialGoals.notes.substring(0, 60)}...`);
    console.log('');
  }
  
  console.log('✅ All users updated with financial goals and preferences!\n');
}

async function showDataSummary() {
  console.log('📊 COMPREHENSIVE TEST DATA SUMMARY\n');
  
  // Get updated user info
  const testUsers = await db
    .select()
    .from(users)
    .where(sql`${users.email} IN ('user1@stp.com', 'user2@stp.com', 'user3@stp.com')`);
  
  // Get scholarship and application counts
  const scholarshipCount = await client`SELECT COUNT(*) as count FROM scholarships`;
  const applicationCount = await client`SELECT COUNT(*) as count FROM applications WHERE user_id IN (SELECT id FROM users WHERE email IN ('user1@stp.com', 'user2@stp.com', 'user3@stp.com'))`;
  const requirementCount = await client`SELECT COUNT(*) as count FROM requirements`;
  
  console.log('🎓 SCHOLARSHIP DATA:');
  console.log(`   • ${scholarshipCount[0].count} scholarships created`);
  console.log(`   • ${requirementCount[0].count} application requirements`);
  console.log(`   • ${applicationCount[0].count} total applications from test users`);
  console.log('');
  
  console.log('👥 USER PROFILES:\n');
  
  for (const user of testUsers) {
    console.log(`${user.name} (${user.email})`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Education: ${user.educationLevel || 'Not specified'}`);
    console.log(`   School: ${user.school || 'Not specified'}`);
    console.log(`   Major: ${user.major || 'Not specified'}`);
    console.log(`   GPA: ${user.gpa || 'Not specified'}`);
    console.log(`   Graduation Year: ${user.graduationYear || 'Not specified'}`);
    
    if (user.preferences) {
      const prefs = user.preferences as any;
      if (prefs.financialGoals) {
        console.log(`   💰 Financial Need: $${prefs.financialGoals.totalNeed.toLocaleString()}`);
        console.log(`   ✅ Covered: $${prefs.financialGoals.coveredSoFar.toLocaleString()}`);
        console.log(`   🎯 Target Apps: ${prefs.financialGoals.targetApplications}`);
      }
    }
    
    // Get application stats for this user
    const userApps = await client`
      SELECT 
        status,
        COUNT(*) as count
      FROM applications 
      WHERE user_id = ${user.id}
      GROUP BY status
      ORDER BY status
    `;
    
    console.log('   📄 Applications:');
    userApps.forEach(app => {
      console.log(`      ${app.status}: ${app.count}`);
    });
    
    console.log('');
  }
  
  console.log('🔗 READY FOR TESTING:');
  console.log('   1. Visit: http://localhost:3000/sign-in');
  console.log('   2. Use any test user credentials (password123)');
  console.log('   3. Explore dashboards, applications, and scholarship data');
  console.log('   4. Test search and filtering functionality');
  console.log('   5. Verify first/last name fields in sign-up form');
  console.log('');
  console.log('✅ Comprehensive test environment ready!');
}

async function main() {
  try {
    await updateUserFinancialData();
    await showDataSummary();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();