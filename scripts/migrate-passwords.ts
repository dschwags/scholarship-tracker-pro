import { db } from '../lib/db/drizzle';
import { users } from '../lib/db/schema';
import { hashPassword } from '../lib/auth/session';
import { eq } from 'drizzle-orm';

async function migratePasswords() {
  console.log('🔐 Migrating passwords to Argon2...');
  
  // Default passwords for test users
  const defaultPasswords = {
    'emily.student@stp.com': 'student123',
    'marcus.student@stp.com': 'student123', 
    'sarah.parent@stp.com': 'parent123',
    'michael.counselor@stp.com': 'counselor123',
    'jennifer.grad@stp.com': 'student123'
  };
  
  try {
    for (const [email, password] of Object.entries(defaultPasswords)) {
      const hashedPassword = await hashPassword(password);
      
      await db.update(users)
        .set({ 
          passwordHash: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(users.email, email));
        
      console.log(`✅ Updated password for ${email}`);
    }
    
    console.log('🎉 Password migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migratePasswords();