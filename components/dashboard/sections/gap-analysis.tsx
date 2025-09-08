'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';
import { useGoals } from '@/contexts/goals-context';
import { FinancialGoalsModal } from '@/components/goals/financial-goals-modal-stub';

interface GapAnalysisProps {
  stats: {
    funding: {
      won: number;
      potential?: number;
    };
  };
}

export function GapAnalysis({ stats }: GapAnalysisProps) {
  const { getTotalFinancialTarget, getTotalFinancialCurrent, goals, setGoals } = useGoals();
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Use actual financial goals instead of hardcoded value - no fallback for new users
  const EXPECTED_ANNUAL_COST = getTotalFinancialTarget() || 0; // No fallback - new users should set goals first
  const currentFunding = getTotalFinancialCurrent();
  const totalAppliedFor = stats.funding.potential || 0;
  const federalAidEstimate = 0; // Only show if user has financial goals set
  const stateGrantsEstimate = 0; // Only show if user has financial goals set
  const hasFinancialGoals = EXPECTED_ANNUAL_COST > 0;

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="pb-3 bg-transparent">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
            <CardTitle className="text-lg text-green-900 dark:text-green-100">Gap Analysis</CardTitle>
            <div className={`px-2 py-0.5 rounded text-xs font-medium ${
              (stats.funding.won + currentFunding) >= EXPECTED_ANNUAL_COST 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              {(stats.funding.won + currentFunding) >= EXPECTED_ANNUAL_COST ? 'Good coverage' : 'Low coverage'}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-green-700 dark:text-green-300"
            onClick={() => setShowGoalsModal(true)}
          >
            ⟲ Edit Financial Goals
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 bg-transparent">
        {!hasFinancialGoals ? (
          <div className="text-center py-6">
            <div className="text-gray-400 mb-3">
              <Target className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Set Financial Goals First</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              Set your financial goals to see detailed gap analysis and funding recommendations.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Expected Annual Cost */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Expected Annual Cost</span>
                </div>
                <span className="text-sm font-bold text-foreground">{formatCurrency(EXPECTED_ANNUAL_COST)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-gray-500 h-2 rounded-full" style={{width: '100%'}}></div>
              </div>
              <div className="text-right text-xs text-gray-600 dark:text-gray-400">{formatCurrency(EXPECTED_ANNUAL_COST)}</div>
            </div>
            
            {/* Total Applied For */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-blue-700 dark:text-blue-300">Total Applied For</span>
                </div>
                <span className="text-sm font-bold text-blue-900 dark:text-blue-100">{formatCurrency(totalAppliedFor)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{width: `${Math.min((totalAppliedFor / EXPECTED_ANNUAL_COST) * 100, 100)}%`}}
                ></div>
              </div>
              <div className="text-right text-xs text-blue-600">{formatCurrency(Math.min(totalAppliedFor, EXPECTED_ANNUAL_COST))}</div>
            </div>
            
            {/* Amount Won */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-700 dark:text-green-300">Amount Won</span>
                </div>
                <span className="text-sm font-bold text-green-900 dark:text-green-100">{formatCurrency(stats.funding.won)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{width: `${Math.min((stats.funding.won / EXPECTED_ANNUAL_COST) * 100, 100)}%`}}
                ></div>
              </div>
              <div className="text-right text-xs text-green-600">{formatCurrency(Math.min(stats.funding.won, EXPECTED_ANNUAL_COST))}</div>
            </div>

            {/* Federal Aid & State Grants */}
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-green-200 dark:border-green-700">
                <span className="text-xs text-muted-foreground">Federal Aid (est.)</span>
                <span className="text-sm font-medium text-blue-600">{formatCurrency(federalAidEstimate)}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-green-200 dark:border-green-700">
                <span className="text-xs text-muted-foreground">State Grants (est.)</span>
                <span className="text-sm font-medium text-purple-600">{formatCurrency(stateGrantsEstimate)}</span>
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
        mode="planning"
      />
    </Card>
  );
}