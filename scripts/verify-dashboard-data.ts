import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, applications, scholarships } from '../lib/db/schema';
import { eq, sql } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL or POSTGRES_URL environment variable is required');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function verifyDashboardData() {
  try {
    console.log('🔍 Verifying dashboard data for all test users...\n');
    
    const testUsers = await db
      .select()
      .from(users)
      .where(sql`${users.email} IN ('user1@stp.com', 'user2@stp.com', 'user3@stp.com')`);
    
    for (const user of testUsers) {
      console.log(`👤 ${user.name} (${user.email}):`);
      
      // This is the same query the dashboard now uses
      const userApplications = await db
        .select({
          id: applications.id,
          applicationId: applications.id,
          scholarshipId: applications.scholarshipId,
          title: scholarships.title,
          description: scholarships.description,
          amount: scholarships.amount,
          currency: scholarships.currency,
          provider: scholarships.provider,
          applicationDeadline: scholarships.applicationDeadline,
          status: applications.status,
          submittedAt: applications.submittedAt,
          awardAmount: applications.awardAmount,
          notes: applications.notes,
          createdAt: applications.createdAt,
          scholarshipStatus: scholarships.status
        })
        .from(applications)
        .leftJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
        .where(eq(applications.userId, user.id));
      
      console.log(`   📊 Applications: ${userApplications.length}`);
      
      if (userApplications.length > 0) {
        const totalAmount = userApplications.reduce((sum, s) => sum + parseFloat(s.amount || '0'), 0);
        const totalAwarded = userApplications.filter(s => s.status === 'accepted').length;
        const totalRejected = userApplications.filter(s => s.status === 'rejected').length;
        const totalPending = userApplications.filter(s => s.status === 'submitted').length;
        const totalDraft = userApplications.filter(s => s.status === 'draft').length;
        const totalUnderReview = userApplications.filter(s => s.status === 'under_review').length;
        
        console.log(`   💰 Total Value: $${totalAmount.toLocaleString()}`);
        console.log(`   📈 Status Breakdown:`);
        console.log(`      ✅ Accepted: ${totalAwarded}`);
        console.log(`      ❌ Rejected: ${totalRejected}`);
        console.log(`      📤 Submitted: ${totalPending}`);
        console.log(`      👁 Under Review: ${totalUnderReview}`);
        console.log(`      📝 Draft: ${totalDraft}`);
        
        const totalEarnings = userApplications.filter(s => s.awardAmount).reduce((sum, s) => sum + parseFloat(s.awardAmount || '0'), 0);
        if (totalEarnings > 0) {
          console.log(`   🏆 Total Earnings: $${totalEarnings.toLocaleString()}`);
        }
        
        console.log(`   📋 Recent Applications:`);
        userApplications.slice(0, 3).forEach(app => {
          console.log(`      - ${app.title} ($${parseFloat(app.amount || '0').toLocaleString()}) - ${app.status}`);
        });
      } else {
        console.log(`   ⚠️  No applications found`);
      }
      
      console.log('');
    }
    
    console.log('✅ Dashboard data verification complete!');
    console.log('\n🎯 Testing Instructions:');
    console.log('1. Visit: http://localhost:3000/sign-in');
    console.log('2. Sign in with any test user (password123)');
    console.log('3. You should now see their scholarship applications in the dashboard');
    console.log('4. Check the stats, progress bars, and scholarship table');
    console.log('5. Each user should have different data based on their applications');
    
  } catch (error) {
    console.error('❌ Verification error:', error);
  } finally {
    await client.end();
  }
}

verifyDashboardData();