'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';
import { useGoals } from '@/contexts/goals-context';
import { FinancialGoalsModal } from '@/components/goals/financial-goals-modal-stub';

interface FinancialProgressProps {
  stats: {
    funding: {
      won: number;
    };
  };
}

export function FinancialProgress({ stats }: FinancialProgressProps) {
  const { goals, setGoals, getTotalFinancialTarget, getTotalFinancialCurrent } = useGoals();
  const [showGoalsModal, setShowGoalsModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Use goals context for dynamic funding target - no fallback for new users
  const FUNDING_GOAL = getTotalFinancialTarget() || 0; // No fallback - new users should set goals first
  const currentFunding = getTotalFinancialCurrent();
  const totalFunding = stats.funding.won + currentFunding;
  const fundingGap = Math.max(0, FUNDING_GOAL - totalFunding);
  const progressPercentage = FUNDING_GOAL > 0 ? Math.round((totalFunding / FUNDING_GOAL) * 100) : 0;
  const isGoalExceeded = progressPercentage >= 100;
  const excessAmount = Math.max(0, totalFunding - FUNDING_GOAL);
  const hasFinancialGoals = FUNDING_GOAL > 0;

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="pb-3 bg-transparent">
        <div>
          <CardTitle className="text-lg text-green-900 dark:text-green-100">Financial Progress & Analytics</CardTitle>
          <CardDescription className="text-sm text-green-700 dark:text-green-300">College Funding Goal & Comprehensive Breakdown</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0 bg-transparent">
        {!hasFinancialGoals ? (
          <div className="text-center py-6">
            <div className="text-gray-400 mb-3">
              <Target className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Set Your Financial Goals</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              Define your college funding targets to track your progress and see meaningful analytics.
            </p>
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setShowGoalsModal(true)}
            >
              <Target className="h-4 w-4 mr-2" />
              Set Goals
            </Button>
          </div>
        ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
            <h3 className="text-base font-semibold text-green-900 dark:text-green-100">Funding Progress</h3>
            <div className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${
              isGoalExceeded 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
            }`}>
              {isGoalExceeded ? `🎉 ${progressPercentage}% Exceeded!` : `${progressPercentage}% Covered`}
            </div>
          </div>
          
          <div className="space-y-1.5">
            <p className={`text-xs ${
              isGoalExceeded 
                ? 'text-green-700 dark:text-green-300' 
                : 'text-green-700 dark:text-green-300'
            }`}>
              {isGoalExceeded ? '🎯 Goal Exceeded - Excellent!' : 'Financial Goal Achievement'}
            </p>
            <div className="relative">
              <Progress 
                value={Math.min(progressPercentage, 100)} 
                className={`h-2.5 ${
                  isGoalExceeded ? '[&>div]:bg-green-500' : ''
                }`} 
              />
              {isGoalExceeded && (
                <div className="absolute right-0 top-0 h-2.5 bg-green-600 rounded-r-full animate-pulse" 
                     style={{width: `${Math.min((progressPercentage - 100) / 2, 20)}%`}}>
                </div>
              )}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(totalFunding)} / {formatCurrency(FUNDING_GOAL)}</span>
              {isGoalExceeded && (
                <span className="text-green-600 font-medium">+{formatCurrency(excessAmount)} extra</span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-white/50 dark:bg-gray-800/50 rounded p-2.5 border border-green-200 dark:border-green-700">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-green-600 dark:text-green-400">⛁</span>
                <span className="text-xs text-green-700 dark:text-green-300">Amount Won</span>
              </div>
              <p className="text-lg font-bold text-green-900 dark:text-green-100">{formatCurrency(totalFunding)}</p>
            </div>
            
            <div className={`bg-white/50 dark:bg-gray-800/50 rounded p-2.5 border ${
              isGoalExceeded 
                ? 'border-green-200 dark:border-green-700' 
                : 'border-orange-200 dark:border-orange-700'
            }`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className={isGoalExceeded 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-orange-600 dark:text-orange-400'
                }>
                  {isGoalExceeded ? '🎉' : '⛗'}
                </span>
                <span className={`text-xs ${
                  isGoalExceeded 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-orange-700 dark:text-orange-300'
                }`}>
                  {isGoalExceeded ? 'Excess Funding' : 'Funding Gap'}
                </span>
              </div>
              <p className={`text-lg font-bold ${
                isGoalExceeded 
                  ? 'text-green-900 dark:text-green-100' 
                  : 'text-orange-900 dark:text-orange-100'
              }`}>
                {formatCurrency(isGoalExceeded ? excessAmount : fundingGap)}
              </p>
            </div>
          </div>
        </div>
        )}
      </CardContent>
      
      <FinancialGoalsModal
        isOpen={showGoalsModal}
        onClose={() => setShowGoalsModal(false)}
        onSaveGoals={(financialGoals) => setGoals({ ...goals, financial: financialGoals })}
        initialGoals={goals.financial}
        mode="edit"
      />
    </Card>
  );
}