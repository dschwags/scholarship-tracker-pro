import { Button } from '@/components/ui/button';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Server action to clear legacy session - UNLOCKED
 */
async function clearLegacySessionAction() {
  'use server';
  
  // Clear all possible legacy cookies
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();
  
  // Clear any session-related cookies
  allCookies.forEach(cookie => {
    if (cookie.name.includes('session') || cookie.name.includes('auth') || cookie.name.includes('token')) {
      cookieStore.delete(cookie.name);
    }
  });
  
  // Redirect to sign-in page
  redirect('/sign-in');
}

/**
 * BugX Framework: Legacy Session Cleanup Page
 * 
 * This page allows users to clear legacy session cookies that might be causing
 * infinite loops or authentication errors after the nuclear database reset.
 */
export default function ClearLegacySessionPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🧹 Clear Legacy Session
            </h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>BugX Framework Notice:</strong></p>
              <p>Your browser has legacy authentication data that's incompatible with the updated system.</p>
              <p>Click below to clear it and get fresh access.</p>
            </div>
          </div>
          
          <form action={clearLegacySessionAction} className="space-y-6">
            <Button 
              type="submit" 
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              🔄 Clear Legacy Session & Restart
            </Button>
          </form>
          
          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>This will log you out and redirect you to create a new account.</p>
            <p className="mt-1"><strong>Technical:</strong> Clearing session cookie for database compatibility</p>
          </div>
        </div>
      </div>
    </div>
  );
}