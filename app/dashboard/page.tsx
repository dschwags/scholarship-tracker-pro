import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { MainDashboard } from '@/components/dashboard/main-dashboard' // ✅ BugX infinite loop fixes applied

export default async function Dashboard() {
  console.log('📋 Dashboard: Starting dashboard load...');
  const session = await getSession();
  console.log('📋 Dashboard: Session check result:', {
    hasSession: !!session,
    sessionUser: session?.user?.email,
    willRedirect: !session
  });
  
  if (!session) {
    console.log('🔄 Dashboard: No session, redirecting to /sign-in');
    redirect('/sign-in');
  }
  
  console.log('✅ Dashboard: Session valid, proceeding with dashboard render');
  
  const user = session.user;

  // Use dynamic imports to avoid bundling database code in client
  const { db } = await import('@/lib/db/drizzle');
  const { scholarships, applications } = await import('@/lib/db/schema');
  const { financialGoals } = await import('@/lib/db/schema-financial-goals');
  const { eq, desc, and } = await import('drizzle-orm');
  
  // Fetch dashboard data directly (server-side)
  let userApplications: any[] = [];
  let userFinancialGoals: any[] = [];
  let apiError = null;
  
  try {
    console.log('🔄 Dashboard: Fetching user applications from database...');
    
    // Get user's scholarship applications with scholarship details
    userApplications = await db
      .select({
        id: applications.id,
        applicationId: applications.id,
        scholarshipId: applications.scholarshipId,
        title: scholarships.title,
        description: scholarships.description,
        amount: scholarships.amount,
        currency: scholarships.currency,
        provider: scholarships.provider,
        applicationDeadline: scholarships.applicationDeadline,
        status: applications.status,
        submittedAt: applications.submittedAt,
        awardAmount: applications.awardAmount,
        notes: applications.notes,
        createdAt: applications.createdAt,
        scholarshipStatus: scholarships.status
      })
      .from(applications)
      .leftJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
      .where(eq(applications.userId, session.user.id));
    
    // Add progress data for scholarship applications UI
    userApplications = userApplications.map((app, index) => {
      // Calculate progress percentage based on status and mock requirements
      let completion = 0;
      let completionText = '0/6 completed';
      
      switch (app.status) {
        case 'draft':
          completion = 15;
          completionText = '1/6 completed';
          break;
        case 'in_progress':
        case 'under_review':
          completion = 75;
          completionText = '4.5/6 completed';
          break;
        case 'submitted':
          completion = 100;
          completionText = '6/6 completed';
          break;
        case 'accepted':
        case 'awarded':
          completion = 100;
          completionText = '6/6 completed';
          break;
        case 'rejected':
          completion = 100;
          completionText = '6/6 completed';
          break;
        default:
          completion = 0;
          completionText = '0/6 completed';
      }
      
      return {
        ...app,
        completion,
        completionText,
        // Add missing fields for ScholarshipRow component
        deadline: app.applicationDeadline,
        category: 'Academic', // Default category - could be enhanced with real data
        organizationUrl: `https://www.${app.provider?.toLowerCase().replace(/\s+/g, '') || 'scholarship'}.edu`,
        applicationUrl: `https://apply.${app.provider?.toLowerCase().replace(/\s+/g, '') || 'scholarship'}.edu/application`
      };
    });
    
    console.log('✅ Dashboard: Fetched applications successfully:', {
      count: userApplications.length,
      totalAmount: userApplications.reduce((sum, s) => sum + parseFloat(s.amount || '0'), 0),
      sampleProgress: userApplications.slice(0, 2).map(s => ({ status: s.status, completion: s.completion }))
    });
    
    // Also fetch user's financial goals
    console.log('🔄 Dashboard: Fetching user financial goals from database...');
    userFinancialGoals = await db
      .select()
      .from(financialGoals)
      .where(eq(financialGoals.userId, session.user.id))
      .orderBy(desc(financialGoals.createdAt));
    
    console.log('✅ Dashboard: Fetched financial goals successfully:', {
      count: userFinancialGoals.length,
      totalTarget: userFinancialGoals.reduce((sum, g) => sum + parseFloat(g.targetAmount || '0'), 0)
    });
  } catch (error) {
    console.error('❌ Dashboard: Error fetching applications:', error);
    apiError = 'Failed to load applications from database';
  }

  const totalApplications = userApplications.length;
  const totalAwarded = userApplications.filter(s => s.status === 'accepted').length;
  const totalRejected = userApplications.filter(s => s.status === 'rejected').length;
  const totalPending = userApplications.filter(s => s.status === 'submitted').length;
  const totalDraft = userApplications.filter(s => s.status === 'draft').length;
  const totalUnderReview = userApplications.filter(s => s.status === 'under_review').length;
  const completedApplications = totalAwarded + totalRejected;
  const successRate = completedApplications > 0 ? Math.round((totalAwarded / completedApplications) * 100) : 0;
  const totalEarnings = userApplications.filter(s => s.awardAmount).reduce((sum, s) => sum + parseFloat(s.awardAmount || '0'), 0);

  // Calculate stats from real data
  const totalTracked = userApplications.reduce((sum, s) => sum + parseFloat(s.amount || '0'), 0);
  
  const stats = {
    applications: {
      total: totalApplications,
      submitted: totalPending,
      draft: totalDraft,
      accepted: totalAwarded,
      rejected: totalRejected,
      under_review: totalUnderReview
    },
    scholarships: {
      saved: userApplications.length,
      available: 50 // Mock value
    },
    funding: {
      total: totalTracked,
      won: totalEarnings,
      potential: totalTracked - totalEarnings
    },
    successRate,
    upcomingDeadlines: userApplications.filter(s => {
      if (!s.applicationDeadline) return false;
      const deadline = new Date(s.applicationDeadline);
      const now = new Date();
      const daysUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntil > 0 && daysUntil <= 30;
    }).length
  };
  
  // Welcome stats for new users
  const welcomeStats = {
    applications: totalApplications,
    totalTracked: totalTracked,
    collaborators: 0 // This would come from connections API
  };
  
  console.log('📊 Dashboard: Calculated stats:', {
    totalApplications,
    totalTracked,
    totalEarnings,
    successRate
  });

  const recentActivity = [
    {
      id: 1,
      type: 'application' as const,
      title: 'Application Submitted',
      description: 'STEM Innovation Grant application was successfully submitted',
      timestamp: '2 hours ago',
      status: 'submitted'
    },
    {
      id: 2,
      type: 'scholarship' as const,
      title: 'New Scholarship Found',
      description: 'Community Service Award matches your profile',
      timestamp: '1 day ago'
    },
    {
      id: 3,
      type: 'status' as const,
      title: 'Application Status Update',
      description: 'Merit-based scholarship application reviewed',
      timestamp: '3 days ago',
      status: 'under_review'
    },
    {
      id: 4,
      type: 'deadline' as const,
      title: 'Deadline Reminder',
      description: 'Merit Excellence Scholarship due in 2 weeks',
      timestamp: '1 week ago'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4">
        <MainDashboard 
          user={user}
          scholarships={userApplications}
          financialGoals={userFinancialGoals}
          stats={stats}
          welcomeStats={welcomeStats}
          recentActivity={recentActivity}
          apiError={apiError}
        />
      </div>
    </div>
  );
}