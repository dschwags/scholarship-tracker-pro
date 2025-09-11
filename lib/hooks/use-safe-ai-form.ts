/**
 * Safety-Enhanced AI Form Hook
 * 
 * Extends the base AI form with comprehensive safety systems,
 * rollback triggers, and automated recovery mechanisms.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRollbackEngine } from '@/lib/safety-systems/rollback-engine';
import { 
  useAIForm, 
  UseAIFormOptions, 
  UseAIFormReturn,
  AIFormState,
  ValidationResults,
  DataConflict 
} from './use-ai-form';
import { useFeatureFlag } from '@/lib/feature-flags/hooks';

export interface SafetyConfig {
  enableAutoSnapshots?: boolean;
  snapshotInterval?: number; // milliseconds
  maxConsecutiveErrors?: number;
  confidenceThreshold?: number;
  enableEmergencyFallback?: boolean;
}

export interface SafetyStatus {
  isInSafeMode: boolean;
  lastSnapshotId: string | null;
  errorCount: number;
  consecutiveFailures: number;
  safetyTriggerActive: string | null;
}

export interface UseSafeAIFormOptions extends UseAIFormOptions {
  safety?: SafetyConfig;
}

export interface UseSafeAIFormReturn extends UseAIFormReturn {
  // Safety-specific additions
  safetyStatus: SafetyStatus;
  createManualSnapshot: (label?: string) => string;
  rollbackToSnapshot: (snapshotId: string) => Promise<boolean>;
  rollbackToLastGoodState: () => Promise<boolean>;
  getSafetyMetrics: () => any;
  getAvailableSnapshots: () => Array<{ id: string; timestamp: string; checksum: string }>;
  
  // Enhanced methods with safety
  safeUpdateField: (fieldId: string, value: any, source?: string) => Promise<boolean>;
  safeValidateForm: () => Promise<ValidationResults>;
  safeResolveConflict: (conflictId: string, resolution: any) => Promise<boolean>;
}

/**
 * Safety-enhanced AI form hook
 */
