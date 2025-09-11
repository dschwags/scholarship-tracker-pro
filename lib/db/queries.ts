import { desc, and, eq, isNull, sql } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, users, applications, scholarships, savedScholarships, notifications } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    // BugX Framework: Legacy session detected
    // User ID from session doesn't exist (likely from nuclear reset)
    console.log('🧹 BugX: Legacy session detected for non-existent user ID:', sessionData.user.id);
    console.log('⚠️ BugX: Session cleanup needed - user should be redirected to clear legacy session');
    
    return null;
  }

  return user[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      metadata: activityLogs.metadata,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

// Get user's applications with scholarship details
export async function getUserApplications() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: applications.id,
      status: applications.status,
      submittedAt: applications.submittedAt,
      statusUpdatedAt: applications.statusUpdatedAt,
      decisionDate: applications.decisionDate,
      awardAmount: applications.awardAmount,
      notes: applications.notes,
      scholarship: {
        id: scholarships.id,
        title: scholarships.title,
        description: scholarships.description,
        amount: scholarships.amount,
        provider: scholarships.provider,
        applicationDeadline: scholarships.applicationDeadline,
        status: scholarships.status
      }
    })
    .from(applications)
    .leftJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
    .where(eq(applications.userId, user.id))
    .orderBy(desc(applications.statusUpdatedAt));
}

// Get available scholarships
export async function getAvailableScholarships() {
  return await db
    .select()
    .from(scholarships)
    .where(eq(scholarships.status, 'active'))
    .orderBy(scholarships.applicationDeadline);
}

// Get user's saved scholarships
export async function getUserSavedScholarships() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: savedScholarships.id,
      notes: savedScholarships.notes,
      createdAt: savedScholarships.createdAt,
      scholarship: {
        id: scholarships.id,
        title: scholarships.title,
        description: scholarships.description,
        amount: scholarships.amount,
        provider: scholarships.provider,
        applicationDeadline: scholarships.applicationDeadline,
        status: scholarships.status
      }
    })
    .from(savedScholarships)
    .leftJoin(scholarships, eq(savedScholarships.scholarshipId, scholarships.id))
    .where(eq(savedScholarships.userId, user.id))
    .orderBy(desc(savedScholarships.createdAt));
}

// Get user's notifications
export async function getUserNotifications() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(20);
}

// Get dashboard statistics
export async function getDashboardStats() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get application statistics
  const applicationStats = await db
    .select({
      status: applications.status,
      count: sql<number>`count(*)`,
      totalAmount: sql<number>`sum(${applications.awardAmount})`
    })
    .from(applications)
    .leftJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
    .where(eq(applications.userId, user.id))
    .groupBy(applications.status);

  // Get total potential funding from active applications
  const potentialFunding = await db
    .select({
      totalPotential: sql<number>`sum(${scholarships.amount})`
    })
    .from(applications)
    .leftJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
    .where(and(
      eq(applications.userId, user.id),
      eq(applications.status, 'submitted')
    ));

  // Get upcoming deadlines (next 30 days)
  const upcomingDeadlines = await db
    .select({
      count: sql<number>`count(*)`
    })
    .from(applications)
    .leftJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
    .where(and(
      eq(applications.userId, user.id),
      eq(applications.status, 'draft'),
      sql`${scholarships.applicationDeadline} <= CURRENT_DATE + INTERVAL '30 days'`
    ));

  // Process statistics
  const stats = {
    applications: {
      total: 0,
      draft: 0,
      submitted: 0,
      accepted: 0,
      rejected: 0,
      under_review: 0
    },
    funding: {
      won: 0,
      potential: potentialFunding[0]?.totalPotential || 0
    },
    upcomingDeadlines: upcomingDeadlines[0]?.count || 0
  };

  applicationStats.forEach((stat) => {
    stats.applications.total += Number(stat.count);
    stats.applications[stat.status as keyof typeof stats.applications] = Number(stat.count);
    
    if (stat.status === 'accepted') {
      stats.funding.won += Number(stat.totalAmount || 0);
    }
  });

  const successRate = stats.applications.submitted > 0 
    ? Math.round((stats.applications.accepted / stats.applications.submitted) * 100) 
    : 0;

  return {
    ...stats,
    successRate
  };
}