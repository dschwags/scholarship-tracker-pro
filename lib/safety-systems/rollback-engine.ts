/**
 * Rollback Engine - Comprehensive Safety System
 * 
 * Provides rollback triggers, safety systems, and automated recovery mechanisms
 * for AI-enhanced forms, progressive disclosure, and financial data management.
 */

// State management and monitoring
export interface FormStateSnapshot {
  timestamp: string;
  sessionId: string;
  formData: Record<string, any>;
  aiState: {
    currentPhase: string;
    completedSections: string[];
    confidenceScores: Record<string, number>;
    inferredData: Record<string, any>;
  };
  progressiveState: {
    disclosureContext: any;
    visibleFields: string[];
    expertiseLevel: string;
  };
  checksum: string;
}

export interface SafetyMetrics {
  errorCount: number;
  totalOperations: number;
  consecutiveFailures: number;
  lastSuccessfulOperation: string;
  confidenceDrift: number;
  dataCorruptionCount: number;
}

export interface SafetyTrigger {
  id: string;
  type: 'technical' | 'data_integrity' | 'user_safety' | 'ai_reliability';
  condition: string;
  threshold: number;
  action: 'rollback' | 'disable_ai' | 'disable_progressive' | 'full_emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface RollbackOptions {
  targetSnapshot?: string;
  preserveUserInput?: boolean;
  disableFeatures?: string[];
  notifyUser?: boolean;
  logEvent?: boolean;
}

// Core safety configuration
export const SAFETY_TRIGGERS: SafetyTrigger[] = [
  {
    id: 'high_error_rate',
    type: 'technical',
    condition: 'error_rate > threshold',
    threshold: 0.15, // 15% error rate
    action: 'disable_ai',
    priority: 'high'
  },
  {
    id: 'confidence_collapse',
    type: 'ai_reliability',
    condition: 'avg_confidence < threshold',
    threshold: 0.3, // Below 30% confidence
    action: 'disable_ai',
    priority: 'high'
  },
  {
    id: 'data_corruption',
    type: 'data_integrity',
    condition: 'corruption_events > threshold',
    threshold: 3, // 3 corruption events
    action: 'rollback',
    priority: 'critical'
  },
  {
    id: 'consecutive_failures',
    type: 'technical',
    condition: 'consecutive_failures > threshold',
    threshold: 5, // 5 consecutive failures
    action: 'full_emergency',
    priority: 'critical'
  },
  {
    id: 'ai_inference_drift',
    type: 'ai_reliability',
    condition: 'inference_drift > threshold',
    threshold: 0.8, // 80% drift from expected
    action: 'disable_ai',
    priority: 'medium'
  },
  {
    id: 'form_state_invalid',
    type: 'data_integrity',
    condition: 'invalid_state_detected',
    threshold: 1, // Any invalid state
    action: 'rollback',
    priority: 'high'
  }
];

/**
 * Rollback Engine Class - Main Safety System
 */
export class RollbackEngine {
  private snapshots: Map<string, FormStateSnapshot> = new Map();
  private metrics: SafetyMetrics = {
    errorCount: 0,
    totalOperations: 0,
    consecutiveFailures: 0,
    lastSuccessfulOperation: new Date().toISOString(),
    confidenceDrift: 0,
    dataCorruptionCount: 0
  };
  
