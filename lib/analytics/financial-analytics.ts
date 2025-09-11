/**
 * Financial Analytics Service
 * 
 * Integrates real financial goals data with dashboard analytics,
 * providing comprehensive calculations and insights.
 */

import { FinancialGoal } from '@/lib/db/schema-financial-goals';

export interface FinancialMetrics {
  // Core Metrics
  totalTargetAmount: number;
  totalCurrentAmount: number;
  totalFundingGap: number;
  progressPercentage: number;
  
  // Scholarship Integration
  scholarshipAmountWon: number;
  scholarshipAmountPotential: number;
  scholarshipApplications: number;
  
  // Detailed Breakdown
  expenseBreakdown: {
    tuition: number;
    roomAndBoard: number;
    books: number;
    transportation: number;
    personal: number;
    fees: number;
    other: number;
  };
  
  fundingBreakdown: {
    scholarships: number;
    federalAid: number;
    stateAid: number;
    familyContribution: number;
    loans: number;
    workStudy: number;
    other: number;
  };
  
  // Analytics Insights
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  completionProbability: number;
  recommendedActions: string[];
  warningFlags: string[];
}

export interface ScholarshipStats {
  funding: {
    won: number;
    potential: number;
  };
  applications: {
    total: number;
    submitted: number;
    accepted: number;
    rejected: number;
  };
}

export class FinancialAnalyticsService {
  
  /**
   * Calculate comprehensive financial metrics from goals and scholarship data
   */
  static calculateMetrics(
    financialGoals: FinancialGoal[], 
    scholarshipStats: ScholarshipStats
  ): FinancialMetrics {
    // Aggregate all active financial goals
    const activeGoals = financialGoals.filter(goal => goal.status === 'active');
    
    // Calculate totals from database goals
    const totalTargetAmount = activeGoals.reduce((sum, goal) => sum + (goal.targetAmount || 0), 0);
    const totalCurrentAmount = scholarshipStats.funding.won + this.calculateFamilyContribution(activeGoals);
    const totalFundingGap = Math.max(0, totalTargetAmount - totalCurrentAmount);
    const progressPercentage = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;
    
    // Calculate expense breakdown from goals
    const expenseBreakdown = this.calculateExpenseBreakdown(activeGoals);
    
    // Calculate funding breakdown
    const fundingBreakdown = this.calculateFundingBreakdown(activeGoals, scholarshipStats);
    
    // Calculate risk and insights
    const riskLevel = this.calculateRiskLevel(totalFundingGap, totalTargetAmount, progressPercentage);
    const completionProbability = this.calculateCompletionProbability(activeGoals, scholarshipStats);
    const recommendedActions = this.generateRecommendedActions(activeGoals, scholarshipStats, riskLevel);
    const warningFlags = this.generateWarningFlags(activeGoals, scholarshipStats);
    
    return {
      totalTargetAmount,
      totalCurrentAmount,
      totalFundingGap,
      progressPercentage,
      scholarshipAmountWon: scholarshipStats.funding.won,
      scholarshipAmountPotential: scholarshipStats.funding.potential,
      scholarshipApplications: scholarshipStats.applications.total,
      expenseBreakdown,
      fundingBreakdown,
      riskLevel,
      completionProbability,
      recommendedActions,
      warningFlags
    };
  }
  
  /**
   * Calculate expense breakdown from financial goals
   */
  private static calculateExpenseBreakdown(goals: FinancialGoal[]) {
    const breakdown = {
      tuition: 0,
      roomAndBoard: 0,
      books: 0,
      transportation: 0,
      personal: 0,
      fees: 0,
      other: 0
    };
    
    goals.forEach(goal => {
      if (goal.expenses) {
        goal.expenses.forEach(expense => {
          const category = this.mapExpenseToCategory(expense.name);
          breakdown[category] += expense.amount || 0;
        });
      }
    });
    
    return breakdown;
  }
  
  /**
   * Calculate funding breakdown from goals and scholarship data
   */
  private static calculateFundingBreakdown(goals: FinancialGoal[], scholarshipStats: ScholarshipStats) {
    const breakdown = {
      scholarships: scholarshipStats.funding.won,
      federalAid: 0,
      stateAid: 0,
      familyContribution: 0,
      loans: 0,
      workStudy: 0,
      other: 0
    };
    
    goals.forEach(goal => {
      if (goal.fundingSources) {
        goal.fundingSources.forEach(source => {
          const category = this.mapFundingToCategory(source.sourceType);
          breakdown[category] += source.amount || 0;
        });
      }
    });
    
    return breakdown;
  }
  
  /**
   * Calculate family contribution from goals
   */
  private static calculateFamilyContribution(goals: FinancialGoal[]): number {
    return goals.reduce((sum, goal) => {
      const familyContribution = goal.fundingSources?.find(source => 
        source.sourceType === 'family' || source.sourceName.toLowerCase().includes('family')
      );
      return sum + (familyContribution?.amount || 0);
    }, 0);
  }
  
