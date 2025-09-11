'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Target,
  Plus,
  Edit3,
  Trash2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useGoals } from '@/contexts/goals-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

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

interface EmbeddedFinancialGoalsProps {
  stats: {
    funding: {
      won: number;
      potential?: number;
    };
  };
}

export function EmbeddedFinancialGoals({ stats }: EmbeddedFinancialGoalsProps) {
  const { goals, setGoals, getTotalFinancialTarget, getTotalFinancialCurrent } = useGoals();
  const [localGoals, setLocalGoals] = useState<FinancialGoal[]>([]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for creating/editing goals
  const [formData, setFormData] = useState<Partial<FinancialGoal>>({
    title: '',
    description: '',
    targetAmount: 0,
    currentAmount: 0,
    deadline: '',
    priority: 'medium',
    goalType: 'education',
    status: 'active'
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Load goals from API on component mount
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
      setError('Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  };

  const saveGoal = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate form data
      if (!formData.title?.trim()) {
        setError('Title is required');
        return;
      }
      if (!formData.targetAmount || formData.targetAmount <= 0) {
        setError('Target amount must be greater than 0');
        return;
      }

      const goalData = {
        ...formData,
        id: editingGoal?.id || `goal-${Date.now()}`,
        createdAt: editingGoal?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentAmount: formData.currentAmount || 0
      };

      const url = '/api/financial-goals';
      const method = editingGoal ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update local state
          if (editingGoal) {
            setLocalGoals(prev => prev.map(g => g.id === editingGoal.id ? goalData as FinancialGoal : g));
          } else {
            setLocalGoals(prev => [...prev, goalData as FinancialGoal]);
          }
          
          // Reset form
          setFormData({
            title: '',
            description: '',
            targetAmount: 0,
            currentAmount: 0,
            deadline: '',
            priority: 'medium',
            goalType: 'education',
            status: 'active'
          });
          setIsAddingGoal(false);
          setEditingGoal(null);
        } else {
          setError(result.error || 'Failed to save goal');
        }
      } else {
        setError('Failed to save goal');
      }
    } catch (err) {
      console.error('Error saving goal:', err);
      setError('Failed to save goal');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/financial-goals?id=${goalId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLocalGoals(prev => prev.filter(g => g.id !== goalId));
      } else {
        setError('Failed to delete goal');
      }
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError('Failed to delete goal');
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setFormData(goal);
    setIsAddingGoal(true);
  };

  const cancelEdit = () => {
    setEditingGoal(null);
    setIsAddingGoal(false);
    setFormData({
      title: '',
      description: '',
      targetAmount: 0,
      currentAmount: 0,
      deadline: '',
      priority: 'medium',
      goalType: 'education',
      status: 'active'
    });
    setError(null);
  };

  // Calculate analytics - ensure localGoals is always an array
  const safeLocalGoals = Array.isArray(localGoals) ? localGoals : [];
  const totalTarget = safeLocalGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrent = safeLocalGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalProgress = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;
  const activeGoals = safeLocalGoals.filter(g => g.status === 'active');
  const completedGoals = safeLocalGoals.filter(g => g.status === 'completed');
  const overallGap = Math.max(0, totalTarget - totalCurrent);

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="pb-3 bg-transparent">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Financial Goals & Progress
            </CardTitle>
            <CardDescription className="text-sm text-purple-700 dark:text-purple-300">
              Track your financial targets with embedded analytics
            </CardDescription>
          </div>
          <Button 
            size="sm" 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => setIsAddingGoal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 bg-transparent">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Overview Analytics */}
        {safeLocalGoals.length > 0 && (
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border">
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{safeLocalGoals.length}</div>
                <div className="text-xs text-purple-700 dark:text-purple-300">Total Goals</div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border">
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">{completedGoals.length}</div>
                <div className="text-xs text-green-700 dark:text-green-300">Completed</div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border">
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatCurrency(totalCurrent)}</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">Current Amount</div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border">
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{formatCurrency(overallGap)}</div>
                <div className="text-xs text-orange-700 dark:text-orange-300">Funding Gap</div>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Overall Progress</div>
                <div className="text-sm font-bold text-purple-900 dark:text-purple-100">{totalProgress}%</div>
              </div>
              <Progress value={totalProgress} className="h-3" />
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>{formatCurrency(totalCurrent)}</span>
                <span>{formatCurrency(totalTarget)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Goals List */}
        {safeLocalGoals.length === 0 && !isLoading ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">No Financial Goals Set</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              Create your first financial goal to start tracking your progress with embedded analytics.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {safeLocalGoals.map((goal) => {
              const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
              const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && goal.status === 'active';
              
              return (
                <div key={goal.id} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(goal.priority)}`}></div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{goal.title}</h4>
                        <Badge className={`text-xs ${getStatusColor(goal.status)}`}>
                          {goal.status}
                        </Badge>
                      </div>
                      {goal.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{goal.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => startEdit(goal)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => deleteGoal(goal.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>{formatCurrency(goal.currentAmount)}</span>
                      <span>{formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <Calendar className="h-3 w-3" />
                      <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                        {formatDate(goal.deadline)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                      {goal.goalType}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add/Edit Goal Dialog */}
        <Dialog open={isAddingGoal} onOpenChange={(open) => !open && cancelEdit()}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingGoal ? 'Edit Goal' : 'Add Financial Goal'}</DialogTitle>
              <DialogDescription>
                {editingGoal ? 'Update your financial goal details' : 'Create a new financial goal with embedded tracking'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Tuition for Fall 2024"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this goal"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetAmount">Target Amount</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    value={formData.targetAmount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="currentAmount">Current Amount</Label>
                  <Input
                    id="currentAmount"
                    type="number"
                    value={formData.currentAmount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="deadline">Deadline (Optional)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="goalType">Goal Type</Label>
                  <Select value={formData.goalType} onValueChange={(value) => setFormData(prev => ({ ...prev, goalType: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="living">Living Expenses</SelectItem>
                      <SelectItem value="emergency">Emergency Fund</SelectItem>
                      <SelectItem value="career">Career Development</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={cancelEdit} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={saveGoal} disabled={isLoading}>
                  {isLoading ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}