'use client';

// EMERGENCY BugX Debug Dashboard - ZERO React hooks to isolate infinite loops
export function EmergencyDebugDashboard({ user, stats }: any) {
  console.log('🚨 EMERGENCY DEBUG DASHBOARD RENDER:', {
    timestamp: new Date().toISOString(),
    user: user?.email,
    hasStats: !!stats
  });

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f8ff', border: '2px solid #007acc' }}>
      <h1 style={{ color: '#007acc', fontSize: '24px', margin: '0 0 20px 0' }}>
        🚨 EMERGENCY DEBUG MODE
      </h1>
      
      <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>User Info:</h2>
        <p><strong>Email:</strong> {user?.email || 'No email'}</p>
        <p><strong>Name:</strong> {user?.name || 'No name'}</p>
        <p><strong>ID:</strong> {user?.id || 'No ID'}</p>
      </div>

      <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Stats:</h2>
        <p><strong>Total Applications:</strong> {stats?.applications?.total || 0}</p>
        <p><strong>Total Earnings:</strong> ${stats?.funding?.won || 0}</p>
        <p><strong>Success Rate:</strong> {stats?.successRate || 0}%</p>
      </div>

      <div style={{ backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '8px', border: '2px solid #28a745' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#28a745' }}>✅ BugX Status</h3>
        <p>✅ No React hooks (useState, useEffect)</p>
        <p>✅ No state management</p>
        <p>✅ No context providers</p>
        <p>✅ Pure function component</p>
        <p>✅ Static rendering only</p>
      </div>
    </div>
  );
}