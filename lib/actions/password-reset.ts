'use server'

import bcrypt from 'bcryptjs'
import { eq, and, gt } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import crypto from 'crypto'

import { db } from '@/lib/db/drizzle'
import { users } from '@/lib/db/schema'

// Validation schemas
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export async function requestPasswordReset(formData: FormData) {
  try {
    const validatedFields = forgotPasswordSchema.safeParse({
      email: formData.get('email'),
    })

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.errors[0]?.message || 'Invalid email address',
      }
    }

    const { email } = validatedFields.data

    // Check if user exists
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1)
    
    if (user.length === 0) {
      // For security, don't reveal if email exists or not
      return {
        success: 'If an account with that email exists, we\'ve sent a password reset link.',
      }
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Save reset token to database
    await db
      .update(users)
      .set({
        resetToken,
        resetTokenExpiry,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user[0].id))

    // In production, you would send an email here
    // For development, we'll log the reset link
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
    console.log(`🔐 Password reset link for ${email}: ${resetUrl}`)
    
    // TODO: Send email with reset link
    // await sendPasswordResetEmail(email, resetUrl)

    return {
      success: 'If an account with that email exists, we\'ve sent a password reset link.',
    }
  } catch (error) {
    console.error('Password reset request error:', error)
    return {
      error: 'An error occurred while processing your request. Please try again.',
    }
  }
}

export async function resetPassword(formData: FormData) {
  try {
    const validatedFields = resetPasswordSchema.safeParse({
      token: formData.get('token'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    })

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.errors[0]?.message || 'Invalid input',
      }
    }

    const { token, password } = validatedFields.data

    // Find user with valid reset token
    const user = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.resetToken, token),
          gt(users.resetTokenExpiry, new Date())
        )
      )
      .limit(1)

    if (user.length === 0) {
      return {
        error: 'Invalid or expired reset token. Please request a new password reset.',
      }
    }

    // Hash new password
    const passwordHash = await hash(password, {
      memoryCost: 65536,
      timeCost: 3,
      outputLen: 32,
    })

    // Update password and clear reset token
    await db
      .update(users)
      .set({
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user[0].id))

    console.log(`✅ Password reset successful for user ID: ${user[0].id}`)

    return {
      success: 'Your password has been reset successfully. You can now sign in with your new password.',
    }
  } catch (error) {
    console.error('Password reset error:', error)
    return {
      error: 'An error occurred while resetting your password. Please try again.',
    }
  }
}

export async function verifyResetToken(token: string) {
  try {
    if (!token) {
      return { valid: false, error: 'Reset token is required' }
    }

    const user = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(
        and(
          eq(users.resetToken, token),
          gt(users.resetTokenExpiry, new Date())
        )
      )
      .limit(1)

    if (user.length === 0) {
      return { 
        valid: false, 
        error: 'Invalid or expired reset token. Please request a new password reset.' 
      }
    }

    return { 
      valid: true, 
      user: { id: user[0].id, email: user[0].email } 
    }
  } catch (error) {
    console.error('Token verification error:', error)
    return { 
      valid: false, 
      error: 'An error occurred while verifying the reset token.' 
    }
  }
}