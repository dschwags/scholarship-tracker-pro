/**
 * AI Conflict Resolution API Endpoint
 * 
 * Resolves data conflicts identified by the AI Decision Engine
 * and updates form state accordingly.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { aiDecisionEngine } from '@/lib/ai/decision-engine';
import { z } from 'zod';

// Request validation schema
const ResolveConflictSchema = z.object({
  conflictId: z.string().min(1, 'Conflict ID is required'),
  resolution: z.any(),
  currentData: z.record(z.any()).default({})
});

export async function POST(request: NextRequest) {
  try {
    // BugX: Environment check
    if (!process.env.POSTGRES_URL) {
      return NextResponse.json(
        { error: 'Database not configured in this environment' },
        { status: 503 }
      );
    }
    
    // Authentication
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validationResult = ResolveConflictSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          issues: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { conflictId, resolution, currentData } = validationResult.data;
    const sessionId = request.headers.get('x-session-id') || `session-${Date.now()}`;

    console.log(`🔧 AI Conflict resolution requested: ${conflictId}`);

    // Get AI context
    const aiContext = await getAIContext(session.user.id, sessionId, currentData);

    // Create conflict resolution update
    const resolutionUpdate = {
      fieldId: 'conflict_resolution',
      value: { conflictId, resolution },
      timestamp: new Date(),
      source: 'user_input' as const
    };

    // Process through AI engine
    const updatedContext = await aiDecisionEngine.processFieldUpdate(
      resolutionUpdate,
      aiContext
    );

    // Return updated conflict state
    const response = {
      success: true,
      remainingConflicts: updatedContext.detectedConflicts,
      updatedValidation: updatedContext.validationResults,
      resolvedConflictId: conflictId
    };

    console.log(`✅ Conflict resolved: ${conflictId}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('🚨 AI conflict resolution error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Conflict resolution failed',
      message: 'Unable to process conflict resolution. Please try manual resolution.'
    }, { status: 500 });
  }
}

/**
 * Get AI context for conflict resolution
 */
async function getAIContext(
  userId: number, 
  sessionId: string, 
  currentData: Record<string, any>
): Promise<any> {
  try {
    // Import here to avoid circular dependencies
    const { db } = await import('@/lib/db/drizzle');
    const { aiFormContexts } = await import('@/lib/db/schema-financial-goals');
    const { eq, and } = await import('drizzle-orm');

    // Try to get existing context
    const existingContext = await db
      .select()
      .from(aiFormContexts)
      .where(and(
        eq(aiFormContexts.userId, userId),
        eq(aiFormContexts.sessionId, sessionId)
      ))
      .limit(1);

    if (existingContext[0]) {
      return {
        ...existingContext[0],
        inferredData: { 
          ...(existingContext[0].inferredData && typeof existingContext[0].inferredData === 'object' ? existingContext[0].inferredData : {}), 
          ...currentData 
        }
      };
    }

    // Return minimal context if none exists
    return {
      id: `conflict-resolution-${Date.now()}`,
      userId,
      sessionId,
      currentPhase: 'conflict_resolution',
      completedSections: [],
      visibleFields: Object.keys(currentData),
      inferredData: currentData,
      confidenceScores: {},
      uncertaintyFlags: [],
      pendingActions: [],
      validationResults: { 
        errors: [], 
        warnings: [], 
        suggestions: [], 
        overallConfidence: 1.0 
      },
      detectedConflicts: [],
      needsManualIntervention: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
  } catch (error) {
    console.error('AI Context retrieval failed:', error);
    throw error;
  }
}