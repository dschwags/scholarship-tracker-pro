'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';
import { useGoals } from '@/contexts/goals-context';
import { FinancialGoalsModal } from '@/components/goals/financial-goals-modal';

interface GapAnalysisProps {
  stats: {
    funding: {
      won: number;
      potential?: number;
    };
    // Enhanced analytics fields
    enhanced?: {
      totalTarget: number;
      totalCurrent: number;
      fundingGap: number;
      progressPercentage: number;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
      completionProbability: number;
      expenseBreakdown: any;
      fundingBreakdown: any;
      recommendations: string[];
      warnings: string[];
    };
    hasRealGoalsData?: boolean;
    isUsingNewSystem?: boolean;
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
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setShowGoalsModal(true)}
            >
              <Target className="h-4 w-4 mr-2" />
              Set Goals
            </Button>
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

            {/* Enhanced Funding Breakdown */}
            {stats.enhanced && stats.hasRealGoalsData ? (
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between items-center text-xs text-green-700 dark:text-green-300 mb-2">
                  <span className="font-medium">Funding Sources Breakdown {stats.isUsingNewSystem && '(Live)'}</span>
                </div>
                
                {stats.enhanced.fundingBreakdown.federalAid > 0 && (
                  <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-green-200 dark:border-green-700">
                    <span className="text-xs text-muted-foreground">Federal Aid</span>
                    <span className="text-sm font-medium text-blue-600">{formatCurrency(stats.enhanced.fundingBreakdown.federalAid)}</span>
                  </div>
                )}
                
                {stats.enhanced.fundingBreakdown.stateAid > 0 && (
                  <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-green-200 dark:border-green-700">
                    <span className="text-xs text-muted-foreground">State Grants</span>
                    <span className="text-sm font-medium text-purple-600">{formatCurrency(stats.enhanced.fundingBreakdown.stateAid)}</span>
                  </div>
                )}
                
                {stats.enhanced.fundingBreakdown.familyContribution > 0 && (
                  <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-green-200 dark:border-green-700">
                    <span className="text-xs text-muted-foreground">Family Contribution</span>
                    <span className="text-sm font-medium text-green-600">{formatCurrency(stats.enhanced.fundingBreakdown.familyContribution)}</span>
                  </div>
                )}
                
                {stats.enhanced.fundingBreakdown.loans > 0 && (
                  <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-orange-200 dark:border-orange-700">
                    <span className="text-xs text-muted-foreground">Loans</span>
                    <span className="text-sm font-medium text-orange-600">{formatCurrency(stats.enhanced.fundingBreakdown.loans)}</span>
                  </div>
                )}
                
                {stats.enhanced.fundingBreakdown.workStudy > 0 && (
                  <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-green-200 dark:border-green-700">
                    <span className="text-xs text-muted-foreground">Work Study</span>
                    <span className="text-sm font-medium text-teal-600">{formatCurrency(stats.enhanced.fundingBreakdown.workStudy)}</span>
                  </div>
                )}
              </div>
            ) : (
              /* Fallback for legacy system */
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
            )}
            
            {/* Enhanced Expense Breakdown */}
            {stats.enhanced && stats.hasRealGoalsData && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <h4 className="font-medium text-sm text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Expense Breakdown Analysis {stats.isUsingNewSystem && '(Live Data)'}
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  {stats.enhanced.expenseBreakdown.tuition > 0 && (
                    <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded border">
                      <div className="text-xs text-muted-foreground">Tuition & Fees</div>
                      <div className="text-sm font-semibold text-red-600">{formatCurrency(stats.enhanced.expenseBreakdown.tuition)}</div>
                    </div>
                  )}
                  
                  {stats.enhanced.expenseBreakdown.housing > 0 && (
                    <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded border">
                      <div className="text-xs text-muted-foreground">Housing</div>
                      <div className="text-sm font-medium text-orange-600">{formatCurrency(stats.enhanced.expenseBreakdown.housing)}</div>
                    </div>
                  )}
                  
                  {stats.enhanced.expenseBreakdown.books > 0 && (
                    <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded border">
                      <div className="text-xs text-muted-foreground">Books & Supplies</div>
                      <div className="text-sm font-medium text-purple-600">{formatCurrency(stats.enhanced.expenseBreakdown.books)}</div>
                    </div>
                  )}
                  
                  {stats.enhanced.expenseBreakdown.personal > 0 && (
                    <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded border">
                      <div className="text-xs text-muted-foreground">Personal Expenses</div>
                      <div className="text-sm font-medium text-teal-600">{formatCurrency(stats.enhanced.expenseBreakdown.personal)}</div>
                    </div>
                  )}
                </div>
                
                {/* Risk Assessment */}
                {stats.enhanced.riskLevel && (
                  <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Financial Risk Level</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        stats.enhanced.riskLevel === 'low' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                        stats.enhanced.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {stats.enhanced.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    
                    {stats.enhanced.completionProbability && (
                      <div className="text-xs text-muted-foreground mb-2">
                        Success Probability: <span className="font-medium text-blue-600">{Math.round(stats.enhanced.completionProbability * 100)}%</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Enhanced Recommendations */}
            {stats.enhanced && stats.enhanced.recommendations && stats.enhanced.recommendations.length > 0 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <h4 className="font-medium text-sm text-green-800 dark:text-green-200 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Actionable Recommendations
                </h4>
                <div className="space-y-2">
                  {stats.enhanced.recommendations.slice(0, 3).map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span className="text-xs text-green-700 dark:text-green-300">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <FinancialGoalsModal
        isOpen={showGoalsModal}
        onClose={() => setShowGoalsModal(false)}
        onSaveGoals={(savedGoals) => {
          console.log('💰 Saving financial goals from GapAnalysis:', savedGoals);
          // Update goals context with the new financial goals
          const updatedGoals = { ...goals };
          updatedGoals.financial = savedGoals;
          setGoals(updatedGoals);
          setShowGoalsModal(false);
        }}
        initialGoals={goals.financial || []}
        mode="create"
        editingGoal={null}
      />
    </Card>
  );
}