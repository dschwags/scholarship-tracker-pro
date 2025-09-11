'use client';

import { useState, useMemo } from 'react';

// Session user type (from auth/session.ts)
interface SessionUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

// BugX-validated component: ZERO useEffect hooks to eliminate infinite loop potential
interface MainDashboardProps {
  user: SessionUser;
  stats: any;
  recentActivity: any[];
  scholarships?: any[];
  welcomeStats?: any;
  apiError?: string | null;
}

export function MainDashboard({ 
  user, 
  stats, 
  recentActivity, 
  scholarships = [], 
  welcomeStats,
  apiError 
}: MainDashboardProps) {
  
  // ✅ BugX SAFE: Simple state with no interdependencies
  const [selectedScholarship, setSelectedScholarship] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // ✅ BugX SAFE: Memoized values with stable dependencies - NO useEffect needed
  const studentProfile = useMemo(() => ({
    firstName: user.name?.split(' ')[0] || 'Student',
    lastName: user.name?.split(' ')[1] || '',
    email: user.email,
    gpa: 3.7,
    major: 'Computer Science',
    graduationYear: 2025,
    school: 'State University'
  }), [user.name, user.email]);
  
  // ✅ BugX SAFE: Direct prop usage - no state synchronization needed
  const currentScholarships = scholarships;
  const hasScholarships = currentScholarships.length > 0;
  
  // ✅ BugX SAFE: Computed values using useMemo instead of useEffect
  const dashboardStats = useMemo(() => ({
    totalApplications: currentScholarships.length,
    submitted: currentScholarships.filter(s => s.status === 'submitted').length,
    inProgress: currentScholarships.filter(s => s.status === 'in progress').length,
    awarded: currentScholarships.filter(s => s.status === 'awarded').length,
    totalAmount: currentScholarships.reduce((sum, s) => sum + (s.amount || 0), 0),
  }), [currentScholarships]);
  
  // ✅ BugX SAFE: Simple event handlers with no state cascade potential
  const openScholarshipModal = (scholarship: any) => {
    console.log('Opening scholarship modal for:', scholarship.title);
    setSelectedScholarship(scholarship);
    setIsModalOpen(true);
  };

  const closeScholarshipModal = () => {
    console.log('Closing scholarship modal');
    setIsModalOpen(false);
    setSelectedScholarship(null);
  };
  
  console.log('🎯 BugX Clean Dashboard Render:', {
    userEmail: user.email,
    scholarshipsCount: currentScholarships.length,
    hasScholarships,
    renderTime: new Date().toISOString()
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Welcome back, {studentProfile.firstName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {hasScholarships 
                ? `You have ${dashboardStats.totalApplications} scholarship applications` 
                : 'Ready to start your scholarship journey?'
              }
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Applications</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dashboardStats.totalApplications}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</h3>
            <p className="text-2xl font-bold text-blue-600">{dashboardStats.inProgress}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted</h3>
            <p className="text-2xl font-bold text-yellow-600">{dashboardStats.submitted}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Awarded</h3>
            <p className="text-2xl font-bold text-green-600">{dashboardStats.awarded}</p>
          </div>
        </div>

        {/* Welcome Message or Scholarships List */}
        {hasScholarships ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Your Scholarships</h2>
              <div className="space-y-4">
                {currentScholarships.map((scholarship) => (
                  <div 
                    key={scholarship.id} 
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => openScholarshipModal(scholarship)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{scholarship.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{scholarship.provider}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Amount: ${scholarship.amount?.toLocaleString() || 'TBD'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        scholarship.status === 'awarded' ? 'bg-green-100 text-green-800' :
                        scholarship.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                        scholarship.status === 'in progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {scholarship.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Welcome to Your Scholarship Dashboard!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start your scholarship journey by adding your first application.
            </p>
            <button 
              onClick={() => alert('Add scholarship functionality will be implemented')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Your First Scholarship
            </button>
          </div>
        )}

        {/* Simple Modal Placeholder */}
        {isModalOpen && selectedScholarship && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full m-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {selectedScholarship.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Provider: {selectedScholarship.provider}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Amount: ${selectedScholarship.amount?.toLocaleString() || 'TBD'}
              </p>
              <button 
                onClick={closeScholarshipModal}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
        
        {/* BugX Debug Info */}
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-xs text-gray-600 dark:text-gray-400">
          🎯 BugX Clean Dashboard | Zero useEffect hooks | Scholarships: {currentScholarships.length} | 
          Render: {new Date().toLocaleString()}
        </div>
        
      </div>
    </div>
  );
}