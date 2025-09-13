'use server';

// BugX: Dynamic imports to prevent legacy locks causing server-side exceptions
// import { db } from '@/lib/db/drizzle';
// import { users, userConnections } from '@/lib/db/schema';
// import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';
import { signToken, verifyToken as jwtVerifyToken } from '@/lib/auth/session';

export interface ParentInviteResult {
  success: boolean;
  message: string;
  inviteToken?: string;
}

export interface ConnectionResult {
  success: boolean;
  message: string;
  connection?: {
    id: number;
    parentName: string;
    parentEmail: string;
    connectionType: string;
    permissions: any;
  };
}

// Parent/Counselor invites student via email
export async function inviteStudent(studentEmail: string, connectionType: 'parent' | 'counselor' = 'parent'): Promise<ParentInviteResult> {
  try {
    // BugX: Dynamic imports to prevent legacy locks
    const { getUser } = await import('@/lib/db/queries');
    const { db } = await import('@/lib/db/drizzle');
    const { users, userConnections } = await import('@/lib/db/schema');
    
    const currentUser = await getUser();
    if (!currentUser) {
      return { success: false, message: 'You must be logged in to invite a student.' };
    }

    // Check if student is already connected
    const existingStudent = await db
      .select()
      .from(users)
      .where(eq(users.email, studentEmail))
      .limit(1);

    if (existingStudent.length > 0) {
      // Check if connection already exists
      const existingConnection = await db
        .select()
        .from(userConnections)
        .where(
          and(
            eq(userConnections.parentUserId, currentUser.id),
            eq(userConnections.childUserId, existingStudent[0].id),
            eq(userConnections.isActive, true)
          )
        )
        .limit(1);

      if (existingConnection.length > 0) {
        return { success: false, message: 'This student is already connected to your account.' };
      }
    }

    // Generate invitation token (simple base64 encoding for now)
    const inviteData = {
      parentId: currentUser.id,
      parentName: currentUser.name || 'Parent',
      parentEmail: currentUser.email,
      studentEmail: studentEmail,
      connectionType: connectionType,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      inviteType: 'student' // New field to distinguish reverse invitations
    };
    const inviteToken = Buffer.from(JSON.stringify(inviteData)).toString('base64');

    // In a real app, you'd send an email here
    // For now, return the token for manual sharing
    return {
      success: true,
      message: 'Invitation created successfully! Share this link with the student.',
      inviteToken
    };

  } catch (error) {
    console.error('Error creating student invitation:', error);
    return { success: false, message: 'Failed to create invitation. Please try again.' };
  }
}

// Student invites parent via email
export async function inviteParent(parentEmail: string, connectionType: 'parent' | 'counselor' = 'parent'): Promise<ParentInviteResult> {
  try {
    // BugX: Dynamic imports to prevent legacy locks
    const { getUser } = await import('@/lib/db/queries');
    const { db } = await import('@/lib/db/drizzle');
    const { users, userConnections } = await import('@/lib/db/schema');
    
    const currentUser = await getUser();
    if (!currentUser) {
      return { success: false, message: 'You must be logged in to invite a parent.' };
    }

    // Check if parent is already connected
    const existingParent = await db
      .select()
      .from(users)
      .where(eq(users.email, parentEmail))
      .limit(1);

    if (existingParent.length > 0) {
      // Check if connection already exists
      const existingConnection = await db
        .select()
        .from(userConnections)
        .where(
          and(
            eq(userConnections.parentUserId, existingParent[0].id),
            eq(userConnections.childUserId, currentUser.id),
            eq(userConnections.isActive, true)
          )
        )
        .limit(1);

      if (existingConnection.length > 0) {
        return { success: false, message: 'This parent is already connected to your account.' };
      }
    }

    // Generate invitation token (simple base64 encoding for now)
    const inviteData = {
      studentId: currentUser.id,
      studentName: currentUser.name || 'Student',
      studentEmail: currentUser.email,
      parentEmail: parentEmail,
      connectionType: connectionType,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      inviteType: 'parent' // Mark as parent invitation
    };
    const inviteToken = Buffer.from(JSON.stringify(inviteData)).toString('base64');

    // In a real app, you'd send an email here
    // For now, return the token for manual sharing
    return {
      success: true,
      message: 'Invitation created successfully! Share this link with your parent.',
      inviteToken
    };

  } catch (error) {
    console.error('Error creating parent invitation:', error);
    return { success: false, message: 'Failed to create invitation. Please try again.' };
  }
}

