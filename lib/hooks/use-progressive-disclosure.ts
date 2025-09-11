/**
 * Progressive Disclosure Hook
 * 
 * Integrates the Progressive Disclosure Engine with React forms,
 * providing intelligent field visibility management and user guidance.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  progressiveDisclosureEngine, 
  DisclosureContext, 
  FieldDisclosureState 
} from '@/lib/progressive-disclosure/disclosure-engine';

export interface UseProgressiveDisclosureOptions {
  userExpertiseLevel?: 'beginner' | 'intermediate' | 'advanced';
  enableAdaptiveOrdering?: boolean;
  enableRecommendations?: boolean;
  confidenceThreshold?: number;
}

export interface UseProgressiveDisclosureReturn {
  // Field State Management
  getFieldState: (fieldId: string) => FieldDisclosureState;
  isFieldVisible: (fieldId: string) => boolean;
  isFieldRequired: (fieldId: string) => boolean;
  isFieldHighlighted: (fieldId: string) => boolean;
  shouldShowHelp: (fieldId: string) => boolean;
  
  // Field Ordering and Recommendations
  getRecommendedNextFields: () => Array<{
    fieldId: string;
    reason: string;
    confidence: number;
    suggestedOrder: number;
  }>;
  getFieldOrder: (fieldId: string) => number;
  
  // Context Management
  updateContext: (updates: Partial<DisclosureContext>) => void;
  markFieldCompleted: (fieldId: string) => void;
  updateConfidenceScore: (fieldId: string, confidence: number) => void;
  
  // State Information
  disclosureContext: DisclosureContext;
  visibleFieldsCount: number;
  completionRate: number;
  overallConfidence: number;
}

export function useProgressiveDisclosure(
  initialFormData: Record<string, any> = {},
  options: UseProgressiveDisclosureOptions = {}
): UseProgressiveDisclosureReturn {
  
  const {
    userExpertiseLevel = 'intermediate',
    enableAdaptiveOrdering = true,
    enableRecommendations = true,
    confidenceThreshold = 0.6
  } = options;

  // Disclosure context state
  const [disclosureContext, setDisclosureContext] = useState<DisclosureContext>({
    formData: initialFormData,
    completedFields: [],
    confidenceScores: {},
    userExpertiseLevel,
    currentPhase: 'basic_info',
    validationResults: { errors: [], warnings: [], suggestions: [] },
    uncertaintyFlags: []
  });

  // Memoized field states for performance
  const fieldStates = useMemo(() => {
    const states: Record<string, FieldDisclosureState> = {};
    
    // Standard form fields that might be evaluated
    const allPossibleFields = [
      'title', 'description', 'targetAmount', 'currentAmount', 'deadline',
      'monthlyContribution', 'expenseBreakdown', 'fundingSourcesSection',
      'clarificationFields', 'advancedCalculations', 'riskAssessment',
      'emergencyFund', 'investmentOptions', 'taxImplications'
    ];

    allPossibleFields.forEach(fieldId => {
      states[fieldId] = progressiveDisclosureEngine.calculateFieldVisibility(
        fieldId, 
        disclosureContext
      );
    });

    return states;
  }, [disclosureContext]);

  // Calculate derived metrics
  const visibleFieldsCount = useMemo(() => {
    return Object.values(fieldStates).filter(state => state.isVisible).length;
  }, [fieldStates]);

  const completionRate = useMemo(() => {
    const visibleFields = Object.entries(fieldStates)
      .filter(([_, state]) => state.isVisible)
      .map(([fieldId, _]) => fieldId);
    
    const completedVisibleFields = disclosureContext.completedFields
      .filter(fieldId => visibleFields.includes(fieldId));
    
    return visibleFields.length > 0 
      ? completedVisibleFields.length / visibleFields.length 
      : 0;
  }, [fieldStates, disclosureContext.completedFields]);

  const overallConfidence = useMemo(() => {
    const scores = Object.values(disclosureContext.confidenceScores);
    return scores.length > 0 
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
      : 1.0;
  }, [disclosureContext.confidenceScores]);

  // Update context when form data changes
  useEffect(() => {
    setDisclosureContext(prev => ({
      ...prev,
      formData: initialFormData
    }));
  }, [initialFormData]);

  // Field state accessors
  const getFieldState = useCallback((fieldId: string): FieldDisclosureState => {
    return fieldStates[fieldId] || {
      isVisible: false,
      isRequired: false,
      isHighlighted: false,
      showHelpText: false,
      reason: 'Field not found',
      confidence: 0,
      suggestedOrder: 999
    };
  }, [fieldStates]);

  const isFieldVisible = useCallback((fieldId: string): boolean => {
    return getFieldState(fieldId).isVisible;
  }, [getFieldState]);

  const isFieldRequired = useCallback((fieldId: string): boolean => {
    return getFieldState(fieldId).isRequired;
  }, [getFieldState]);

  const isFieldHighlighted = useCallback((fieldId: string): boolean => {
    return getFieldState(fieldId).isHighlighted;
  }, [getFieldState]);

  const shouldShowHelp = useCallback((fieldId: string): boolean => {
    return getFieldState(fieldId).showHelpText;
  }, [getFieldState]);

  // Recommendations and ordering
  const getRecommendedNextFields = useCallback(() => {
    if (!enableRecommendations) return [];
    
    return progressiveDisclosureEngine.getRecommendedNextFields(disclosureContext);
  }, [disclosureContext, enableRecommendations]);

  const getFieldOrder = useCallback((fieldId: string): number => {
    if (!enableAdaptiveOrdering) return 0;
    
    return getFieldState(fieldId).suggestedOrder;
  }, [getFieldState, enableAdaptiveOrdering]);

  // Context management functions
  const updateContext = useCallback((updates: Partial<DisclosureContext>) => {
    setDisclosureContext(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  const markFieldCompleted = useCallback((fieldId: string) => {
    setDisclosureContext(prev => ({
      ...prev,
      completedFields: [...new Set([...prev.completedFields, fieldId])]
    }));
  }, []);

  const updateConfidenceScore = useCallback((fieldId: string, confidence: number) => {
    setDisclosureContext(prev => ({
      ...prev,
      confidenceScores: {
        ...prev.confidenceScores,
        [fieldId]: Math.max(0, Math.min(1, confidence)) // Clamp between 0 and 1
      }
    }));
  }, []);

  // Auto-update completion based on form data changes
  useEffect(() => {
    const newCompletedFields: string[] = [];
    
    Object.entries(disclosureContext.formData).forEach(([fieldId, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newCompletedFields.push(fieldId);
      }
    });

    // Only update if there are actual changes
    const currentCompleted = new Set(disclosureContext.completedFields);
    const newCompleted = new Set(newCompletedFields);
    
    const hasChanges = newCompleted.size !== currentCompleted.size ||
      [...newCompleted].some(field => !currentCompleted.has(field));

    if (hasChanges) {
      setDisclosureContext(prev => ({
        ...prev,
        completedFields: newCompletedFields
      }));
    }
  }, [disclosureContext.formData]);

  // Auto-advance phases based on completion rate
  useEffect(() => {
    const phaseTransitions = {
      'basic_info': { threshold: 0.5, next: 'financial_details' },
      'financial_details': { threshold: 0.7, next: 'advanced_planning' },
      'advanced_planning': { threshold: 0.9, next: 'review_complete' }
    };

    const currentTransition = phaseTransitions[disclosureContext.currentPhase as keyof typeof phaseTransitions];
    
    if (currentTransition && completionRate >= currentTransition.threshold) {
      setDisclosureContext(prev => ({
        ...prev,
        currentPhase: currentTransition.next
      }));
    }
  }, [completionRate, disclosureContext.currentPhase]);

  return {
    // Field State Management
    getFieldState,
    isFieldVisible,
    isFieldRequired,
    isFieldHighlighted,
    shouldShowHelp,
    
    // Field Ordering and Recommendations
    getRecommendedNextFields,
    getFieldOrder,
    
    // Context Management
    updateContext,
    markFieldCompleted,
    updateConfidenceScore,
    
    // State Information
    disclosureContext,
    visibleFieldsCount,
    completionRate,
    overallConfidence
  };
}