'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GoalsData, Goal, FinancialGoal } from '@/components/goals/goals-types';
import { useFeatureFlag } from '@/lib/feature-flags/hooks';
import { useGoalsSystem } from '@/lib/hooks/use-goals-system';
import useSWR from 'swr';

interface GoalsContextType {
  goals: GoalsData;
  setGoals: (goals: GoalsData) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (type: Goal['type'], id: string) => void;
  addGoal: (goal: Goal) => void;
  getGoalById: (id: string) => Goal | undefined;
  getActiveGoals: () => Goal[];
  getGoalsByType: (type: Goal['type']) => Goal[];
  getTotalFinancialTarget: () => number;
  getTotalFinancialCurrent: () => number;
  getOverallProgress: () => number;
  isLoading: boolean;
  
  // New system features
  isUsingNewSystem: boolean;
  hasLegacyData: boolean;
  migrationStatus: 'pending' | 'in_progress' | 'completed' | 'failed' | null;
  migrateToNewSystem: () => Promise<void>;
  systemError: string | null;
  
  // Server-side data initialization
  initializeWithServerData: (serverGoals: any[]) => void;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

const defaultGoalsData: GoalsData = {
  financial: [
    {
      id: 'financial-1',
      type: 'financial',
      title: '2024-2025 Academic Year Funding',
      description: 'Complete funding plan for sophomore year including all expenses and funding sources',
      priority: 'high',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      
      // Enhanced fields
      scope: 'annual',
      academicYear: '2024-2025',
      calculationMethod: 'detailed-breakdown',
      
      // Detailed expense breakdown
      expenses: {
        tuition: {
          amount: 28000,
          inStateRate: 15000,
          outOfStateRate: 28000,
          currentlyInState: false
        },
        roomAndBoard: {
          amount: 12000,
          housingType: 'dorm',
          mealPlan: 4500
        },
        books: {
          amount: 1200,
          estimatePerSemester: 600
        },
        transportation: {
          amount: 800,
          type: 'flights'
        },
        personal: {
          amount: 2000,
          monthlyEstimate: 200
        },
        fees: {
          amount: 1500,
          breakdown: ['Student Activities', 'Technology Fee', 'Health Center']
        },
        other: {
          amount: 500,
          description: 'Emergency fund and misc expenses'
        }
      },
      
      // Detailed funding sources
      fundingSources: {
        federalAid: {
          pellGrant: {
            amount: 0,
            awarded: false,
            renewable: false,
            academicRequirements: ''
          },
          subsidizedLoans: {
            amount: 0,
            interestRate: 0
          },
          unsubsidizedLoans: {
            amount: 0,
            interestRate: 0
          },
          workStudy: {
            amount: 0,
            hoursPerWeek: 0,
            hourlyRate: 0
          },
          other: {
            amount: 0,
            description: ''
          }
        },
        stateGrants: {
          needBased: {
            amount: 0,
            programName: '',
            renewable: false,
            requirements: ''
          },
          meritBased: {
            amount: 0,
            programName: '',
            gpaRequirement: 0,
            renewable: false
          },
          other: {
            amount: 0,
            description: ''
          }
        },
        scholarships: [],
        familyContribution: {
          amount: 0,
          expectedFamilyContribution: 0,
          parentContribution: 0,
          studentContribution: 0,
          studentSavings: 0
        },
        employment: {
          amount: 0,
          jobType: 'part-time' as const,
          hoursPerWeek: 0,
          hourlyRate: 0
        }
      },
      
      // School information
      schoolInfo: {
        name: 'State University',
        state: 'California',
        isInState: false,
        costOfLiving: 'high'
      },
      
      // Calculated totals - no fake data
      totalExpenses: 0,
      totalFunding: 0,
      remainingGap: 0
    }
  ],
  academic: [
    {
      id: 'academic-1',
      type: 'academic',
      title: 'Maintain High GPA',
      targetGPA: 3.7,
      currentGPA: 3.4,
      targetGraduationDate: '2026-05-15',
      major: 'Computer Science',
      description: 'Achieve and maintain a high GPA for graduate school applications',
      priority: 'high',
      milestones: [
        {
          id: 'milestone-1',
          title: 'Complete Spring Semester',
          deadline: '2024-05-15',
          completed: true,
          description: 'Finish all spring courses with high grades'
        },
        {
          id: 'milestone-2',
          title: 'Summer Internship',
          deadline: '2024-08-15',
          completed: false,
          description: 'Complete software engineering internship'
        }
      ],
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ],
  career: [
    {
      id: 'career-1',
      type: 'career',
      title: 'Software Engineer Position',
      targetPosition: 'Senior Software Engineer',
      targetCompany: 'Tech Company',
      targetIndustry: 'Technology',
      targetSalary: 85000,
      deadline: '2026-06-01',
      description: 'Land a senior software engineer position at a reputable tech company',
      priority: 'high',
      skills: [
        {
          id: 'skill-1',
          skill: 'React',
          currentLevel: 'intermediate',
          targetLevel: 'advanced',
          priority: 'high',
          completed: false
        },
        {
          id: 'skill-2',
          skill: 'Python',
          currentLevel: 'beginner',
          targetLevel: 'intermediate',
          priority: 'medium',
          completed: false
        }
      ],
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ],
  personal: [
    {
      id: 'personal-1',
      type: 'personal',
      title: 'Health & Wellness',
      description: 'Maintain physical and mental health throughout college',
      deadline: '2024-12-31',
      priority: 'medium',
      category: 'health',
      isActive: true,
      progress: 65,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ]
};

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoalsState] = useState<GoalsData>(defaultGoalsData);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get user data for new system integration (OPTIMIZED)
  const { data: userData } = useSWR('/api/user', null, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    dedupingInterval: 30000 // 30 seconds
  });
  const userId = userData?.id;
  
  // Feature flags and new system integration
  const newSystemEnabled = useFeatureFlag('new_goals_system');
  const {
    goals: newSystemGoals,
    isLoading: newSystemLoading,
    error: newSystemError,
    addGoal: addNewGoal,
    updateGoal: updateNewGoal, 
    deleteGoal: deleteNewGoal,
    migrateData,
    isUsingNewSystem,
    hasLegacyData,
    migrationStatus
  } = useGoalsSystem(userId);

  // Determine which system to use and merge data
  useEffect(() => {
    if (isUsingNewSystem && newSystemGoals !== undefined) {
      // Convert new system goals to legacy format for compatibility (including empty arrays)
      const convertedGoals = convertNewGoalsToLegacyFormat(newSystemGoals);
      console.log('🔄 GoalsContext: Using new system data', { goalCount: newSystemGoals.length, convertedGoals });
      setGoalsState(convertedGoals);
    } else if (!isUsingNewSystem) {
      // Load legacy goals from localStorage only if not using new system
      const savedGoals = localStorage.getItem('scholarship-tracker-goals');
      if (savedGoals) {
        try {
          console.log('📂 GoalsContext: Using localStorage data');
          setGoalsState(JSON.parse(savedGoals));
        } catch (error) {
          console.error('Error loading goals from localStorage:', error);
        }
      }
    }
    // Note: If isUsingNewSystem is true but newSystemGoals is undefined (still loading), do nothing
  }, [isUsingNewSystem, newSystemGoals]);

  // Save goals to localStorage whenever goals change
  const setGoals = (newGoals: GoalsData) => {
    setGoalsState(newGoals);
    try {
      localStorage.setItem('scholarship-tracker-goals', JSON.stringify(newGoals));
    } catch (error) {
      console.error('Error saving goals to localStorage:', error);
    }
  };

  const updateGoal = (updatedGoal: Goal) => {
    const newGoals = { ...goals };
    const goalIndex = newGoals[updatedGoal.type].findIndex(g => g.id === updatedGoal.id);
    
    if (goalIndex !== -1) {
      newGoals[updatedGoal.type][goalIndex] = updatedGoal;
      setGoals(newGoals);
    }
  };

  const deleteGoal = (type: Goal['type'], id: string) => {
    const newGoals = { ...goals };
    (newGoals[type] as Goal[]) = (newGoals[type] as Goal[]).filter(g => g.id !== id);
    setGoals(newGoals);
  };

  const addGoal = async (newGoal: Goal) => {
    if (isUsingNewSystem && newGoal.type === 'financial') {
      // Use new system for financial goals
      try {
        await addNewGoal({
          title: newGoal.title,
          description: newGoal.description,
          targetAmount: newGoal.targetAmount || 0,
          deadline: newGoal.deadline,
          priority: newGoal.priority,
          goalType: 'education',
        });
      } catch (error) {
        console.error('Failed to add goal to new system:', error);
        // Fallback to legacy system
        const newGoals = { ...goals };
        (newGoals[newGoal.type] as Goal[]).push(newGoal as Goal);
        setGoals(newGoals);
      }
    } else {
      // Use legacy system for non-financial goals or when new system is disabled
      const newGoals = { ...goals };
      (newGoals[newGoal.type] as Goal[]).push(newGoal as Goal);
      setGoals(newGoals);
    }
  };

  const getGoalById = (id: string): Goal | undefined => {
    for (const type of Object.keys(goals) as (keyof GoalsData)[]) {
      const goal = goals[type].find(g => g.id === id);
      if (goal) return goal;
    }
    return undefined;
  };

  const getActiveGoals = (): Goal[] => {
    const allGoals: Goal[] = [];
    Object.values(goals).forEach(typeGoals => {
      allGoals.push(...typeGoals.filter((g: Goal) => g.isActive));
    });
    return allGoals;
  };

  const getGoalsByType = (type: Goal['type']): Goal[] => {
    return goals[type];
  };

  const getTotalFinancialTarget = (): number => {
    return goals.financial
      .filter(g => g.isActive)
      .reduce((total, goal) => {
        // Use totalExpenses for enhanced goals, fallback to targetAmount for legacy goals
        return total + (goal.totalExpenses || goal.targetAmount || 0);
      }, 0);
  };

  const getTotalFinancialCurrent = (): number => {
    return goals.financial
      .filter(g => g.isActive)
      .reduce((total, goal) => {
        // Use totalFunding for enhanced goals, fallback to currentAmount for legacy goals
        return total + (goal.totalFunding || goal.currentAmount || 0);
      }, 0);
  };

  const getOverallProgress = (): number => {
    const activeGoals = getActiveGoals();
    if (activeGoals.length === 0) return 0;

    const totalProgress = activeGoals.reduce((sum, goal) => {
      if (goal.type === 'financial') {
        const target = goal.totalExpenses || goal.targetAmount || 1;
        const current = goal.totalFunding || goal.currentAmount || 0;
        return sum + Math.min(100, (current / target) * 100);
      } else if (goal.type === 'academic') {
        return sum + Math.min(100, (goal.currentGPA / goal.targetGPA) * 100);
      } else if (goal.type === 'personal') {
        return sum + goal.progress;
      } else if (goal.type === 'career') {
        const completedSkills = goal.skills.filter(s => s.completed).length;
        return sum + (goal.skills.length > 0 ? (completedSkills / goal.skills.length) * 100 : 0);
      }
      return sum;
    }, 0);

    return Math.round(totalProgress / activeGoals.length);
  };
  
  // Server-side data initialization method (memoized to prevent infinite re-renders)
  const initializeWithServerData = useCallback((serverGoals: any[]) => {
    console.log('🔄 GoalsContext: initializeWithServerData called with:', {
      serverGoalsCount: serverGoals.length,
      isUsingNewSystem,
      currentGoalsCount: goals.financial.length
    });
    
    if (serverGoals && serverGoals.length >= 0) {
      // Convert server goals to legacy format and set immediately
      const convertedGoals = convertNewGoalsToLegacyFormat(serverGoals);
      console.log('✅ GoalsContext: Server data converted and applied:', {
        financialGoalsCount: convertedGoals.financial.length,
        convertedGoals
      });
      setGoalsState(convertedGoals);
    }
  }, [isUsingNewSystem, goals.financial.length]); // ✅ BUGX: Memoized with stable deps

  const value: GoalsContextType = {
    goals,
    setGoals,
    updateGoal,
    deleteGoal,
    addGoal,
    getGoalById,
    getActiveGoals,
    getGoalsByType,
    getTotalFinancialTarget,
    getTotalFinancialCurrent,
    getOverallProgress,
    isLoading: isLoading || newSystemLoading,
    
    // New system features
    isUsingNewSystem,
    hasLegacyData,
    migrationStatus,
    migrateToNewSystem: migrateData,
    systemError: newSystemError,
    
    // Server-side data initialization
    initializeWithServerData
  };

  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  );
}

