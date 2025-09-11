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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign,
  Plus,
  X,
  AlertCircle,
  HelpCircle,
  Target,
  Calculator,
  Bookmark,
  CheckCircle2,
  Edit3
} from 'lucide-react';
import { 
  FinancialGoal,
  FINANCIAL_GOAL_TEMPLATES,
  FinancialGoalTemplate,
  calculateTotalExpenses,
  calculateTotalFunding
} from './goals-types';
import { safeAccess } from '../bugx/BugX-Schema-Framework';
import { EnhancedFinancialForm } from './enhanced-financial-form';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FinancialGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveGoals: (goals: FinancialGoal[]) => void;
  initialGoals: FinancialGoal[];
  mode: 'create' | 'edit' | 'planning';
  editingGoal?: FinancialGoal | null;
}

export function FinancialGoalsModal({
  isOpen,
  onClose,
  onSaveGoals,
  initialGoals,
  mode,
  editingGoal
}: FinancialGoalsModalProps) {
  const [goals, setGoals] = useState<FinancialGoal[]>(initialGoals || []);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'simple' | 'detailed'>('detailed');
  const [planningMode, setPlanningMode] = useState<'goals' | 'direct'>('goals');
  const [formData, setFormData] = useState<Partial<FinancialGoal>>({
    title: '',
    description: '',
    targetAmount: 0,
    currentAmount: 0,
    deadline: '',
    calculationMethod: 'detailed-breakdown',
    isActive: true
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customFields, setCustomFields] = useState<Record<string, string>>({});

  // Memoized onChange handler to prevent infinite loops
  const handleFormDataChange = useCallback((data: Partial<FinancialGoal>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  // Sync internal goals state with initialGoals prop
  useEffect(() => {
    setGoals(initialGoals || []);
  }, [initialGoals]);

  // Reset modal state when closed
  useEffect(() => {
    if (!isOpen) {
      setShowCreateForm(false);
      setEditingId(null);
      resetForm();
    }
  }, [isOpen]);

  // Initialize editing if editingGoal is provided
  useEffect(() => {
    if (editingGoal && mode === 'edit') {
      setEditingId(editingGoal.id);
      setShowCreateForm(true);
      setFormData(editingGoal);
      setCustomFields(editingGoal.customFields || {});
      setFormMode('detailed'); // Always show detailed for editing
      setPlanningMode('goals');
    } else if (mode === 'create') {
      // Create mode - show the enhanced financial form
      setShowCreateForm(true);
      setFormMode('detailed');
      setPlanningMode('goals');
      // Initialize with default goal data
      setFormData({
        title: '',
        description: '',
        targetAmount: 0,
        currentAmount: 0,
        deadline: '',
        calculationMethod: 'detailed-breakdown',
        isActive: true
      });
    } else if (mode === 'planning') {
      // Direct planning mode - skip goal management
      setPlanningMode('direct');
      setShowCreateForm(true);
      setFormMode('detailed');
      // Set up a default temporary goal for planning
      setFormData({
        title: 'Financial Planning Session',
        description: 'Plan your educational expenses and funding sources',
        targetAmount: 0,
        currentAmount: 0,
        deadline: '',
        calculationMethod: 'detailed-breakdown',
        isActive: true
      });
    }
  }, [editingGoal, mode]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetAmount: 0,
      currentAmount: 0,
      deadline: '',
      calculationMethod: 'detailed-breakdown',
      isActive: true
    });
    setCustomFields({});
    setErrors({});
    setEditingId(null);
    setFormMode('detailed');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.targetAmount || formData.targetAmount <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than 0';
    }

    if (formData.currentAmount && formData.currentAmount < 0) {
      newErrors.currentAmount = 'Current amount cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveGoal = (section?: string) => {
    if (!validateForm()) return;

    const now = new Date().toISOString();
    const goalId = editingId || `goal-${Date.now()}`;

    // For simple goals, ensure total expenses and funding are calculated correctly
    const targetAmount = formData.targetAmount || 0;
    const currentAmount = formData.currentAmount || 0;
    const isSimpleMode = formData.calculationMethod === 'manual-total' || formMode === 'simple';
    
    // Calculate totals based on mode
    let totalExpenses: number;
    let totalFunding: number;
    
    if (isSimpleMode) {
      // For simple mode, map targetAmount to totalExpenses and currentAmount to totalFunding
      totalExpenses = targetAmount;
      totalFunding = currentAmount;
    } else {
      // For detailed mode, use calculated totals from form
      totalExpenses = formData.totalExpenses || 0;
      totalFunding = formData.totalFunding || 0;
    }

    const newGoal: FinancialGoal = {
      id: goalId,
      type: 'financial',
      title: formData.title || '',
      description: formData.description || '',
      priority: 'high',
      isActive: formData.isActive !== false, // Default to true unless explicitly false
      createdAt: editingId ? goals.find(g => g.id === editingId)?.createdAt || now : now,
      updatedAt: now,
      scope: formData.scope || 'annual',
      calculationMethod: isSimpleMode ? 'manual-total' : 'detailed-breakdown',
      targetAmount: targetAmount,
      currentAmount: currentAmount,
      totalExpenses: totalExpenses,
      totalFunding: totalFunding,
      remainingGap: totalExpenses - totalFunding,
      deadline: formData.deadline || '',
      expenses: formData.expenses,
      fundingSources: formData.fundingSources,
      schoolInfo: formData.schoolInfo,
      academicYear: formData.academicYear,
      customFields: { ...customFields, ...(formData.customFields || {}) }
    };

    const updatedGoals = [...goals];
    if (editingId) {
      const index = updatedGoals.findIndex(g => g.id === editingId);
      if (index !== -1) {
        updatedGoals[index] = newGoal;
      }
    } else {
      updatedGoals.push(newGoal);
    }

    setGoals(updatedGoals);
    
    // If saving a specific section, don't reset form or close
    if (section) {
      // Show brief success message for section save
      console.log(`${section} section saved successfully. Goal updated!`);
      // Force re-render by updating the parent goals state immediately
      handleSaveAllGoals();
    } else {
      resetForm();
      setShowCreateForm(false);
      // Also save to parent when creating/updating full goal
      handleSaveAllGoals();
    }
  };

  const handleDeleteGoal = (id: string) => {
    const updatedGoals = goals.filter(g => g.id !== id);
    setGoals(updatedGoals);
  };

  const calculateProgress = (goal: FinancialGoal): number => {
    const current = goal.currentAmount || 0;
    const target = goal.targetAmount || 1;
    return Math.min(100, Math.round((current / target) * 100));
  };

  const addCustomField = () => {
    const fieldName = prompt('Enter custom field name:');
    if (fieldName && fieldName.trim()) {
      setCustomFields(prev => ({
        ...prev,
        [fieldName.trim()]: ''
      }));
    }
  };

  const removeCustomField = (fieldName: string) => {
    setCustomFields(prev => {
      const newFields = { ...prev };
      delete newFields[fieldName];
      return newFields;
    });
  };

  const handleSaveAllGoals = () => {
    setIsSubmitting(true);
    try {
      onSaveGoals(goals);
      // Only close if explicitly requested (not for section saves)
      if (!showCreateForm) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bookmark/anchor navigation
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderDirectPlanningMode = () => (
    <div className="space-y-4">
      {/* Direct Access Navigation */}
      <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
        <CardHeader className="pb-1 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-green-800 dark:text-green-200">
            <Bookmark className="w-5 h-5" />
            Financial Planning Sections
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
            Close
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-700 dark:text-green-300 mb-4">
            Access all financial planning sections directly. Your changes are automatically saved.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToSection('expenses-section')}
              className="text-xs"
            >
              📚 Expenses
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToSection('federal-aid-section')}
              className="text-xs"
            >
              🇺🇸 Federal Aid
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToSection('scholarships-section')}
              className="text-xs"
            >
              🏆 Scholarships
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToSection('family-friends-section')}
              className="text-xs"
            >
              💰 Family & Friends
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mode Selection for Direct Planning */}
      <Card className="bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Planning Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={formMode} onValueChange={(value) => {
            const newMode = value as 'simple' | 'detailed';
            setFormMode(newMode);
            // Update the calculation method in formData to match the mode
            const calculationMethod = newMode === 'simple' ? 'manual-total' : 'detailed-breakdown';
            handleFormDataChange({ ...formData, calculationMethod });
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="simple" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Simple Goal
              </TabsTrigger>
              <TabsTrigger value="detailed" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Detailed Breakdown
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Enhanced Financial Form - Direct Access */}
      <EnhancedFinancialForm
        formData={formData}
        onChange={handleFormDataChange}
        onSaveSection={handleSaveGoal}
        errors={errors}
      />
    </div>
  );

  const renderGoalForm = () => (
    <div className="space-y-6">
      {/* Explanation Header */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Target className="w-5 h-5" />
            Financial Goals Planning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Set up your financial goals for education funding. You can either enter a simple target amount 
            or use our detailed breakdown to plan expenses, scholarships, and funding sources.
          </p>
          <div className="flex flex-wrap gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 cursor-help">
                    <HelpCircle className="w-3 h-3" />
                    What's a financial goal?
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>A financial goal helps you plan and track funding for your education, including tuition, living expenses, and other costs.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Financial Form - Direct Access */}
      <EnhancedFinancialForm
        formData={formData}
        onChange={handleFormDataChange}
        onSaveSection={handleSaveGoal}
        errors={errors}
      />


      {/* Custom Fields Section */}
      <Card id="custom-fields-section" className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
        <CardHeader className="pb-1 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-purple-800 dark:text-purple-200">
            <Edit3 className="w-5 h-5" />
            Custom Fields
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Add your own custom fields to track additional information specific to your financial goals.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleSaveGoal('Custom Fields')}
            className="text-xs"
          >
            Save Section
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {Object.entries(customFields).map(([fieldName, fieldValue]) => (
              <div key={fieldName} className="flex items-center gap-2">
                <div className="flex-1">
                  <Label className="text-sm font-medium">{fieldName}</Label>
                  <Input
                    value={fieldValue}
                    onChange={(e) => setCustomFields(prev => ({
                      ...prev,
                      [fieldName]: e.target.value
                    }))}
                    placeholder={`Enter ${fieldName.toLowerCase()}...`}
                    className="mt-1"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCustomField(fieldName)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <Button
            variant="outline"
            onClick={addCustomField}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Field
          </Button>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t">
        <Button onClick={() => handleSaveGoal()} className="flex-1">
          {editingId ? 'Update' : 'Create'} Goal
        </Button>
        <Button 
          variant="outline" 
          onClick={() => {
            resetForm();
            setShowCreateForm(false);
          }}
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );

  const renderGoalsList = () => {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Financial Goals ({safeAccess(goals, 'length', 0)})
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              resetForm();
              setShowCreateForm(true);
            }}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Goal
          </Button>
        </div>

        {safeAccess(goals, 'length', 0) === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No financial goals yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(goals || []).map((goal) => {
              const progress = calculateProgress(goal);
              return (
                <Card key={goal.id} className="p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{goal.title}</h4>
                        {!goal.isActive && (
                          <span className="px-1.5 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        ${goal.currentAmount?.toLocaleString() || 0} / ${goal.targetAmount?.toLocaleString() || 0}
                      </p>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{progress}% complete</p>
                    </div>
                    
                    <div className="flex gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData(goal);
                          setCustomFields(goal.customFields || {});
                          setEditingId(goal.id);
                          setShowCreateForm(true);
                          setFormMode(goal.calculationMethod === 'detailed-breakdown' ? 'detailed' : 'simple');
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {planningMode === 'direct' ? 'Financial Planning' : 'Financial Goals Management'}
          </DialogTitle>
          <DialogDescription>
            {planningMode === 'direct' 
              ? 'Plan your educational expenses, scholarships, and funding sources directly.'
              : 'Plan and track your education funding goals with detailed breakdowns or simple targets.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {planningMode === 'direct' ? renderDirectPlanningMode() : (showCreateForm ? renderGoalForm() : renderGoalsList())}
          
          {!showCreateForm && (
            <div className="flex justify-end pt-4 border-t">
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveAllGoals}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Save Goals
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}