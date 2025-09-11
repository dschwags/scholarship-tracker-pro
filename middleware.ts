import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');

  let res = NextResponse.next();

  if (sessionCookie && request.method === 'GET') {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      
      // ✅ BugX FIX: Only refresh session if it expires within 2 hours
      const sessionExpiry = new Date(parsed.expires);
      const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
      
      if (sessionExpiry <= twoHoursFromNow) {
        console.log('🔄 Middleware: Session expires soon, refreshing token');
        const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

        res.cookies.set({
          name: 'session',
          value: await signToken({
            ...parsed,
            expires: expiresInOneDay.toISOString()
          }),
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          expires: expiresInOneDay
        });
      } else {
        console.log('🔒 Middleware: Session still valid, no refresh needed');
      }
    } catch (error) {
      console.error('🚨 Middleware session refresh error:', error);
      
      // Only delete session for specific JWT expiration/corruption errors
      // Don't delete for temporary network/processing errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('jwt expired') || 
            errorMessage.includes('invalid compact jws') || 
            errorMessage.includes('invalid signature')) {
          console.log('🧽 Middleware: Deleting invalid/expired session');
          res.cookies.delete('session');
        } else {
          // Log but preserve session for temporary errors
          console.log('⚠️ Middleware: Temporary error, preserving session');
        }
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs'
};
