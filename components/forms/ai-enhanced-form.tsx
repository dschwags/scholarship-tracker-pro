/**
 * AI-Enhanced Form Component
 * 
 * Demonstrates integration with the AI Decision Engine for intelligent
 * form assistance, progressive disclosure, and real-time validation.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, AlertTriangle, CheckCircle, Info, Lightbulb } from 'lucide-react';
import { useAIForm } from '@/lib/hooks/use-ai-form';

interface AIEnhancedFormProps {
  initialData?: Record<string, any>;
  onSubmit?: (data: Record<string, any>) => Promise<void>;
  className?: string;
}

export function AIEnhancedForm({ 
  initialData = {}, 
  onSubmit,
  className = "" 
}: AIEnhancedFormProps) {
  // AI Form Hook
  const {
    aiState,
    updateField,
    validateForm,
    isFieldVisible,
    getFieldConfidence,
    getFieldSuggestions,
    getUncertaintyHelp,
    getNextRecommendedFields,
    completeSection,
    resolveConflict
  } = useAIForm(initialData, {
    initialPhase: 'goal_creation',
    enableRealTimeValidation: true,
    enableProgressiveDisclosure: true,
    confidenceThreshold: 0.7
  });

  // Local form state
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Update form data and notify AI
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    updateField(fieldId, value);
  };

  // Handle form submission with AI validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowValidation(true);
    
    try {
      // Run AI validation
      const validation = await validateForm();
      
      // Check if there are blocking errors
      if (validation.errors.length > 0) {
        console.log('Form has validation errors, blocking submission');
        return;
      }
      
      // Submit if validation passes
      if (onSubmit) {
        await onSubmit(formData);
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle conflict resolution
  const handleResolveConflict = async (conflictId: string, resolution: any) => {
    await resolveConflict(conflictId, resolution);
  };

  // Get confidence color for visual feedback
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Field configurations for demo
  const fieldConfigs = [
    {
      id: 'title',
      label: 'Goal Title',
      type: 'text',
      placeholder: 'Enter your financial goal title...',
      section: 'basic_info'
    },
    {
      id: 'targetAmount',
      label: 'Target Amount',
      type: 'number',
      placeholder: '0',
      section: 'basic_info'
    },
    {
      id: 'deadline',
      label: 'Target Date',
      type: 'date',
      section: 'basic_info'
    },
    {
      id: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Describe your goal...',
      section: 'details'
    },
    {
      id: 'currentAmount',
      label: 'Current Savings',
      type: 'number',
      placeholder: '0',
      section: 'financial_details'
    },
    {
      id: 'monthlyContribution',
      label: 'Monthly Contribution Capacity',
      type: 'number',
      placeholder: '0',
      section: 'financial_details'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Status Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            AI-Enhanced Financial Goal Form
            {aiState.isProcessing && (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            )}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <Badge variant="outline">
              Phase: {aiState.currentPhase}
            </Badge>
            <Badge variant="outline" className={getConfidenceColor(aiState.validationResults.overallConfidence)}>
              Confidence: {Math.round(aiState.validationResults.overallConfidence * 100)}%
            </Badge>
            {aiState.needsManualIntervention && (
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Needs Review
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* AI Insights and Warnings */}
      {(aiState.validationResults.warnings.length > 0 || aiState.detectedConflicts.length > 0) && (
        <div className="space-y-3">
          {aiState.validationResults.warnings.map((warning, index) => (
            <Alert key={index}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{warning.message}</AlertDescription>
            </Alert>
          ))}
          
          {aiState.detectedConflicts.map((conflict) => (
            <Alert key={conflict.conflictId} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>{conflict.description}</p>
                  <p className="text-sm">Suggested resolution: {conflict.suggestedResolution}</p>
                  <Button 
                    size="sm" 
                    onClick={() => handleResolveConflict(conflict.conflictId, { accepted: true })}
                  >
                    Apply Suggestion
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* AI Suggestions */}
      {aiState.validationResults.suggestions.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium mb-2">AI Suggestions</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {aiState.validationResults.suggestions.map((suggestion, index) => (
                    <li key={index}>• {suggestion.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {fieldConfigs.map((field) => {
          const isVisible = isFieldVisible(field.id);
          const confidence = getFieldConfidence(field.id);
          const suggestions = getFieldSuggestions(field.id);
          const uncertainty = getUncertaintyHelp(field.id);
          
          if (!isVisible) return null;

          return (
            <Card key={field.id} className="relative">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={field.id} className="flex items-center gap-2">
                      {field.label}
                      {confidence < 0.7 && (
                        <Badge variant="outline" className="text-xs">
                          Low Confidence
                        </Badge>
                      )}
                    </Label>
                    
                    {/* Confidence Indicator */}
                    <div className="flex items-center gap-1 text-xs">
                      {confidence >= 0.8 ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : confidence >= 0.6 ? (
                        <Info className="w-3 h-3 text-yellow-600" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                      )}
                      <span className={getConfidenceColor(confidence)}>
                        {Math.round(confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.id}
                      className="w-full p-2 border rounded-md resize-none"
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
                    />
                  )}

                  {/* Field-specific suggestions */}
                  {suggestions.length > 0 && (
                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                      <Lightbulb className="w-3 h-3 inline mr-1" />
                      {suggestions.join(', ')}
                    </div>
                  )}

                  {/* Uncertainty help */}
                  {uncertainty && (
                    <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                      <Info className="w-3 h-3 inline mr-1" />
                      {uncertainty.suggestedClarification}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Next Recommended Fields */}
        {getNextRecommendedFields().length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <h4 className="text-sm font-medium mb-2">Recommended Next Steps</h4>
              <div className="flex flex-wrap gap-2">
                {getNextRecommendedFields().map((fieldId) => {
                  const field = fieldConfigs.find(f => f.id === fieldId);
                  return field ? (
                    <Badge key={fieldId} variant="outline" className="text-xs">
                      {field.label}
                    </Badge>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Validation Results */}
        {showValidation && aiState.validationResults.errors.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <h4 className="text-sm font-medium text-red-600 mb-2">Validation Errors</h4>
              <ul className="text-sm text-red-600 space-y-1">
                {aiState.validationResults.errors.map((error, index) => (
                  <li key={index}>• {error.message}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || aiState.isProcessing}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            'Create Financial Goal'
          )}
        </Button>
      </form>
    </div>
  );
}