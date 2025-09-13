'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { safeAccess } from '@/components/bugx/BugX-Schema-Framework';
import {
  FinancialGoal,
  CALCULATION_METHODS,
  HOUSING_TYPES,
  TRANSPORTATION_TYPES,
  JOB_TYPES,
  SCHOLARSHIP_DURATIONS,
  SCHOLARSHIP_STATUSES,
  COST_OF_LIVING_LEVELS,
  FINANCIAL_GOAL_TEMPLATES,
  FinancialGoalTemplate,
  calculateTotalExpenses,
  calculateTotalFunding,
  getTemplateConfig
} from './goals-types';

interface EnhancedFinancialFormProps {
  formData: Partial<FinancialGoal> & { template?: FinancialGoalTemplate; title?: string; };
  onChange: (data: Partial<FinancialGoal> & { template?: FinancialGoalTemplate; title?: string; }) => void;
  errors: Record<string, string>;
  onSaveSection?: (section: string) => void;
}

export function EnhancedFinancialForm({ formData, onChange, errors, onSaveSection }: EnhancedFinancialFormProps) {
  const [calculationMethod, setCalculationMethod] = useState<'manual-total' | 'detailed-breakdown'>(
    formData.calculationMethod || 'detailed-breakdown'
  );
  const [selectedTemplate, setSelectedTemplate] = useState<FinancialGoalTemplate | ''>(
    formData.template || ''
  );

  // Calculate totals when data changes
  useEffect(() => {
    if (calculationMethod === 'detailed-breakdown') {
      const totalExpenses = calculateTotalExpenses(formData.expenses);
      const totalFunding = calculateTotalFunding(formData.fundingSources);
      const remainingGap = totalExpenses - totalFunding;
      
      onChange({
        ...formData,
        totalExpenses,
        totalFunding,
        remainingGap,
        targetAmount: totalExpenses,
      });
    }
  }, [formData.expenses, formData.fundingSources, calculationMethod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const updateExpense = (section: string, field: string, value: any) => {
    const currentSection = formData.expenses?.[section as keyof typeof formData.expenses] || {};
    
    // Ensure the base expenses structure exists
    const baseExpenses = formData.expenses || {
      tuition: { amount: 0 },
      roomAndBoard: { amount: 0, housingType: 'dorm' as const },
      books: { amount: 0 },
      transportation: { amount: 0, type: 'car' as const },
      personal: { amount: 0 },
      fees: { amount: 0 },
      other: { amount: 0 }
    };
    
    const newExpenses = {
      ...baseExpenses,
      [section]: {
        ...currentSection,
        [field]: value
      }
    };
    onChange({ ...formData, expenses: newExpenses });
  };

  const updateFunding = (section: string, field: string, value: any) => {
    const baseFunding = formData.fundingSources || {
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
    
    const newFunding = { ...baseFunding };
    
    if (field === '') {
      // Direct assignment for arrays like scholarships - use type assertion
      (newFunding as any)[section] = value;
    } else if (typeof value === 'object' && value.amount !== undefined) {
      // Handle nested objects like federalAid.pellGrant
      const currentFundingSection = (newFunding as any)[section] || {};
      (newFunding as any)[section] = {
        ...currentFundingSection,
        [field]: value
      };
    } else {
      // Handle simple field updates
      const currentFundingSection = (newFunding as any)[section] || {};
      (newFunding as any)[section] = {
        ...currentFundingSection,
        [field]: value
      };
    }
    
    onChange({ ...formData, fundingSources: newFunding });
  };

  const addExpenseEntry = (section: string) => {
    const currentSection = safeAccess(formData.expenses, section as keyof typeof formData.expenses, {} as any);
    const currentEntries = safeAccess(currentSection as any, 'entries', []);
    const newEntry = {
      amount: 0,
      type: section === 'transportation' ? 'car' : 'other',
      description: ''
    };
    
    updateExpense(section, 'entries', [...currentEntries, newEntry]);
  };

  const removeExpenseEntry = (section: string, index: number) => {
    const currentSection = safeAccess(formData.expenses, section as keyof typeof formData.expenses, {} as any);
    const currentEntries = safeAccess(currentSection as any, 'entries', []);
    const newEntries = currentEntries.filter((_: any, i: number) => i !== index);
    updateExpense(section, 'entries', newEntries);
  };

  const updateExpenseEntry = (section: string, index: number, field: string, value: any) => {
    const currentSection = safeAccess(formData.expenses, section as keyof typeof formData.expenses, {} as any);
    const currentEntries = safeAccess(currentSection as any, 'entries', []);
    const newEntries = [...currentEntries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    updateExpense(section, 'entries', newEntries);
  };

  // BugX Template-based conditional rendering
  const renderTemplateExpenses = () => {
    const templateConfig = getTemplateConfig(selectedTemplate);
    const defaultExpenses = [
      { key: 'tuition', title: '🎓 Tuition & Fees', placeholder: '35000', description: 'Annual tuition and mandatory fees' },
      { key: 'roomAndBoard', title: '🏠 Room & Board', placeholder: '12000', description: 'Housing and meal plans' },
      { key: 'books', title: '📚 Books & Supplies', placeholder: '1200', description: 'Textbooks and academic materials' },
      { key: 'transportation', title: '🚗 Transportation', placeholder: '2000', description: 'Travel and commuting costs' },
      { key: 'personal', title: '👤 Personal Expenses', placeholder: '3000', description: 'Personal and miscellaneous costs' },
      { key: 'other', title: '📋 Other Expenses', placeholder: '1000', description: 'Additional miscellaneous expenses' }
    ];

    const expensesToRender = selectedTemplate && templateConfig 
      ? templateConfig.expenses || defaultExpenses
      : defaultExpenses;

    return (
      <div className="space-y-3">
        {expensesToRender.map((expense) => (
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
                    value={String(safeAccess(formData.expenses, `${expense.key}.amount` as any, '') || '')}
                    onChange={(e) => updateExpense(expense.key, 'amount', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
            {expense.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400">{expense.description}</p>
            )}
            
            {/* Special handling for specific expense types */}
            {expense.key === 'roomAndBoard' && (
              <div className="flex items-center gap-2 mt-2">
                <Label className="text-xs">Housing Type:</Label>
                <Select
                  value={String(safeAccess(formData.expenses, 'roomAndBoard.housingType' as any, 'dorm'))}
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

            {expense.key === 'transportation' && (
              <div className="flex items-center gap-2 mt-2">
                <Label className="text-xs">Transport Type:</Label>
                <Select
                  value={String(safeAccess(formData.expenses, 'transportation.type' as any, 'car'))}
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

            {/* Multiple entries support for transportation and other */}
            {(expense.key === 'transportation' || expense.key === 'other') && (
              <div className="space-y-2">
                {safeAccess(formData.expenses as any, `${expense.key}.entries`, []).map((entry: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <Input
                      placeholder="Description"
                      className="text-xs h-7"
                      value={entry.description || ''}
                      onChange={(e) => updateExpenseEntry(expense.key, index, 'description', e.target.value)}
                    />
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        className="w-20 pl-6 text-xs h-7"
                        value={entry.amount || ''}
                        onChange={(e) => updateExpenseEntry(expense.key, index, 'amount', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => removeExpenseEntry(expense.key, index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => addExpenseEntry(expense.key)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Entry
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Enhanced funding sources with conditional logic
  const renderFundingSources = () => {
    return (
      <div className="space-y-4">
        {/* Federal Aid */}
        <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-950/30">
          <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">🇺🇸 Federal Aid</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <Label className="text-xs">Pell Grant</Label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  className="pl-6 text-sm h-8"
                  value={String(safeAccess(formData.fundingSources, 'federalAid.pellGrant.amount' as any, '') || '')}
                  onChange={(e) => updateFunding('federalAid', 'pellGrant', { 
                    ...safeAccess(formData.fundingSources, 'federalAid.pellGrant' as any, {} as any),
                    amount: parseFloat(e.target.value) || 0 
                  })}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Work Study</Label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  className="pl-6 text-sm h-8"
                  value={String((safeAccess(formData.fundingSources as any, 'federalAid.workStudy.amount', '') as any) || '')}
                  onChange={(e) => updateFunding('federalAid', 'workStudy', { 
                    ...(safeAccess(formData.fundingSources as any, 'federalAid.workStudy', {}) as any),
                    amount: parseFloat(e.target.value) || 0 
                  })}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Subsidized Loans</Label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  className="pl-6 text-sm h-8"
                  value={String((safeAccess(formData.fundingSources as any, 'federalAid.subsidizedLoans.amount', '') as any) || '')}
                  onChange={(e) => updateFunding('federalAid', 'subsidizedLoans', { 
                    ...(safeAccess(formData.fundingSources as any, 'federalAid.subsidizedLoans', {}) as any),
                    amount: parseFloat(e.target.value) || 0 
                  })}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Unsubsidized Loans</Label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  className="pl-6 text-sm h-8"
                  value={String((safeAccess(formData.fundingSources as any, 'federalAid.unsubsidizedLoans.amount', '') as any) || '')}
                  onChange={(e) => updateFunding('federalAid', 'unsubsidizedLoans', { 
                    ...(safeAccess(formData.fundingSources as any, 'federalAid.unsubsidizedLoans', {}) as any),
                    amount: parseFloat(e.target.value) || 0 
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Family Contribution */}
        <div className="border rounded-lg p-3 bg-purple-50 dark:bg-purple-950/30">
          <Label className="text-sm font-medium text-purple-800 dark:text-purple-200">👨‍👩‍👧‍👦 Family Contribution</Label>
          <div className="mt-2">
            <div className="relative">
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                type="number"
                className="pl-6 text-sm h-8 w-32"
                placeholder="15000"
                value={String((safeAccess(formData.fundingSources as any, 'familyContribution.amount', '') as any) || '')}
                onChange={(e) => updateFunding('familyContribution', 'amount', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        {/* Employment */}
        <div className="border rounded-lg p-3 bg-green-50 dark:bg-green-950/30">
          <Label className="text-sm font-medium text-green-800 dark:text-green-200">💼 Employment</Label>
          <div className="flex items-center gap-2 mt-2">
            <div className="relative">
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                type="number"
                className="pl-6 text-sm h-8 w-28"
                placeholder="5000"
                value={String((safeAccess(formData.fundingSources as any, 'employment.amount', '') as any) || '')}
                onChange={(e) => updateFunding('employment', 'amount', parseFloat(e.target.value) || 0)}
              />
            </div>
            <Select
              value={String((safeAccess(formData.fundingSources as any, 'employment.jobType', 'part-time') as any))}
              onValueChange={(value) => updateFunding('employment', 'jobType', value)}
            >
              <SelectTrigger className="w-32 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(JOB_TYPES).map(([key, type]) => (
                  <SelectItem key={key} value={key} className="text-sm">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Goal Configuration Header */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-blue-800 dark:text-blue-200">🎯 Financial Goal Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm min-w-fit">Template:</Label>
            <Select 
              value={selectedTemplate ? selectedTemplate : 'none'} 
              onValueChange={(value) => {
                const templateValue = value === 'none' ? '' : value;
                setSelectedTemplate(templateValue as FinancialGoalTemplate);
                
                // Auto-populate title and description when template is selected
                if (templateValue && templateValue !== 'custom') {
                  const template = FINANCIAL_GOAL_TEMPLATES[templateValue as FinancialGoalTemplate];
                  onChange({ 
                    ...formData, 
                    template: templateValue as FinancialGoalTemplate,
                    title: template.title,
                    description: template.description
                  });
                } else {
                  onChange({ ...formData, template: templateValue as FinancialGoalTemplate });
                }
              }}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Choose template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Template (Custom)</SelectItem>
                {Object.entries(FINANCIAL_GOAL_TEMPLATES).map(([key, template]) => (
                  <SelectItem key={key} value={key}>
                    {template.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-sm min-w-fit">Goal Title:</Label>
            <Input
              className="w-56"
              placeholder="My Financial Goal"
              value={formData.title || ''}
              onChange={(e) => onChange({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-sm min-w-fit">Calculation Method:</Label>
            <Select 
              value={calculationMethod} 
              onValueChange={(value) => {
                setCalculationMethod(value as 'manual-total' | 'detailed-breakdown');
                onChange({ ...formData, calculationMethod: value as 'manual-total' | 'detailed-breakdown' });
              }}
            >
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CALCULATION_METHODS).map(([key, method]) => (
                  <SelectItem key={key} value={key}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Manual Total Method */}
      {calculationMethod === 'manual-total' && (
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle>Manual Total Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm min-w-fit">Target Amount:</Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    className="w-24 pl-6"
                    placeholder="45000"
                    value={formData.targetAmount || ''}
                    onChange={(e) => onChange({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                {errors.targetAmount && (
                  <p className="text-sm text-red-600">{errors.targetAmount}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm min-w-fit">Current Amount:</Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    className="w-24 pl-6"
                    placeholder="12500"
                    value={formData.currentAmount || ''}
                    onChange={(e) => onChange({ ...formData, currentAmount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Breakdown Method */}
      {calculationMethod === 'detailed-breakdown' && (
        <>
          {/* Expenses Breakdown */}
          <Card id="expenses-section" className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
            <CardHeader className="pb-1 flex flex-row items-center justify-between">
              <CardTitle className="text-orange-800 dark:text-orange-200">📚 Expenses Breakdown</CardTitle>
              {onSaveSection && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onSaveSection('Expenses')}
                  className="text-xs"
                >
                  Save Section
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Template-specific expenses */}
              {renderTemplateExpenses()}

              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Expenses:</span>
                  <span>{formatCurrency(formData.totalExpenses || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Funding Sources */}
          <Card id="funding-section" className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
            <CardHeader className="pb-1 flex flex-row items-center justify-between">
              <CardTitle className="text-green-800 dark:text-green-200">💰 Funding Sources</CardTitle>
              {onSaveSection && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onSaveSection('Funding')}
                  className="text-xs"
                >
                  Save Section
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {renderFundingSources()}

              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Funding:</span>
                  <span className="text-green-600">{formatCurrency(formData.totalFunding || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle>💰 Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-lg">
                  <span>Total Expenses:</span>
                  <span className="font-semibold">{formatCurrency(formData.totalExpenses || 0)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Total Funding:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(formData.totalFunding || 0)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-xl font-bold">
                  <span>Remaining Gap:</span>
                  <span className={(formData.remainingGap || 0) > 0 ? 'text-red-600' : 'text-green-600'}>
                    {formatCurrency(formData.remainingGap || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}