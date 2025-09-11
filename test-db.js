import { db } from './lib/db/drizzle.ts';
import { users } from './lib/db/schema.ts';
import { eq, desc } from 'drizzle-orm';

async function testLatestUser() {
  try {
    const latestUser = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        educationalStatus: users.educationalStatus,
        educationalDescription: users.educationalDescription,
        educationLevel: users.educationLevel,
        school: users.school,
        graduationYear: users.graduationYear
      })
      .from(users)
      .orderBy(desc(users.id))
      .limit(1);
      
    console.log('Latest user:', JSON.stringify(latestUser, null, 2));
    
    // Look for the test user
    const testUser = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        educationalStatus: users.educationalStatus,
        educationalDescription: users.educationalDescription,
        educationLevel: users.educationLevel,
        school: users.school,
        graduationYear: users.graduationYear
      })
      .from(users)
      .where(eq(users.email, 'test@example.com'))
      .limit(1);
      
    console.log('Test user:', JSON.stringify(testUser, null, 2));
  } catch (error) {
    console.error('Database error:', error);
  }
}

testLatestUser();