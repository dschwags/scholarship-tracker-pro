'use client';

import { createContext, useContext, ReactNode } from 'react';
import { User } from '@/lib/db/schema';

// Session user type (from auth/session.ts)
interface SessionUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

interface AuthContextType {
  user: SessionUser | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUser: SessionUser | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const value: AuthContextType = {
    user: initialUser,
    isAuthenticated: !!initialUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook that returns User type compatible with existing components
export function useAuthUser(): User | null {
  const { user } = useAuth();
  
  if (!user) return null;
  
  // Convert SessionUser to User type for compatibility
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    // Default values for User type fields not in SessionUser
    passwordHash: '',
    profilePicture: null,
    phone: null,
    dateOfBirth: null,
    address: null,
    city: null,
    state: null,
    zipCode: null,
    country: null,
    educationLevel: null,
    educationalStatus: null,
    educationalDescription: null,
    gpa: null,
    graduationYear: null,
    school: null,
    major: null,
    isActive: true,
    emailVerified: false,
    preferences: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: new Date('2024-01-01'), // ✅ BUGX: Fixed timestamp to prevent infinite re-renders
    updatedAt: new Date('2024-01-01'), // ✅ BUGX: Fixed timestamp to prevent infinite re-renders
    deletedAt: null
  } as User;
}