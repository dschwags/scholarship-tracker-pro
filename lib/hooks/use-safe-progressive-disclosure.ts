/**
 * Safety-Enhanced Progressive Disclosure Hook
 * 
 * Extends progressive disclosure with rollback capabilities,
 * safety monitoring, and emergency fallback mechanisms.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRollbackEngine } from '@/lib/safety-systems/rollback-engine';
import { 
  useProgressiveDisclosure,
  UseProgressiveDisclosureOptions,
  UseProgressiveDisclosureReturn,
  DisclosureContext
} from './use-progressive-disclosure';
import { useFeatureFlag } from '@/lib/feature-flags/hooks';

export interface DisclosureSafetyConfig {
  enableSafeMode?: boolean;
  maxVisibilityChangesPerMinute?: number;
  confidenceThresholdForChanges?: number;
  enableEmergencySimplification?: boolean;
}

export interface DisclosureSafetyStatus {
  isInSafeMode: boolean;
  visibilityChangesThisMinute: number;
  lastResetTime: number;
  emergencySimplificationActive: boolean;
  blockedChanges: number;
}

export interface UseSafeProgressiveDisclosureOptions extends UseProgressiveDisclosureOptions {
  safety?: DisclosureSafetyConfig;
}

export interface UseSafeProgressiveDisclosureReturn extends UseProgressiveDisclosureReturn {
  // Safety additions
  disclosureSafetyStatus: DisclosureSafetyStatus;
  enableSafeMode: () => void;
  disableSafeMode: () => void;
  createDisclosureSnapshot: (label?: string) => string;
  rollbackDisclosureState: (snapshotId: string) => Promise<boolean>;
  getDisclosureSafetyMetrics: () => any;
  
  // Safe methods
  safeUpdateContext: (updates: Partial<DisclosureContext>) => Promise<boolean>;
  safeMarkFieldCompleted: (fieldId: string) => Promise<boolean>;
  safeUpdateConfidenceScore: (fieldId: string, confidence: number) => Promise<boolean>;
}

/**
 * Safety-enhanced progressive disclosure hook
 */
