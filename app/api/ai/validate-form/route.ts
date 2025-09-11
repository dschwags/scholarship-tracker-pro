/**
 * AI Form Validation API Endpoint
 * 
 * Runs comprehensive validation on form data using the AI Decision Engine
 * and returns detailed validation results with suggestions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { aiDecisionEngine } from '@/lib/ai/decision-engine';
import { z } from 'zod';

// Request validation schema
const ValidateFormSchema = z.object({
  formData: z.record(z.any()).default({}),
  currentPhase: z.string().default('goal_creation'),
  validateAll: z.boolean().default(true),
  specificFields: z.array(z.string()).optional()
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
    const validationResult = ValidateFormSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          issues: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { formData, currentPhase, validateAll, specificFields } = validationResult.data;
    const sessionId = request.headers.get('x-session-id') || `session-${Date.now()}`;

    console.log(`🔍 AI Form validation requested for phase: ${currentPhase}`);

    // Get AI context
    const aiContext = await getAIContext(session.user.id, sessionId, currentPhase, formData);

    // Create a validation field update to trigger comprehensive validation
    const validationUpdate = {
      fieldId: 'form_validation_request',
      value: { validateAll, specificFields, formData },
      timestamp: new Date(),
      source: 'user_input' as const
    };

    // Process through AI engine for comprehensive validation
    const updatedContext = await aiDecisionEngine.processFieldUpdate(
      validationUpdate,
      aiContext
    );

    // Return just the validation results
    const response = {
      errors: updatedContext.validationResults.errors,
      warnings: updatedContext.validationResults.warnings,
      suggestions: updatedContext.validationResults.suggestions,
      overallConfidence: updatedContext.validationResults.overallConfidence,
      conflicts: updatedContext.detectedConflicts,
      needsManualIntervention: updatedContext.needsManualIntervention,
      uncertaintyFlags: updatedContext.uncertaintyFlags.filter(flag => 
        !specificFields || specificFields.includes(flag.fieldId)
      )
    };

    console.log(`✅ Validation complete. Confidence: ${response.overallConfidence}, Errors: ${response.errors.length}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('🚨 AI form validation error:', error);
    
    // Return graceful fallback
    return NextResponse.json({
      errors: [],
      warnings: [{
        ruleId: 'validation_service_error',
        fieldId: 'system',
        message: 'Validation service temporarily unavailable. Please review your data manually.',
        severity: 'warning',
        confidence: 0.5
      }],
      suggestions: [{
        ruleId: 'manual_review',
        fieldId: 'form',
        message: 'Consider saving your progress and trying again later.',
        severity: 'info',
        confidence: 0.5
      }],
      overallConfidence: 0.5,
      conflicts: [],
      needsManualIntervention: true,
      uncertaintyFlags: []
    });
  }
}

/**
 * Get AI context for validation
 */
async function getAIContext(
  userId: number, 
  sessionId: string, 
  currentPhase: string,
  formData: Record<string, any>
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
        inferredData: { ...existingContext[0].inferredData, ...formData },
        currentPhase
      };
    }

    // Return minimal context if none exists
    return {
      id: `validation-${Date.now()}`,
      userId,
      sessionId,
      currentPhase,
      completedSections: [],
      visibleFields: Object.keys(formData),
      inferredData: formData,
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
    
    // Return minimal fallback context
    return {
      id: `fallback-validation-${Date.now()}`,
      userId,
      sessionId,
      currentPhase,
      completedSections: [],
      visibleFields: Object.keys(formData),
      inferredData: formData,
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