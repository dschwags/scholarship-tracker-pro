'use server'

import { hash as argonHash, verify as argonVerify } from '@node-rs/argon2'
import { compare as bcryptCompare } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db/drizzle'
import { users } from '@/lib/db/schema'

export async function verifyPasswordWithMigration(
  userId: number,
  plainPassword: string,
  currentHash: string
): Promise<{ isValid: boolean; needsMigration: boolean; newHash?: string }> {
  
  // First try Argon2 (new format)
  try {
    const isValidArgon = await argonVerify(currentHash, plainPassword, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    })
    
    if (isValidArgon) {
      return { isValid: true, needsMigration: false }
    }
  } catch (error) {
    // If Argon2 fails, try bcrypt (legacy format)
  }
  
  // Try bcrypt (legacy format)
  const isValidBcrypt = await bcryptCompare(plainPassword, currentHash)
  
  if (isValidBcrypt) {
    // Password is valid but needs migration to Argon2
    const newArgonHash = await argonHash(plainPassword, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    })
    
    return { 
      isValid: true, 
      needsMigration: true, 
      newHash: newArgonHash 
    }
  }
  
  return { isValid: false, needsMigration: false }
}

export async function migrateUserPassword(userId: number, newHash: string) {
  await db.update(users)
    .set({
      passwordHash: newHash,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId))
}