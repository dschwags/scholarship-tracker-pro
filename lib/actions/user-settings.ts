'use server'

import { hash, verify } from '@node-rs/argon2'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { db } from '@/lib/db/drizzle'
import { users } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { 
  UserPreferences, 
  PasswordChangeRequest, 
  EmailChangeRequest,
  emailValidation 
} from '@/lib/types/user-preferences'
import { validatePasswordStrength } from '@/lib/utils/password-validation'

// Get user preferences
export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    const session = await getSession()
    if (!session?.user?.id) return null

    const user = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1)
    if (!user[0]) return null

    return user[0].preferences as UserPreferences || null
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return null
  }
}

// Update user preferences
export async function updateUserPreferences(preferences: Partial<UserPreferences>) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      throw new Error('Not authenticated')
    }

    // Get current preferences
    const currentUser = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1)
    if (!currentUser[0]) {
      throw new Error('User not found')
    }

    // Merge with existing preferences
    const currentPreferences = (currentUser[0].preferences as UserPreferences) || {}
    const updatedPreferences = {
      ...currentPreferences,
      ...preferences
    }

    // Update in database
    await db.update(users)
      .set({
        preferences: updatedPreferences,
        updatedAt: new Date()
      })
      .where(eq(users.id, session.user.id))

    revalidatePath('/settings')
    return { success: true, message: 'Preferences updated successfully' }
  } catch (error) {
    console.error('Error updating preferences:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to update preferences' 
    }
  }
}

// Update user profile
export async function updateUserProfile(profileData: {
  name?: string
  bio?: string
  gpa?: number
  graduationYear?: number
  school?: string
  major?: string
}) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      throw new Error('Not authenticated')
    }

    // Validate data
    if (profileData.gpa && (profileData.gpa < 0 || profileData.gpa > 4.0)) {
      throw new Error('GPA must be between 0.0 and 4.0')
    }

    if (profileData.graduationYear && profileData.graduationYear < 2020) {
      throw new Error('Graduation year must be 2020 or later')
    }

    // Update user profile
    await db.update(users)
      .set({
        ...profileData,
        updatedAt: new Date()
      })
      .where(eq(users.id, session.user.id))

    revalidatePath('/settings')
    return { success: true, message: 'Profile updated successfully' }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to update profile' 
    }
  }
}

// Change password
export async function changePassword(request: PasswordChangeRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      throw new Error('Not authenticated')
    }

    // Validate passwords match
    if (request.newPassword !== request.confirmPassword) {
      throw new Error('New passwords do not match')
    }

    // Validate password strength
    const passwordCheck = validatePasswordStrength(request.newPassword)
    if (!passwordCheck.isValid) {
      throw new Error(`Password validation failed: ${passwordCheck.errors.join(', ')}`)
    }

    // Get current user
    const user = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1)
    if (!user[0]) {
      throw new Error('User not found')
    }

    // Check if user has a password set
    if (!user[0].passwordHash) {
      throw new Error('No password is set for this account. Please contact support.')
    }

    // Verify current password
    const isCurrentPasswordValid = await verify(user[0].passwordHash, request.currentPassword, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    })

    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect')
    }

    // Hash new password
    const hashedNewPassword = await hash(request.newPassword, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    })

    // Update password
    await db.update(users)
      .set({
        passwordHash: hashedNewPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, session.user.id))

    // Log security event (in a real app, you'd have an activity log)
    console.log(`Password changed for user ${session.user.id}`)

    revalidatePath('/settings')
    return { success: true, message: 'Password changed successfully' }
  } catch (error) {
    console.error('Error changing password:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to change password' 
    }
  }
}

// Change email
export async function changeEmail(request: EmailChangeRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      throw new Error('Not authenticated')
    }

    // Validate email format
    if (!emailValidation.pattern.test(request.newEmail)) {
      throw new Error('Invalid email format')
    }

    if (request.newEmail.length > emailValidation.maxLength) {
      throw new Error('Email address is too long')
    }

    // Check if email already exists
    const existingUser = await db.select().from(users).where(eq(users.email, request.newEmail)).limit(1)
    if (existingUser[0]) {
      throw new Error('Email address is already in use')
    }

    // Get current user and verify password
    const user = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1)
    if (!user[0]) {
      throw new Error('User not found')
    }

    const isPasswordValid = await verify(user[0].passwordHash, request.password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    })

    if (!isPasswordValid) {
      throw new Error('Password is incorrect')
    }

    // Update email (in a real app, you'd send verification email first)
    await db.update(users)
      .set({
        email: request.newEmail,
        emailVerified: false, // Require re-verification
        updatedAt: new Date()
      })
      .where(eq(users.id, session.user.id))

    // Log security event
    console.log(`Email changed for user ${session.user.id} from ${user[0].email} to ${request.newEmail}`)

    revalidatePath('/settings')
    return { 
      success: true, 
      message: 'Email updated successfully. Please verify your new email address.' 
    }
  } catch (error) {
    console.error('Error changing email:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to change email' 
    }
  }
}

// Delete account
export async function deleteAccount(password: string) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      throw new Error('Not authenticated')
    }

    // Get current user and verify password
    const user = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1)
    if (!user[0]) {
      throw new Error('User not found')
    }

    const isPasswordValid = await verify(user[0].passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    })

    if (!isPasswordValid) {
      throw new Error('Password is incorrect')
    }

    // Soft delete the user account
    await db.update(users)
      .set({
        isActive: false,
        deletedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, session.user.id))

    // Log security event
    console.log(`Account deleted for user ${session.user.id}`)

    // Redirect to login page
    redirect('/sign-in?message=account-deleted')
  } catch (error) {
    console.error('Error deleting account:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to delete account' 
    }
  }
}