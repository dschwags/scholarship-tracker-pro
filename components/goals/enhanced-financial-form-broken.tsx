'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, X, DollarSign, Calculator, AlertCircle } from 'lucide-react';
import { 
  FinancialGoal,
  ScholarshipFunding,
  FUNDING_SCOPES,
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
    const newExpenses = {
      ...formData.expenses,
      [section]: {
        ...formData.expenses?.[section],
        [field]: value
      }
    };
    onChange({ ...formData, expenses: newExpenses });
  };

  const updateFunding = (section: string, field: string, value: any) => {
    const newFunding = { ...formData.fundingSources };
    
    if (field === '') {
      // Direct assignment for arrays like scholarships
      newFunding[section] = value;
    } else if (typeof value === 'object' && value.amount !== undefined) {
      // Handle nested objects like federalAid.pellGrant
      newFunding[section] = {
        ...newFunding[section],
        [field]: value
      };
    } else {
      // Handle simple field updates
      newFunding[section] = {
        ...newFunding[section],
        [field]: value
      };
    }
    
    onChange({ ...formData, fundingSources: newFunding });
  };

  const addExpenseEntry = (section: string) => {
    const currentEntries = formData.expenses?.[section]?.entries || [];
    const newEntry = {
      amount: 0,
      type: section === 'transportation' ? 'car' : 'other',
      description: ''
    };
    
    updateExpense(section, 'entries', [...currentEntries, newEntry]);
  };

  const removeExpenseEntry = (section: string, index: number) => {
    const currentEntries = formData.expenses?.[section]?.entries || [];
    const newEntries = currentEntries.filter((_, i) => i !== index);
    updateExpense(section, 'entries', newEntries);
  };

  const updateExpenseEntry = (section: string, index: number, field: string, value: any) => {
    const currentEntries = formData.expenses?.[section]?.entries || [];
    const newEntries = [...currentEntries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    updateExpense(section, 'entries', newEntries);
  };

  const addFundingEntry = (section: string) => {
    const currentEntries = formData.fundingSources?.[section]?.entries || [];
    const newEntry = {
      amount: 0,
      source: '',
      description: ''
    };
    
    updateFunding(section, 'entries', [...currentEntries, newEntry]);
  };

  const removeFundingEntry = (section: string, index: number) => {
    const currentEntries = formData.fundingSources?.[section]?.entries || [];
    const newEntries = currentEntries.filter((_, i) => i !== index);
    updateFunding(section, 'entries', newEntries);
  };

  const updateFundingEntry = (section: string, index: number, field: string, value: any) => {
    const currentEntries = formData.fundingSources?.[section]?.entries || [];
    const newEntries = [...currentEntries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    updateFunding(section, 'entries', newEntries);
  };

  // Get template configuration
  const templateConfig = getTemplateConfig(selectedTemplate);

  // Template application effect
  useEffect(() => {
    if (selectedTemplate && selectedTemplate !== 'custom') {
      // Apply template-specific title if not custom
      const template = FINANCIAL_GOAL_TEMPLATES[selectedTemplate];
      if (template && !formData.title) {
        onChange({ ...formData, title: template.title });
      }
    }
  }, [selectedTemplate]);

  // Render template-specific expenses
  const renderTemplateExpenses = () => {
    return templateConfig.expenses.map((expenseConfig) => {
      const { key, title, placeholder, description, allowMultiple } = expenseConfig;
      const currentValue = formData.expenses?.[key]?.amount || 0;
      
      return (
        <div key={key} className="bg-white dark:bg-gray-800 p-2 rounded-lg border">
          <h4 className="font-medium text-sm mb-2">{title}</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm min-w-fit">Amount:</Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    className="w-24 pl-6"
                    placeholder={placeholder}
                    value={currentValue}
                    onChange={(e) => updateExpense(key, 'amount', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              {description && (
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-gray-600">{description}</Label>
                </div>
              )}
              {allowMultiple && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addExpenseEntry(key)}
                  className="text-xs"
                >
                  + Add More
                </Button>
              )}
            </div>
            
            {/* Additional entries for expenses that allow multiple */}
            {allowMultiple && formData.expenses?.[key]?.entries && (
              <div className="space-y-1">
                {formData.expenses[key].entries.map((entry: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 ml-4">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        className="w-24 pl-6"
                        placeholder="0"
                        value={entry.amount || 0}
                        onChange={(e) => updateExpenseEntry(key, index, 'amount', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <Input
                      className="w-44"
                      placeholder="Description"
                      value={entry.description || ''}
                      onChange={(e) => updateExpenseEntry(key, index, 'description', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExpenseEntry(key, index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-3">
      {/* Template Selection */}
      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle>Financial Goal Template</CardTitle>
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
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm min-w-fit">Amount:</Label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="number"
                          className="w-24 pl-6"
                          placeholder="2000"
                          value={formData.expenses?.transportation?.amount || 0}
                          onChange={(e) => updateExpense('transportation', 'amount', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm min-w-fit">Type:</Label>
                      <Select 
                        value={formData.expenses?.transportation?.type || 'car'} 
                        onValueChange={(value) => updateExpense('transportation', 'type', value)}
                      >
                        <SelectTrigger className="w-44">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(TRANSPORTATION_TYPES).map(([key, type]) => (
                            <SelectItem key={key} value={key}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addExpenseEntry('transportation')}
                      className="flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add More
                    </Button>
                  </div>

                  {/* Additional Transportation Entries */}
                  {formData.expenses?.transportation?.entries?.map((entry, index) => (
                    <div key={index} className="ml-4 p-2 bg-gray-50 dark:bg-gray-700 rounded border-l-2 border-blue-300">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm min-w-fit">Amount:</Label>
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <Input
                              type="number"
                              className="w-24 pl-6"
                              placeholder="0"
                              value={entry.amount || 0}
                              onChange={(e) => updateExpenseEntry('transportation', index, 'amount', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm min-w-fit">Type:</Label>
                          <Select 
                            value={entry.type || 'car'} 
                            onValueChange={(value) => updateExpenseEntry('transportation', index, 'type', value)}
                          >
                            <SelectTrigger className="w-44">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(TRANSPORTATION_TYPES).map(([key, type]) => (
                                <SelectItem key={key} value={key}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeExpenseEntry('transportation', index)}
                          className="text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm min-w-fit">Description:</Label>
                        <Input
                          className="w-48"
                          placeholder="e.g., Monthly bus pass"
                          value={entry.description || ''}
                          onChange={(e) => updateExpenseEntry('transportation', index, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Expenses */}
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border">
                <h4 className="font-medium text-sm mb-2">👤 Personal Expenses</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm min-w-fit">Amount:</Label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="number"
                          className="w-24 pl-6"
                          placeholder="3000"
                          value={formData.expenses?.personal?.amount || 0}
                          onChange={(e) => updateExpense('personal', 'amount', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm min-w-fit">Living Level:</Label>
                      <Select 
                        value={formData.expenses?.personal?.livingLevel || 'moderate'} 
                        onValueChange={(value) => updateExpense('personal', 'livingLevel', value)}
                      >
                        <SelectTrigger className="w-44">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(COST_OF_LIVING_LEVELS).map(([key, level]) => (
                            <SelectItem key={key} value={key}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Expenses */}
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border">
                <h4 className="font-medium text-sm mb-2">💼 Other Expenses</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm min-w-fit">Amount:</Label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="number"
                          className="w-24 pl-6"
                          placeholder="1500"
                          value={formData.expenses?.other?.amount || 0}
                          onChange={(e) => updateExpense('other', 'amount', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm min-w-fit">Description:</Label>
                      <Input
                        className="w-44"
                        placeholder="Books, supplies, etc."
                        value={formData.expenses?.other?.description || ''}
                        onChange={(e) => updateExpense('other', 'description', e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addExpenseEntry('other')}
                      className="flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add More
                    </Button>
                  </div>

                  {/* Additional Other Entries */}
                  {formData.expenses?.other?.entries?.map((entry, index) => (
                    <div key={index} className="ml-4 p-2 bg-gray-50 dark:bg-gray-700 rounded border-l-2 border-blue-300">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm min-w-fit">Amount:</Label>
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <Input
                              type="number"
                              className="w-24 pl-6"
                              placeholder="0"
                              value={entry.amount || 0}
                              onChange={(e) => updateExpenseEntry('other', index, 'amount', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm min-w-fit">Description:</Label>
                          <Input
                            className="w-44"
                            placeholder="e.g., Lab fees, textbooks"
                            value={entry.description || ''}
                            onChange={(e) => updateExpenseEntry('other', index, 'description', e.target.value)}
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeExpenseEntry('other', index)}
                          className="text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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
              {/* State Grants */}
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border">
                <h4 className="font-medium text-sm mb-2">🏛️ State Grants</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm min-w-fit">Amount:</Label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="number"
                          className="w-24 pl-6"
                          placeholder="5000"
                          value={formData.fundingSources?.stateGrants?.amount || 0}
                          onChange={(e) => updateFunding('stateGrants', 'amount', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm min-w-fit">Grant Name:</Label>
                      <Input
                        className="w-44"
                        placeholder="e.g., State Merit Grant"
                        value={formData.fundingSources?.stateGrants?.source || ''}
                        onChange={(e) => updateFunding('stateGrants', 'source', e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addFundingEntry('stateGrants')}
                      className="flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add More
                    </Button>
                  </div>

                  {/* Additional State Grant Entries */}
                  {formData.fundingSources?.stateGrants?.entries?.map((entry, index) => (
                    <div key={index} className="ml-4 p-2 bg-gray-50 dark:bg-gray-700 rounded border-l-2 border-green-300">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm min-w-fit">Amount:</Label>
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <Input
                              type="number"
                              className="w-24 pl-6"
                              placeholder="0"
                              value={entry.amount || 0}
                              onChange={(e) => updateFundingEntry('stateGrants', index, 'amount', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm min-w-fit">Grant Name:</Label>
                          <Input
                            className="w-44"
                            placeholder="e.g., Need-Based Grant"
                            value={entry.source || ''}
                            onChange={(e) => updateFundingEntry('stateGrants', index, 'source', e.target.value)}
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFundingEntry('stateGrants', index)}
                          className="text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm min-w-fit">Description:</Label>
                        <Input
                          className="w-48"
                          placeholder="Grant details or requirements"
                          value={entry.description || ''}
                          onChange={(e) => updateFundingEntry('stateGrants', index, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Federal Aid */}
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border">
                <h4 className="font-medium text-sm mb-2">🏛️ Federal Aid</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm min-w-fit">Pell Grant:</Label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="number"
                          className="w-24 pl-6"
                          placeholder="6000"
                          value={formData.fundingSources?.federalAid?.pellGrant?.amount || 0}
                          onChange={(e) => updateFunding('federalAid', 'pellGrant', { amount: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm min-w-fit">Work Study:</Label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="number"
                          className="w-24 pl-6"
                          placeholder="2500"
                          value={formData.fundingSources?.federalAid?.workStudy?.amount || 0}
                          onChange={(e) => updateFunding('federalAid', 'workStudy', { amount: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm min-w-fit">Subsidized Loans:</Label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="number"
                          className="w-24 pl-6"
                          placeholder="3500"
                          value={formData.fundingSources?.federalAid?.subsidizedLoans?.amount || 0}
                          onChange={(e) => updateFunding('federalAid', 'subsidizedLoans', { amount: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm min-w-fit">Unsubsidized Loans:</Label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="number"
                          className="w-24 pl-6"
                          placeholder="2000"
                          value={formData.fundingSources?.federalAid?.unsubsidizedLoans?.amount || 0}
                          onChange={(e) => updateFunding('federalAid', 'unsubsidizedLoans', { amount: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scholarships */}
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border">
                <h4 className="font-medium text-sm mb-2">🎓 Scholarships</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm min-w-fit">Amount:</Label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="number"
                          className="w-24 pl-6"
                          placeholder="5000"
                          value={formData.fundingSources?.scholarships?.[0]?.amount || 0}
                          onChange={(e) => {
                            const scholarships = formData.fundingSources?.scholarships || [{ amount: 0, source: '', duration: 'annual' }];
                            scholarships[0] = { ...scholarships[0], amount: parseFloat(e.target.value) || 0 };
                            updateFunding('scholarships', '', scholarships);
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm min-w-fit">Source:</Label>
                      <Input
                        className="w-44"
                        placeholder="e.g., Merit Scholarship"
                        value={formData.fundingSources?.scholarships?.[0]?.source || ''}
                        onChange={(e) => {
                          const scholarships = formData.fundingSources?.scholarships || [{ amount: 0, source: '', duration: 'annual' }];
                          scholarships[0] = { ...scholarships[0], source: e.target.value };
                          updateFunding('scholarships', '', scholarships);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Family & Friends */}
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border">
                <h4 className="font-medium text-sm mb-2">👨‍👩‍👧‍👦 Family & Friends</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm min-w-fit">Family Contribution:</Label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="number"
                          className="w-24 pl-6"
                          placeholder="8000"
                          value={formData.fundingSources?.familyContribution?.amount || 0}
                          onChange={(e) => updateFunding('familyContribution', 'amount', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm min-w-fit">Friends Contribution:</Label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="number"
                          className="w-24 pl-6"
                          placeholder="1000"
                          value={formData.fundingSources?.familyContribution?.friendsContribution || 0}
                          onChange={(e) => updateFunding('familyContribution', 'friendsContribution', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm min-w-fit">Employer Contribution:</Label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="number"
                          className="w-24 pl-6"
                          placeholder="2000"
                          value={formData.fundingSources?.familyContribution?.employerContribution || 0}
                          onChange={(e) => updateFunding('familyContribution', 'employerContribution', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                <div className="flex justify-between text-lg font-semibold text-green-600">
                  <span>Total Funding:</span>
                  <span>{formatCurrency(formData.totalFunding || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Expenses:</span>
                  <span className="font-semibold">{formatCurrency(formData.totalExpenses || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Funding:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(formData.totalFunding || 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Remaining Gap:</span>
                  <span className={`${(formData.remainingGap || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
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