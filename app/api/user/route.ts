import { getUser } from '@/lib/db/queries';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    console.log('🔍 /api/user: Starting user fetch...');
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
    // If JWT is invalid, clear the session cookie
    if (error instanceof Error && error.message.includes('Invalid Compact JWS')) {
      console.log('🧽 /api/user: Clearing invalid JWT session cookie');
      (await cookies()).set('session', '', {
        expires: new Date(0),
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      });
    }
    console.log('📝 /api/user: Returning null due to error');
    return Response.json(null);
  }
}
