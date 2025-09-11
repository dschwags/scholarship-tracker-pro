'use client';

import { GraduationCap, TrendingUp, Clock, Landmark, Target, CheckCircle, AlertCircle } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    applications: {
      total: number;
      submitted: number;
    };
    funding: {
      won: number;
      potential?: number;
      total?: number;
    };
    successRate: number;
    // Enhanced analytics fields
    enhanced?: {
      totalExpenses: number;
      totalFunding: number;
      fundingGap: number;
      completionProbability: number;
      riskLevel: 'low' | 'medium' | 'high';
      expenseBreakdown: {
        tuition: number;
        housing: number;
        books: number;
        personal: number;
      };
      fundingBreakdown: {
        federalAid: number;
        stateAid: number;
        familyContribution: number;
        loans: number;
        workStudy: number;
      };
    };
    hasRealGoalsData?: boolean;
    isUsingNewSystem?: boolean;
    financialMetrics?: any;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Enhanced display when we have real financial goals data
  if (stats.enhanced && stats.hasRealGoalsData) {
    const fundingProgress = stats.enhanced.totalFunding > 0 
      ? Math.round((stats.enhanced.totalFunding / stats.enhanced.totalExpenses) * 100) 
      : 0;

    return (
      <div className="space-y-3">
        {/* Primary Financial Goals Progress */}
        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Financial Goals Progress {stats.isUsingNewSystem && '(Live Data)'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-blue-600 dark:text-blue-400">Funding Secured</div>
              <div className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                {formatCurrency(stats.enhanced.totalFunding)} ({fundingProgress}%)
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-blue-600 dark:text-blue-400">Remaining Need</div>
              <div className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                {formatCurrency(Math.max(0, stats.enhanced.fundingGap))}
              </div>
            </div>
          </div>
        </div>

        {/* Achievement & Risk Indicators */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
            <span className="text-2xs text-muted-foreground">Success Probability:</span>
            <span className={`text-sm font-semibold ${
              stats.enhanced.completionProbability >= 0.8 ? 'text-green-600' :
              stats.enhanced.completionProbability >= 0.6 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {Math.round(stats.enhanced.completionProbability * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-1">
            <AlertCircle className={`h-3.5 w-3.5 ${
              stats.enhanced.riskLevel === 'low' ? 'text-green-600' :
              stats.enhanced.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
            }`} />
            <span className="text-2xs text-muted-foreground">Risk Level:</span>
            <span className={`text-sm font-semibold uppercase ${
              stats.enhanced.riskLevel === 'low' ? 'text-green-600' :
              stats.enhanced.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {stats.enhanced.riskLevel}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <GraduationCap className="h-3.5 w-3.5 text-foreground" />
            <span className="text-2xs text-muted-foreground">Applications:</span>
            <span className="text-sm font-semibold text-foreground">{stats.applications.total}</span>
          </div>

          <div className="flex items-center gap-1">
            <Landmark className="h-3.5 w-3.5 text-foreground" />
            <span className="text-2xs text-muted-foreground">Awarded:</span>
            <span className="text-sm font-semibold text-foreground">{formatCurrency(stats.funding.won)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Legacy display for when we don't have enhanced financial goals data
  return (
    <div className="flex justify-between items-center -mt-2">
      <div className="flex items-center gap-1">
        <GraduationCap className="h-3.5 w-3.5 text-foreground" />
        <span className="text-2xs text-muted-foreground">Total Applications:</span>
        <span className="text-sm font-semibold text-foreground">{stats.applications.total}</span>
      </div>

      <div className="flex items-center gap-1">
        <TrendingUp className="h-3.5 w-3.5 text-foreground" />
        <span className="text-2xs text-muted-foreground">Success Rate:</span>
        <span className="text-sm font-semibold text-foreground">{stats.successRate}%</span>
      </div>

      <div className="flex items-center gap-1">
        <Landmark className="h-3.5 w-3.5 text-foreground" />
        <span className="text-2xs text-muted-foreground">Total Awarded:</span>
        <span className="text-sm font-semibold text-foreground">{formatCurrency(stats.funding.won)}</span>
      </div>

      <div className="flex items-center gap-1">
        <Clock className="h-3.5 w-3.5 text-foreground" />
        <span className="text-2xs text-muted-foreground">Pending Applications:</span>
        <span className="text-sm font-semibold text-foreground">{stats.applications.submitted}</span>
      </div>
    </div>
  );
}