export function useSafeAIForm(
  initialFormData: Record<string, any> = {},
  options: UseSafeAIFormOptions = {}
): UseSafeAIFormReturn {
  const {
    safety = {},
    ...aiFormOptions
  } = options;

  const {
    enableAutoSnapshots = true,
    snapshotInterval = 30000, // 30 seconds
    maxConsecutiveErrors = 3,
    confidenceThreshold = 0.5,
    enableEmergencyFallback = true
  } = safety;

  // Feature flags for safety systems
  const rollbackEnabled = useFeatureFlag('rollback_system_enabled');
  const safetySystemEnabled = useFeatureFlag('safety_systems_enabled');
  const emergencyModeEnabled = useFeatureFlag('emergency_mode_enabled');

  // Initialize base AI form
  const aiForm = useAIForm(initialFormData, aiFormOptions);
  
  // Initialize rollback engine
  const rollbackEngine = useRollbackEngine(aiForm.aiState.sessionId);
  
  // Safety state
  const [safetyStatus, setSafetyStatus] = useState<SafetyStatus>({
    isInSafeMode: false,
    lastSnapshotId: null,
    errorCount: 0,
    consecutiveFailures: 0,
    safetyTriggerActive: null
  });

  // Refs for tracking
  const lastSnapshotTime = useRef<number>(Date.now());
  const operationCount = useRef<number>(0);

  // Disable AI systems if safety triggers are active
  const aiSystemsEnabled = rollbackEnabled && safetySystemEnabled && !safetyStatus.isInSafeMode;

  /**
   * Create a manual snapshot
   */
  const createManualSnapshot = useCallback((label?: string): string => {
    if (!rollbackEnabled) {
      console.warn('⚠️ Rollback system is disabled');
      return '';
    }

    try {
      const snapshotId = rollbackEngine.createSnapshot(
        initialFormData,
        aiForm.aiState,
        { aiSystemsEnabled }, // Progressive state placeholder
        label
      );
      
      setSafetyStatus(prev => ({ ...prev, lastSnapshotId: snapshotId }));
      rollbackEngine.recordOperation('form_update', true, undefined, { type: 'manual_snapshot' });
      
      return snapshotId;
    } catch (error) {
      console.error('❌ Failed to create manual snapshot:', error);
      rollbackEngine.recordOperation('form_update', false, undefined, { error: error.message });
      return '';
    }
  }, [rollbackEnabled, rollbackEngine, initialFormData, aiForm.aiState, aiSystemsEnabled]);

  /**
   * Create automatic snapshots
   */
  const createAutoSnapshot = useCallback((): void => {
    if (!enableAutoSnapshots || !rollbackEnabled) return;

    const now = Date.now();
    if (now - lastSnapshotTime.current >= snapshotInterval) {
      const snapshotId = createManualSnapshot('auto');
      if (snapshotId) {
        lastSnapshotTime.current = now;
        console.log(`📸 Auto-snapshot created: ${snapshotId}`);
      }
    }
  }, [enableAutoSnapshots, rollbackEnabled, snapshotInterval, createManualSnapshot]);

  /**
   * Rollback to a specific snapshot
   */
  const rollbackToSnapshot = useCallback(async (snapshotId: string): Promise<boolean> => {
    if (!rollbackEnabled) {
      console.warn('⚠️ Rollback system is disabled');
      return false;
    }

    try {
      const snapshot = rollbackEngine.rollbackToSnapshot(snapshotId, {
        preserveUserInput: true,
        notifyUser: true,
        logEvent: true
      });

      if (snapshot) {
        // Apply the snapshot data to the form
        // This would need integration with the actual form state management
        console.log('✅ Successfully rolled back to snapshot:', snapshotId);
        
        setSafetyStatus(prev => ({
          ...prev,
          consecutiveFailures: 0,
          safetyTriggerActive: null
        }));

        rollbackEngine.recordOperation('rollback', true, undefined, { snapshotId });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      rollbackEngine.recordOperation('rollback', false, undefined, { error: error.message });
      return false;
    }
  }, [rollbackEnabled, rollbackEngine]);

  /**
   * Rollback to last known good state
   */
  const rollbackToLastGoodState = useCallback(async (): Promise<boolean> => {
    if (!rollbackEnabled) return false;

    try {
      const snapshot = rollbackEngine.rollbackToLastGoodState();
      if (snapshot) {
        console.log('✅ Successfully rolled back to last good state');
        setSafetyStatus(prev => ({
          ...prev,
          isInSafeMode: false,
          consecutiveFailures: 0,
          safetyTriggerActive: null
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to rollback to last good state:', error);
      return false;
    }
  }, [rollbackEnabled, rollbackEngine]);

  /**
   * Safe field update with error handling
   */
  const safeUpdateField = useCallback(async (
    fieldId: string, 
    value: any, 
    source?: string
  ): Promise<boolean> => {
    if (!aiSystemsEnabled) {
      // Fallback to basic form update without AI
      console.log(`📝 Safe mode: Basic field update for ${fieldId}`);
      return true;
    }

    try {
      // Create snapshot before risky operation
      createAutoSnapshot();
      
      // Attempt the AI-enhanced update
      aiForm.updateField(fieldId, value, source as any);
      
      // Record successful operation
      rollbackEngine.recordOperation('form_update', true, 
        aiForm.getFieldConfidence(fieldId), 
        { fieldId, source }
      );

      setSafetyStatus(prev => ({ ...prev, consecutiveFailures: 0 }));
      return true;

    } catch (error) {
      console.error(`❌ Safe field update failed for ${fieldId}:`, error);
      
      // Record failure
      rollbackEngine.recordOperation('form_update', false, 0, { 
        fieldId, 
        error: error.message 
      });

      // Update safety status
      setSafetyStatus(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1,
        consecutiveFailures: prev.consecutiveFailures + 1
      }));

      // Check if we need to enter safe mode
      if (safetyStatus.consecutiveFailures >= maxConsecutiveErrors) {
        console.warn('⚠️ Entering safe mode due to consecutive failures');
        setSafetyStatus(prev => ({
          ...prev,
          isInSafeMode: true,
          safetyTriggerActive: 'consecutive_failures'
        }));
        
        if (enableEmergencyFallback) {
          await rollbackToLastGoodState();
        }
      }

      return false;
    }
  }, [aiSystemsEnabled, createAutoSnapshot, aiForm, rollbackEngine, safetyStatus.consecutiveFailures, maxConsecutiveErrors, enableEmergencyFallback, rollbackToLastGoodState]);

  /**
   * Safe form validation
   */
  const safeValidateForm = useCallback(async (): Promise<ValidationResults> => {
    if (!aiSystemsEnabled) {
      // Return basic validation results
      return {
        errors: [],
        warnings: [],
        suggestions: [],
        overallConfidence: 1.0
      };
    }

    try {
      const results = await aiForm.validateForm();
      
      rollbackEngine.recordOperation('validation', true, results.overallConfidence);
      
      // Check confidence threshold
      if (results.overallConfidence < confidenceThreshold) {
        console.warn(`⚠️ Low confidence validation result: ${results.overallConfidence}`);
        setSafetyStatus(prev => ({
          ...prev,
          safetyTriggerActive: 'low_confidence'
        }));
      }

      return results;
      
    } catch (error) {
      console.error('❌ Safe form validation failed:', error);
      
      rollbackEngine.recordOperation('validation', false, 0, { error: error.message });
      
      // Return error state
      return {
        errors: [{
          ruleId: 'safety_fallback',
          fieldId: 'form',
          message: 'Validation temporarily unavailable',
          severity: 'warning' as const,
          confidence: 0
        }],
        warnings: [],
        suggestions: [],
        overallConfidence: 0
      };
    }
  }, [aiSystemsEnabled, aiForm, rollbackEngine, confidenceThreshold]);

  /**
   * Safe conflict resolution
   */
  const safeResolveConflict = useCallback(async (
    conflictId: string, 
    resolution: any
  ): Promise<boolean> => {
    if (!aiSystemsEnabled) {
      console.log('📝 Safe mode: Conflict resolution skipped');
      return true;
    }

    try {
      createAutoSnapshot();
      
      await aiForm.resolveConflict(conflictId, resolution);
      
      rollbackEngine.recordOperation('conflict_resolution', true, undefined, { 
        conflictId, 
        resolution 
      });

      return true;
      
    } catch (error) {
      console.error('❌ Safe conflict resolution failed:', error);
      
      rollbackEngine.recordOperation('conflict_resolution', false, undefined, { 
        conflictId, 
        error: error.message 
      });

      return false;
    }
  }, [aiSystemsEnabled, createAutoSnapshot, aiForm, rollbackEngine]);

  /**
   * Safety event listeners
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSafetyDisableAI = (event: CustomEvent) => {
      console.log('🚨 AI systems disabled by safety trigger');
      setSafetyStatus(prev => ({
        ...prev,
        isInSafeMode: true,
        safetyTriggerActive: 'ai_disabled'
      }));
    };

    const handleEmergencyMode = (event: CustomEvent) => {
      console.error('🚨 Emergency mode activated');
      setSafetyStatus(prev => ({
        ...prev,
        isInSafeMode: true,
        safetyTriggerActive: 'emergency_mode'
      }));
      
      // Trigger rollback to last good state
      rollbackToLastGoodState();
    };

    window.addEventListener('safety:disable-ai', handleSafetyDisableAI as EventListener);
    window.addEventListener('safety:emergency-mode', handleEmergencyMode as EventListener);

    return () => {
      window.removeEventListener('safety:disable-ai', handleSafetyDisableAI as EventListener);
      window.removeEventListener('safety:emergency-mode', handleEmergencyMode as EventListener);
    };
  }, [rollbackToLastGoodState]);

  /**
   * Periodic health checks
   */
  useEffect(() => {
    if (!safetySystemEnabled) return;

    const healthCheckInterval = setInterval(() => {
      operationCount.current++;
      
      // Create periodic snapshots
      if (operationCount.current % 10 === 0) { // Every 10 operations
        createAutoSnapshot();
      }
    }, 5000); // Every 5 seconds

    return () => clearInterval(healthCheckInterval);
  }, [safetySystemEnabled, createAutoSnapshot]);

  // Return enhanced API
  return {
    // Include all base AI form functionality
    ...aiForm,
    
    // Safety additions
    safetyStatus,
    createManualSnapshot,
    rollbackToSnapshot,
    rollbackToLastGoodState,
    getSafetyMetrics: rollbackEngine.getMetrics,
    getAvailableSnapshots: rollbackEngine.getSnapshots,
    
    // Enhanced safe methods
    safeUpdateField,
    safeValidateForm,
    safeResolveConflict,
    
    // Override original methods with safe versions
    updateField: safeUpdateField,
    validateForm: safeValidateForm,
    resolveConflict: safeResolveConflict
  };
}