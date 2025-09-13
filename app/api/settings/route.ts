import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db/drizzle'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getUserPreferences } from '@/lib/actions/user-settings'

export async function GET(request: NextRequest) {
  try {
    console.log('⚙️ Settings API: Starting data fetch...');
    const session = await getSession();
    
    if (!session) {
      console.log('🔒 Settings API: No session, returning 401');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('✅ Settings API: Session valid, fetching data for user:', session.user.email);
    
    // Fetch complete user data from database
    const userData = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
    
    if (!userData[0]) {
      console.log('❌ Settings API: User not found in database');
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    
    const user = userData[0];
    const preferences = await getUserPreferences();
    
    console.log('✅ Settings API: User data fetched successfully');
    
    return Response.json({
      user,
      preferences
    });

  } catch (error) {
    console.error('❌ Settings API: Unexpected error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}