// BugX Framework: Minimal Dashboard with ZERO hooks to eliminate infinite loops

interface MinimalDashboardProps {
  user: {
    id: number;
    email: string;
    name: string | null;
    role: string;
  };
  stats: any;
  recentActivity: any[];
  scholarships?: any[];
}

export function MinimalDashboard({ user, stats, recentActivity, scholarships = [] }: MinimalDashboardProps) {
  
  // NO useState, NO useEffect, NO useMemo, NO useCallback - ZERO hooks
  // Pure function component that just renders data
  
  const firstName = user.name?.split(' ')[0] || 'Student';
  const scholarshipCount = scholarships.length;
  const totalAmount = scholarships.reduce((sum, s) => sum + (s.amount || 0), 0);
  
  console.log('🎯 MINIMAL DASHBOARD RENDER:', {
    userEmail: user.email,
    scholarshipCount,
    totalAmount,
    renderTime: new Date().toISOString()
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        
        {/* Simple Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {firstName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            You have {scholarshipCount} scholarship applications
          </p>
        </div>

        {/* Basic Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Applications</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{scholarshipCount}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</h3>
            <p className="text-2xl font-bold text-green-600">${totalAmount.toLocaleString()}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Account</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
          </div>
        </div>

        {/* Basic Message */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Dashboard Active
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This is a minimal dashboard with zero React hooks to test for infinite loops.
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            ✅ Zero useState hooks | ✅ Zero useEffect hooks | ✅ Zero useMemo hooks
          </div>
        </div>
        
        {/* Debug Info */}
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-xs text-gray-600 dark:text-gray-400">
          🎯 Minimal Dashboard | User: {user.email} | Scholarships: {scholarshipCount} | 
          Render: {new Date().toLocaleString()}
        </div>
        
      </div>
    </div>
  );
}