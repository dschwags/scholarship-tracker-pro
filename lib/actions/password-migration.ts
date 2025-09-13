'use server'

import { comparePasswords } from '@/lib/auth/session'
import { eq } from 'drizzle-orm'
// BugX: Dynamic imports to prevent legacy locks
// import { db } from '@/lib/db/drizzle'
// import { users } from '@/lib/db/schema'

export async function verifyPasswordWithMigration(
  userId: number,
  plainPassword: string,
  currentHash: string
): Promise<{ isValid: boolean; needsMigration: boolean; newHash?: string }> {
  
  // Use comparePasswords for all password verification
  const isValid = await comparePasswords(plainPassword, currentHash)
  
  return { 
    isValid, 
    needsMigration: false // No migration needed with bcryptjs
  }
}

export async function migrateUserPassword(userId: number, newHash: string) {
  // BugX: Dynamic imports to prevent legacy locks
  const { db } = await import('@/lib/db/drizzle');
  const { users } = await import('@/lib/db/schema');
  
  await db.update(users)
    .set({
      passwordHash: newHash,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId))
}