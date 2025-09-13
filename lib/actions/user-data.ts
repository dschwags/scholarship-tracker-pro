'use server'

// 🚨 BUGX FIX: Dynamic import to prevent getUser legacy lock chain
// import { getUser } from '@/lib/db/queries';
import { SessionUser } from '@/types/api';

// Server action to get user data without exposing database imports to client
export async function getUserData(): Promise<SessionUser | null> {
  try {
    // 🚨 BUGX FIX: Dynamic import to prevent legacy lock chain
    const { getUser } = await import('@/lib/db/queries');
    const user = await getUser();
    
    if (!user) {
      return null;
    }
    
    // Convert User to SessionUser format for client consumption
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
  } catch (error) {
    console.error('❌ getUserData: Error fetching user:', error);
    return null;
  }
}