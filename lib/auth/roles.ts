import { User } from '@/lib/db/schema';

export type UserRole = 'student' | 'parent' | 'counselor' | 'admin';

export const ROLE_PERMISSIONS = {
  student: {
    applications: ['create', 'read', 'update', 'delete'],
    scholarships: ['read', 'save'],
    profile: ['read', 'update'],
    files: ['create', 'read', 'update', 'delete'],
    notifications: ['read', 'update'],
    dashboard: ['read'],
  },
  parent: {
    applications: ['read'], // Only read child's applications
    scholarships: ['read', 'save'],
    profile: ['read'],
    files: ['read'],
    notifications: ['read', 'update'],
    dashboard: ['read'],
    children: ['read'], // Can view connected children
  },
  counselor: {
    applications: ['read'], // Can read student applications
    scholarships: ['create', 'read', 'update', 'delete', 'save'],
    profile: ['read', 'update'],
    files: ['read'],
    notifications: ['create', 'read', 'update'],
    dashboard: ['read'],
    students: ['read'], // Can view connected students
    analytics: ['read'], // Can view student analytics
  },
  admin: {
    applications: ['create', 'read', 'update', 'delete'],
    scholarships: ['create', 'read', 'update', 'delete', 'save'],
    profile: ['read', 'update'],
    files: ['create', 'read', 'update', 'delete'],
    notifications: ['create', 'read', 'update', 'delete'],
    dashboard: ['read'],
    users: ['create', 'read', 'update', 'delete'],
    analytics: ['read'],
    system: ['read', 'update'],
  },
} as const;

export function hasPermission(
  userRole: UserRole,
  resource: keyof typeof ROLE_PERMISSIONS.student,
  action: string
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions || !permissions[resource]) {
    return false;
  }
  return permissions[resource].includes(action);
}

export function canAccessResource(
  user: User | null,
  resource: keyof typeof ROLE_PERMISSIONS.student,
  action: string
): boolean {
  if (!user || !user.role) {
    return false;
  }
  return hasPermission(user.role as UserRole, resource, action);
}

export function isStudent(user: User | null): boolean {
  return user?.role === 'student';
}

export function isParent(user: User | null): boolean {
  return user?.role === 'parent';
}

export function isCounselor(user: User | null): boolean {
  return user?.role === 'counselor';
}

export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

export function canManageUsers(user: User | null): boolean {
  return isAdmin(user) || isCounselor(user);
}

export function canManageScholarships(user: User | null): boolean {
  return isAdmin(user) || isCounselor(user);
}

export function canViewAnalytics(user: User | null): boolean {
  return isAdmin(user) || isCounselor(user);
}

export function getRoleDisplayName(role: UserRole): string {
  const roleNames = {
    student: 'Student',
    parent: 'Parent',
    counselor: 'Counselor',
    admin: 'Administrator',
  };
  return roleNames[role] || 'Unknown';
}

export function getRoleDescription(role: UserRole): string {
  const descriptions = {
    student: 'Can manage their own scholarship applications and profile',
    parent: 'Can view and monitor their child\'s scholarship progress',
    counselor: 'Can guide students and manage scholarship programs',
    admin: 'Full system access with administrative privileges',
  };
  return descriptions[role] || 'No description available';
}

// Role hierarchy for permission inheritance
export const ROLE_HIERARCHY = {
  admin: 4,
  counselor: 3,
  parent: 2,
  student: 1,
} as const;

export function hasHigherRole(userRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[targetRole];
}

export function canViewUserData(currentUser: User | null, targetUserId: number): boolean {
  if (!currentUser) return false;
  
  // Users can always view their own data
  if (currentUser.id === targetUserId) return true;
  
  // Admins can view all user data
  if (isAdmin(currentUser)) return true;
  
  // Counselors can view their connected students' data
  // Parents can view their connected children's data
  // TODO: Implement connection checks in database queries
  
  return false;
}