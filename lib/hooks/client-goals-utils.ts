/**
 * Client-side utilities for goals system
 * Safe functions that don't import server-side code
 */

'use client';

interface LegacyGoal {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  expenses?: Array<{
    name: string;
    amount: number;
    frequency?: string;
  }>;
  type?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Check if user has legacy goals data in localStorage (client-safe)
 */
export function hasLegacyGoalsData(userId: number): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const possibleKeys = [
      `financial_goals_${userId}`,
      `goals_${userId}`,
      'financial_goals',
      'goals',
      'user_goals'
    ];
    
    for (const key of possibleKeys) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return true;
          }
          if (parsed?.goals && Array.isArray(parsed.goals) && parsed.goals.length > 0) {
            return true;
          }
        } catch (parseError) {
          console.warn(`Failed to parse localStorage key ${key}:`, parseError);
        }
      }
    }
    
    return false;
  } catch (error) {
    console.warn('Error checking legacy goals data:', error);
    return false;
  }
}

/**
 * Load legacy goals from localStorage (client-safe)
 */
export function loadLegacyGoals(userId: number): LegacyGoal[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const possibleKeys = [
      `financial_goals_${userId}`,
      `goals_${userId}`,
      'financial_goals',
      'goals'
    ];
    
    for (const key of possibleKeys) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          
          // Handle different data structures
          if (Array.isArray(parsed)) {
            return parsed;
          }
          
          if (parsed?.goals && Array.isArray(parsed.goals)) {
            return parsed.goals;
          }
        } catch (parseError) {
          console.warn(`Failed to parse localStorage key ${key}:`, parseError);
        }
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error loading legacy goals:', error);
    return [];
  }
}

/**
 * Save legacy goals to localStorage (client-safe)
 */
export function saveLegacyGoals(userId: number, goals: LegacyGoal[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = `financial_goals_${userId}`;
    const data = {
      goals,
      metadata: {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        totalGoals: goals.length,
      }
    };
    
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`Saved ${goals.length} goals to localStorage`);
  } catch (error) {
    console.error('Error saving legacy goals:', error);
    throw new Error('Failed to save goals to localStorage');
  }
}

/**
 * Migrate data via API call (client-safe)
 */
export async function migrateGoalsViaAPI(userId: number): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/migrate-goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Migration failed: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Migration API error:', error);
    return { 
      success: false, 
      message: `Migration failed: ${error.message}` 
    };
  }
}

/**
 * SWR fetcher function for client-side data fetching
 */
export const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.') as any;
    error.info = await response.json();
    error.status = response.status;
    throw error;
  }
  return response.json();
};