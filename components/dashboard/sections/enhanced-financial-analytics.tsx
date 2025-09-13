'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Calendar,
  PieChart,
  BarChart3,
  Activity,
  Clock,
  Zap,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useGoals } from '@/contexts/goals-context';

interface FinancialGoal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  goalType: 'education' | 'living' | 'emergency' | 'career' | 'research' | 'travel';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface AnalyticsData {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalTarget: number;
  totalCurrent: number;
  totalGap: number;
  overallProgress: number;
  avgProgress: number;
  onTrackGoals: number;
  behindGoals: number;
  criticalGoals: number;
  overdueGoals: number;
  monthlyProjection: number;
  estimatedCompletion: string;
  recommendations: string[];
  warnings: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface EnhancedFinancialAnalyticsProps {
  stats: {
    funding: {
      won: number;
      potential?: number;
    };
  };
}

export function EnhancedFinancialAnalytics({ stats }: EnhancedFinancialAnalyticsProps) {
  const { goals, getTotalFinancialTarget, getTotalFinancialCurrent } = useGoals();
  const [localGoals, setLocalGoals] = useState<FinancialGoal[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300';
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Load goals from API
  useEffect(() => {
    loadGoals();
  }, []);

  // Recalculate analytics when goals change
  useEffect(() => {
    if (localGoals.length > 0) {
      calculateAnalytics();
    }
  }, [localGoals, selectedTimeframe]);

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/financial-goals');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setLocalGoals(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to load financial goals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAnalytics = () => {
    if (localGoals.length === 0) {
      setAnalytics(null);
      return;
    }

    const now = new Date();
    const activeGoals = localGoals.filter(g => g.status === 'active');
    const completedGoals = localGoals.filter(g => g.status === 'completed');
    
    const totalTarget = localGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalCurrent = localGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const totalGap = Math.max(0, totalTarget - totalCurrent);
    const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
    
    // Calculate individual goal progress
    const goalProgress = localGoals.map(goal => ({
      ...goal,
      progress: goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0,
      isOverdue: goal.deadline && new Date(goal.deadline) < now && goal.status === 'active'
    }));

    const avgProgress = goalProgress.reduce((sum, g) => sum + g.progress, 0) / goalProgress.length;
    const onTrackGoals = goalProgress.filter(g => g.progress >= 50 && !g.isOverdue).length;
    const behindGoals = goalProgress.filter(g => g.progress < 50 && g.status === 'active').length;
    const criticalGoals = goalProgress.filter(g => g.priority === 'critical' && g.status === 'active').length;
    const overdueGoals = goalProgress.filter(g => g.isOverdue).length;

    // Calculate monthly projection based on recent progress
    const monthlyProjection = totalCurrent * 0.1; // Simplified calculation
    
    // Estimate completion date
    const remainingAmount = totalGap;
    const monthsToCompletion = monthlyProjection > 0 ? Math.ceil(remainingAmount / monthlyProjection) : 999;
    const estimatedCompletion = monthsToCompletion < 999 
      ? new Date(now.getTime() + monthsToCompletion * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
      : 'Unknown';

    // Generate recommendations
    const recommendations: string[] = [];
    const warnings: string[] = [];

    if (behindGoals > 0) {
      recommendations.push(`Focus on ${behindGoals} goals that are behind schedule`);
    }
    if (overdueGoals > 0) {
      warnings.push(`${overdueGoals} goals are overdue and need immediate attention`);
    }
    if (criticalGoals > 0) {
      recommendations.push(`Prioritize ${criticalGoals} critical goals for maximum impact`);
    }
    if (overallProgress < 25) {
      recommendations.push('Consider increasing funding sources or adjusting target amounts');
    }
    if (totalGap > totalCurrent * 2) {
      warnings.push('Large funding gap detected - review goals and funding strategy');
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (overdueGoals > 0 || overallProgress < 25) riskLevel = 'critical';
    else if (behindGoals > (Number(activeGoals) || 0) / 2 || overallProgress < 50) riskLevel = 'high';
    else if (behindGoals > 0 || overallProgress < 75) riskLevel = 'medium';

    setAnalytics({
      totalGoals: localGoals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      totalTarget,
      totalCurrent,
      totalGap,
      overallProgress,
      avgProgress,
      onTrackGoals,
      behindGoals,
      criticalGoals,
      overdueGoals,
      monthlyProjection,
      estimatedCompletion,
      recommendations,
      warnings,
      riskLevel
    });
  };

  if (isLoading || !analytics) {
    return (
      <Card className="bg-transparent border-none shadow-none">
        <CardHeader className="pb-3 bg-transparent">
          <CardTitle className="text-lg text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Financial Analytics Dashboard
          </CardTitle>
          <CardDescription className="text-sm text-blue-700 dark:text-blue-300">
            Loading comprehensive progress tracking and gap analysis...
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 bg-transparent">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="pb-3 bg-transparent">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Financial Analytics Dashboard
            </CardTitle>
            <CardDescription className="text-sm text-blue-700 dark:text-blue-300">
              Comprehensive progress tracking and gap analysis with AI insights
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`px-2 py-1 text-xs font-medium ${getRiskColor(analytics.riskLevel)}`}>
              {analytics.riskLevel.toUpperCase()} RISK
            </Badge>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {(['week', 'month', 'quarter', 'year'] as const).map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${ 
                    selectedTimeframe === timeframe
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 bg-transparent">
        {/* Key Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-blue-900 dark:text-blue-100">{formatPercentage(analytics.overallProgress)}</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">Overall Progress</div>
              </div>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-green-900 dark:text-green-100">{analytics.onTrackGoals}</div>
                <div className="text-xs text-green-700 dark:text-green-300">On Track</div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-orange-900 dark:text-orange-100">{formatCurrency(analytics.totalGap)}</div>
                <div className="text-xs text-orange-700 dark:text-orange-300">Funding Gap</div>
              </div>
              <Target className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-purple-900 dark:text-purple-100">{analytics.estimatedCompletion}</div>
                <div className="text-xs text-purple-700 dark:text-purple-300">Est. Completion</div>
              </div>
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Progress Visualization */}
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Financial Progress Breakdown</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {formatCurrency(analytics.totalCurrent)} / {formatCurrency(analytics.totalTarget)}
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 dark:text-gray-300">Overall Progress</span>
                <span className="font-medium">{formatPercentage(analytics.overallProgress)}</span>
              </div>
              <Progress 
                value={analytics.overallProgress} 
                className={`h-3 [&>div]:${getProgressColor(analytics.overallProgress)}`} 
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 dark:text-gray-300">Average Goal Progress</span>
                <span className="font-medium">{formatPercentage(analytics.avgProgress)}</span>
              </div>
              <Progress 
                value={analytics.avgProgress} 
                className={`h-2 [&>div]:${getProgressColor(analytics.avgProgress)}`} 
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analytics.activeGoals}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Active Goals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics.completedGoals}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{analytics.behindGoals}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Behind Schedule</div>
              </div>
            </div>
          </div>
        </div>

        {/* Warnings and Alerts */}
        {(analytics.warnings.length > 0 || analytics.overdueGoals > 0 || analytics.criticalGoals > 0) && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">Attention Required</h4>
                <div className="space-y-1">
                  {analytics.overdueGoals > 0 && (
                    <div className="text-sm text-red-700 dark:text-red-300">
                      • {analytics.overdueGoals} goals are overdue
                    </div>
                  )}
                  {analytics.criticalGoals > 0 && (
                    <div className="text-sm text-red-700 dark:text-red-300">
                      • {analytics.criticalGoals} critical priority goals need focus
                    </div>
                  )}
                  {analytics.warnings.map((warning, index) => (
                    <div key={index} className="text-sm text-red-700 dark:text-red-300">
                      • {warning}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {analytics.recommendations.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">AI Recommendations</h4>
                <div className="space-y-1">
                  {analytics.recommendations.map((rec, index) => (
                    <div key={index} className="text-sm text-blue-700 dark:text-blue-300">
                      • {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Projection */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-purple-900 dark:text-purple-100">Monthly Projection</h3>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">Projected Monthly Increase</div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {formatCurrency(analytics.monthlyProjection)}
              </div>
            </div>
            <div>
              <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">Time to Goal Completion</div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {analytics.estimatedCompletion}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}