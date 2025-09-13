import { verify, hash } from '@node-rs/argon2';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
// NewUser type removed - using generic user object for setSession

const key = new TextEncoder().encode(process.env.AUTH_SECRET);
export async function hashPassword(password: string) {
  return hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
) {
  return verify(hashedPassword, plainTextPassword, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

type SessionData = {
  user: {
    id: number;
    email: string;
    name: string | null;
    role: string;
  };
  expires: string;
};

export async function signToken(payload: SessionData) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1 day from now')
    .sign(key);
}

export async function verifyToken(input: string) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload as SessionData;
}

export async function getSession() {
  const stackTrace = new Error().stack?.split('\n')[2]?.trim() || 'unknown';
  console.log('🔍 getSession: Starting session check from:', stackTrace);
  
  try {
    const sessionCookie = (await cookies()).get('session');
    console.log('🍪 getSession: Session cookie exists:', !!sessionCookie?.value);
    
    if (!sessionCookie?.value) {
      console.log('❌ getSession: No session cookie found, returning null');
      console.log('🔍 getSession: Cookie details:', sessionCookie);
      return null;
    }
    
    console.log('🗝 getSession: Attempting JWT verification...');
    const session = await verifyToken(sessionCookie.value);
    console.log('✅ getSession: JWT verification successful:', {
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      expires: session?.expires,
      calledFrom: stackTrace
    });
    
    // Check expiration
    if (session?.expires && new Date(session.expires) < new Date()) {
      console.log('⏰ getSession: Session expired, returning null');
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('🚨 getSession: Error verifying token:', error);
    console.log('🔍 getSession: Error occurred in context:', stackTrace);
    return null;
  }
}

export async function setSession(user: any) {
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session: SessionData = {
    user: {
      id: user.id!,
      email: user.email,
      name: user.name || null,
      role: user.role || 'student',
    },
    expires: expiresInOneDay.toISOString(),
  };
  const encryptedSession = await signToken(session);
  (await cookies()).set('session', encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });
}
