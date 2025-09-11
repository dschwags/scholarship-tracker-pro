'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Target,
  DollarSign,
  GraduationCap,
  Briefcase,
  Heart,
  Plus,
  X,
  AlertCircle,
  Calendar,
  TrendingUp,
  CheckCircle,
  Circle
} from 'lucide-react';
import { 
  Goal, 
  GoalFormData, 
  GoalsData,
  FinancialGoal,
  GOAL_CATEGORIES,
  PRIORITY_LEVELS,
  SKILL_LEVELS,
  AcademicMilestone,
  SkillRequirement,
  calculateTotalFunding
} from './goals-types';
import { EnhancedFinancialForm } from './enhanced-financial-form';

interface GoalsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveGoals: (goals: GoalsData) => void;
  initialGoals: GoalsData;
  mode: 'create' | 'edit';
  editingGoal?: Goal | null;
}

const getGoalIcon = (type: Goal['type']) => {
  switch (type) {
    case 'financial': return <DollarSign className="w-4 h-4" />;
    case 'academic': return <GraduationCap className="w-4 h-4" />;
    case 'career': return <Briefcase className="w-4 h-4" />;
    case 'personal': return <Heart className="w-4 h-4" />;
    default: return <Target className="w-4 h-4" />;
  }
};

const getGoalColor = (type: Goal['type']) => {
  switch (type) {
    case 'financial': return 'text-green-600';
    case 'academic': return 'text-blue-600';
    case 'career': return 'text-purple-600';
    case 'personal': return 'text-pink-600';
    default: return 'text-gray-600';
  }
};

