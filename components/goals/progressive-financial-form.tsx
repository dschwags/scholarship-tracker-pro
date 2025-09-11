/**
 * Progressive Financial Form Component
 * 
 * Demonstrates progressive disclosure integration with financial goal creation.
 * Fields appear intelligently based on user input patterns and AI confidence levels.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb, 
  ArrowRight,
  Target,
  Calendar,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { useProgressiveDisclosure } from '@/lib/hooks/use-progressive-disclosure';
import { useAIForm } from '@/lib/hooks/use-ai-form';

interface ProgressiveFinancialFormProps {
  onSubmit?: (data: Record<string, any>) => Promise<void>;
  initialData?: Record<string, any>;
  userExpertiseLevel?: 'beginner' | 'intermediate' | 'advanced';
  className?: string;
}

export function ProgressiveFinancialForm({
  onSubmit,
  initialData = {},
  userExpertiseLevel = 'intermediate',
  className = ''
}: ProgressiveFinancialFormProps) {
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    monthlyContribution: '',
    description: '',
    ...initialData
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Progressive disclosure integration
  const {
    isFieldVisible,
    isFieldRequired,
    isFieldHighlighted,
    shouldShowHelp,
    getRecommendedNextFields,
    getFieldOrder,
    markFieldCompleted,
    updateConfidenceScore,
    updateContext,
    completionRate,
    overallConfidence,
    visibleFieldsCount
  } = useProgressiveDisclosure(formData, {
    userExpertiseLevel,
    enableAdaptiveOrdering: true,
    enableRecommendations: true
  });

  // AI form integration
  const {
    aiState,
    updateField,
    validateForm,
    getFieldSuggestions,
    getUncertaintyHelp
  } = useAIForm(formData, {
    initialPhase: 'basic_info',
    enableRealTimeValidation: true,
    enableProgressiveDisclosure: true
  });

  // Sync AI state with progressive disclosure
  useEffect(() => {
    updateContext({
      formData,
      confidenceScores: aiState.confidenceScores,
      validationResults: aiState.validationResults,
      uncertaintyFlags: aiState.uncertaintyFlags
    });
  }, [formData, aiState.confidenceScores, aiState.validationResults, aiState.uncertaintyFlags]);

  // Handle field changes
  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    updateField(fieldId, value);
    
    // Mark as completed if field has meaningful value
    if (value && value !== '') {
      markFieldCompleted(fieldId);
    }
    
    // Update confidence based on field completeness
    const confidence = calculateFieldConfidence(fieldId, value);
    updateConfidenceScore(fieldId, confidence);
  }, [updateField, markFieldCompleted, updateConfidenceScore]);

  // Calculate field confidence based on value quality
  const calculateFieldConfidence = (fieldId: string, value: any): number => {
    if (!value || value === '') return 0;
    
    switch (fieldId) {
      case 'title':
        return value.length > 5 ? 0.9 : 0.6;
      case 'targetAmount':
        const amount = parseFloat(value);
        return amount > 0 ? (amount > 1000 ? 0.9 : 0.7) : 0.3;
      case 'deadline':
        const futureDate = new Date(value) > new Date();
        return futureDate ? 0.9 : 0.4;
      case 'monthlyContribution':
        const monthly = parseFloat(value);
        return monthly > 0 ? 0.8 : 0.5;
      default:
        return 0.7;
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const validation = await validateForm();
      
      if (validation.errors.length > 0) {
        console.log('Form validation failed:', validation.errors);
        return;
      }
      
      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Field configuration with progressive disclosure
  const fieldConfigs = [
    {
      id: 'title',
      label: 'Goal Title',
      type: 'text',
      placeholder: 'e.g., College Tuition Fund',
      icon: Target,
      helpText: 'Give your goal a clear, specific name',
      section: 'basic'
    },
    {
      id: 'targetAmount',
      label: 'Target Amount',
      type: 'number',
      placeholder: '25000',
      icon: DollarSign,
      helpText: 'Total amount you need to save',
      section: 'basic'
    },
    {
      id: 'deadline',
      label: 'Target Date',
      type: 'date',
      icon: Calendar,
      helpText: 'When do you need this money?',
      section: 'basic'
    },
    {
      id: 'currentAmount',
      label: 'Current Savings',
      type: 'number',
      placeholder: '5000',
      icon: DollarSign,
      helpText: 'Amount you already have saved',
      section: 'financial'
    },
    {
      id: 'monthlyContribution',
      label: 'Monthly Contribution Capacity',
      type: 'number',
      placeholder: '500',
      icon: TrendingUp,
      helpText: 'How much can you save per month?',
      section: 'financial'
    },
    {
      id: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Describe your goal in more detail...',
      helpText: 'Additional context about your goal',
      section: 'details'
    }
  ];

  // Get visible fields in suggested order
  const visibleFields = fieldConfigs
    .filter(field => isFieldVisible(field.id))
    .sort((a, b) => getFieldOrder(a.id) - getFieldOrder(b.id));

  // Get recommended next fields
  const recommendedFields = getRecommendedNextFields();

  // Calculate progress metrics
  const progressPercentage = Math.round(completionRate * 100);
  const confidencePercentage = Math.round(overallConfidence * 100);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              Progressive Financial Goal Planning
            </CardTitle>
            <Badge variant="outline" className="text-sm">
              {userExpertiseLevel} Mode
            </Badge>
          </div>
          
          <div className="space-y-3">
            {/* Completion Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Form Completion</span>
                <span>{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Confidence Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>AI Confidence</span>
                <span className={confidencePercentage >= 70 ? 'text-green-600' : 'text-yellow-600'}>
                  {confidencePercentage}%
                </span>
              </div>
              <Progress 
                value={confidencePercentage} 
                className={`h-2 ${confidencePercentage >= 70 ? 'bg-green-100' : 'bg-yellow-100'}`} 
              />
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Visible Fields: {visibleFieldsCount}</span>
              <span>•</span>
              <span>Phase: {aiState.currentPhase.replace('_', ' ')}</span>
              {aiState.needsManualIntervention && (
                <>
                  <span>•</span>
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Needs Review
                  </Badge>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* AI Suggestions */}
      {aiState.validationResults.suggestions.length > 0 && (
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">AI Suggestions:</p>
              <ul className="text-sm space-y-1">
                {aiState.validationResults.suggestions.slice(0, 3).map((suggestion, index) => (
                  <li key={index}>• {suggestion.message}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Recommended Next Steps */}
      {recommendedFields.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-blue-600" />
              Recommended Next Steps
            </h4>
            <div className="space-y-2">
              {recommendedFields.map((field) => {
                const config = fieldConfigs.find(f => f.id === field.fieldId);
                return config ? (
                  <div key={field.fieldId} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {config.icon && <config.icon className="w-4 h-4 text-blue-600" />}
                      <span className="text-sm font-medium">{config.label}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(field.confidence * 100)}% confidence
                    </Badge>
                  </div>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {visibleFields.map((field) => {
          const isHighlighted = isFieldHighlighted(field.id);
          const showHelp = shouldShowHelp(field.id);
          const suggestions = getFieldSuggestions(field.id);
          const uncertainty = getUncertaintyHelp(field.id);
          const isRequired = isFieldRequired(field.id);

          return (
            <Card 
              key={field.id} 
              className={`transition-all duration-300 ${isHighlighted ? 'ring-2 ring-yellow-300 bg-yellow-50' : ''}`}
            >
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {/* Field Header */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor={field.id} className="flex items-center gap-2 text-base">
                      {field.icon && <field.icon className="w-4 h-4 text-gray-600" />}
                      {field.label}
                      {isRequired && <span className="text-red-500">*</span>}
                    </Label>
                    
                    {/* Confidence Indicator */}
                    <div className="flex items-center gap-2">
                      {formData[field.id] && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        Order: {getFieldOrder(field.id)}
                      </Badge>
                    </div>
                  </div>

                  {/* Input Field */}
                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.id}
                      className="w-full p-3 border rounded-lg resize-none"
                      rows={3}
                      placeholder={field.placeholder}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    />
                  ) : (
                    <Input
                      id={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="text-base"
                    />
                  )}

                  {/* Help Text */}
                  {showHelp && field.helpText && (
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      💡 {field.helpText}
                    </p>
                  )}

                  {/* AI Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                      <Lightbulb className="w-3 h-3 inline mr-1" />
                      {suggestions.join(', ')}
                    </div>
                  )}

                  {/* Uncertainty Help */}
                  {uncertainty && (
                    <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      {uncertainty.suggestedClarification}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Separator />

        {/* Submit Section */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {visibleFieldsCount} fields visible • {Math.round(completionRate * 100)}% complete
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting || progressPercentage < 30}
            className="px-8"
          >
            {isSubmitting ? 'Creating Goal...' : 'Create Financial Goal'}
          </Button>
        </div>
      </form>
    </div>
  );
}