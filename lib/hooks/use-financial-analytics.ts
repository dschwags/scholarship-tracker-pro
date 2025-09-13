/**
 * Enhanced Financial Analytics Hook
 * 
 * Integrates real financial goals data from database with 
 * dashboard analytics and scholarship tracking.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import { FinancialAnalyticsService, FinancialMetrics, ScholarshipStats } from '@/lib/analytics/financial-analytics';
import { useFeatureFlag } from '@/lib/feature-flags/hooks';
// FinancialGoal type definition moved to avoid database imports in client
interface FinancialGoal {
  id: number;
  userId: number;
  type: string;
  name: string;
  targetAmount: number;
  targetDate: Date;
  priority: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  // Additional fields as needed
}

interface UseFinancialAnalyticsReturn {
  // Core Metrics
  metrics: FinancialMetrics | null;
  
  // Raw Data
  financialGoals: FinancialGoal[];
  scholarshipStats: ScholarshipStats;
  
  // Loading States
  isLoading: boolean;
  error: string | null;
  
  // Enhanced Analytics
  hasRealGoalsData: boolean;
  isUsingNewSystem: boolean;
  
  // Actions
  refreshData: () => Promise<void>;
  
  // Legacy compatibility removed for BugX stability
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useFinancialAnalytics(
  legacyScholarshipStats?: any,
  userId?: string | number
): UseFinancialAnalyticsReturn {
  const [error, setError] = useState<string | null>(null);
  
  // Feature flags (MEMOIZED)
  const newSystemEnabled = useFeatureFlag('new_goals_system');
  const analyticsEnabled = useFeatureFlag('enhanced_analytics');
  
  // Determine if we should use new system (MEMOIZED)
  const shouldUseNewSystem = useMemo(() => {
    return newSystemEnabled && analyticsEnabled && userId;
  }, [newSystemEnabled, analyticsEnabled, userId]);
  
  // Fetch financial goals from database
  const { 
    data: financialGoalsResponse, 
    error: goalsError, 
    isLoading: goalsLoading,
    mutate: mutateGoals
  } = useSWR(
    shouldUseNewSystem ? `/api/financial-goals?userId=${userId}&includeExpenses=true&includeFunding=true` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
      onError: (err) => {
        console.error('Financial goals fetch error:', err);
        const errorMsg = `Failed to load financial goals: ${err.message}`;
        // Prevent cascading error updates
        setError(prev => prev === errorMsg ? prev : errorMsg);
      }
    }
  );
  
  // Note: User data is available from header/context, no need to fetch again
  
  // Process financial goals data
  const financialGoals = useMemo(() => {
    if (!financialGoalsResponse?.success || !financialGoalsResponse?.data) {
      return [];
    }
    return financialGoalsResponse.data.goals || [];
  }, [financialGoalsResponse]);
  
  // Convert legacy scholarship stats to new format
  const scholarshipStats = useMemo(() => {
    if (legacyScholarshipStats) {
      return FinancialAnalyticsService.convertScholarshipStats(legacyScholarshipStats);
    }
    
    return {
      funding: { won: 0, potential: 0 },
      applications: { total: 0, submitted: 0, accepted: 0, rejected: 0 }
    };
  }, [legacyScholarshipStats]);
  
  // Calculate comprehensive metrics
  const metrics = useMemo(() => {
    if (!shouldUseNewSystem || financialGoals.length === 0) {
      // Fallback to legacy calculations
      if (legacyScholarshipStats) {
        return FinancialAnalyticsService.calculateMetrics([], scholarshipStats);
      }
      return null;
    }
    
    try {
      return FinancialAnalyticsService.calculateMetrics(financialGoals, scholarshipStats);
    } catch (err) {
      console.error('Metrics calculation error:', err);
      const errorMsg = `Failed to calculate metrics: ${err.message}`;
      // Prevent cascading error updates
      setError(prev => prev === errorMsg ? prev : errorMsg);
      return null;
    }
  }, [financialGoals, scholarshipStats, shouldUseNewSystem, legacyScholarshipStats]);
  
  // Enhanced loading state
  const isLoading = useMemo(() => {
    if (!shouldUseNewSystem) return false;
    return goalsLoading;
  }, [shouldUseNewSystem, goalsLoading]);
  
  // Data availability flags
  const hasRealGoalsData = financialGoals.length > 0;
  const isUsingNewSystem = shouldUseNewSystem && !error;
  
  // Refresh all data (MEMOIZED)
  const refreshData = useCallback(async () => {
    setError(null);
    try {
      await mutateGoals();
    } catch (err) {
      console.error('Failed to refresh financial data:', err);
      const errorMsg = `Refresh failed: ${err.message}`;
      setError(prev => prev === errorMsg ? prev : errorMsg);
    }
  }, [mutateGoals]);
  
  // Legacy function removed for BugX stability
  
  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Financial Analytics Debug:', {
        shouldUseNewSystem,
        hasRealGoalsData,
        financialGoalsCount: financialGoals.length,
        metricsAvailable: !!metrics,
        isLoading,
        error
      });
    }
  }, [shouldUseNewSystem, hasRealGoalsData, financialGoals.length, metrics, isLoading, error]);
  
  return {
    metrics,
    financialGoals,
    scholarshipStats,
    isLoading,
    error: error || (goalsError ? 'Failed to load financial goals' : null),
    hasRealGoalsData,
    isUsingNewSystem,
    refreshData
  };
}