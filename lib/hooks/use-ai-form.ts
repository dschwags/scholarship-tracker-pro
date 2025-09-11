/**
 * AI-Assisted Form Hook
 * 
 * Integrates with the BugX AI Decision Engine to provide intelligent form assistance,
 * progressive disclosure, real-time validation, and decision tree navigation.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Simple debounce implementation
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  debounced.cancel = () => clearTimeout(timeout);
  return debounced as any;
}

// Types matching the AI Decision Engine
export interface AIFormState {
  currentPhase: string;
  completedSections: string[];
  visibleFields: string[];
  inferredData: Record<string, any>;
  confidenceScores: Record<string, number>;
  uncertaintyFlags: UncertaintyFlag[];
  pendingActions: OutcomeAction[];
  validationResults: ValidationResults;
  detectedConflicts: DataConflict[];
  needsManualIntervention: boolean;
  isProcessing: boolean;
  sessionId: string;
}

export interface UncertaintyFlag {
  fieldId: string;
  reason: string;
  suggestedClarification: string;
  confidence: number;
}

export interface OutcomeAction {
  type: 'show_field' | 'hide_field' | 'calculate' | 'validate' | 'warn' | 'error';
  target: string;
  parameters: Record<string, any>;
  confidence: number;
}

export interface ValidationResults {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  suggestions: ValidationIssue[];
  overallConfidence: number;
}

export interface ValidationIssue {
  ruleId: string;
  fieldId: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  aiResolution?: string;
  confidence: number;
}

export interface DataConflict {
  conflictId: string;
  description: string;
  conflictingFields: string[];
  suggestedResolution: string;
  confidence: number;
}

export interface UseAIFormOptions {
  initialPhase: string;
  sessionId?: string;
  debounceMs?: number;
  confidenceThreshold?: number;
  enableRealTimeValidation?: boolean;
  enableProgressiveDisclosure?: boolean;
}

export interface UseAIFormReturn {
  // State
  aiState: AIFormState;
  isFieldVisible: (fieldId: string) => boolean;
  getFieldConfidence: (fieldId: string) => number;
  
  // Actions
  updateField: (fieldId: string, value: any, source?: 'user_input' | 'ai_inference' | 'template' | 'calculation') => void;
  processFieldUpdate: (fieldId: string, value: any) => Promise<void>;
  completeSection: (sectionId: string) => void;
  moveToPhase: (phase: string) => void;
  
  // Validation
  validateForm: () => Promise<ValidationResults>;
  resolveConflict: (conflictId: string, resolution: any) => Promise<void>;
  
  // AI Assistance
  getFieldSuggestions: (fieldId: string) => string[];
  getUncertaintyHelp: (fieldId: string) => UncertaintyFlag | undefined;
  requestManualIntervention: (reason: string) => void;
  
  // Progressive Disclosure
  getNextRecommendedFields: () => string[];
  shouldShowField: (fieldId: string, formData: any) => boolean;
}

/**
 * Custom hook for AI-assisted forms
 */