  private sessionId: string;
  private maxSnapshots: number = 10;
  private monitoringEnabled: boolean = true;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.setupMonitoring();
  }

  /**
   * Create a state snapshot for rollback purposes
   */
  createSnapshot(
    formData: Record<string, any>,
    aiState: any,
    progressiveState: any,
    label?: string
  ): string {
    const snapshotId = label || `snapshot_${Date.now()}`;
    
    const snapshot: FormStateSnapshot = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      formData: JSON.parse(JSON.stringify(formData)), // Deep clone
      aiState: {
        currentPhase: aiState.currentPhase || 'unknown',
        completedSections: [...(aiState.completedSections || [])],
        confidenceScores: { ...(aiState.confidenceScores || {}) },
        inferredData: { ...(aiState.inferredData || {}) }
      },
      progressiveState: {
        disclosureContext: JSON.parse(JSON.stringify(progressiveState.disclosureContext || {})),
        visibleFields: [...(progressiveState.visibleFields || [])],
        expertiseLevel: progressiveState.expertiseLevel || 'intermediate'
      },
      checksum: this.generateChecksum(formData, aiState, progressiveState)
    };

    this.snapshots.set(snapshotId, snapshot);
    
    // Limit snapshot storage
    if (this.snapshots.size > this.maxSnapshots) {
      const oldestKey = Array.from(this.snapshots.keys())[0];
      this.snapshots.delete(oldestKey);
    }

    console.log(`📸 Safety snapshot created: ${snapshotId}`);
    return snapshotId;
  }

  /**
   * Rollback to a specific snapshot
   */
  rollbackToSnapshot(
    snapshotId: string, 
    options: RollbackOptions = {}
  ): FormStateSnapshot | null {
    const snapshot = this.snapshots.get(snapshotId);
    
    if (!snapshot) {
      console.error(`❌ Rollback failed: Snapshot ${snapshotId} not found`);
      return null;
    }

    // Verify snapshot integrity
    if (!this.verifySnapshot(snapshot)) {
      console.error(`❌ Rollback failed: Snapshot ${snapshotId} is corrupted`);
      return null;
    }

    console.log(`🔄 Rolling back to snapshot: ${snapshotId}`);
    
    if (options.logEvent !== false) {
      this.logRollbackEvent(snapshotId, 'manual', options);
    }

    if (options.notifyUser !== false) {
      this.notifyUserOfRollback(snapshotId);
    }

    return snapshot;
  }

  /**
   * Rollback to the last known good state
   */
  rollbackToLastGoodState(): FormStateSnapshot | null {
    // Find the most recent snapshot with high confidence scores
    let bestSnapshot: FormStateSnapshot | null = null;
    let bestScore = 0;

    for (const [snapshotId, snapshot] of this.snapshots) {
      const avgConfidence = this.calculateAverageConfidence(snapshot.aiState.confidenceScores);
      if (avgConfidence > bestScore && avgConfidence > 0.7) {
        bestSnapshot = snapshot;
        bestScore = avgConfidence;
      }
    }

    if (bestSnapshot) {
      console.log(`🔄 Rolling back to last good state with confidence: ${bestScore}`);
      this.logRollbackEvent('last_good_state', 'automatic');
      return bestSnapshot;
    }

    console.warn(`⚠️ No good state found for rollback`);
    return null;
  }

  /**
   * Record an operation result for monitoring
   */
  recordOperation(
    operationType: 'ai_inference' | 'form_update' | 'validation' | 'disclosure_update',
    success: boolean,
    confidence?: number,
    metadata?: any
  ): void {
    this.metrics.totalOperations++;

    if (success) {
      this.metrics.consecutiveFailures = 0;
      this.metrics.lastSuccessfulOperation = new Date().toISOString();
    } else {
      this.metrics.errorCount++;
      this.metrics.consecutiveFailures++;
    }

    // Update confidence drift if applicable
    if (confidence !== undefined) {
      const expectedConfidence = 0.8; // Expected baseline
      this.metrics.confidenceDrift = Math.abs(confidence - expectedConfidence);
    }

    // Check safety triggers after each operation
    this.checkSafetyTriggers();
    
    console.log(`📊 Operation recorded: ${operationType}, success: ${success}, metrics:`, {
      errorRate: this.metrics.errorCount / this.metrics.totalOperations,
      consecutiveFailures: this.metrics.consecutiveFailures,
      confidence
    });
  }

  /**
   * Check all safety triggers and take appropriate action
   */
  private checkSafetyTriggers(): void {
    const errorRate = this.metrics.totalOperations > 0 
      ? this.metrics.errorCount / this.metrics.totalOperations 
      : 0;

    const avgConfidence = this.calculateCurrentConfidence();

    for (const trigger of SAFETY_TRIGGERS) {
      let shouldTrigger = false;

      switch (trigger.condition) {
        case 'error_rate > threshold':
          shouldTrigger = errorRate > trigger.threshold;
          break;
        case 'avg_confidence < threshold':
          shouldTrigger = avgConfidence < trigger.threshold;
          break;
        case 'corruption_events > threshold':
          shouldTrigger = this.metrics.dataCorruptionCount > trigger.threshold;
          break;
        case 'consecutive_failures > threshold':
          shouldTrigger = this.metrics.consecutiveFailures > trigger.threshold;
          break;
        case 'inference_drift > threshold':
          shouldTrigger = this.metrics.confidenceDrift > trigger.threshold;
          break;
        case 'invalid_state_detected':
          shouldTrigger = this.detectInvalidState();
          break;
      }

      if (shouldTrigger) {
        console.warn(`⚠️ Safety trigger activated: ${trigger.id} (${trigger.priority})`);
        this.executeSafetyAction(trigger);
      }
    }
  }

  /**
   * Execute safety action based on trigger
   */
  private executeSafetyAction(trigger: SafetyTrigger): void {
    console.log(`🚨 Executing safety action: ${trigger.action} for trigger: ${trigger.id}`);

    switch (trigger.action) {
      case 'rollback':
        this.rollbackToLastGoodState();
        break;
      case 'disable_ai':
        this.disableAIFeatures();
        break;
      case 'disable_progressive':
        this.disableProgressiveFeatures();
        break;
      case 'full_emergency':
        this.triggerFullEmergencyMode();
        break;
    }

    // Log the safety action
    this.logSafetyEvent(trigger);
  }

  /**
   * Disable AI features for safety
   */
  private disableAIFeatures(): void {
    if (typeof window !== 'undefined') {
      // Dispatch custom event to notify components
      window.dispatchEvent(new CustomEvent('safety:disable-ai', {
        detail: { reason: 'safety_trigger', timestamp: new Date().toISOString() }
      }));
    }
  }

  /**
   * Disable progressive disclosure features
   */
  private disableProgressiveFeatures(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('safety:disable-progressive', {
        detail: { reason: 'safety_trigger', timestamp: new Date().toISOString() }
      }));
    }
  }

  /**
   * Trigger full emergency mode
   */
  private triggerFullEmergencyMode(): void {
    console.error('🚨 FULL EMERGENCY MODE ACTIVATED');
    
    if (typeof window !== 'undefined') {
      // Notify all systems
      window.dispatchEvent(new CustomEvent('safety:emergency-mode', {
        detail: { 
          reason: 'critical_safety_trigger', 
          timestamp: new Date().toISOString(),
          metrics: this.metrics
        }
      }));

      // Show user notification
      alert('System has entered safe mode to protect your data. Please save your work and refresh the page.');
    }
  }

  /**
   * Utilities
   */
  private generateChecksum(formData: any, aiState: any, progressiveState: any): string {
    const combined = JSON.stringify({ formData, aiState, progressiveState });
    return btoa(combined).slice(0, 16); // Simple checksum
  }

  private verifySnapshot(snapshot: FormStateSnapshot): boolean {
    const expectedChecksum = this.generateChecksum(
      snapshot.formData, 
      snapshot.aiState, 
      snapshot.progressiveState
    );
    return expectedChecksum === snapshot.checksum;
  }

  private calculateAverageConfidence(confidenceScores: Record<string, number>): number {
    const scores = Object.values(confidenceScores);
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  }

  private calculateCurrentConfidence(): number {
    // This would be populated by the current AI state
    return 0.8; // Placeholder
  }

  private detectInvalidState(): boolean {
    // Check for common invalid states
    return false; // Placeholder - would implement actual validation
  }

  private setupMonitoring(): void {
    if (!this.monitoringEnabled || typeof window === 'undefined') return;

    // Set up periodic health checks
    setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Every 30 seconds
  }

  private performHealthCheck(): void {
    // Check system health and create automatic snapshots if needed
    const errorRate = this.metrics.totalOperations > 0 
      ? this.metrics.errorCount / this.metrics.totalOperations 
      : 0;

    if (errorRate < 0.05 && this.metrics.consecutiveFailures === 0) {
      // System is healthy - this would be a good time for an automatic snapshot
      console.log('💚 System health check passed');
    }
  }

  private logRollbackEvent(snapshotId: string, type: 'manual' | 'automatic', options?: RollbackOptions): void {
    const event = {
      type: 'rollback',
      snapshotId,
      rollbackType: type,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      options,
      metrics: { ...this.metrics }
    };

    console.log('📝 Rollback event logged:', event);
    
    // Store in localStorage for debugging
    if (typeof window !== 'undefined') {
      const key = `rollback_log_${Date.now()}`;
      localStorage.setItem(key, JSON.stringify(event));
    }
  }

  private logSafetyEvent(trigger: SafetyTrigger): void {
    const event = {
      type: 'safety_trigger',
      trigger,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      metrics: { ...this.metrics }
    };

    console.log('📝 Safety event logged:', event);
    
    if (typeof window !== 'undefined') {
      const key = `safety_log_${Date.now()}`;
      localStorage.setItem(key, JSON.stringify(event));
    }
  }

  private notifyUserOfRollback(snapshotId: string): void {
    if (typeof window !== 'undefined') {
      // In a real app, you'd use a proper toast/notification system
      console.log(`🔔 User notified of rollback to: ${snapshotId}`);
    }
  }

  /**
   * Public API for getting current metrics
   */
  getMetrics(): SafetyMetrics {
    return { ...this.metrics };
  }

  /**
   * Get all available snapshots
   */
  getSnapshots(): Array<{ id: string; timestamp: string; checksum: string }> {
    return Array.from(this.snapshots.entries()).map(([id, snapshot]) => ({
      id,
      timestamp: snapshot.timestamp,
      checksum: snapshot.checksum
    }));
  }

  /**
   * Clear all snapshots (for cleanup)
   */
  clearSnapshots(): void {
    this.snapshots.clear();
    console.log('🧹 All snapshots cleared');
  }
}

/**
 * Singleton instance for global access
 */
let globalRollbackEngine: RollbackEngine | null = null;

export function getRollbackEngine(sessionId?: string): RollbackEngine {
  if (!globalRollbackEngine) {
    globalRollbackEngine = new RollbackEngine(sessionId || 'default');
  }
  return globalRollbackEngine;
}

/**
 * React Hook for easy integration
 */
export function useRollbackEngine(sessionId?: string) {
  const engine = getRollbackEngine(sessionId);
  
  return {
    createSnapshot: engine.createSnapshot.bind(engine),
    rollbackToSnapshot: engine.rollbackToSnapshot.bind(engine),
    rollbackToLastGoodState: engine.rollbackToLastGoodState.bind(engine),
    recordOperation: engine.recordOperation.bind(engine),
    getMetrics: engine.getMetrics.bind(engine),
    getSnapshots: engine.getSnapshots.bind(engine),
    clearSnapshots: engine.clearSnapshots.bind(engine)
  };
}