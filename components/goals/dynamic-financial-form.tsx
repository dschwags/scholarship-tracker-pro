'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, DollarSign, Edit3, Trash2 } from 'lucide-react';
import { safeAccess } from '@/components/bugx/BugX-Schema-Framework';
import {
  FinancialGoal,
  calculateTotalExpenses,
  calculateTotalFunding,
} from './goals-types';

interface DynamicExpenseField {
  id: string;
  key: string;
  title: string;
  placeholder: string;
  description: string;
  allowMultiple?: boolean;
  required?: boolean;
  userDefined?: boolean;
  category?: string;
}

interface DynamicFinancialFormProps {
  formData: Partial<FinancialGoal> & { 
    template?: any; 
    title?: string;
    expenses?: any;
    fundingSources?: any;
    customExpenseFields?: DynamicExpenseField[];
  };
  onChange: (data: any) => void;
  errors: Record<string, string>;
  templateData?: any; // From the enhanced template builder
}

export function DynamicFinancialForm({ 
  formData, 
  onChange, 
  errors, 
  templateData 
}: DynamicFinancialFormProps) {
  const [customExpenseFields, setCustomExpenseFields] = useState<DynamicExpenseField[]>(
    formData.customExpenseFields || []
  );
  const [customFundingFields, setCustomFundingFields] = useState<any[]>([]);
  const [showAddExpenseField, setShowAddExpenseField] = useState(false);
  const [showAddFundingField, setShowAddFundingField] = useState(false);

  // Initialize fields based on template data
  useEffect(() => {
    if (templateData && templateData.components) {
      const allFields: DynamicExpenseField[] = [];
      
      // Load fields from template components
      templateData.components.forEach((componentId: string) => {
        // This would map to the TEMPLATE_COMPONENTS from enhanced-template-builder
        // For now, we'll use the existing template config
      });

      // Add custom fields from template
      if (templateData.customFields) {
        templateData.customFields.forEach((field: any, index: number) => {
          allFields.push({
            id: `custom-${index}`,
            key: field.title.toLowerCase().replace(/\s+/g, '-'),
            title: field.title,
            placeholder: '0',
            description: field.description,
            userDefined: true,
            category: 'custom'
          });
        });
      }

      setCustomExpenseFields(allFields);
    }
  }, [templateData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const updateExpense = (section: string, field: string, value: any) => {
    const currentSection = formData.expenses?.[section as keyof typeof formData.expenses] || {};
    const newExpenses = {
      ...formData.expenses,
      [section]: {
        ...currentSection,
        [field]: value
      }
    };
    onChange({ ...formData, expenses: newExpenses });
  };

  const updateFunding = (section: string, field: string, value: any) => {
    const newFunding = { ...formData.fundingSources };
    
    if (field === '') {
      newFunding[section] = value;
    } else if (typeof value === 'object' && value.amount !== undefined) {
      const currentFundingSection = newFunding[section as keyof typeof newFunding] || {};
      newFunding[section] = {
        ...currentFundingSection,
        [field]: value
      };
    } else {
      const currentFundingSection = newFunding[section as keyof typeof newFunding] || {};
      newFunding[section] = {
        ...currentFundingSection,
        [field]: value
      };
    }
    
    onChange({ ...formData, fundingSources: newFunding });
  };

  const addCustomExpenseField = () => {
    const newField: DynamicExpenseField = {
      id: `custom-${Date.now()}`,
      key: `custom-${Date.now()}`,
      title: '',
      placeholder: '0',
      description: '',
      userDefined: true,
      category: 'custom'
    };
    setCustomExpenseFields([...customExpenseFields, newField]);
    setShowAddExpenseField(false);
  };

  const updateCustomExpenseField = (id: string, updates: Partial<DynamicExpenseField>) => {
    setCustomExpenseFields(fields => 
      fields.map(field => 
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const removeCustomExpenseField = (id: string) => {
    setCustomExpenseFields(fields => fields.filter(f => f.id !== id));
    // Also remove the data from formData
    const newExpenses = { ...formData.expenses };
    const fieldToRemove = customExpenseFields.find(f => f.id === id);
    if (fieldToRemove) {
      delete newExpenses[fieldToRemove.key];
      onChange({ ...formData, expenses: newExpenses });
    }
  };

  const addExpenseEntry = (section: string) => {
    const currentSection = safeAccess(formData.expenses, section as keyof typeof formData.expenses, {});
    const currentEntries = safeAccess(currentSection, 'entries', []);
    const newEntry = {
      amount: 0,
      description: '',
      type: 'other'
    };
    
    updateExpense(section, 'entries', [...currentEntries, newEntry]);
  };

  const removeExpenseEntry = (section: string, index: number) => {
    const currentSection = safeAccess(formData.expenses, section as keyof typeof formData.expenses, {});
    const currentEntries = safeAccess(currentSection, 'entries', []);
    const newEntries = currentEntries.filter((_: any, i: number) => i !== index);
    updateExpense(section, 'entries', newEntries);
  };

  const updateExpenseEntry = (section: string, index: number, field: string, value: any) => {
    const currentSection = safeAccess(formData.expenses, section as keyof typeof formData.expenses, {});
    const currentEntries = safeAccess(currentSection, 'entries', []);
    const newEntries = [...currentEntries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    updateExpense(section, 'entries', newEntries);
  };

  // Calculate totals
  const totalExpenses = calculateTotalExpenses(formData.expenses);
  const totalFunding = calculateTotalFunding(formData.fundingSources);
  const remainingGap = totalExpenses - totalFunding;

  // Group fields by category
  const expenseFieldsByCategory = customExpenseFields.reduce((acc, field) => {
    const category = field.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(field);
    return acc;
  }, {} as Record<string, DynamicExpenseField[]>);

  const categoryIcons = {
    essential: '🎯',
    academic: '📚',
    living: '🏠',
    special: '✨',
    emergency: '🛡️',
    custom: '🔧',
    general: '📊'
  };

  const categoryNames = {
    essential: 'Essential Academic',
    academic: 'Academic Enhancement',
    living: 'Living Expenses',
    special: 'Special Programs',
    emergency: 'Safety & Emergency',
    custom: 'Custom Categories',
    general: 'General Expenses'
  };

  return (
    <div className="space-y-6">
      {/* Expenses Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            📊 Expenses Breakdown
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAddExpenseField(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Custom Field
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(expenseFieldsByCategory).map(([category, fields]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <span className="text-lg">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                <h3 className="font-semibold text-lg">
                  {categoryNames[category as keyof typeof categoryNames]}
                </h3>
              </div>
              
              <div className="grid gap-4">
                {fields.map((field) => {
                  const currentValue = safeAccess(formData.expenses, field.key, {});
                  const amount = safeAccess(currentValue, 'amount', 0);
                  const entries = safeAccess(currentValue, 'entries', []);

                  return (
                    <Card key={field.id} className="p-4">
                      <div className="space-y-3">
                        {/* Field Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            {field.userDefined && showAddExpenseField ? (
                              <div className="space-y-2">
                                <Input
                                  placeholder="Field Title (e.g., Research Materials)"
                                  value={field.title}
                                  onChange={(e) => updateCustomExpenseField(field.id, { 
                                    title: e.target.value,
                                    key: e.target.value.toLowerCase().replace(/\s+/g, '-')
                                  })}
                                />
                                <Input
                                  placeholder="Description"
                                  value={field.description}
                                  onChange={(e) => updateCustomExpenseField(field.id, { description: e.target.value })}
                                />
                              </div>
                            ) : (
                              <div>
                                <h4 className="font-medium">{field.title}</h4>
                                {field.description && (
                                  <p className="text-sm text-gray-600">{field.description}</p>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {field.userDefined && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAddExpenseField(!showAddExpenseField)}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCustomExpenseField(field.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Amount Input */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm min-w-fit">Amount:</Label>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                              <Input
                                type="number"
                                className="w-32 pl-6"
                                placeholder={field.placeholder}
                                value={amount || ''}
                                onChange={(e) => updateExpense(field.key, 'amount', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </div>
                          
                          {field.allowMultiple && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addExpenseEntry(field.key)}
                              className="text-xs"
                            >
                              + Add More
                            </Button>
                          )}
                        </div>

                        {/* Multiple Entries */}
                        {field.allowMultiple && entries.length > 0 && (
                          <div className="space-y-2 ml-4 pl-4 border-l-2 border-gray-200">
                            {entries.map((entry: any, index: number) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                  <Input
                                    type="number"
                                    className="w-24 pl-6"
                                    placeholder="0"
                                    value={safeAccess(entry, 'amount', 0)}
                                    onChange={(e) => updateExpenseEntry(field.key, index, 'amount', parseFloat(e.target.value) || 0)}
                                  />
                                </div>
                                <Input
                                  className="flex-1"
                                  placeholder="Description"
                                  value={safeAccess(entry, 'description', '')}
                                  onChange={(e) => updateExpenseEntry(field.key, index, 'description', e.target.value)}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeExpenseEntry(field.key, index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Add Custom Field Form */}
          {showAddExpenseField && (
            <Card className="border-dashed border-2 border-blue-300 bg-blue-50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Add Custom Expense Category</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Category Title</Label>
                      <Input placeholder="e.g., Research Materials" />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input placeholder="Brief description" />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowAddExpenseField(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addCustomExpenseField}>
                      Add Field
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Total Expenses */}
          <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg border">
            <span className="font-semibold text-lg">Total Expenses:</span>
            <span className="font-bold text-xl text-orange-600">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Funding Sources Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            💰 Funding Sources
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAddFundingField(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Custom Source
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Standard funding sources (Federal Aid, State Grants, etc.) */}
          {/* This would be similar to the current implementation but with more customization */}
          
          {/* Total Funding */}
          <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border">
            <span className="font-semibold text-lg">Total Funding:</span>
            <span className="font-bold text-xl text-green-600">
              {formatCurrency(totalFunding)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Gap Analysis */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg">Remaining Gap:</span>
            <span className={`font-bold text-xl ${remainingGap > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(Math.abs(remainingGap))}
              {remainingGap < 0 && ' (Surplus)'}
            </span>
          </div>
          {remainingGap > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              You need an additional {formatCurrency(remainingGap)} in funding to meet your goal.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}