  /**
   * Map expense names to standard categories
   */
  private static mapExpenseToCategory(expenseName: string): keyof FinancialMetrics['expenseBreakdown'] {
    const name = expenseName.toLowerCase();
    
    if (name.includes('tuition') || name.includes('academic')) return 'tuition';
    if (name.includes('room') || name.includes('board') || name.includes('housing') || name.includes('dorm')) return 'roomAndBoard';
    if (name.includes('book') || name.includes('textbook') || name.includes('supply')) return 'books';
    if (name.includes('transport') || name.includes('travel') || name.includes('gas') || name.includes('car')) return 'transportation';
    if (name.includes('personal') || name.includes('entertainment') || name.includes('food')) return 'personal';
    if (name.includes('fee') || name.includes('technology') || name.includes('activity')) return 'fees';
    
    return 'other';
  }
  
  /**
   * Map funding source types to standard categories
   */
  private static mapFundingToCategory(sourceType: string): keyof FinancialMetrics['fundingBreakdown'] {
    const type = sourceType.toLowerCase();
    
    if (type.includes('scholarship') || type.includes('grant_private')) return 'scholarships';
    if (type.includes('federal') || type.includes('pell') || type.includes('stafford')) return 'federalAid';
    if (type.includes('state') || type.includes('cal_grant')) return 'stateAid';
    if (type.includes('family') || type.includes('parent') || type.includes('personal')) return 'familyContribution';
    if (type.includes('loan')) return 'loans';
    if (type.includes('work') || type.includes('job')) return 'workStudy';
    
    return 'other';
  }
  
  /**
   * Calculate funding risk level
   */
  private static calculateRiskLevel(
    fundingGap: number, 
    targetAmount: number, 
    progressPercentage: number
  ): FinancialMetrics['riskLevel'] {
    if (progressPercentage >= 90) return 'low';
    if (progressPercentage >= 70) return 'medium';
    if (progressPercentage >= 40) return 'high';
    return 'critical';
  }
  
  /**
   * Calculate probability of meeting financial goals
   */
  private static calculateCompletionProbability(
    goals: FinancialGoal[], 
    scholarshipStats: ScholarshipStats
  ): number {
    const baseScore = 50; // Start with 50%
    
    // Add points for secured funding
    const securedFundingScore = Math.min(30, (scholarshipStats.funding.won / 10000) * 10);
    
    // Add points for potential funding
    const potentialFundingScore = Math.min(20, (scholarshipStats.funding.potential / 20000) * 10);
    
    // Add points for application activity
    const applicationScore = Math.min(15, scholarshipStats.applications.total * 2);
    
    // Deduct points for missed deadlines or high expenses
    const riskPenalty = goals.some(goal => 
      goal.deadline && new Date(goal.deadline) < new Date()
    ) ? -10 : 0;
    
    return Math.max(0, Math.min(100, baseScore + securedFundingScore + potentialFundingScore + applicationScore + riskPenalty));
  }
  
  /**
   * Generate actionable recommendations
   */
  private static generateRecommendedActions(
    goals: FinancialGoal[], 
    scholarshipStats: ScholarshipStats, 
    riskLevel: FinancialMetrics['riskLevel']
  ): string[] {
    const actions: string[] = [];
    
    if (riskLevel === 'critical') {
      actions.push('Apply for emergency financial aid');
      actions.push('Consider reducing expenses or changing plans');
      actions.push('Explore additional funding sources immediately');
    }
    
    if (scholarshipStats.applications.total < 5) {
      actions.push('Apply to more scholarships - aim for at least 10 applications');
    }
    
    if (scholarshipStats.funding.potential < 20000) {
      actions.push('Research higher-value scholarship opportunities');
    }
    
    if (goals.length === 0) {
      actions.push('Create detailed financial goals to track progress');
    }
    
    return actions;
  }
  
  /**
   * Generate warning flags
   */
  private static generateWarningFlags(
    goals: FinancialGoal[], 
    scholarshipStats: ScholarshipStats
  ): string[] {
    const warnings: string[] = [];
    
    const totalTarget = goals.reduce((sum, goal) => sum + (goal.targetAmount || 0), 0);
    const fundingGap = totalTarget - scholarshipStats.funding.won;
    
    if (fundingGap > 50000) {
      warnings.push('Large funding gap may require additional planning');
    }
    
    if (scholarshipStats.applications.total > 0 && scholarshipStats.funding.won === 0) {
      warnings.push('No scholarships awarded yet - review application strategy');
    }
    
    goals.forEach(goal => {
      if (goal.deadline && new Date(goal.deadline) < new Date()) {
        warnings.push(`Goal "${goal.title}" has passed its deadline`);
      }
    });
    
    return warnings;
  }
  
  /**
   * Convert legacy scholarship stats to new format
   */
  static convertScholarshipStats(legacyStats: any): ScholarshipStats {
    return {
      funding: {
        won: legacyStats.funding?.won || 0,
        potential: legacyStats.funding?.potential || 0
      },
      applications: {
        total: legacyStats.applications?.total || 0,
        submitted: legacyStats.applications?.submitted || 0,
        accepted: legacyStats.applications?.accepted || 0,
        rejected: legacyStats.applications?.rejected || 0
      }
    };
  }
}