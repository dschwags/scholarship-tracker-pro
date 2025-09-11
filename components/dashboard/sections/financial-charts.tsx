'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  PieChart,
  BarChart3,
  TrendingUp,
  Target,
  DollarSign,
  Calendar,
  Activity
} from 'lucide-react';

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

interface FinancialChartsProps {
  stats: {
    funding: {
      won: number;
      potential?: number;
    };
  };
}

export function FinancialCharts({ stats }: FinancialChartsProps) {
  const [localGoals, setLocalGoals] = useState<FinancialGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'breakdown' | 'timeline'>('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'education': return '#3B82F6'; // blue
      case 'living': return '#10B981'; // green
      case 'emergency': return '#EF4444'; // red
      case 'career': return '#8B5CF6'; // purple
      case 'research': return '#F59E0B'; // amber
      case 'travel': return '#06B6D4'; // cyan
      default: return '#6B7280'; // gray
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#EF4444'; // red
      case 'high': return '#F97316'; // orange
      case 'medium': return '#EAB308'; // yellow
      case 'low': return '#22C55E'; // green
      default: return '#6B7280'; // gray
    }
  };

  // Load goals from API
  useEffect(() => {
    loadGoals();
  }, []);

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

  // Calculate data for visualizations
  const calculateChartData = () => {
    if (localGoals.length === 0) return null;

    // Goal types distribution
    const typeDistribution = localGoals.reduce((acc, goal) => {
      acc[goal.goalType] = (acc[goal.goalType] || 0) + goal.targetAmount;
      return acc;
    }, {} as Record<string, number>);

    // Priority distribution
    const priorityDistribution = localGoals.reduce((acc, goal) => {
      acc[goal.priority] = (acc[goal.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Status distribution
    const statusDistribution = localGoals.reduce((acc, goal) => {
      acc[goal.status] = (acc[goal.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Progress by goal
    const progressData = localGoals.map(goal => ({
      title: goal.title.length > 20 ? goal.title.substring(0, 20) + '...' : goal.title,
      progress: goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0,
      current: goal.currentAmount,
      target: goal.targetAmount,
      type: goal.goalType,
      priority: goal.priority
    }));

    return {
      typeDistribution,
      priorityDistribution,
      statusDistribution,
      progressData
    };
  };

  const chartData = calculateChartData();

  if (isLoading || !chartData) {
    return (
      <Card className="bg-transparent border-none shadow-none">
        <CardHeader className="pb-3 bg-transparent">
          <CardTitle className="text-lg text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Financial Goals Visualization
          </CardTitle>
          <CardDescription className="text-sm text-indigo-700 dark:text-indigo-300">
            Loading interactive charts and progress graphs...
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 bg-transparent">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (localGoals.length === 0) {
    return (
      <Card className="bg-transparent border-none shadow-none">
        <CardHeader className="pb-3 bg-transparent">
          <CardTitle className="text-lg text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Financial Goals Visualization
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 bg-transparent">
          <div className="text-center py-8">
            <PieChart className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No financial goals to visualize. Create goals to see interactive charts.
            </p>
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
            <CardTitle className="text-lg text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Financial Goals Visualization
            </CardTitle>
            <CardDescription className="text-sm text-indigo-700 dark:text-indigo-300">
              Interactive charts and progress graphs
            </CardDescription>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['overview', 'breakdown', 'timeline'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`px-3 py-1 text-xs rounded transition-colors ${ 
                  selectedView === view
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 bg-transparent">
        {selectedView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Goal Types Distribution */}
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Goals by Type
              </h3>
              <div className="space-y-3">
                {Object.entries(chartData.typeDistribution).map(([type, amount]) => {
                  const percentage = (amount / Object.values(chartData.typeDistribution).reduce((a, b) => a + b, 0)) * 100;
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getTypeColor(type) }}
                        ></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{type}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(amount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.round(percentage)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Goals by Priority
              </h3>
              <div className="space-y-3">
                {Object.entries(chartData.priorityDistribution).map(([priority, count]) => {
                  const percentage = (count / localGoals.length) * 100;
                  return (
                    <div key={priority} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getPriorityColor(priority) }}
                        ></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{priority}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {count} goals
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.round(percentage)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'breakdown' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Goal Progress Breakdown
            </h3>
            {chartData.progressData.map((goal, index) => (
              <div key={index} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getTypeColor(goal.type) }}
                    ></div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{goal.title}</span>
                    <Badge 
                      className="text-xs px-2 py-0.5"
                      style={{ 
                        backgroundColor: getPriorityColor(goal.priority) + '20', 
                        color: getPriorityColor(goal.priority),
                        border: `1px solid ${getPriorityColor(goal.priority)}40`
                      }}
                    >
                      {goal.priority}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {Math.round(goal.progress)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                    </div>
                  </div>
                </div>
                <Progress 
                  value={goal.progress} 
                  className="h-2"
                  style={{
                    '--progress-background': getTypeColor(goal.type)
                  } as React.CSSProperties}
                />
              </div>
            ))}
          </div>
        )}

        {selectedView === 'timeline' && (
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Goal Status Timeline
            </h3>
            <div className="space-y-4">
              {Object.entries(chartData.statusDistribution).map(([status, count]) => {
                const statusColor = status === 'completed' ? '#22C55E' : 
                                 status === 'active' ? '#3B82F6' : 
                                 status === 'paused' ? '#EAB308' : '#EF4444';
                const percentage = (count / localGoals.length) * 100;
                
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: statusColor }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {status} Goals
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {count} ({Math.round(percentage)}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: statusColor
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Stats */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {localGoals.length}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Total Goals</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {chartData.statusDistribution.active || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Active</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {chartData.statusDistribution.completed || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}