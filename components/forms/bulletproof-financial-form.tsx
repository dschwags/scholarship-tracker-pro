/**
 * Bulletproof Financial Form
 * 
 * Production-ready financial goals form with comprehensive safety systems,
 * rollback capabilities, and emergency fallback mechanisms.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useSafeAIForm } from '@/lib/hooks/use-safe-ai-form';
import { useSafeProgressiveDisclosure } from '@/lib/hooks/use-safe-progressive-disclosure';

interface BulletproofFinancialFormProps {
  onSave?: (formData: any) => void;
  initialData?: Record<string, any>;
  showSafetyIndicators?: boolean;
}

export function BulletproofFinancialForm({ 
  onSave,
  initialData = {},
  showSafetyIndicators = true
}: BulletproofFinancialFormProps) {
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    monthlyContribution: '',
    ...initialData
  });

  // Safety-enhanced AI form
  const {
    safetyStatus,
    createManualSnapshot,
    rollbackToLastGoodState,
    getSafetyMetrics,
    safeUpdateField,
    safeValidateForm,
    getFieldConfidence,
    isFieldVisible,
    aiState
  } = useSafeAIForm(formData, {
    initialPhase: 'goal_creation',
    enableRealTimeValidation: true,
    enableProgressiveDisclosure: true,
    safety: {
      enableAutoSnapshots: true,
      snapshotInterval: 30000, // 30 seconds
      maxConsecutiveErrors: 3,
      confidenceThreshold: 0.6,
      enableEmergencyFallback: true
    }
  });

  // Safety-enhanced progressive disclosure
  const {
    disclosureSafetyStatus,
    isFieldVisible: isProgressiveFieldVisible,
    getFieldState,
    safeUpdateContext,
    safeMarkFieldCompleted,
    completionRate
  } = useSafeProgressiveDisclosure(formData, {
    userExpertiseLevel: 'intermediate',
    enableAdaptiveOrdering: true,
    enableRecommendations: true,
    safety: {
      enableSafeMode: true,
      maxVisibilityChangesPerMinute: 15,
      confidenceThresholdForChanges: 0.6,
      enableEmergencySimplification: true
    }
  });

  // Handle field updates with safety
  const handleFieldUpdate = async (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    const success = await safeUpdateField(fieldId, value, 'user_input');
    
    if (success && value && value.toString().trim()) {
      // Mark field as completed if it has a value
      await safeMarkFieldCompleted(fieldId);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create snapshot before submission
    const snapshotId = createManualSnapshot('before_submit');
    console.log('Created pre-submission snapshot:', snapshotId);
    
    try {
      // Validate form with safety
      const validationResults = await safeValidateForm();
      
      if (validationResults.errors.length === 0) {
        onSave?.(formData);
        console.log('✅ Form submitted successfully');
      } else {
        console.warn('⚠️ Form validation failed:', validationResults.errors);
      }
    } catch (error) {
      console.error('❌ Form submission failed:', error);
      // Auto-rollback on critical errors
      await rollbackToLastGoodState();
    }
  };

  // Emergency rollback
  const handleEmergencyRollback = async () => {
    const success = await rollbackToLastGoodState();
    if (success) {
      console.log('✅ Emergency rollback successful');
    }
  };

  // Determine field visibility (combine AI and progressive disclosure)
  const shouldShowField = (fieldId: string): boolean => {
    return isFieldVisible(fieldId) && isProgressiveFieldVisible(fieldId);
  };

  // Get field confidence for display
  const getDisplayConfidence = (fieldId: string): number => {
    return getFieldConfidence(fieldId);
  };

  // Get field state for progressive disclosure
  const getFieldDisplayState = (fieldId: string) => {
    return getFieldState(fieldId);
  };

  // Safety status indicator
  const getSafetyStatusColor = () => {
    if (safetyStatus.isInSafeMode || disclosureSafetyStatus.isInSafeMode) {
      return 'text-red-600';
    }
    if (safetyStatus.errorCount > 0 || disclosureSafetyStatus.blockedChanges > 0) {
      return 'text-yellow-600';
    }
    return 'text-green-600';
  };

  const getSafetyStatusText = () => {
    if (safetyStatus.isInSafeMode) {
      return 'Safe Mode Active (AI)';
    }
    if (disclosureSafetyStatus.isInSafeMode) {
      return 'Safe Mode Active (Disclosure)';
    }
    if (disclosureSafetyStatus.emergencySimplificationActive) {
      return 'Emergency Simplification';
    }
    return 'All Systems Operational';
  };

  return (
    <div className="space-y-6">
      {/* Safety Status Header */}
      {showSafetyIndicators && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🛡️ Bulletproof Financial Form</span>
              <Badge variant={safetyStatus.isInSafeMode ? "destructive" : "default"}>
                <span className={getSafetyStatusColor()}>
                  {getSafetyStatusText()}
                </span>
              </Badge>
            </CardTitle>
            <CardDescription>
              AI-enhanced form with comprehensive safety systems and rollback protection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold">{safetyStatus.errorCount}</div>
                <div className="text-muted-foreground">AI Errors</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{disclosureSafetyStatus.blockedChanges}</div>
                <div className="text-muted-foreground">Blocked Changes</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{(completionRate * 100).toFixed(0)}%</div>
                <div className="text-muted-foreground">Completion</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{aiState.sessionId.slice(-6)}</div>
                <div className="text-muted-foreground">Session ID</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <Progress value={completionRate * 100} className="w-full" />
            </div>

            {/* Emergency Controls */}
            <div className="mt-4 flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => createManualSnapshot('manual_backup')}
              >
                📸 Create Backup
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={handleEmergencyRollback}
              >
                🔄 Emergency Rollback
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Safety Alerts */}
      {(safetyStatus.isInSafeMode || disclosureSafetyStatus.isInSafeMode) && (
        <Alert>
          <AlertDescription>
            ⚠️ Safe mode is active. Some AI features may be disabled to protect your data.
            {safetyStatus.safetyTriggerActive && ` Trigger: ${safetyStatus.safetyTriggerActive}`}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Goal Details</CardTitle>
          <CardDescription>
            Create your financial goal with intelligent assistance and safety protection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Title */}
            {shouldShowField('title') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title">
                    Goal Title
                    {getFieldDisplayState('title').isRequired && <span className="text-red-500">*</span>}
                  </Label>
                  {showSafetyIndicators && (
                    <Badge variant="outline" className="text-xs">
                      {(getDisplayConfidence('title') * 100).toFixed(0)}% confidence
                    </Badge>
                  )}
                </div>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleFieldUpdate('title', e.target.value)}
                  placeholder="e.g., Emergency Fund, Vacation Savings"
                  className={getFieldDisplayState('title').isHighlighted ? 'ring-2 ring-blue-500' : ''}
                />
                {getFieldDisplayState('title').showHelpText && (
                  <p className="text-xs text-muted-foreground">
                    Give your goal a clear, memorable name that motivates you.
                  </p>
                )}
              </div>
            )}

            {/* Description */}
            {shouldShowField('description') && (
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFieldUpdate('description', e.target.value)}
                  placeholder="Describe your financial goal in detail..."
                  rows={3}
                />
              </div>
            )}

            {/* Target Amount */}
            {shouldShowField('targetAmount') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="targetAmount">
                    Target Amount
                    {getFieldDisplayState('targetAmount').isRequired && <span className="text-red-500">*</span>}
                  </Label>
                  {showSafetyIndicators && (
                    <Badge variant="outline" className="text-xs">
                      {(getDisplayConfidence('targetAmount') * 100).toFixed(0)}% confidence
                    </Badge>
                  )}
                </div>
                <Input
                  id="targetAmount"
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => handleFieldUpdate('targetAmount', parseFloat(e.target.value) || 0)}
                  placeholder="10000"
                  className={getFieldDisplayState('targetAmount').isHighlighted ? 'ring-2 ring-blue-500' : ''}
                />
              </div>
            )}

            {/* Current Amount */}
            {shouldShowField('currentAmount') && (
              <div className="space-y-2">
                <Label htmlFor="currentAmount">Current Amount</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  value={formData.currentAmount}
                  onChange={(e) => handleFieldUpdate('currentAmount', parseFloat(e.target.value) || 0)}
                  placeholder="2500"
                />
              </div>
            )}

            {/* Deadline */}
            {shouldShowField('deadline') && (
              <div className="space-y-2">
                <Label htmlFor="deadline">Target Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleFieldUpdate('deadline', e.target.value)}
                />
              </div>
            )}

            {/* Monthly Contribution */}
            {shouldShowField('monthlyContribution') && (
              <div className="space-y-2">
                <Label htmlFor="monthlyContribution">Monthly Contribution</Label>
                <Input
                  id="monthlyContribution"
                  type="number"
                  value={formData.monthlyContribution}
                  onChange={(e) => handleFieldUpdate('monthlyContribution', parseFloat(e.target.value) || 0)}
                  placeholder="500"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={safetyStatus.isInSafeMode}
                className="flex-1"
              >
                {safetyStatus.isInSafeMode ? '🛡️ Safe Mode Active' : '💾 Save Goal'}
              </Button>
              {showSafetyIndicators && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => safeValidateForm()}
                >
                  ✅ Validate
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Advanced Safety Information */}
      {showSafetyIndicators && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">🔍 Safety System Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <h4 className="font-medium mb-2">AI Form Status</h4>
                <div className="space-y-1">
                  <div>Session: {aiState.sessionId}</div>
                  <div>Phase: {aiState.currentPhase}</div>
                  <div>Processing: {aiState.isProcessing ? 'Yes' : 'No'}</div>
                  <div>Manual Intervention: {aiState.needsManualIntervention ? 'Yes' : 'No'}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Progressive Disclosure</h4>
                <div className="space-y-1">
                  <div>Expertise: {disclosureSafetyStatus.isInSafeMode ? 'Safe Mode' : 'Intermediate'}</div>
                  <div>Changes/Min: {disclosureSafetyStatus.visibilityChangesThisMinute}</div>
                  <div>Emergency Mode: {disclosureSafetyStatus.emergencySimplificationActive ? 'Active' : 'Inactive'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}