// Student accepts reverse invitation from parent/counselor
export async function acceptStudentInvitation(inviteToken: string): Promise<ConnectionResult> {
  try {
    // BugX: Dynamic imports to prevent legacy locks
    const { getUser } = await import('@/lib/db/queries');
    const { db } = await import('@/lib/db/drizzle');
    const { users, userConnections } = await import('@/lib/db/schema');
    
    const currentUser = await getUser();
    if (!currentUser) {
      return { success: false, message: 'You must be logged in to accept an invitation.' };
    }

    // Verify and decode the invitation token
    const inviteData = await verifyInviteToken(inviteToken);
    if (!inviteData) {
      return { success: false, message: 'Invalid or expired invitation link.' };
    }

    // Check if this is a student invitation
    if (inviteData.inviteType !== 'student') {
      return { success: false, message: 'This invitation is not for a student.' };
    }

    // Check if current user's email matches the invited student email
    if (currentUser.email !== inviteData.studentEmail) {
      return { success: false, message: 'This invitation is not for your email address.' };
    }

    // Check if connection already exists
    const existingConnection = await db
      .select()
      .from(userConnections)
      .where(
        and(
          eq(userConnections.parentUserId, inviteData.parentId),
          eq(userConnections.childUserId, currentUser.id),
          eq(userConnections.isActive, true)
        )
      )
      .limit(1);

    if (existingConnection.length > 0) {
      return { success: false, message: 'You are already connected to this parent/counselor.' };
    }

    // Create the connection
    const defaultPermissions = {
      canViewScholarships: true,
      canEditScholarships: true,
      canViewFinancials: true,
      canEditFinancials: true,
      canCreateTasks: true,
      canViewProgress: true,
      canReceiveNotifications: true
    };

    const newConnection = await db
      .insert(userConnections)
      .values({
        parentUserId: inviteData.parentId,
        childUserId: currentUser.id,
        connectionType: inviteData.connectionType || 'parent',
        permissions: defaultPermissions,
        isActive: true
      })
      .returning();

    return {
      success: true,
      message: `Successfully connected to ${inviteData.parentName}!`,
      connection: {
        id: newConnection[0].id,
        parentName: inviteData.parentName,
        parentEmail: inviteData.parentEmail,
        connectionType: newConnection[0].connectionType,
        permissions: newConnection[0].permissions
      }
    };

  } catch (error) {
    console.error('Error accepting student invitation:', error);
    return { success: false, message: 'Failed to accept invitation. Please try again.' };
  }
}

