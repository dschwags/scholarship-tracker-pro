/**
 * AI Field Processing API Endpoint
 * 
 * Processes individual field updates through the AI Decision Engine
 * and returns updated form state with progressive disclosure logic.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { aiDecisionEngine } from '@/lib/ai/decision-engine';
import { z } from 'zod';

// Request validation schema
const ProcessFieldSchema = z.object({
  fieldId: z.string().min(1, 'Field ID is required'),
  value: z.any(),
  currentData: z.record(z.any()).default({}),
  currentPhase: z.string().default('goal_creation'),
  source: z.enum(['user_input', 'ai_inference', 'template', 'calculation']).default('user_input')
});

export async function POST(request: NextRequest) {
  try {
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
    const validationResult = ProcessFieldSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          issues: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { fieldId, value, currentData, currentPhase, source } = validationResult.data;
    const sessionId = request.headers.get('x-session-id') || `session-${Date.now()}`;

    console.log(`🤖 AI Processing field update: ${fieldId} = ${JSON.stringify(value)}`);

    // Get or create AI form context
    const aiContext = await getOrCreateAIContext(
      session.user.id, 
      sessionId, 
      currentPhase,
      currentData
    );

    // Process field update through AI Decision Engine
    const fieldUpdate = {
      fieldId,
      value,
      timestamp: new Date(),
      source: source as 'user_input' | 'ai_inference' | 'template' | 'calculation'
    };

    const updatedContext = await aiDecisionEngine.processFieldUpdate(
      fieldUpdate,
      aiContext
    );

    // Transform AI context to frontend-compatible format
    const responseData = {
      currentPhase: updatedContext.currentPhase,
      completedSections: updatedContext.completedSections,
      visibleFields: updatedContext.visibleFields,
      confidenceScores: updatedContext.confidenceScores,
      uncertaintyFlags: updatedContext.uncertaintyFlags,
      pendingActions: updatedContext.pendingActions,
      validationResults: updatedContext.validationResults,
      detectedConflicts: updatedContext.detectedConflicts,
      needsManualIntervention: updatedContext.needsManualIntervention
    };

    console.log(`✅ AI Processing complete. Confidence: ${updatedContext.validationResults.overallConfidence}`);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('🚨 AI field processing error:', error);
    
    // Return graceful fallback
    return NextResponse.json({
      currentPhase: 'goal_creation',
      completedSections: [],
      visibleFields: [],
      confidenceScores: {},
      uncertaintyFlags: [{
        fieldId: 'ai_processing',
        reason: 'AI processing temporarily unavailable',
        suggestedClarification: 'Please continue filling the form manually',
        confidence: 0.5
      }],
      pendingActions: [],
      validationResults: {
        errors: [],
        warnings: [{
          ruleId: 'ai_fallback',
          fieldId: 'system',
          message: 'AI assistance temporarily unavailable',
          severity: 'warning',
          confidence: 0.5
        }],
        suggestions: [],
        overallConfidence: 0.5
      },
      detectedConflicts: [],
      needsManualIntervention: false
    });
  }
}

/**
 * Create or retrieve AI form context
 */
async function getOrCreateAIContext(
  userId: number, 
  sessionId: string, 
  currentPhase: string,
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
      // Update with current data
      const context = existingContext[0];
      return {
        ...context,
        inferredData: { 
          ...(context.inferredData && typeof context.inferredData === 'object' ? context.inferredData : {}), 
          ...currentData 
        },
        currentPhase,
        updatedAt: new Date()
      };
    }

    // Create new context
    const [newContext] = await db
      .insert(aiFormContexts)
      .values({
        userId,
        sessionId,
        currentPhase,
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
      })
      .returning();

    return newContext;
    
  } catch (error) {
    console.error('AI Context creation failed:', error);
    
    // Return minimal context for fallback
    return {
      id: `fallback-${Date.now()}`,
      userId,
      sessionId,
      currentPhase,
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
        overallConfidence: 0.5 
      },
      detectedConflicts: [],
      needsManualIntervention: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}