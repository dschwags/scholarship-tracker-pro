/**
 * Enhanced Goals Hook - Smart routing between old and new systems
 * Features gradual rollout, automatic migration, and rollback safety
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFeatureFlag } from '@/lib/feature-flags/hooks';
import { 
  hasLegacyGoalsData, 
  loadLegacyGoals, 
  saveLegacyGoals,
  migrateGoalsViaAPI,
  fetcher 
} from './client-goals-utils';
import useSWR from 'swr';

interface Goal {
  id: string | number;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string;
  priority?: 'low' | 'medium' | 'high';
  goalType?: string;
  expenses?: Array<{
    name: string;
    amount: number;
    frequency?: string;
  }>;
}

interface UseGoalsSystemResult {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (id: string | number, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string | number) => Promise<void>;
  migrateData: () => Promise<void>;
  isUsingNewSystem: boolean;
  hasLegacyData: boolean;
  migrationStatus: 'pending' | 'in_progress' | 'completed' | 'failed' | null;
}

/**
 * Smart goals hook that routes between legacy and new systems
 */
export function useGoalsSystem(userId?: number): UseGoalsSystemResult {
  const newSystemEnabled = useFeatureFlag('new_goals_system');
  const migrationEnabled = useFeatureFlag('data_migration_enabled');
  
  const [migrationStatus, setMigrationStatus] = useState<UseGoalsSystemResult['migrationStatus']>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasLegacyData, setHasLegacyData] = useState(false);

  // Check for legacy data on mount
  useEffect(() => {
    if (userId) {
      setHasLegacyData(hasLegacyGoalsData(userId));
    }
  }, [userId]);

  // Determine which system to use
  const shouldUseNewSystem = newSystemEnabled && userId;
  
  // New system data fetching
  const { 
    data: newGoalsData, 
    error: newGoalsError, 
    isLoading: newGoalsLoading,
    mutate: mutateNewGoals 
  } = useSWR(
    shouldUseNewSystem ? `/api/financial-goals?userId=${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
      onError: (err) => {
        console.error('New goals system error:', err);
        // Auto-fallback to legacy system on critical errors
        if (err.message?.includes('database') || err.status >= 500) {
          setError('New system temporarily unavailable, using local data');
        }
      }
    }
  );

  // Legacy system data
  const { 
    data: legacyGoalsData, 
    error: legacyGoalsError, 
    isLoading: legacyGoalsLoading,
    mutate: mutateLegacyGoals 
  } = useSWR(
    !shouldUseNewSystem && userId ? `legacy_goals_${userId}` : null,
    () => loadLegacyGoals(userId!),
    { revalidateOnFocus: false }
  );

  // Determine current state
  const isUsingNewSystem = shouldUseNewSystem && !error;
  const goals = isUsingNewSystem ? (newGoalsData?.data?.goals || []) : (legacyGoalsData || []);
  const isLoading = isUsingNewSystem ? newGoalsLoading : legacyGoalsLoading;
  const currentError = error || (isUsingNewSystem ? newGoalsError : legacyGoalsError);

  /**
   * Add a new goal
   */
  const addGoal = useCallback(async (goalData: Omit<Goal, 'id'>) => {
    try {
      setError(null);

      if (isUsingNewSystem) {
        // Use new API
        const response = await fetch('/api/financial-goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...goalData,
            userId,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        await mutateNewGoals(); // Revalidate data
      } else {
        // Use legacy localStorage
        const currentGoals = legacyGoalsData || [];
        const newGoal = {
          ...goalData,
          id: Date.now().toString(),
          createdAt: '2024-01-01T00:00:00.000Z', // ✅ BUGX: Fixed timestamp to prevent infinite re-renders
        };
        
        const updatedGoals = [...currentGoals, newGoal];
        saveLegacyGoals(userId!, updatedGoals);
        await mutateLegacyGoals(); // Revalidate data
      }
    } catch (err) {
      const errorMessage = `Failed to add goal: ${err.message}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isUsingNewSystem, userId, newGoalsData, legacyGoalsData, mutateNewGoals, mutateLegacyGoals]);

  /**
   * Update an existing goal
   */
  const updateGoal = useCallback(async (id: string | number, updates: Partial<Goal>) => {
    try {
      setError(null);

      if (isUsingNewSystem) {
        // Use new API
        const response = await fetch(`/api/financial-goals/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        await mutateNewGoals(); // Revalidate data
      } else {
        // Use legacy localStorage
        const currentGoals = legacyGoalsData || [];
        const updatedGoals = currentGoals.map(goal => 
          goal.id === id ? { ...goal, ...updates, updatedAt: '2024-01-01T00:00:00.000Z' } : goal // ✅ BUGX: Fixed timestamp to prevent infinite re-renders
        );
        
        saveLegacyGoals(userId!, updatedGoals);
        await mutateLegacyGoals(); // Revalidate data
      }
    } catch (err) {
      const errorMessage = `Failed to update goal: ${err.message}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isUsingNewSystem, userId, legacyGoalsData, mutateNewGoals, mutateLegacyGoals]);

  /**
   * Delete a goal
   */
  const deleteGoal = useCallback(async (id: string | number) => {
    try {
      setError(null);

      if (isUsingNewSystem) {
        // Use new API
        const response = await fetch(`/api/financial-goals/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        await mutateNewGoals(); // Revalidate data
      } else {
        // Use legacy localStorage
        const currentGoals = legacyGoalsData || [];
        const updatedGoals = currentGoals.filter(goal => goal.id !== id);
        
        saveLegacyGoals(userId!, updatedGoals);
        await mutateLegacyGoals(); // Revalidate data
      }
    } catch (err) {
      const errorMessage = `Failed to delete goal: ${err.message}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isUsingNewSystem, userId, legacyGoalsData, mutateNewGoals, mutateLegacyGoals]);

  /**
   * Migrate data from legacy to new system
   */
  const migrateData = useCallback(async () => {
    if (!migrationEnabled || !userId || !hasLegacyData) {
      return;
    }

    try {
      setMigrationStatus('in_progress');
      setError(null);

      const result = await migrateGoalsViaAPI(userId);
      
      if (result.success) {
        setMigrationStatus('completed');
        setHasLegacyData(false);
        
        // Refresh new system data
        if (shouldUseNewSystem) {
          await mutateNewGoals();
        }
        
        console.log('✅ Migration completed successfully');
      } else {
        setMigrationStatus('failed');
        setError(`Migration failed: ${result.message}`);
        console.error('Migration failed:', result.message);
      }
    } catch (err) {
      setMigrationStatus('failed');
      setError(`Migration error: ${err.message}`);
      console.error('Migration error:', err);
    }
  }, [migrationEnabled, userId, hasLegacyData, shouldUseNewSystem, mutateNewGoals]);

  // Auto-migrate if conditions are met
  useEffect(() => {
    const shouldAutoMigrate = 
      newSystemEnabled && 
      migrationEnabled && 
      userId && 
      hasLegacyData && 
      migrationStatus === null;

    if (shouldAutoMigrate) {
      console.log('🔄 Auto-migration triggered');
      migrateData();
    }
  }, [newSystemEnabled, migrationEnabled, userId, hasLegacyData, migrationStatus, migrateData]);

  return {
    goals,
    isLoading,
    error: currentError?.message || error,
    addGoal,
    updateGoal,
    deleteGoal,
    migrateData,
    isUsingNewSystem,
    hasLegacyData,
    migrationStatus,
  };
}

