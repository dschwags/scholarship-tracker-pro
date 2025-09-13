import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db/drizzle'
import { scholarships, applications } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Dashboard API: Starting data fetch...');
    const session = await getSession();
    
    if (!session) {
      console.log('🔒 Dashboard API: No session, returning 401');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('✅ Dashboard API: Session valid, fetching data for user:', session.user.email);
    
    // Fetch real scholarship data directly from database
    let userScholarships: any[] = [];
    
    try {
      console.log('🔄 Dashboard API: Fetching scholarships from database...');
      
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
      
      console.log('✅ Dashboard API: Fetched scholarships successfully:', {
        count: userScholarships.length,
        totalAmount: userScholarships.reduce((sum, s) => sum + parseFloat(s.amount), 0)
      });
    } catch (error) {
      console.error('❌ Dashboard API: Error fetching scholarships:', error);
      return Response.json({ error: 'Failed to load scholarships from database' }, { status: 500 });
    }

    const totalApplications = userScholarships.length;
    const totalAwarded = userScholarships.filter(s => s.status === 'awarded').length;
    const totalRejected = userScholarships.filter(s => s.status === 'rejected').length;
    const totalPending = userScholarships.filter(s => s.status === 'submitted').length;
    const completedApplications = totalAwarded + totalRejected;
    const successRate = completedApplications > 0 ? Math.round((totalAwarded / completedApplications) * 100) : 0;
    const totalEarnings = 0; // No earnings until actual scholarships are won

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
        won: 0,
        potential: 0
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
    
    console.log('📊 Dashboard API: Calculated stats:', {
      totalApplications,
      totalTracked,
      totalEarnings,
      successRate
    });

    return Response.json({
      userScholarships,
      stats,
      welcomeStats,
      recentActivity,
      user: session.user
    });

  } catch (error) {
    console.error('❌ Dashboard API: Unexpected error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}