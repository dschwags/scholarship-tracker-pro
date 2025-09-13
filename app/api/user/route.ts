// BugX: Dynamic imports to prevent build-time database issues
// import { getUser } from '@/lib/db/queries';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // BugX: Environment check
    if (!process.env.POSTGRES_URL) {
      return Response.json(null);
    }
    
    console.log('🔍 /api/user: Starting user fetch...');
    
    // BugX: Dynamic import
    const { getUser } = await import('@/lib/db/queries');
    const sessionCookie = (await cookies()).get('session');
    console.log('🍪 /api/user: Session cookie exists:', !!sessionCookie?.value);
    
    const user = await getUser();
    console.log('✅ /api/user: User fetch successful:', {
      hasUser: !!user,
      userEmail: user?.email,
      userName: user?.name,
      userId: user?.id
    });
    return Response.json(user);
  } catch (error) {
    console.error('🚨 /api/user: Error fetching user:', error);
    
    // Only clear session for specific JWT expiration/corruption errors
    // Don't clear for temporary database/processing errors  
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('jwt expired') || 
          errorMessage.includes('invalid compact jws') || 
          errorMessage.includes('invalid signature')) {
        console.log('🧽 /api/user: Clearing invalid/expired JWT session cookie');
        (await cookies()).set('session', '', {
          expires: new Date(0),
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
        });
      } else {
        // Log but preserve session for temporary errors (DB issues, network, etc.)
        console.log('⚠️ /api/user: Temporary error, preserving session');
      }
    }
    console.log('📝 /api/user: Returning null due to error');
    return Response.json(null);
  }
}