export function useAIForm(
  initialFormData: Record<string, any> = {},
  options: UseAIFormOptions = {}
): UseAIFormReturn {
  const {
    initialPhase = 'goal_creation',
    sessionId = generateSessionId(),
    debounceMs = 500,
    confidenceThreshold = 0.7,
    enableRealTimeValidation = true,
    enableProgressiveDisclosure = true
  } = options;

  // State
  const [aiState, setAIState] = useState<AIFormState>({
    currentPhase: initialPhase,
    completedSections: [],
    visibleFields: Object.keys(initialFormData),
    inferredData: initialFormData,
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
    isProcessing: false,
    sessionId
  });

  // Refs for debouncing
  const debouncedProcessRef = useRef<any>();
  const processingQueueRef = useRef<Array<{ fieldId: string; value: any }>>([]);

  // Initialize debounced processor
  useEffect(() => {
    debouncedProcessRef.current = debounce(async () => {
      if (processingQueueRef.current.length === 0) return;
      
      const updates = [...processingQueueRef.current];
      processingQueueRef.current = [];
      
      setAIState(prev => ({ ...prev, isProcessing: true }));
      
      try {
        // Process all pending updates
        for (const update of updates) {
          await processFieldUpdateInternal(update.fieldId, update.value);
        }
      } finally {
        setAIState(prev => ({ ...prev, isProcessing: false }));
      }
    }, debounceMs);

    return () => {
      if (debouncedProcessRef.current) {
        debouncedProcessRef.current.cancel();
      }
    };
  }, [debounceMs]);

  // Internal field processing
  const processFieldUpdateInternal = async (fieldId: string, value: any) => {
    try {
      const response = await fetch('/api/ai/process-field', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId
        },
        body: JSON.stringify({
          fieldId,
          value,
          currentData: aiState.inferredData,
          currentPhase: aiState.currentPhase,
          source: 'user_input'
        })
      });

      if (!response.ok) {
        throw new Error(`AI processing failed: ${response.statusText}`);
      }

      const aiResponse = await response.json();
      
      setAIState(prev => ({
        ...prev,
        ...aiResponse,
        inferredData: { ...prev.inferredData, [fieldId]: value }
      }));

    } catch (error) {
      console.error('AI field processing error:', error);
      
      // Fallback: update field without AI assistance
      setAIState(prev => ({
        ...prev,
        inferredData: { ...prev.inferredData, [fieldId]: value },
        validationResults: {
          ...prev.validationResults,
          warnings: [...prev.validationResults.warnings, {
            ruleId: 'ai_processing_failed',
            fieldId,
            message: 'AI assistance temporarily unavailable for this field',
            severity: 'warning' as const,
            confidence: 0.5
          }]
        }
      }));
    }
  };

  // Public API
  const updateField = useCallback((
    fieldId: string, 
    value: any, 
    source: 'user_input' | 'ai_inference' | 'template' | 'calculation' = 'user_input'
  ) => {
    // Immediate local update
    setAIState(prev => ({
      ...prev,
      inferredData: { ...prev.inferredData, [fieldId]: value }
    }));

    // Queue for AI processing if enabled
    if (enableRealTimeValidation && source === 'user_input') {
      processingQueueRef.current.push({ fieldId, value });
      if (debouncedProcessRef.current) {
        debouncedProcessRef.current();
      }
    }
  }, [enableRealTimeValidation]);

  const processFieldUpdate = useCallback(async (fieldId: string, value: any) => {
    await processFieldUpdateInternal(fieldId, value);
  }, [aiState.inferredData, aiState.currentPhase, sessionId]);

  const isFieldVisible = useCallback((fieldId: string): boolean => {
    if (!enableProgressiveDisclosure) return true;
    return aiState.visibleFields.includes(fieldId);
  }, [aiState.visibleFields, enableProgressiveDisclosure]);

  const getFieldConfidence = useCallback((fieldId: string): number => {
    return aiState.confidenceScores[fieldId] || 1.0;
  }, [aiState.confidenceScores]);

  const completeSection = useCallback((sectionId: string) => {
    setAIState(prev => ({
      ...prev,
      completedSections: [...prev.completedSections, sectionId]
    }));
  }, []);

  const moveToPhase = useCallback((phase: string) => {
    setAIState(prev => ({
      ...prev,
      currentPhase: phase
    }));
  }, []);

  const validateForm = useCallback(async (): Promise<ValidationResults> => {
    try {
      const response = await fetch('/api/ai/validate-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId
        },
        body: JSON.stringify({
          formData: aiState.inferredData,
          currentPhase: aiState.currentPhase
        })
      });

      const validation = await response.json();
      
      setAIState(prev => ({
        ...prev,
        validationResults: validation
      }));

      return validation;
    } catch (error) {
      console.error('Form validation error:', error);
      const fallbackValidation: ValidationResults = {
        errors: [],
        warnings: [{ 
          ruleId: 'validation_failed', 
          fieldId: 'form', 
          message: 'Validation service temporarily unavailable', 
          severity: 'warning',
          confidence: 0.5 
        }],
        suggestions: [],
        overallConfidence: 0.5
      };
      
      setAIState(prev => ({
        ...prev,
        validationResults: fallbackValidation
      }));

      return fallbackValidation;
    }
  }, [aiState.inferredData, aiState.currentPhase, sessionId]);

  const resolveConflict = useCallback(async (conflictId: string, resolution: any) => {
    try {
      await fetch('/api/ai/resolve-conflict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId
        },
        body: JSON.stringify({
          conflictId,
          resolution,
          currentData: aiState.inferredData
        })
      });

      setAIState(prev => ({
        ...prev,
        detectedConflicts: prev.detectedConflicts.filter(c => c.conflictId !== conflictId)
      }));
    } catch (error) {
      console.error('Conflict resolution error:', error);
    }
  }, [aiState.inferredData, sessionId]);

  const getFieldSuggestions = useCallback((fieldId: string): string[] => {
    return aiState.validationResults.suggestions
      .filter(s => s.fieldId === fieldId)
      .map(s => s.message);
  }, [aiState.validationResults.suggestions]);

  const getUncertaintyHelp = useCallback((fieldId: string): UncertaintyFlag | undefined => {
    return aiState.uncertaintyFlags.find(flag => flag.fieldId === fieldId);
  }, [aiState.uncertaintyFlags]);

  const requestManualIntervention = useCallback((reason: string) => {
    setAIState(prev => ({
      ...prev,
      needsManualIntervention: true,
      uncertaintyFlags: [...prev.uncertaintyFlags, {
        fieldId: 'manual_intervention',
        reason,
        suggestedClarification: 'Please review this form manually',
        confidence: 0.0
      }]
    }));
  }, []);

  const getNextRecommendedFields = useCallback((): string[] => {
    return aiState.pendingActions
      .filter(action => action.type === 'show_field')
      .map(action => action.target);
  }, [aiState.pendingActions]);

  const shouldShowField = useCallback((fieldId: string, formData: any): boolean => {
    if (!enableProgressiveDisclosure) return true;
    
    // Check if field is in visible fields
    if (aiState.visibleFields.includes(fieldId)) return true;
    
    // Check pending actions
    const showAction = aiState.pendingActions.find(
      action => action.type === 'show_field' && action.target === fieldId
    );
    
    return !!showAction;
  }, [aiState.visibleFields, aiState.pendingActions, enableProgressiveDisclosure]);

  return {
    // State
    aiState,
    isFieldVisible,
    getFieldConfidence,
    
    // Actions
    updateField,
    processFieldUpdate,
    completeSection,
    moveToPhase,
    
    // Validation
    validateForm,
    resolveConflict,
    
    // AI Assistance
    getFieldSuggestions,
    getUncertaintyHelp,
    requestManualIntervention,
    
    // Progressive Disclosure
    getNextRecommendedFields,
    shouldShowField
  };
}

// Helper function to generate session IDs
function generateSessionId(): string {
  return `ai-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}