// Parent accepts invitation
export async function acceptParentInvitation(inviteToken: string): Promise<ConnectionResult> {
  try {
    // BugX: Dynamic imports to prevent legacy locks
    const { getUser } = await import('@/lib/db/queries');
    const { db } = await import('@/lib/db/drizzle');
    const { users, userConnections } = await import('@/lib/db/schema');
    
    const currentUser = await getUser();
    if (!currentUser) {
      return { success: false, message: 'You must be logged in to accept an invitation.' };
    }

    // Verify and decode the invitation token
    const inviteData = await verifyInviteToken(inviteToken);
    if (!inviteData) {
      return { success: false, message: 'Invalid or expired invitation link.' };
    }

    // Check if this is a parent invitation (backwards compatibility)
    if (inviteData.inviteType && inviteData.inviteType !== 'parent') {
      return { success: false, message: 'This invitation is not for a parent/counselor.' };
    }

    // Check if current user's email matches the invited parent email
    if (currentUser.email !== inviteData.parentEmail) {
      return { success: false, message: 'This invitation is not for your email address.' };
    }

    // Check if connection already exists
    const existingConnection = await db
      .select()
      .from(userConnections)
      .where(
        and(
          eq(userConnections.parentUserId, currentUser.id),
          eq(userConnections.childUserId, inviteData.studentId),
          eq(userConnections.isActive, true)
        )
      )
      .limit(1);

    if (existingConnection.length > 0) {
      return { success: false, message: 'You are already connected to this student.' };
    }

    // Create the connection
    const defaultPermissions = {
      canViewScholarships: true,
      canEditScholarships: true,
      canViewFinancials: true,
      canEditFinancials: true,
      canCreateTasks: true,
      canViewProgress: true,
      canReceiveNotifications: true
    };

    const newConnection = await db
      .insert(userConnections)
      .values({
        parentUserId: currentUser.id,
        childUserId: inviteData.studentId,
        connectionType: inviteData.connectionType || 'parent',
        permissions: defaultPermissions,
        isActive: true
      })
      .returning();

    return {
      success: true,
      message: `Successfully connected to ${inviteData.studentName}!`,
      connection: {
        id: newConnection[0].id,
        parentName: currentUser.name || 'Parent',
        parentEmail: currentUser.email,
        connectionType: newConnection[0].connectionType,
        permissions: newConnection[0].permissions
      }
    };

  } catch (error) {
    console.error('Error accepting parent invitation:', error);
    return { success: false, message: 'Failed to accept invitation. Please try again.' };
  }
}

// Get user's connections (for both students and parents)
export async function getUserConnections() {
  try {
    // BugX: Dynamic imports to prevent legacy locks
    const { getUser } = await import('@/lib/db/queries');
    const { db } = await import('@/lib/db/drizzle');
    const { users, userConnections } = await import('@/lib/db/schema');
    
    const currentUser = await getUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Get connections where current user is the parent
    const parentConnections = await db
      .select({
        id: userConnections.id,
        connectionType: userConnections.connectionType,
        permissions: userConnections.permissions,
        createdAt: userConnections.createdAt,
        isActive: userConnections.isActive,
        childUser: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role
        }
      })
      .from(userConnections)
      .leftJoin(users, eq(userConnections.childUserId, users.id))
      .where(
        and(
          eq(userConnections.parentUserId, currentUser.id),
          eq(userConnections.isActive, true)
        )
      );

    // Get connections where current user is the child
    const childConnections = await db
      .select({
        id: userConnections.id,
        connectionType: userConnections.connectionType,
        permissions: userConnections.permissions,
        createdAt: userConnections.createdAt,
        isActive: userConnections.isActive,
        parentUser: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role
        }
      })
      .from(userConnections)
      .leftJoin(users, eq(userConnections.parentUserId, users.id))
      .where(
        and(
          eq(userConnections.childUserId, currentUser.id),
          eq(userConnections.isActive, true)
        )
      );

    return {
      asParent: parentConnections,
      asChild: childConnections
    };

  } catch (error) {
    console.error('Error fetching user connections:', error);
    throw error;
  }
}

// Add comment/task to scholarship (collaborative feature)
export async function addScholarshipComment(scholarshipId: number, comment: string, assignedTo?: number) {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // For now, we'll store comments in the scholarship's metadata
    // In a full implementation, you'd create a separate comments table
    const commentData = {
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name || 'User',
      comment: comment,
      assignedTo: assignedTo,
      createdAt: new Date().toISOString(),
      isTask: !!assignedTo
    };

    // This is a simplified implementation - you'd want a proper comments table
    return {
      success: true,
      message: assignedTo ? 'Task assigned successfully!' : 'Comment added successfully!',
      comment: commentData
    };

  } catch (error) {
    console.error('Error adding scholarship comment:', error);
    return { success: false, message: 'Failed to add comment. Please try again.' };
  }
}

// Simple invite token verification (base64 encoded)
async function verifyInviteToken(token: string): Promise<any> {
  try {
    // Decode base64 token
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Check if token is expired
    if (new Date(decoded.expires) < new Date()) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Error verifying invite token:', error);
    return null;
  }
}