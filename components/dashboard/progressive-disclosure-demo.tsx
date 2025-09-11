/**
 * Progressive Disclosure Demo Component
 * 
 * A simplified demonstration of progressive disclosure that can be embedded
 * in the existing dashboard without complex dependencies.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  Brain, 
  CheckCircle, 
  ArrowRight,
  Target,
  DollarSign,
  Calendar
} from 'lucide-react';

interface FieldConfig {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  icon: any;
  dependencies: string[];
  expertiseLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';
  confidenceThreshold: number;
}

export function ProgressiveDisclosureDemo() {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [expertiseLevel, setExpertiseLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [confidenceScores, setConfidenceScores] = useState<Record<string, number>>({});

  // Field configuration
  const fieldConfigs: FieldConfig[] = [
    {
      id: 'title',
      label: 'Goal Title',
      type: 'text',
      placeholder: 'e.g., College Fund',
      icon: Target,
      dependencies: [],
      expertiseLevel: 'all',
      confidenceThreshold: 0.0
    },
    {
      id: 'targetAmount',
      label: 'Target Amount',
      type: 'number',
      placeholder: '25000',
      icon: DollarSign,
      dependencies: ['title'],
      expertiseLevel: 'all',
      confidenceThreshold: 0.3
    },
    {
      id: 'deadline',
      label: 'Target Date',
      type: 'date',
      placeholder: '',
      icon: Calendar,
      dependencies: ['targetAmount'],
      expertiseLevel: 'all',
      confidenceThreshold: 0.5
    },
    {
      id: 'currentAmount',
      label: 'Current Savings',
      type: 'number',
      placeholder: '5000',
      icon: DollarSign,
      dependencies: ['deadline'],
      expertiseLevel: 'intermediate',
      confidenceThreshold: 0.6
    },
    {
      id: 'monthlyContribution',
      label: 'Monthly Savings Capacity',
      type: 'number',
      placeholder: '500',
      icon: DollarSign,
      dependencies: ['currentAmount'],
      expertiseLevel: 'advanced',
      confidenceThreshold: 0.7
    }
  ];

  // Calculate field visibility
  const isFieldVisible = (field: FieldConfig): boolean => {
    // Check expertise level
    if (field.expertiseLevel !== 'all' && field.expertiseLevel !== expertiseLevel) {
      if (expertiseLevel === 'beginner' && field.expertiseLevel !== 'beginner') return false;
      if (expertiseLevel === 'intermediate' && field.expertiseLevel === 'advanced') return false;
    }

    // Check dependencies
    const dependenciesMet = field.dependencies.every(dep => {
      const value = formData[dep];
      return value !== undefined && value !== null && value !== '';
    });

    if (!dependenciesMet) return false;

    // Check confidence threshold
    const avgConfidence = calculateAverageConfidence();
    return avgConfidence >= field.confidenceThreshold;
  };

  // Calculate confidence for a field value
  const calculateFieldConfidence = (fieldId: string, value: any): number => {
    if (!value || value === '') return 0;

    switch (fieldId) {
      case 'title':
        return value.length > 3 ? 0.8 : 0.4;
      case 'targetAmount':
        const amount = parseFloat(value);
        return amount > 0 ? (amount > 1000 ? 0.9 : 0.6) : 0.2;
      case 'deadline':
        const futureDate = new Date(value) > new Date();
        return futureDate ? 0.9 : 0.3;
      case 'currentAmount':
        return parseFloat(value) >= 0 ? 0.8 : 0.2;
      case 'monthlyContribution':
        return parseFloat(value) > 0 ? 0.9 : 0.3;
      default:
        return 0.5;
    }
  };

  // Calculate average confidence
  const calculateAverageConfidence = (): number => {
    const scores = Object.values(confidenceScores);
    return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  };

  // Handle field changes
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    // Update confidence score
    const confidence = calculateFieldConfidence(fieldId, value);
    setConfidenceScores(prev => ({ ...prev, [fieldId]: confidence }));
  };

  // Get visible fields
  const visibleFields = fieldConfigs.filter(isFieldVisible);
  const completionRate = Object.keys(formData).filter(key => formData[key] && formData[key] !== '').length / visibleFields.length;
  const overallConfidence = calculateAverageConfidence();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-600" />
            Progressive Disclosure Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Expertise Level Selector */}
            <div>
              <Label className="text-sm font-medium">Experience Level:</Label>
              <div className="flex gap-2 mt-2">
                {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                  <Button
                    key={level}
                    variant={expertiseLevel === level ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setExpertiseLevel(level)}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            {/* Progress Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Completion</span>
                  <span>{Math.round(completionRate * 100)}%</span>
                </div>
                <Progress value={completionRate * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>AI Confidence</span>
                  <span>{Math.round(overallConfidence * 100)}%</span>
                </div>
                <Progress value={overallConfidence * 100} className="h-2" />
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Visible Fields: {visibleFields.length}</span>
              <span>•</span>
              <span>Mode: {expertiseLevel}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Form Fields */}
      <div className="space-y-4">
        {visibleFields.map((field, index) => {
          const confidence = confidenceScores[field.id] || 0;
          const isCompleted = formData[field.id] && formData[field.id] !== '';
          
          return (
            <Card 
              key={field.id}
              className={`transition-all duration-500 ${
                index === visibleFields.length - 1 ? 'animate-pulse border-indigo-300' : ''
              }`}
            >
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {/* Field Header */}
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <field.icon className="w-4 h-4 text-gray-600" />
                      {field.label}
                    </Label>
                    
                    <div className="flex items-center gap-2">
                      {isCompleted && <CheckCircle className="w-4 h-4 text-green-600" />}
                      <Badge variant="outline" className="text-xs">
                        {Math.round(confidence * 100)}% confidence
                      </Badge>
                    </div>
                  </div>

                  {/* Input */}
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  />

                  {/* Progressive Disclosure Explanation */}
                  {index === visibleFields.length - 1 && visibleFields.length < fieldConfigs.length && (
                    <div className="text-xs text-indigo-600 bg-indigo-50 p-2 rounded flex items-center gap-2">
                      <Brain className="w-3 h-3" />
                      This field appeared because: {
                        field.dependencies.length > 0 
                          ? `Previous fields completed (${field.dependencies.join(', ')})`
                          : 'It matches your expertise level'
                      }
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Next Field Preview */}
        {visibleFields.length < fieldConfigs.length && (
          <Card className="border-dashed border-gray-300 bg-gray-50">
            <CardContent className="pt-4">
              <div className="text-center text-gray-500">
                <ArrowRight className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm">
                  Complete the fields above to reveal more options
                </p>
                <p className="text-xs mt-1">
                  Next: {fieldConfigs.find(f => !visibleFields.includes(f))?.label || 'Advanced Planning'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Demo Summary */}
      <Card>
        <CardContent className="pt-4">
          <h4 className="font-medium mb-2">Progressive Disclosure in Action:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Fields appear based on your expertise level ({expertiseLevel})</li>
            <li>• Dependencies ensure logical flow (title → amount → date → savings)</li>
            <li>• AI confidence guides when to show advanced options</li>
            <li>• Real-time feedback helps maintain data quality</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}