export function useSafeProgressiveDisclosure(
  initialFormData: Record<string, any> = {},
  options: UseSafeProgressiveDisclosureOptions = {}
): UseSafeProgressiveDisclosureReturn {
  const {
    safety = {},
    ...progressiveOptions
  } = options;

  const {
    enableSafeMode = true,
    maxVisibilityChangesPerMinute = 20,
    confidenceThresholdForChanges = 0.6,
    enableEmergencySimplification = true
  } = safety;

  // Feature flags
  const progressiveDisclosureEnabled = useFeatureFlag('progressive_disclosure_enabled');
  const safetySystemEnabled = useFeatureFlag('safety_systems_enabled');
  
  // Initialize base progressive disclosure
  const progressive = useProgressiveDisclosure(initialFormData, progressiveOptions);
  
  // Initialize rollback engine
  const rollbackEngine = useRollbackEngine();
  
  // Safety state
  const [disclosureSafetyStatus, setDisclosureSafetyStatus] = useState<DisclosureSafetyStatus>({
    isInSafeMode: false,
    visibilityChangesThisMinute: 0,
    lastResetTime: Date.now(),
    emergencySimplificationActive: false,
    blockedChanges: 0
  });

  // Refs for tracking
  const lastContextSnapshot = useRef<string | null>(null);
  const visibilityChangeLog = useRef<Array<{ timestamp: number; fieldId: string; visible: boolean }>>([]);

  // Determine if progressive systems should be active
  const progressiveSystemsActive = progressiveDisclosureEnabled && safetySystemEnabled && !disclosureSafetyStatus.isInSafeMode;

  /**
   * Rate limiting for visibility changes
   */
  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Reset counter if more than a minute has passed
    if (now - disclosureSafetyStatus.lastResetTime > 60000) {
      setDisclosureSafetyStatus(prev => ({
        ...prev,
        visibilityChangesThisMinute: 0,
        lastResetTime: now
      }));
      return true;
    }

    // Check if we've exceeded the rate limit
    if (disclosureSafetyStatus.visibilityChangesThisMinute >= maxVisibilityChangesPerMinute) {
      console.warn('⚠️ Progressive disclosure rate limit exceeded');
      setDisclosureSafetyStatus(prev => ({
        ...prev,
        isInSafeMode: true,
        blockedChanges: prev.blockedChanges + 1
      }));
      
      rollbackEngine.recordOperation('disclosure_update', false, undefined, {
        reason: 'rate_limit_exceeded',
        changesThisMinute: disclosureSafetyStatus.visibilityChangesThisMinute
      });

      return false;
    }

    return true;
  }, [disclosureSafetyStatus, maxVisibilityChangesPerMinute, rollbackEngine]);

  /**
   * Create disclosure state snapshot
   */
  const createDisclosureSnapshot = useCallback((label?: string): string => {
    try {
      const snapshotId = rollbackEngine.createSnapshot(
        initialFormData,
        { progressive: progressive.disclosureContext },
        {
          disclosureContext: progressive.disclosureContext,
          visibleFields: Object.keys(initialFormData).filter(fieldId => 
            progressive.isFieldVisible(fieldId)
          ),
          expertiseLevel: progressive.disclosureContext.userExpertiseLevel
        },
        label || 'disclosure_state'
      );

      lastContextSnapshot.current = snapshotId;
      console.log(`📸 Disclosure snapshot created: ${snapshotId}`);
      return snapshotId;

    } catch (error) {
      console.error('❌ Failed to create disclosure snapshot:', error);
      return '';
    }
  }, [rollbackEngine, initialFormData, progressive]);

  /**
   * Rollback disclosure state
   */
  const rollbackDisclosureState = useCallback(async (snapshotId: string): Promise<boolean> => {
    try {
      const snapshot = rollbackEngine.rollbackToSnapshot(snapshotId, {
        preserveUserInput: true,
        notifyUser: false, // Progressive disclosure changes shouldn't be too disruptive
        logEvent: true
      });

      if (snapshot) {
        console.log('✅ Disclosure state rolled back to:', snapshotId);
        
        // Reset safety status after successful rollback
        setDisclosureSafetyStatus(prev => ({
          ...prev,
          isInSafeMode: false,
          emergencySimplificationActive: false,
          visibilityChangesThisMinute: 0
        }));

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Disclosure rollback failed:', error);
      return false;
    }
  }, [rollbackEngine]);

  /**
   * Safe context update with error handling
   */
  const safeUpdateContext = useCallback(async (updates: Partial<DisclosureContext>): Promise<boolean> => {
    if (!progressiveSystemsActive) {
      console.log('📝 Progressive disclosure disabled, skipping context update');
      return true;
    }

    if (!checkRateLimit()) {
      return false;
    }

    try {
      // Create snapshot before major changes
      if (updates.userExpertiseLevel || updates.currentPhase) {
        createDisclosureSnapshot('before_context_update');
      }

      // Perform the update
      progressive.updateContext(updates);

      // Record successful operation
      rollbackEngine.recordOperation('disclosure_update', true, 
        progressive.overallConfidence, 
        { updates }
      );

      // Update rate limiting counter
      setDisclosureSafetyStatus(prev => ({
        ...prev,
        visibilityChangesThisMinute: prev.visibilityChangesThisMinute + 1
      }));

      return true;

    } catch (error) {
      console.error('❌ Safe context update failed:', error);
      
      rollbackEngine.recordOperation('disclosure_update', false, 0, { 
        error: error.message, 
        updates 
      });

      // Consider entering safe mode on repeated failures
      setDisclosureSafetyStatus(prev => ({
        ...prev,
        isInSafeMode: true
      }));

      return false;
    }
  }, [progressiveSystemsActive, checkRateLimit, createDisclosureSnapshot, progressive, rollbackEngine]);

  /**
   * Safe field completion marking
   */
  const safeMarkFieldCompleted = useCallback(async (fieldId: string): Promise<boolean> => {
    if (!progressiveSystemsActive) return true;

    try {
      progressive.markFieldCompleted(fieldId);
      
      rollbackEngine.recordOperation('disclosure_update', true, 
        progressive.overallConfidence, 
        { operation: 'mark_completed', fieldId }
      );

      // Log visibility change
      visibilityChangeLog.current.push({
        timestamp: Date.now(),
        fieldId,
        visible: progressive.isFieldVisible(fieldId)
      });

      return true;

    } catch (error) {
      console.error(`❌ Failed to mark field ${fieldId} as completed:`, error);
      
      rollbackEngine.recordOperation('disclosure_update', false, 0, { 
        error: error.message, 
        fieldId 
      });

      return false;
    }
  }, [progressiveSystemsActive, progressive, rollbackEngine]);

  /**
   * Safe confidence score update
   */
  const safeUpdateConfidenceScore = useCallback(async (
    fieldId: string, 
    confidence: number
  ): Promise<boolean> => {
    if (!progressiveSystemsActive) return true;

    // Validate confidence threshold
    if (confidence < confidenceThresholdForChanges && confidence > 0) {
      console.warn(`⚠️ Low confidence score for ${fieldId}: ${confidence}`);
      
      // Don't apply changes with very low confidence
      if (confidence < 0.3) {
        rollbackEngine.recordOperation('disclosure_update', false, confidence, { 
          reason: 'confidence_too_low',
          fieldId,
          confidence
        });
        return false;
      }
    }

    try {
      progressive.updateConfidenceScore(fieldId, confidence);
      
      rollbackEngine.recordOperation('disclosure_update', true, confidence, { 
        operation: 'update_confidence', 
        fieldId, 
        confidence 
      });

      return true;

    } catch (error) {
      console.error(`❌ Failed to update confidence for ${fieldId}:`, error);
      
      rollbackEngine.recordOperation('disclosure_update', false, 0, { 
        error: error.message, 
        fieldId, 
        confidence 
      });

      return false;
    }
  }, [progressiveSystemsActive, confidenceThresholdForChanges, progressive, rollbackEngine]);

  /**
   * Enable safe mode manually
   */
  const enableSafeMode = useCallback(() => {
    console.log('🛡️ Enabling progressive disclosure safe mode');
    setDisclosureSafetyStatus(prev => ({
      ...prev,
      isInSafeMode: true
    }));
  }, []);

  /**
   * Disable safe mode manually
   */
  const disableSafeMode = useCallback(() => {
    console.log('✅ Disabling progressive disclosure safe mode');
    setDisclosureSafetyStatus(prev => ({
      ...prev,
      isInSafeMode: false,
      emergencySimplificationActive: false,
      visibilityChangesThisMinute: 0,
      blockedChanges: 0
    }));
  }, []);

  /**
   * Emergency simplification mode
   */
  const activateEmergencySimplification = useCallback(() => {
    if (!enableEmergencySimplification) return;

    console.log('🚨 Activating emergency simplification mode');
    
    setDisclosureSafetyStatus(prev => ({
      ...prev,
      emergencySimplificationActive: true,
      isInSafeMode: true
    }));

    // Force simplest expertise level
    safeUpdateContext({ 
      userExpertiseLevel: 'beginner',
      currentPhase: 'basic_info'
    });
  }, [enableEmergencySimplification, safeUpdateContext]);

  /**
   * Listen for safety events
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleDisableProgressive = () => {
      console.log('🚨 Progressive disclosure disabled by safety trigger');
      enableSafeMode();
      
      if (enableEmergencySimplification) {
        activateEmergencySimplification();
      }
    };

    const handleEmergencyMode = () => {
      console.error('🚨 Emergency mode - activating simplification');
      activateEmergencySimplification();
    };

    window.addEventListener('safety:disable-progressive', handleDisableProgressive);
    window.addEventListener('safety:emergency-mode', handleEmergencyMode);

    return () => {
      window.removeEventListener('safety:disable-progressive', handleDisableProgressive);
      window.removeEventListener('safety:emergency-mode', handleEmergencyMode);
    };
  }, [enableSafeMode, activateEmergencySimplification]);

  /**
   * Periodic cleanup and monitoring
   */
  useEffect(() => {
    const cleanup = setInterval(() => {
      // Clean up old visibility change logs (keep last 100)
      if (visibilityChangeLog.current.length > 100) {
        visibilityChangeLog.current = visibilityChangeLog.current.slice(-100);
      }

      // Auto-create snapshots for stable states
      if (progressive.completionRate > 0.8 && !lastContextSnapshot.current) {
        createDisclosureSnapshot('stable_state');
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(cleanup);
  }, [progressive.completionRate, createDisclosureSnapshot]);

  // Return enhanced API
  return {
    // Include all base progressive disclosure functionality
    ...progressive,
    
    // Safety additions
    disclosureSafetyStatus,
    enableSafeMode,
    disableSafeMode,
    createDisclosureSnapshot,
    rollbackDisclosureState,
    getDisclosureSafetyMetrics: rollbackEngine.getMetrics,
    
    // Enhanced safe methods
    safeUpdateContext,
    safeMarkFieldCompleted,
    safeUpdateConfidenceScore,
    
    // Override original methods with safe versions if safety is enabled
    updateContext: enableSafeMode ? safeUpdateContext : progressive.updateContext,
    markFieldCompleted: enableSafeMode ? safeMarkFieldCompleted : progressive.markFieldCompleted,
    updateConfidenceScore: enableSafeMode ? safeUpdateConfidenceScore : progressive.updateConfidenceScore
  };
}