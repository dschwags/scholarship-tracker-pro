'use server'

import bcrypt from 'bcryptjs'
import { compare as bcryptCompare } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db/drizzle'
import { users } from '@/lib/db/schema'

export async function verifyPasswordWithMigration(
  userId: number,
  plainPassword: string,
  currentHash: string
): Promise<{ isValid: boolean; needsMigration: boolean; newHash?: string }> {
  
  // Use bcryptjs for all password verification
  const isValid = await bcrypt.compare(plainPassword, currentHash)
  
  return { 
    isValid, 
    needsMigration: false // No migration needed with bcryptjs
  }
}

export async function migrateUserPassword(userId: number, newHash: string) {
  await db.update(users)
    .set({
      passwordHash: newHash,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId))
}