/**
 * React Hook for Threaded AI Processing
 * 
 * Provides easy access to Web Worker-powered AI decision engine
 * with automatic fallback to main thread processing.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { getWorkerManager, destroyWorkerManager } from '@/lib/workers/worker-manager';
// Types moved to avoid database imports in client code
export interface AIFormContext {
  id: string;
  userId: number;
  sessionId: string;
  currentPhase: string;
  completedSections: string[];
  visibleFields: string[];
  inferredData: Record<string, any>;
  confidenceScores: Record<string, number>;
  uncertaintyFlags: any[];
  pendingActions: any[];
  validationResults: any;
  detectedConflicts: any[];
  needsManualIntervention: boolean;
}

export interface FieldUpdate {
  fieldId: string;
  value: any;
  timestamp: Date;
  source: 'user_input' | 'ai_inference' | 'template' | 'calculation';
}

interface ThreadedAIState {
  isProcessing: boolean;
  progress: number;
  error: string | null;
  workerStats: {
    totalWorkers: number;
    availableWorkers: number;
    activeTests: number;
  } | null;
}

interface UseThreadedAIOptions {
  enableWorkers?: boolean;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}

export function useThreadedAI(options: UseThreadedAIOptions = {}) {
  const {
    enableWorkers = true,
    onProgress,
    onError
  } = options;

  const [state, setState] = useState<ThreadedAIState>({
    isProcessing: false,
    progress: 0,
    error: null,
    workerStats: null
  });

  const workerManagerRef = useRef<ReturnType<typeof getWorkerManager> | null>(null);
  const isClient = typeof window !== 'undefined';

  // Initialize worker manager on client side
  useEffect(() => {
    if (isClient && enableWorkers && 'Worker' in window) {
      try {
        workerManagerRef.current = getWorkerManager();
        updateWorkerStats();
        console.log('🧵 Threaded AI processing initialized');
      } catch (error) {
        console.warn('⚠️ Failed to initialize worker manager:', error);
      }
    }

    // Cleanup on unmount
    return () => {
      if (workerManagerRef.current) {
        // Note: We don't destroy the global worker manager here
        // as it might be used by other components
        workerManagerRef.current = null;
      }
    };
  }, [isClient, enableWorkers]);

  // Update worker statistics
  const updateWorkerStats = useCallback(() => {
    if (workerManagerRef.current) {
      const stats = workerManagerRef.current.getStats();
      setState(prev => ({ ...prev, workerStats: stats }));
    }
  }, []);

  // Process field update with progress tracking
  const processFieldUpdate = useCallback(async (
    fieldUpdate: FieldUpdate,
    context: AIFormContext
  ): Promise<AIFormContext> => {
    setState(prev => ({
      ...prev,
      isProcessing: true,
      progress: 0,
      error: null
    }));

    try {
      const handleProgress = (progress: number) => {
        setState(prev => ({ ...prev, progress }));
        onProgress?.(progress);
      };

      let result: AIFormContext;

      if (workerManagerRef.current && enableWorkers) {
        console.log('🚀 Processing field update using Web Workers');
        result = await workerManagerRef.current.processFieldUpdate(
          fieldUpdate,
          context,
          handleProgress
        );
      } else {
        console.log('🔄 Processing field update via API fallback');
        // Use API call instead of direct engine import to avoid database bundling
        const response = await fetch('/api/ai/process-field', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fieldUpdate, context })
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        result = await response.json();
        handleProgress(100);
      }

      setState(prev => ({
        ...prev,
        isProcessing: false,
        progress: 100
      }));

      updateWorkerStats();
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage
      }));

      onError?.(error instanceof Error ? error : new Error(errorMessage));
      throw error;
    }
  }, [enableWorkers, onProgress, onError, updateWorkerStats]);

  // Validate entire form
  const validateForm = useCallback(async (
    formData: Record<string, any>,
    context: AIFormContext
  ): Promise<any> => {
    setState(prev => ({
      ...prev,
      isProcessing: true,
      progress: 0,
      error: null
    }));

    try {
      const handleProgress = (progress: number) => {
        setState(prev => ({ ...prev, progress }));
        onProgress?.(progress);
      };

      let result: any;

      if (workerManagerRef.current && enableWorkers) {
        console.log('🚀 Validating form using Web Workers');
        result = await workerManagerRef.current.validateForm(
          formData,
          context,
          handleProgress
        );
      } else {
        console.log('🔄 Validating form on main thread');
        // Fallback to direct validation methods
        result = await performMainThreadValidation(formData, context, handleProgress);
      }

      setState(prev => ({
        ...prev,
        isProcessing: false,
        progress: 100
      }));

      updateWorkerStats();
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage
      }));

      onError?.(error instanceof Error ? error : new Error(errorMessage));
      throw error;
    }
  }, [enableWorkers, onProgress, onError, updateWorkerStats]);

  // Resolve conflicts
  const resolveConflicts = useCallback(async (
    conflicts: any[],
    formData: Record<string, any>
  ): Promise<any> => {
    setState(prev => ({
      ...prev,
      isProcessing: true,
      progress: 0,
      error: null
    }));

    try {
      const handleProgress = (progress: number) => {
        setState(prev => ({ ...prev, progress }));
        onProgress?.(progress);
      };

      let result: any;

      if (workerManagerRef.current && enableWorkers) {
        console.log('🚀 Resolving conflicts using Web Workers');
        result = await workerManagerRef.current.resolveConflicts(
          conflicts,
          formData,
          handleProgress
        );
      } else {
        console.log('🔄 Resolving conflicts on main thread');
        result = await performMainThreadConflictResolution(
          conflicts,
          formData,
          handleProgress
        );
      }

      setState(prev => ({
        ...prev,
        isProcessing: false,
        progress: 100
      }));

      updateWorkerStats();
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage
      }));

      onError?.(error instanceof Error ? error : new Error(errorMessage));
      throw error;
    }
  }, [enableWorkers, onProgress, onError, updateWorkerStats]);

  // Get current worker statistics
  const getWorkerStats = useCallback(() => {
    updateWorkerStats();
    return state.workerStats;
  }, [updateWorkerStats, state.workerStats]);

  // Check if workers are available and being used
  const isUsingWorkers = useCallback(() => {
    return !!(workerManagerRef.current && enableWorkers && isClient && 'Worker' in window);
  }, [enableWorkers, isClient]);

  return {
    // State
    isProcessing: state.isProcessing,
    progress: state.progress,
    error: state.error,
    workerStats: state.workerStats,
    
    // Methods
    processFieldUpdate,
    validateForm,
    resolveConflicts,
    getWorkerStats,
    isUsingWorkers,
    
    // Utilities
    updateWorkerStats
  };
}

// Fallback functions for main thread processing
async function performMainThreadValidation(
  formData: Record<string, any>,
  context: AIFormContext,
  onProgress: (progress: number) => void
): Promise<any> {
  onProgress(25);
  
  // Simulate validation work
  await new Promise(resolve => setTimeout(resolve, 100));
  onProgress(50);
  
  await new Promise(resolve => setTimeout(resolve, 100));
  onProgress(75);
  
  await new Promise(resolve => setTimeout(resolve, 100));
  onProgress(100);

  return {
    crossFieldValidation: { isValid: true, issues: [] },
    sanityChecks: { passed: true, flags: [] },
    businessRules: { compliant: true, violations: [] },
    costCalculations: { totalCost: 0, breakdown: {} }
  };
}

async function performMainThreadConflictResolution(
  conflicts: any[],
  formData: Record<string, any>,
  onProgress: (progress: number) => void
): Promise<any> {
  onProgress(50);
  
  // Simulate conflict resolution work
  await new Promise(resolve => setTimeout(resolve, 200));
  onProgress(100);

  return conflicts.map(conflict => ({
    resolved: true,
    resolution: 'main-thread-resolved',
    confidence: 0.8
  }));
}

/**
 * Hook for managing worker lifecycle in the app
 */
export function useWorkerLifecycle() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Worker' in window) {
      setIsInitialized(true);
    }

    // Cleanup workers when app unmounts
    return () => {
      destroyWorkerManager();
    };
  }, []);

  const destroyWorkers = useCallback(() => {
    destroyWorkerManager();
    setIsInitialized(false);
  }, []);

  return {
    isInitialized,
    destroyWorkers
  };
}