/**
 * Debug Date Issue - Isolate the toISOString error
 */

import { db } from '@/lib/db/drizzle';
import { financialGoals } from '@/lib/db/schema-financial-goals';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function debugDateIssue() {
  console.log('🔍 Debugging date issue...');

  try {
    // Create test user first
    const [testUser] = await db
      .insert(users)
      .values({
        email: `debug-date-${Date.now()}@example.com`,
        name: 'Debug Date User',
        passwordHash: 'debug-hash',
        role: 'student',
        educationLevel: 'undergraduate',
        stateProvince: 'California',
        country: 'United States',
      })
      .returning();

    console.log(`✅ Created test user ${testUser.id}`);

    // Try different date formats
    const testData1 = {
      userId: testUser.id,
      title: 'Test Goal 1 - Date object',
      goalType: 'education' as const,
      targetAmount: '50000.00',
      deadline: new Date('2028-05-15T23:59:59.000Z'),
      plannedStartDate: '2024-09-01',
    };

    console.log('📅 Testing Date object for deadline...');
    console.log('Date object:', testData1.deadline);
    console.log('Type:', typeof testData1.deadline);

    try {
      const [goal1] = await db
        .insert(financialGoals)
        .values(testData1)
        .returning();
      
      console.log('✅ Date object worked:', goal1.id);
    } catch (error) {
      console.log('❌ Date object failed:', error.message);
    }

    const testData2 = {
      userId: testUser.id,
      title: 'Test Goal 2 - ISO string',
      goalType: 'education' as const,
      targetAmount: '50000.00',
      deadline: '2028-05-15T23:59:59.000Z',
      plannedStartDate: '2024-09-01',
    };

    console.log('\n📅 Testing ISO string for deadline...');
    console.log('ISO string:', testData2.deadline);
    console.log('Type:', typeof testData2.deadline);

    try {
      const [goal2] = await db
        .insert(financialGoals)
        .values(testData2)
        .returning();
      
      console.log('✅ ISO string worked:', goal2.id);
    } catch (error) {
      console.log('❌ ISO string failed:', error.message);
    }

    const testData3 = {
      userId: testUser.id,
      title: 'Test Goal 3 - no deadline',
      goalType: 'education' as const,
      targetAmount: '50000.00',
      plannedStartDate: '2024-09-01',
    };

    console.log('\n📅 Testing without deadline...');

    try {
      const [goal3] = await db
        .insert(financialGoals)
        .values(testData3)
        .returning();
      
      console.log('✅ No deadline worked:', goal3.id);
    } catch (error) {
      console.log('❌ No deadline failed:', error.message);
    }

    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await db
      .delete(financialGoals)
      .where(eq(financialGoals.userId, testUser.id));
    
    await db
      .delete(users)
      .where(eq(users.id, testUser.id));
    
    console.log('✅ Cleanup complete');

  } catch (error) {
    console.error('💥 Debugging failed:', error);
  }
}

debugDateIssue().catch(console.error);