/**
 * Convert new system goals to legacy GoalsData format for backward compatibility
 */
function convertNewGoalsToLegacyFormat(newGoals: any[]): GoalsData {
  const legacyGoals: GoalsData = {
    financial: [],
    academic: [],
    career: [],
    personal: []
  };

  newGoals.forEach(goal => {
    // Convert new system goal to legacy financial goal format
    const legacyGoal: FinancialGoal = {
      id: goal.id.toString(),
      type: 'financial',
      title: goal.title,
      description: goal.description || '',
      targetAmount: parseFloat(goal.targetAmount) || 0,
      currentAmount: parseFloat(goal.currentAmount) || 0,
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : undefined,
      priority: goal.priority || 'medium',
      isActive: goal.status === 'active',
      createdAt: goal.createdAt || '2024-01-01T00:00:00.000Z', // ✅ BUGX: Fixed timestamp to prevent infinite re-renders
      updatedAt: goal.updatedAt || '2024-01-01T00:00:00.000Z', // ✅ BUGX: Fixed timestamp to prevent infinite re-renders
      
      // Enhanced fields from new system
      scope: 'annual',
      academicYear: goal.academicYear || '2024-2025',
      calculationMethod: goal.calculationMethod || 'detailed-breakdown',
      
      // Default expense structure (can be enhanced later)
      expenses: {
        tuition: { amount: 0, inStateRate: 0, outOfStateRate: 0, currentlyInState: true },
        roomAndBoard: { amount: 0, housingType: 'dorm', mealPlan: 0 },
        books: { amount: 0, estimatePerSemester: 0 },
        transportation: { amount: 0, type: 'car' },
        personal: { amount: 0, monthlyEstimate: 0 },
        fees: { amount: 0, breakdown: [] },
        other: { amount: 0, description: '' }
      },
      
      // Default funding sources (can be enhanced later)
      fundingSources: {
        federalAid: {
          pellGrant: { amount: 0, awarded: false, renewable: false, academicRequirements: '' },
          subsidizedLoans: { amount: 0, interestRate: 0 },
          unsubsidizedLoans: { amount: 0, interestRate: 0 },
          workStudy: { amount: 0, hoursPerWeek: 0, hourlyRate: 0 },
          other: { amount: 0, description: '' }
        },
        stateGrants: {
          needBased: { amount: 0, programName: '', renewable: false, requirements: '' },
          meritBased: { amount: 0, programName: '', gpaRequirement: 0, renewable: false },
          other: { amount: 0, description: '' }
        },
        scholarships: [],
        familyContribution: {
          amount: 0,
          expectedFamilyContribution: 0,
          parentContribution: 0,
          studentContribution: 0
        }
      },
      
      // Calculated fields
      totalExpenses: parseFloat(goal.targetAmount) || 0,
      totalFunding: parseFloat(goal.currentAmount) || 0,
      fundingGap: (parseFloat(goal.targetAmount) || 0) - (parseFloat(goal.currentAmount) || 0),
      
      // AI and validation fields
      aiConfidenceScore: parseFloat(goal.aiConfidenceScore) || 0.5,
      needsHumanReview: goal.needsHumanReview || false,
      validationWarnings: goal.validationWarnings || [],
      lastValidated: goal.lastValidated || '2024-01-01T00:00:00.000Z' // ✅ BUGX: Fixed timestamp to prevent infinite re-renders
    };
    
    legacyGoals.financial.push(legacyGoal);
  });

  return legacyGoals;
}

export function useGoals() {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
}