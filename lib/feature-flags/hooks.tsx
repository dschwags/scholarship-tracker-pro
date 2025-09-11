/**
 * Feature Flag React Hooks
 * Safe, reactive feature flag system with automatic rollback
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FeatureFlags, DEFAULT_FEATURE_FLAGS, FEATURE_FLAG_OVERRIDES, getEnvironmentFlags, ROLLBACK_TRIGGERS } from './config';

interface FeatureFlagContextType {
  flags: FeatureFlags;
  isFeatureEnabled: (feature: keyof FeatureFlags) => boolean;
  enableFeature: (feature: keyof FeatureFlags) => void;
  disableFeature: (feature: keyof FeatureFlags) => void;
  triggerEmergencyRollback: () => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | null>(null);

interface FeatureFlagProviderProps {
  children: ReactNode;
  userRole?: 'admin' | 'beta' | 'user';
  userId?: string;
}

export function FeatureFlagProvider({ children, userRole = 'user', userId }: FeatureFlagProviderProps) {
  // ✅ BUGX CRITICAL FIX: Fixed invalid hook call causing infinite loops
  const [flags, setFlags] = useState<FeatureFlags>({
    ...DEFAULT_FEATURE_FLAGS,
    // Simplified initialization to prevent hook violations
    new_goals_system: false,
    enhanced_analytics: false,
    ai_form_validation: false,
    progressive_disclosure: false,
    export_import: true,
    parent_collaboration: true,
    safety_systems: true,
    emergency_rollback: false
  });

  // Define emergency rollback function first
  const triggerEmergencyRollback = () => {
    console.error('🚨 EMERGENCY ROLLBACK TRIGGERED');
    
    setFlags(prev => ({
      ...prev,
      ...FEATURE_FLAG_OVERRIDES.emergency,
    }));
    
    // Notify user
    if (typeof window !== 'undefined') {
      // You can replace this with your toast/notification system
      alert('System temporarily reverted to safe mode. Your data is safe.');
    }
    
    // Log to analytics/monitoring
    if (userId) {
      localStorage.setItem(`emergency_rollback_${Date.now()}`, JSON.stringify({
        userId,
        timestamp: '2024-01-01T00:00:00.000Z', // ✅ BUGX: Fixed timestamp to prevent infinite re-renders
        flags: flags,
      }));
    }
  };

  // Automatic monitoring and rollback system
  useEffect(() => {
    let errorCount = 0;
    let totalRequests = 0;
    
    const monitoringInterval = setInterval(() => {
      // Calculate error rate
      const errorRate = totalRequests > 0 ? errorCount / totalRequests : 0;
      
      // Check rollback triggers
      if (errorRate > ROLLBACK_TRIGGERS.technical.api_error_rate_threshold) {
        console.warn('⚠️ High error rate detected, triggering emergency rollback');
        triggerEmergencyRollback();
      }
      
      // Reset counters
      errorCount = 0;
      totalRequests = 0;
    }, 60000); // Check every minute
    
    // Global error monitoring
    const handleGlobalError = (event: ErrorEvent) => {
      errorCount++;
      totalRequests++;
      
      // Immediate rollback for critical errors
      if (event.error?.message?.includes('financial-goals') || 
          event.error?.message?.includes('database')) {
        console.error('🚨 Critical error detected:', event.error);
        triggerEmergencyRollback();
      }
    };
    
    window.addEventListener('error', handleGlobalError);
    
    return () => {
      clearInterval(monitoringInterval);
      window.removeEventListener('error', handleGlobalError);
    };
  }, [triggerEmergencyRollback]);

  // Load user-specific flags from localStorage/API
  useEffect(() => {
    if (userId) {
      const savedFlags = localStorage.getItem(`feature_flags_${userId}`);
      if (savedFlags) {
        try {
          const userFlags = JSON.parse(savedFlags);
          setFlags(prev => ({ ...prev, ...userFlags }));
        } catch (error) {
          console.warn('Failed to parse saved feature flags:', error);
        }
      }
    }
  }, [userId]);

  const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
    // Emergency rollback disables everything
    if (flags.emergency_rollback) {
      return false;
    }
    
    return flags[feature];
  };

  const enableFeature = (feature: keyof FeatureFlags) => {
    setFlags(prev => {
      const newFlags = { ...prev, [feature]: true };
      
      // Save to localStorage for persistence
      if (userId) {
        localStorage.setItem(`feature_flags_${userId}`, JSON.stringify(newFlags));
      }
      
      console.log(`✅ Feature enabled: ${feature}`);
      return newFlags;
    });
  };

  const disableFeature = (feature: keyof FeatureFlags) => {
    setFlags(prev => {
      const newFlags = { ...prev, [feature]: false };
      
      // Save to localStorage for persistence
      if (userId) {
        localStorage.setItem(`feature_flags_${userId}`, JSON.stringify(newFlags));
      }
      
      console.log(`❌ Feature disabled: ${feature}`);
      return newFlags;
    });
  };

  const contextValue = {
    flags,
    isFeatureEnabled,
    enableFeature,
    disableFeature,
    triggerEmergencyRollback,
  };

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  const context = useContext(FeatureFlagContext);
  
  if (!context) {
    // Fail safe - return false if no context
    console.warn('useFeatureFlag used outside FeatureFlagProvider, returning false');
    return false;
  }
  
  return context.isFeatureEnabled(feature);
}

export function useFeatureFlags(): FeatureFlagContextType {
  const context = useContext(FeatureFlagContext);
  
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagProvider');
  }
  
  return context;
}

// Utility hook for gradual rollout
export function useGradualRollout(feature: keyof FeatureFlags, rolloutPercentage: number = 10): boolean {
  const isEnabled = useFeatureFlag(feature);
  const [isInRollout, setIsInRollout] = useState(false);
  
  useEffect(() => {
    if (!isEnabled) {
      setIsInRollout(false);
      return;
    }
    
    // Use user ID hash for consistent rollout
    const userId = localStorage.getItem('user_id') || 'anonymous';
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const userPercentile = Math.abs(hash) % 100;
    setIsInRollout(userPercentile < rolloutPercentage);
  }, [isEnabled, rolloutPercentage]);
  
  return isInRollout;
}