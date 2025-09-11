/**
 * BugX Framework: Legacy Session Cleanup Endpoint
 * 
 * This endpoint clears any legacy session cookies that might reference
 * deleted user IDs after the nuclear database reset. This prevents
 * authentication errors and infinite loops caused by invalid session data.
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🧹 BugX Framework: Clearing legacy session cookies...');
    
    // Clear the session cookie completely
    const cookieStore = await cookies();
    
    // Clear session cookie with all possible configurations to ensure complete removal
    cookieStore.set('session', '', {
      expires: new Date(0), // Set to past date
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/'
    });
    
    // Also try clearing with different path configurations
    cookieStore.set('session', '', {
      expires: new Date(0),
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/'
    });
    
    console.log('✅ BugX Framework: Legacy session cookies cleared successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Legacy session cookies cleared',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ BugX Framework: Failed to clear legacy session cookies:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to clear legacy session cookies',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}