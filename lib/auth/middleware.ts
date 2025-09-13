import { z } from 'zod';
import { User } from '@/lib/db/schema';
// 🚨 BUGX FIX: Dynamic import to prevent getUser legacy lock chain
// import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { UserRole, canAccessResource, hasPermission } from './roles';

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any; // This allows for additional properties
};

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;

export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    return action(result.data, formData);
  };
}

type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User
) => Promise<T>;

export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    // 🚨 BUGX FIX: Dynamic import to prevent getUser legacy lock chain
    const { getUser } = await import('@/lib/db/queries');
    const user = await getUser();
    if (!user) {
      throw new Error('User is not authenticated');
    }

    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    return action(result.data, formData, user);
  };
}

// Role-based action validation
type ValidatedActionWithRoleFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User
) => Promise<T>;

export function validatedActionWithRole<S extends z.ZodType<any, any>, T>(
  schema: S,
  requiredRole: UserRole | UserRole[],
  action: ValidatedActionWithRoleFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    // 🚨 BUGX FIX: Dynamic import to prevent getUser legacy lock chain
    const { getUser } = await import('@/lib/db/queries');
    const user = await getUser();
    if (!user) {
      return { error: 'Authentication required' };
    }

    const userRole = user.role as UserRole;
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!allowedRoles.includes(userRole)) {
      return { error: 'Insufficient permissions' };
    }

    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    return action(result.data, formData, user);
  };
}

// Resource-based action validation
export function validatedActionWithPermission<S extends z.ZodType<any, any>, T>(
  schema: S,
  resource: string,
  requiredAction: string,
  action: ValidatedActionWithRoleFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    // 🚨 BUGX FIX: Dynamic import to prevent getUser legacy lock chain
    const { getUser } = await import('@/lib/db/queries');
    const user = await getUser();
    if (!user) {
      return { error: 'Authentication required' };
    }

    if (!canAccessResource(user, resource, requiredAction)) {
      return { error: 'Insufficient permissions for this action' };
    }

    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    return action(result.data, formData, user);
  };
}

// Authentication requirement wrapper
export function requireAuth() {
  return async () => {
    // 🚨 BUGX FIX: Dynamic import to prevent getUser legacy lock chain
    const { getUser } = await import('@/lib/db/queries');
    const user = await getUser();
    if (!user) {
      redirect('/sign-in');
    }
    return user;
  };
}

// Role requirement wrapper
export function requireRole(requiredRole: UserRole | UserRole[]) {
  return async () => {
    // 🚨 BUGX FIX: Dynamic import to prevent getUser legacy lock chain
    const { getUser } = await import('@/lib/db/queries');
    const user = await getUser();
    if (!user) {
      redirect('/sign-in');
    }

    const userRole = user.role as UserRole;
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!allowedRoles.includes(userRole)) {
      redirect('/unauthorized');
    }
    
    return user;
  };
}


