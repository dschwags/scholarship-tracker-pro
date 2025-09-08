'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoalsData, Goal, FinancialGoal } from '@/components/goals/goals-types';

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
            amount: 6000,
            awarded: true,
            renewable: true,
            academicRequirements: 'Maintain SAP (2.0 GPA minimum)'
          },
          subsidizedLoans: {
            amount: 3500,
            interestRate: 5.50
          },
          unsubsidizedLoans: {
            amount: 2000,
            interestRate: 5.50
          },
          workStudy: {
            amount: 2500,
            hoursPerWeek: 15,
            hourlyRate: 12.50
          },
          other: {
            amount: 0,
            description: ''
          }
        },
        stateGrants: {
          needBased: {
            amount: 2000,
            programName: 'State Need Grant',
            renewable: true,
            requirements: 'FAFSA renewal and state residency'
          },
          meritBased: {
            amount: 1500,
            programName: 'Academic Excellence Award',
            gpaRequirement: 3.5,
            renewable: true
          },
          other: {
            amount: 0,
            description: ''
          }
        },
        scholarships: [
          {
            id: 'scholarship-1',
            name: 'Engineering Excellence Scholarship',
            amount: 5000,
            duration: 'annual',
            isRenewable: true,
            renewalRequirements: {
              minGPA: 3.2,
              fullTimeEnrollment: true,
              majorRequirement: 'Engineering or Computer Science',
              communityService: false,
              additionalRequirements: 'Complete 30 credits per year'
            },
            awardDate: '2024-04-15',
            disbursementSchedule: {
              fall: 2500,
              spring: 2500
            },
            status: 'awarded',
            academicYears: ['2024-2025', '2025-2026', '2026-2027', '2027-2028'],
            requirementsMet: true,
            currentGPA: 3.4,
            notes: 'Must maintain engineering major and complete annual community service report'
          }
        ],
        familyContribution: {
          amount: 8000,
          expectedFamilyContribution: 12000,
          parentContribution: 6000,
          studentContribution: 2000,
          studentSavings: 0
        },
        employment: {
          amount: 3000,
          jobType: 'part-time',
          hoursPerWeek: 12,
          hourlyRate: 15.00
        }
      },
      
      // School information
      schoolInfo: {
        name: 'State University',
        state: 'California',
        isInState: false,
        costOfLiving: 'high'
      },
      
      // Calculated totals
      totalExpenses: 46000,
      totalFunding: 35500,
      remainingGap: 10500
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
      personalCategory: 'health',
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

  // Load goals from localStorage on mount
  useEffect(() => {
    const savedGoals = localStorage.getItem('scholarship-tracker-goals');
    if (savedGoals) {
      try {
        setGoalsState(JSON.parse(savedGoals));
      } catch (error) {
        console.error('Error loading goals from localStorage:', error);
      }
    }
  }, []);

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
      newGoals[updatedGoal.type][goalIndex] = updatedGoal as any;
      setGoals(newGoals);
    }
  };

  const deleteGoal = (type: Goal['type'], id: string) => {
    const newGoals = { ...goals };
    newGoals[type] = newGoals[type].filter(g => g.id !== id);
    setGoals(newGoals);
  };

  const addGoal = (newGoal: Goal) => {
    const newGoals = { ...goals };
    newGoals[newGoal.type].push(newGoal as any);
    setGoals(newGoals);
  };

  const getGoalById = (id: string): Goal | undefined => {
    for (const type of Object.keys(goals) as (keyof GoalsData)[]) {
      const goal = goals[type].find(g => g.id === id);
      if (goal) return goal as Goal;
    }
    return undefined;
  };

  const getActiveGoals = (): Goal[] => {
    const allGoals: Goal[] = [];
    Object.values(goals).forEach(typeGoals => {
      allGoals.push(...(typeGoals.filter(g => g.isActive) as Goal[]));
    });
    return allGoals;
  };

  const getGoalsByType = (type: Goal['type']): Goal[] => {
    return goals[type] as Goal[];
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
    isLoading
  };

  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  );
}

export function useGoals() {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
}