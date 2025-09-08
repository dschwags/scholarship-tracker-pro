import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { ConnectionsDashboard } from '@/components/parent-linking/connections-dashboard';

export default async function ConnectionsPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        <ConnectionsDashboard />
      </div>
    </div>
  );
}