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
  calculateTotalFunding
} from './goals-types';

interface EnhancedFinancialFormProps {
  formData: Partial<FinancialGoal> & { template?: FinancialGoalTemplate; title?: string; };
  onChange: (data: Partial<FinancialGoal> & { template?: FinancialGoalTemplate; title?: string; }) => void;
  errors: Record<string, string>;
  onSaveSection?: (section: string) => void;
}

function EnhancedFinancialForm({ formData, onChange, errors, onSaveSection }: EnhancedFinancialFormProps) {
  const [calculationMethod, setCalculationMethod] = useState<'manual-total' | 'detailed-breakdown'>(
    formData.calculationMethod || 'manual-total'
  );
  const [selectedTemplate, setSelectedTemplate] = useState<FinancialGoalTemplate | ''>(
    formData.template || ''
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-3">
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
                <Input
                  type="number"
                  className="w-32"
                  placeholder="$45000"
                  value={formData.targetAmount || ''}
                  onChange={(e) => onChange({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })}
                />
                <span className="text-sm text-gray-500">$</span>
                {errors.targetAmount && (
                  <p className="text-sm text-red-600">{errors.targetAmount}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm min-w-fit">Current Amount:</Label>
                <Input
                  type="number"
                  className="w-32"
                  placeholder="$12500"
                  value={formData.currentAmount || ''}
                  onChange={(e) => onChange({ ...formData, currentAmount: parseFloat(e.target.value) || 0 })}
                />
                <span className="text-sm text-gray-500">$</span>
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
              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Expenses:</span>
                  <span>{formatCurrency(formData.totalExpenses || 0)}</span>
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

export { EnhancedFinancialForm };