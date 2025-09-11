/**
 * Feature Flags Configuration
 * Safety-first rollout system for bulletproof deployment
 */

export interface FeatureFlags {
  // Phase 2 Feature Flags
  new_goals_system: boolean;
  enhanced_onboarding: boolean;
  ai_decision_engine: boolean;
  progressive_disclosure: boolean;
  
  // Safety & Rollback Flags
  emergency_rollback: boolean;
  data_migration_enabled: boolean;
  rollback_system_enabled: boolean;
  safety_systems_enabled: boolean;
  emergency_mode_enabled: boolean;
  progressive_disclosure_enabled: boolean;
  
  // Future Phase Flags
  advanced_analytics: boolean;
  smart_suggestions: boolean;
  template_recommendations: boolean;
}

// Default feature flag configuration
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  // Phase 2 - Start with safe defaults
  new_goals_system: false, // Start disabled for gradual rollout
  enhanced_onboarding: false,
  ai_decision_engine: false,
  progressive_disclosure: false,
  
  // Safety flags
  emergency_rollback: false,
  data_migration_enabled: false,
  rollback_system_enabled: true, // Always enabled for safety
  safety_systems_enabled: true, // Always enabled for safety
  emergency_mode_enabled: true, // Always enabled for safety
  progressive_disclosure_enabled: false,
  
  // Future features
  advanced_analytics: false,
  smart_suggestions: false,
  template_recommendations: false,
};

// Rollback triggers - automatically disable features if issues detected
export const ROLLBACK_TRIGGERS = {
  technical: {
    api_error_rate_threshold: 0.05, // 5%
    database_timeout_threshold: 120000, // 2 minutes
    form_completion_drop_threshold: 0.20, // 20% drop
  },
  data_integrity: {
    data_loss_tolerance: 0, // Zero tolerance
    calculation_accuracy_threshold: 0.95, // 95%
    migration_failure_threshold: 0.02, // 2%
  }
};

// Feature flag overrides for different user groups
export const FEATURE_FLAG_OVERRIDES = {
  // Admin users get access to all features
  admin: {
    new_goals_system: true,
    enhanced_onboarding: true,
    ai_decision_engine: true,
    progressive_disclosure: true,
    progressive_disclosure_enabled: true,
    rollback_system_enabled: true,
    safety_systems_enabled: true,
    emergency_mode_enabled: true,
  },
  
  // Beta users for gradual rollout
  beta: {
    new_goals_system: true,
    enhanced_onboarding: true,
    progressive_disclosure_enabled: true,
    rollback_system_enabled: true,
    safety_systems_enabled: true,
  },
  
  // Emergency rollback - disable all new features
  emergency: {
    new_goals_system: false,
    enhanced_onboarding: false,
    ai_decision_engine: false,
    progressive_disclosure: false,
    progressive_disclosure_enabled: false,
    emergency_rollback: true,
    rollback_system_enabled: true, // Keep rollback enabled in emergencies
    safety_systems_enabled: true, // Keep safety enabled in emergencies
    emergency_mode_enabled: true, // Keep emergency mode enabled
  }
};

// Environment-specific overrides
export const getEnvironmentFlags = (): Partial<FeatureFlags> => {
  const env = process.env.NODE_ENV;
  
  switch (env) {
    case 'development':
      return {
        new_goals_system: true,
        enhanced_onboarding: true,
        ai_decision_engine: true,
        progressive_disclosure: true,
        progressive_disclosure_enabled: true,
        data_migration_enabled: true,
        rollback_system_enabled: true,
        safety_systems_enabled: true,
        emergency_mode_enabled: true,
      };
    
    case 'staging':
      return {
        new_goals_system: true,
        enhanced_onboarding: true,
      };
    
    case 'production':
      // Production starts conservative
      return DEFAULT_FEATURE_FLAGS;
    
    default:
      return DEFAULT_FEATURE_FLAGS;
  }
};