'use client';

import { createContext, useContext, ReactNode } from 'react';
import { SessionUser, ApiUser } from '@/types/api';

// SessionUser is now imported from types/api.ts

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

// Hook that returns ApiUser type compatible with existing components
export function useAuthUser(): ApiUser | null {
  const { user } = useAuth();
  
  if (!user) return null;
  
  // Convert SessionUser to ApiUser type for compatibility
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    // Default values for ApiUser type fields not in SessionUser
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
    createdAt: new Date('2024-01-01'), // ✅ BUGX: Fixed timestamp to prevent infinite re-renders
    updatedAt: new Date('2024-01-01'), // ✅ BUGX: Fixed timestamp to prevent infinite re-renders
    deletedAt: null
  } as ApiUser;
}