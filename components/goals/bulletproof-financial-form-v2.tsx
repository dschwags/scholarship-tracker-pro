'use client';

import React, { useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, DollarSign, TrendingUp, Target, Plus, X } from 'lucide-react';
import { 
  FinancialGoal, 
  FinancialGoalTemplate,
  CALCULATION_METHODS,
  HOUSING_TYPES,
  TRANSPORTATION_TYPES,
  getTemplateConfig,
  calculateTotalExpenses,
  calculateTotalFunding
} from '@/components/goals/goals-types';

// BugX Safe Types - Use existing system types
interface CalculationResult {
  totalExpenses: number;
  totalFunding: number;
  remainingGap: number;
  fundingPercentage: number;
  gapPercentage: number;
}

interface BulletproofFinancialFormProps {
  formData: FinancialGoal;
  onChange: (data: FinancialGoal) => void;
  selectedTemplate?: FinancialGoalTemplate | '';
  onTemplateChange?: (template: FinancialGoalTemplate | '') => void;
}

// BugX Safe: Helper for safe property access
const safeAccess = <T>(obj: any, path: string, defaultValue: T): T => {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }
  return current != null ? current : defaultValue;
};

// BugX Safe: Pure calculation functions using existing system logic
const calculateTotals = (formData: FinancialGoal): CalculationResult => {
  const totalExpenses = formData.calculationMethod === 'detailed-breakdown' 
    ? calculateTotalExpenses(formData.expenses)
    : (formData.targetAmount || 0);
    
  const totalFunding = formData.calculationMethod === 'detailed-breakdown'
    ? calculateTotalFunding(formData.fundingSources)
    : (formData.totalFunding || 0);
    
  const remainingGap = Math.max(0, totalExpenses - totalFunding);
  const fundingPercentage = totalExpenses > 0 ? Math.min(100, (totalFunding / totalExpenses) * 100) : 0;
  const gapPercentage = totalExpenses > 0 ? (remainingGap / totalExpenses) * 100 : 0;

  return {
    totalExpenses,
    totalFunding,
    remainingGap,
    fundingPercentage,
    gapPercentage,
  };
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// BugX Safe: Default values using system structures
const defaultExpenses = {
  tuition: { amount: 0 },
  roomAndBoard: { amount: 0, housingType: 'dorm' as const },
  books: { amount: 0 },
  transportation: { amount: 0, type: 'car' as const, entries: [] },
  personal: { amount: 0 },
  fees: { amount: 0 },
  other: { amount: 0, entries: [] }
};

const defaultFunding = {
  federalAid: {
    pellGrant: { amount: 0, awarded: false, renewable: false },
    subsidizedLoans: { amount: 0 },
    unsubsidizedLoans: { amount: 0 },
    workStudy: { amount: 0 },
    other: { amount: 0 }
  },
  stateGrants: {
    needBased: { amount: 0, renewable: false },
    meritBased: { amount: 0, renewable: false },
    other: { amount: 0 }
  },
  scholarships: [],
  familyContribution: { amount: 0 },
  employment: { amount: 0, jobType: 'part-time' as const }
};

export default function BulletproofFinancialFormV2({ 
  formData, 
  onChange, 
  selectedTemplate = '',
  onTemplateChange 
}: BulletproofFinancialFormProps) {
  // BugX Safe: Memoized calculations with stable dependencies
  const safeFormData = useMemo(() => ({
    ...formData,
    expenses: { ...defaultExpenses, ...formData.expenses },
    fundingSources: { ...defaultFunding, ...formData.fundingSources },
    calculationMethod: formData.calculationMethod || 'detailed-breakdown',
  }), [formData]);

  // BugX Safe: Pure calculation - no side effects
  const calculations = useMemo(() => 
    calculateTotals(safeFormData), 
    [safeFormData]
  );

  // BugX Safe: Stable update functions for expenses
  const updateExpense = useCallback((section: string, field: string, value: any) => {
    const currentSection = safeFormData.expenses?.[section as keyof typeof safeFormData.expenses] || {};
    const newExpenses = {
      ...safeFormData.expenses,
      [section]: {
        ...currentSection,
        [field]: value
      }
    };
    onChange({
      ...safeFormData,
      expenses: newExpenses,
    });
  }, [safeFormData, onChange]);

  // BugX Safe: Stable update functions for funding
  const updateFunding = useCallback((section: string, field: string, value: any) => {
    const newFunding = { ...safeFormData.fundingSources };
    
    if (field === '') {
      // Direct assignment for arrays like scholarships
      (newFunding as any)[section] = value;
    } else {
      // Handle nested objects
      const currentFundingSection = (newFunding as any)[section] || {};
      (newFunding as any)[section] = {
        ...currentFundingSection,
        [field]: value
      };
    }
    
    onChange({
      ...safeFormData,
      fundingSources: newFunding,
    });
  }, [safeFormData, onChange]);

  const switchCalculationMethod = useCallback(() => {
    const newMethod = safeFormData.calculationMethod === 'manual-total' ? 'detailed-breakdown' : 'manual-total';
    onChange({
      ...safeFormData,
      calculationMethod: newMethod,
    });
  }, [safeFormData, onChange]);

  // BugX Safe: Template configuration
  const templateConfig = useMemo(() => 
    getTemplateConfig(selectedTemplate), 
    [selectedTemplate]
  );

  // BugX Safe: Status determination based on calculations
  const status = useMemo(() => {
    if (calculations.remainingGap <= 0) return { type: 'success', message: 'Fully Funded!' };
    if (calculations.fundingPercentage >= 80) return { type: 'warning', message: 'Nearly Funded' };
    if (calculations.fundingPercentage >= 50) return { type: 'info', message: 'Partially Funded' };
    return { type: 'error', message: 'Needs More Funding' };
  }, [calculations]);

  return (
    <div className="space-y-6">
      {/* BugX Safe: Header with live calculations */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Financial Planning</CardTitle>
            <div className="flex gap-2">
              <Select 
                value={safeFormData.calculationMethod} 
                onValueChange={(value) => onChange({ ...safeFormData, calculationMethod: value as 'manual-total' | 'detailed-breakdown' })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CALCULATION_METHODS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {onTemplateChange && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onTemplateChange('')}
                >
                  Reset Template
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Total Expenses</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(calculations.totalExpenses)}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Total Funding</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(calculations.totalFunding)}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Remaining Gap</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(calculations.remainingGap)}
              </p>
            </div>
          </div>

          {/* BugX Safe: Progress visualization */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Funding Progress</span>
              <Badge variant={
                status.type === 'success' ? 'default' :
                status.type === 'warning' ? 'secondary' :
                status.type === 'info' ? 'outline' : 'destructive'
              }>
                {status.message}
              </Badge>
            </div>
            <Progress 
              value={calculations.fundingPercentage} 
              className="h-3"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>{calculations.fundingPercentage.toFixed(1)}% Funded</span>
              <span>{calculations.gapPercentage.toFixed(1)}% Gap Remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BugX Safe: Form inputs with controlled components */}
      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="funding">Funding Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          {safeFormData.calculationMethod === 'detailed-breakdown' ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Educational Expenses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {templateConfig.expenses.map((expense) => (
                  <div key={expense.key} className="border rounded-lg p-3 space-y-2 bg-white dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">{expense.title}</Label>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            type="number"
                            className="w-24 pl-6 text-sm"
                            placeholder={expense.placeholder}
                            value={safeAccess(safeFormData.expenses, `${expense.key}.amount`, '') || ''}
                            onChange={(e) => updateExpense(expense.key, 'amount', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                    {expense.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">{expense.description}</p>
                    )}
                    
                    {/* Housing Type Conditional */}
                    {expense.key === 'roomAndBoard' && (
                      <div className="flex items-center gap-2 mt-2">
                        <Label className="text-xs">Housing Type:</Label>
                        <Select
                          value={safeAccess(safeFormData.expenses, 'roomAndBoard.housingType', 'dorm')}
                          onValueChange={(value) => updateExpense('roomAndBoard', 'housingType', value)}
                        >
                          <SelectTrigger className="w-28 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(HOUSING_TYPES).map(([key, type]) => (
                              <SelectItem key={key} value={key} className="text-xs">
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Transportation Type Conditional */}
                    {expense.key === 'transportation' && (
                      <div className="flex items-center gap-2 mt-2">
                        <Label className="text-xs">Transport Type:</Label>
                        <Select
                          value={safeAccess(safeFormData.expenses, 'transportation.type', 'car')}
                          onValueChange={(value) => updateExpense('transportation', 'type', value)}
                        >
                          <SelectTrigger className="w-28 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(TRANSPORTATION_TYPES).map(([key, type]) => (
                              <SelectItem key={key} value={key} className="text-xs">
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total Amount Needed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Target Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      type="number"
                      placeholder="Enter total amount needed"
                      className="pl-8 text-lg"
                      value={safeFormData.targetAmount || ''}
                      onChange={(e) => onChange({ ...safeFormData, targetAmount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Enter the total amount you need to raise for this goal
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="funding" className="space-y-4">
          {safeFormData.calculationMethod === 'detailed-breakdown' ? (
            <div className="space-y-4">
              {/* Federal Aid Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">🏛️ Federal Financial Aid</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Pell Grant</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        placeholder="6500"
                        className="pl-8"
                        value={safeAccess(safeFormData.fundingSources, 'federalAid.pellGrant.amount', '') || ''}
                        onChange={(e) => updateFunding('federalAid', 'pellGrant', { 
                          ...safeAccess(safeFormData.fundingSources, 'federalAid.pellGrant', {}),
                          amount: parseFloat(e.target.value) || 0 
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Work Study</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        placeholder="2000"
                        className="pl-8"
                        value={safeAccess(safeFormData.fundingSources, 'federalAid.workStudy.amount', '') || ''}
                        onChange={(e) => updateFunding('federalAid', 'workStudy', { amount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* State Grants Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">🏛️ State Grants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Need-Based Grant</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        placeholder="3000"
                        className="pl-8"
                        value={safeAccess(safeFormData.fundingSources, 'stateGrants.needBased.amount', '') || ''}
                        onChange={(e) => updateFunding('stateGrants', 'needBased', { 
                          amount: parseFloat(e.target.value) || 0,
                          renewable: safeAccess(safeFormData.fundingSources, 'stateGrants.needBased.renewable', false)
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Family & Personal Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">👨‍👩‍👧‍👦 Family & Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Family Contribution</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        placeholder="8000"
                        className="pl-8"
                        value={safeAccess(safeFormData.fundingSources, 'familyContribution.amount', '') || ''}
                        onChange={(e) => updateFunding('familyContribution', 'amount', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Employment Income</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        placeholder="4000"
                        className="pl-8"
                        value={safeAccess(safeFormData.fundingSources, 'employment.amount', '') || ''}
                        onChange={(e) => updateFunding('employment', 'amount', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total Funding Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Available Funding</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      type="number"
                      placeholder="Enter total funding available"
                      className="pl-8 text-lg"
                      value={safeFormData.totalFunding || ''}
                      onChange={(e) => onChange({ ...safeFormData, totalFunding: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Enter the total amount of funding you have secured or expect to receive
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* BugX Safe: Summary section */}
      {calculations.remainingGap > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-medium text-amber-800 dark:text-amber-200">
                  Funding Gap Analysis
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  You need an additional <strong>{formatCurrency(calculations.remainingGap)}</strong> to 
                  fully fund your educational expenses. Consider applying for additional scholarships, 
                  grants, or exploring student loan options.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}