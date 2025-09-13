'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
// 🚨 BUGX FIX: Dynamic import to prevent legacy lock
// import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  activityLogs,
  type NewUser,
  type NewActivityLog,
  ActivityType,
} from '@/lib/db/schema';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
// 🚨 BUGX FIX: Dynamic import to prevent getUser legacy lock chain
// import { getUser } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser
} from '@/lib/auth/middleware';

async function logActivity(
  userId: number,
  type: ActivityType,
  ipAddress?: string,
  metadata?: string
) {
  // 🚨 BUGX FIX: Dynamic import to prevent legacy lock
  const { db } = await import('@/lib/db/drizzle');
  
  const newActivity: NewActivityLog = {
    userId,
    action: type,
    ipAddress: ipAddress || '',
    metadata: metadata || null
  };
  await db.insert(activityLogs).values(newActivity);
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  // 🚨 BUGX FIX: Dynamic import to prevent legacy lock
  const { db } = await import('@/lib/db/drizzle');

  const foundUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (foundUser.length === 0) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  const user = foundUser[0];

  const isPasswordValid = await comparePasswords(
    password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  await Promise.all([
    setSession(user),
    logActivity(user.id, ActivityType.SIGN_IN)
  ]);

  redirect('/');
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  // Keep legacy name field for backward compatibility
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['student', 'parent', 'counselor', 'admin']).default('student'),
  phone: z.string().optional(),
  educationLevel: z.enum(['high_school', 'undergraduate', 'graduate', 'doctoral', 'post_doctoral']).optional(),
  educationalStatus: z.enum(['currently_enrolled', 'accepted_planning', 'applying_multiple', 'community_college', 'military_veteran', 'adult_learner', 'funding_goal', 'exploring_options', 'other']).optional(),
  educationalDescription: z.string().max(500).optional(),
  graduationYear: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  school: z.string().max(200).optional()
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, firstName, lastName, name, role, phone, educationLevel, educationalStatus, educationalDescription, graduationYear, school } = data;
  
  // Combine firstName and lastName into name field for database storage
  const fullName = firstName && lastName ? `${firstName} ${lastName}`.trim() : name || null;
  
  // Validate that user provided some form of name
  if (!fullName || fullName.trim().length === 0) {
    return {
      error: 'Please provide your first and last name.',
      email,
      password
    };
  }
  
  // Validate graduation year if provided
  if (graduationYear && (graduationYear < 2020 || graduationYear > 2040)) {
    return {
      error: 'Graduation year must be between 2020 and 2040',
      email,
      password
    };
  }

  // 🚨 BUGX FIX: Dynamic import to prevent legacy lock
  const { db } = await import('@/lib/db/drizzle');

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: 'An account with this email already exists. Please try signing in instead.',
      email,
      password
    };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    email,
    passwordHash,
    name: fullName,
    role: role || 'student',
    phone: phone || null,
    educationLevel: educationLevel || null,
    educationalStatus: educationalStatus || null,
    educationalDescription: educationalDescription || null,
    graduationYear: graduationYear || null,
    school: school || null,
    isActive: true,
    emailVerified: false
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password
    };
  }

  await Promise.all([
    logActivity(createdUser.id, ActivityType.SIGN_UP),
    setSession(createdUser)
  ]);

  // Redirect to dashboard after successful signup
  redirect('/dashboard');
});

export async function signOut() {
  // 🚨 BUGX FIX: Dynamic import to prevent getUser legacy lock chain
  const { getUser } = await import('@/lib/db/queries');
  const user = (await getUser()) as User;
  await logActivity(user.id, ActivityType.SIGN_OUT);
  (await cookies()).delete('session');
  redirect('/'); // Redirect to home page after logout
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'Current password is incorrect.'
      };
    }

    if (currentPassword === newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password must be different from the current password.'
      };
    }

    if (confirmPassword !== newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password and confirmation password do not match.'
      };
    }

    const newPasswordHash = await hashPassword(newPassword);

    // 🚨 BUGX FIX: Dynamic import to prevent legacy lock
    const { db } = await import('@/lib/db/drizzle');

    await Promise.all([
      db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, user.id)),
      logActivity(user.id, ActivityType.UPDATE_PASSWORD)
    ]);

    return {
      success: 'Password updated successfully.'
    };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100)
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        password,
        error: 'Incorrect password. Please try again.'
      };
    }

    // 🚨 BUGX FIX: Dynamic import to prevent legacy lock
    const { db } = await import('@/lib/db/drizzle');

    await Promise.all([
      db
        .update(users)
        .set({ deletedAt: new Date() })
        .where(eq(users.id, user.id)),
      logActivity(user.id, ActivityType.DELETE_ACCOUNT)
    ]);

    (await cookies()).delete('session');
    redirect('/sign-in');
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().min(3).max(255)
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;

    // 🚨 BUGX FIX: Dynamic import to prevent legacy lock
    const { db } = await import('@/lib/db/drizzle');

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0 && existingUser[0].id !== user.id) {
      return {
        name,
        email,
        error: 'Email is already in use.'
      };
    }

    await Promise.all([
      db.update(users).set({ name, email }).where(eq(users.id, user.id)),
      logActivity(user.id, ActivityType.UPDATE_ACCOUNT)
    ]);

    return {
      success: 'Account updated successfully.'
    };
  }
);