export function GoalsManagementModal({
  isOpen,
  onClose,
  onSaveGoals,
  initialGoals,
  mode,
  editingGoal
}: GoalsManagementModalProps) {
  const [goals, setGoals] = useState<GoalsData>(initialGoals);
  const [activeTab, setActiveTab] = useState<Goal['type']>('financial');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<GoalFormData>({
    type: 'financial',
    title: '',
    description: '',
    priority: 'medium',
    deadline: '',
    isActive: true
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized onChange handler to prevent infinite loops
  const handleFormDataChange = useCallback((data: Partial<GoalFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  // Initialize editing if editingGoal is provided
  useEffect(() => {
    if (editingGoal && mode === 'edit') {
      setActiveTab(editingGoal.type);
      setEditingId(editingGoal.id);
      setShowCreateForm(true);
      populateFormFromGoal(editingGoal);
    }
  }, [editingGoal, mode]);

  const populateFormFromGoal = (goal: Goal) => {
    const baseFormData: GoalFormData = {
      type: goal.type,
      title: goal.title,
      description: goal.description,
      priority: goal.priority,
      deadline: goal.type === 'financial' ? goal.deadline : 
               goal.type === 'career' ? goal.deadline : 
               goal.type === 'personal' ? goal.deadline : '',
      isActive: goal.isActive
    };

    if (goal.type === 'financial') {
      Object.assign(baseFormData, {
        // Handle both enhanced and legacy financial goals
        scope: goal.scope,
        academicYear: goal.academicYear,
        calculationMethod: goal.calculationMethod,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        deadline: goal.deadline,
        expenses: goal.expenses,
        fundingSources: goal.fundingSources,
        schoolInfo: goal.schoolInfo
      });
    } else if (goal.type === 'academic') {
      Object.assign(baseFormData, {
        targetGPA: goal.targetGPA,
        currentGPA: goal.currentGPA,
        targetGraduationDate: goal.targetGraduationDate,
        major: goal.major,
        milestones: [...goal.milestones]
      });
    } else if (goal.type === 'career') {
      Object.assign(baseFormData, {
        targetPosition: goal.targetPosition,
        targetCompany: goal.targetCompany,
        targetIndustry: goal.targetIndustry,
        targetSalary: goal.targetSalary,
        skills: [...goal.skills]
      });
    } else if (goal.type === 'personal') {
      Object.assign(baseFormData, {
        personalCategory: goal.category,
        progress: goal.progress
      });
    }

    setFormData(baseFormData);
  };

  const resetForm = () => {
    setFormData({
      type: activeTab,
      title: '',
      description: '',
      priority: 'medium',
      deadline: '',
      isActive: true
    });
    setErrors({});
    setEditingId(null);
  };

  // Update form type when active tab changes
  useEffect(() => {
    if (!editingId && !showCreateForm) {
      setFormData(prev => ({ ...prev, type: activeTab }));
    }
  }, [activeTab, editingId, showCreateForm]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.type === 'financial') {
      if (formData.calculationMethod === 'manual-total') {
        if (!formData.targetAmount || formData.targetAmount <= 0) {
          newErrors.targetAmount = 'Target amount must be greater than 0';
        }
        if (formData.currentAmount && formData.currentAmount < 0) {
          newErrors.currentAmount = 'Current amount cannot be negative';
        }
      }
      // For detailed breakdown, validation is handled by the enhanced form component
    }

    if (formData.type === 'academic') {
      if (!formData.targetGPA || formData.targetGPA < 0 || formData.targetGPA > 4.0) {
        newErrors.targetGPA = 'Target GPA must be between 0 and 4.0';
      }
      if (formData.currentGPA && (formData.currentGPA < 0 || formData.currentGPA > 4.0)) {
        newErrors.currentGPA = 'Current GPA must be between 0 and 4.0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveGoal = () => {
    if (!validateForm()) return;

    const now = new Date().toISOString();
    const goalId = editingId || `goal-${Date.now()}`;

    const baseGoal = {
      id: goalId,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      isActive: formData.isActive,
      createdAt: editingId ? goals[formData.type].find(g => g.id === editingId)?.createdAt || now : now,
      updatedAt: now
    };

    let newGoal: Goal;

    if (formData.type === 'financial') {
      newGoal = {
        ...baseGoal,
        type: 'financial',
        scope: formData.scope || 'annual',
        academicYear: formData.academicYear,
        calculationMethod: formData.calculationMethod || 'manual-total',
        targetAmount: formData.targetAmount,
        currentAmount: formData.currentAmount,
        deadline: formData.deadline,
        expenses: formData.expenses,
        fundingSources: formData.fundingSources,
        schoolInfo: formData.schoolInfo,
        totalExpenses: formData.calculationMethod === 'detailed-breakdown' && formData.expenses ? 
          Object.values(formData.expenses).reduce((sum, exp) => sum + (exp.amount || 0), 0) : 
          (formData.targetAmount || 0),
        totalFunding: formData.calculationMethod === 'detailed-breakdown' && formData.fundingSources ? 
          calculateTotalFunding(formData.fundingSources) : 
          (formData.currentAmount || 0),
        remainingGap: formData.calculationMethod === 'detailed-breakdown' ? 
          (formData.expenses ? Object.values(formData.expenses).reduce((sum, exp) => sum + (exp.amount || 0), 0) : 0) - 
          (formData.fundingSources ? calculateTotalFunding(formData.fundingSources) : 0) : 
          (formData.targetAmount || 0) - (formData.currentAmount || 0)
      } as FinancialGoal;
    } else if (formData.type === 'academic') {
      newGoal = {
        ...baseGoal,
        type: 'academic',
        targetGPA: formData.targetGPA!,
        currentGPA: formData.currentGPA || 0,
        targetGraduationDate: formData.targetGraduationDate || '',
        major: formData.major || '',
        milestones: formData.milestones || []
      };
    } else if (formData.type === 'career') {
      newGoal = {
        ...baseGoal,
        type: 'career',
        targetPosition: formData.targetPosition || '',
        targetCompany: formData.targetCompany,
        targetIndustry: formData.targetIndustry || '',
        targetSalary: formData.targetSalary,
        deadline: formData.deadline,
        skills: formData.skills || []
      };
    } else {
      newGoal = {
        ...baseGoal,
        type: 'personal',
        deadline: formData.deadline || '',
        category: formData.personalCategory || 'other',
        progress: formData.progress || 0
      };
    }

    const updatedGoals = { ...goals };
    if (editingId) {
      // Update existing goal
      const index = updatedGoals[formData.type].findIndex(g => g.id === editingId);
      if (index !== -1) {
        updatedGoals[formData.type][index] = newGoal;
      }
    } else {
      // Add new goal
      updatedGoals[formData.type].push(newGoal);
    }

    setGoals(updatedGoals);
    resetForm();
    setShowCreateForm(false);
  };

  const handleDeleteGoal = (type: Goal['type'], id: string) => {
    const updatedGoals = { ...goals };
    updatedGoals[type] = updatedGoals[type].filter(g => g.id !== id);
    setGoals(updatedGoals);
  };

  const calculateProgress = (goal: Goal): number => {
    if (goal.type === 'financial') {
      const current = goal.currentAmount || 0;
      const target = goal.targetAmount || 1;
      return Math.min(100, Math.round((current / target) * 100));
    } else if (goal.type === 'academic') {
      const current = goal.currentGPA || 0;
      const target = goal.targetGPA || 4.0;
      return Math.min(100, Math.round((current / target) * 100));
    } else if (goal.type === 'personal') {
      return goal.progress || 0;
    } else if (goal.type === 'career') {
      const completedSkills = goal.skills?.filter(s => s.completed).length || 0;
      return goal.skills?.length > 0 ? Math.round((completedSkills / goal.skills.length) * 100) : 0;
    }
    return 0;
  };

  const handleSaveAllGoals = () => {
    setIsSubmitting(true);
    try {
      onSaveGoals(goals);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderGoalForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          {getGoalIcon(formData.type)}
          {editingId ? 'Edit' : 'Create'} {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} Goal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Priority and Active Status - Only show for non-financial goals */}
        {formData.type !== 'financial' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={`Enter ${formData.type} goal title`}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.title}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_LEVELS.map(priority => (
                    <SelectItem key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Description - Only show for non-financial goals */}
        {formData.type !== 'financial' && (
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={`Describe your ${formData.type} goal...`}
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.description}
              </p>
            )}
          </div>
        )}

        {/* Type-specific fields */}
        {formData.type === 'financial' && (
          <EnhancedFinancialForm
            formData={formData}
            onChange={handleFormDataChange}
            errors={errors}
          />
        )}

        {formData.type === 'academic' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetGPA">Target GPA *</Label>
                <Input
                  id="targetGPA"
                  type="number"
                  step="0.1"
                  min="0"
                  max="4.0"
                  value={formData.targetGPA || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetGPA: Number(e.target.value) }))}
                  placeholder="3.5"
                  className={errors.targetGPA ? 'border-red-500' : ''}
                />
                {errors.targetGPA && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.targetGPA}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentGPA">Current GPA</Label>
                <Input
                  id="currentGPA"
                  type="number"
                  step="0.1"
                  min="0"
                  max="4.0"
                  value={formData.currentGPA || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentGPA: Number(e.target.value) }))}
                  placeholder="0.0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="major">Major</Label>
                <Input
                  id="major"
                  value={formData.major || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, major: e.target.value }))}
                  placeholder="Computer Science"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="graduationDate">Target Graduation</Label>
                <Input
                  id="graduationDate"
                  type="date"
                  value={formData.targetGraduationDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetGraduationDate: e.target.value }))}
                />
              </div>
            </div>
          </>
        )}

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSaveGoal} className="flex-1">
            {editingId ? 'Update' : 'Create'} Goal
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              resetForm();
              setShowCreateForm(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderGoalsList = (type: Goal['type']) => {
    const typeGoals = goals[type];

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium flex items-center gap-2">
            {getGoalIcon(type)}
            {type.charAt(0).toUpperCase() + type.slice(1)} Goals ({typeGoals.length})
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setActiveTab(type);
              setFormData({ ...formData, type });
              setShowCreateForm(true);
              resetForm();
            }}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        </div>

        {typeGoals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No {type} goals yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {typeGoals.map((goal) => {
              const progress = calculateProgress(goal);
              return (
                <Card key={goal.id} className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{goal.title}</h4>
                        <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                          goal.priority === 'high' ? 'bg-red-100 text-red-700' :
                          goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {goal.priority}
                        </span>
                        {!goal.isActive && (
                          <span className="px-1.5 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{goal.description}</p>
                      
                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>

                      {/* Goal specific info */}
                      {goal.type === 'financial' && (
                        <div className="mt-2 text-xs text-gray-600">
                          {/* Handle both new enhanced structure and legacy structure */}
                          {goal.totalFunding !== undefined && goal.totalExpenses !== undefined ? (
                            <>
                              ${goal.totalFunding.toLocaleString()} / ${goal.totalExpenses.toLocaleString()}
                              {goal.remainingGap !== undefined && goal.remainingGap > 0 && (
                                <span className="text-orange-600"> • Gap: ${goal.remainingGap.toLocaleString()}</span>
                              )}
                              {goal.academicYear && ` • ${goal.academicYear}`}
                            </>
                          ) : (
                            <>
                              ${(goal.currentAmount || 0).toLocaleString()} / ${(goal.targetAmount || 0).toLocaleString()}
                              {goal.deadline && ` • Target: ${new Date(goal.deadline).toLocaleDateString()}`}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingId(goal.id);
                          setActiveTab(goal.type);
                          populateFormFromGoal(goal);
                          setShowCreateForm(true);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <TrendingUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGoal(type, goal.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Goals Management Modal Main Return
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isSubmitting) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Goals Management
          </DialogTitle>
          <DialogDescription>
            Set and track your financial, academic, career, and personal goals.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {['financial', 'academic', 'career', 'personal'].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setActiveTab(type as Goal['type']);
                  if (showCreateForm && !editingId) {
                    setFormData(prev => ({ ...prev, type: type as Goal['type'] }));
                  }
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === type 
                    ? 'bg-white shadow-sm text-gray-900' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {getGoalIcon(type as Goal['type'])}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && renderGoalForm()}

          {/* Goals List */}
          {!showCreateForm && renderGoalsList(activeTab)}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAllGoals}
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? 'Saving...' : 'Save All Goals'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}