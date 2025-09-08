'use server';

import { db } from '@/lib/db/drizzle';
import { users, userConnections } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface DeleteAccountResult {
  success: boolean;
  message: string;
}

export async function deleteUserAccount(confirmationText?: string): Promise<DeleteAccountResult> {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return { success: false, message: 'You must be logged in to delete your account.' };
    }

    // Require confirmation text for safety
    if (confirmationText !== 'DELETE MY ACCOUNT') {
      return { 
        success: false, 
        message: 'Please type "DELETE MY ACCOUNT" exactly to confirm account deletion.' 
      };
    }

    // Start a transaction to delete all user data
    await db.transaction(async (tx) => {
      // 1. Delete all user connections (both as parent and child)
      await tx.delete(userConnections)
        .where(
          eq(userConnections.parentUserId, currentUser.id)
        );
      
      await tx.delete(userConnections)
        .where(
          eq(userConnections.childUserId, currentUser.id)
        );

      // 2. Delete the user account
      await tx.delete(users)
        .where(eq(users.id, currentUser.id));
    });

    // Clear the session cookie
    (await cookies()).delete('session');

    return {
      success: true,
      message: 'Your account has been permanently deleted. We\'re sorry to see you go!'
    };

  } catch (error) {
    console.error('Error deleting user account:', error);
    return { 
      success: false, 
      message: 'Failed to delete account. Please contact support if this issue persists.' 
    };
  }
}

export interface RemoveCollaboratorResult {
  success: boolean;
  message: string;
}

export async function removeCollaborator(connectionId: number): Promise<RemoveCollaboratorResult> {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return { success: false, message: 'You must be logged in to remove collaborators.' };
    }

    // Verify the connection exists and the current user has permission to remove it
    const connection = await db
      .select()
      .from(userConnections)
      .where(
        and(
          eq(userConnections.id, connectionId),
          eq(userConnections.childUserId, currentUser.id), // Only students can remove their collaborators
          eq(userConnections.isActive, true)
        )
      )
      .limit(1);

    if (connection.length === 0) {
      return { 
        success: false, 
        message: 'Connection not found or you don\'t have permission to remove it.' 
      };
    }

    // Deactivate the connection instead of deleting (for audit trail)
    await db
      .update(userConnections)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(userConnections.id, connectionId));

    return {
      success: true,
      message: 'Collaborator access has been removed successfully.'
    };

  } catch (error) {
    console.error('Error removing collaborator:', error);
    return { 
      success: false, 
      message: 'Failed to remove collaborator. Please try again.' 
    };
  }
}