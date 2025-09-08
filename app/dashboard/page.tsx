import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { MainDashboard } from '@/components/dashboard/main-dashboard'
import { db } from '@/lib/db/drizzle'
import { scholarships, applications } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

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
  
  const user = session.user

  // Fetch real scholarship data directly from database
  let userScholarships: any[] = [];
  let apiError = null;
  
  try {
    console.log('🔄 Dashboard: Fetching scholarships from database...');
    
    // Get scholarships created by this user
    userScholarships = await db
      .select({
        id: scholarships.id,
        title: scholarships.title,
        description: scholarships.description,
        amount: scholarships.amount,
        currency: scholarships.currency,
        provider: scholarships.provider,
        applicationDeadline: scholarships.applicationDeadline,
        status: scholarships.status,
        createdAt: scholarships.createdAt,
      })
      .from(scholarships)
      .where(eq(scholarships.createdBy, session.user.id))
    
    console.log('✅ Dashboard: Fetched scholarships successfully:', {
      count: userScholarships.length,
      totalAmount: userScholarships.reduce((sum, s) => sum + parseFloat(s.amount), 0)
    });
  } catch (error) {
    console.error('❌ Dashboard: Error fetching scholarships:', error);
    apiError = 'Failed to load scholarships from database';
  }

  const totalApplications = userScholarships.length;
  const totalAwarded = userScholarships.filter(s => s.status === 'awarded').length;
  const totalRejected = userScholarships.filter(s => s.status === 'rejected').length;
  const totalPending = userScholarships.filter(s => s.status === 'submitted').length;
  const completedApplications = totalAwarded + totalRejected;
  const successRate = completedApplications > 0 ? Math.round((totalAwarded / completedApplications) * 100) : 0;
  const totalEarnings = userScholarships
    .filter(s => s.status === 'awarded')
    .reduce((sum, s) => sum + parseFloat(s.amount), 0);



  // Calculate stats from real data
  const totalTracked = userScholarships.reduce((sum, s) => sum + parseFloat(s.amount), 0);
  
  const stats = {
    applications: {
      total: totalApplications,
      submitted: totalPending,
      draft: userScholarships.filter(s => s.status === 'not_started' || s.status === 'draft').length,
      accepted: totalAwarded,
      rejected: totalRejected
    },
    scholarships: {
      saved: userScholarships.length,
      available: 50 // Mock value
    },
    funding: {
      total: totalTracked,
      won: totalEarnings,
      potential: userScholarships.filter(s => s.status !== 'rejected').reduce((sum, s) => sum + parseFloat(s.amount), 0)
    },
    successRate,
    upcomingDeadlines: userScholarships.filter(s => {
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
  
  // API error state is set above during fetch
  
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
      title: 'Award Received',
      description: 'Athletics Scholarship - $12,000 awarded',
      timestamp: '3 days ago',
      status: 'won'
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
          stats={stats} 
          recentActivity={recentActivity}
          scholarships={userScholarships}
          welcomeStats={welcomeStats}
          apiError={apiError}
        />
      </div>
    </div>
  )
}