'use client';

import { GraduationCap, TrendingUp, Clock, Landmark } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    applications: {
      total: number;
      submitted: number;
    };
    funding: {
      won: number;
    };
    successRate: number;
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