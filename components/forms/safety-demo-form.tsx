/**
 * Safety Demo Form - Simplified Demonstration
 * 
 * Demonstrates the rollback engine and safety systems in action
 * with a simplified, working form interface.
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRollbackEngine } from '@/lib/safety-systems/rollback-engine';

interface SafetyDemoFormProps {
  title?: string;
}

export function SafetyDemoForm({ title = "Safety Systems Demo" }: SafetyDemoFormProps) {
  // Form state
  const [formData, setFormData] = useState({
    goalTitle: '',
    targetAmount: '',
    deadline: ''
  });
  
  // Safety metrics
  const [safetyMetrics, setSafetyMetrics] = useState({
    operationsCount: 0,
    successCount: 0,
    errorCount: 0,
    snapshotsCreated: 0
  });

  // Initialize rollback engine
  const rollbackEngine = useRollbackEngine('safety_demo');

  // Handle safe form updates
  const handleSafeUpdate = (fieldId: string, value: string) => {
    try {
      // Create snapshot before risky operations
      if (Math.random() > 0.7) { // 30% chance to create snapshot
        const snapshotId = rollbackEngine.createSnapshot(
          formData,
          { phase: 'form_editing', confidence: Math.random() },
          { visible: Object.keys(formData) },
          `auto_${Date.now()}`
        );
        
        setSafetyMetrics(prev => ({
          ...prev,
          snapshotsCreated: prev.snapshotsCreated + 1
        }));
        
        console.log(`📸 Auto-snapshot created: ${snapshotId}`);
      }

      // Update form data
      setFormData(prev => ({ ...prev, [fieldId]: value }));

      // Record successful operation
      rollbackEngine.recordOperation('form_update', true, Math.random() * 0.8 + 0.2);
      
      setSafetyMetrics(prev => ({
        ...prev,
        operationsCount: prev.operationsCount + 1,
        successCount: prev.successCount + 1
      }));

    } catch (error) {
      console.error('❌ Safe update failed:', error);
      
      // Record failed operation
      rollbackEngine.recordOperation('form_update', false, 0);
      
      setSafetyMetrics(prev => ({
        ...prev,
        operationsCount: prev.operationsCount + 1,
        errorCount: prev.errorCount + 1
      }));
    }
  };

  // Simulate error scenario
  const simulateError = () => {
    console.log('🚨 Simulating multiple errors...');
    
    // Record multiple failures to trigger safety systems
    for (let i = 0; i < 5; i++) {
      rollbackEngine.recordOperation('form_update', false, 0.1, { 
        error: 'Simulated error',
        iteration: i + 1
      });
    }
    
    setSafetyMetrics(prev => ({
      ...prev,
      operationsCount: prev.operationsCount + 5,
      errorCount: prev.errorCount + 5
    }));
  };

  // Create manual snapshot
  const createManualSnapshot = () => {
    const snapshotId = rollbackEngine.createSnapshot(
      formData,
      { phase: 'manual_backup', confidence: 1.0 },
      { visible: Object.keys(formData) },
      'manual_backup'
    );
    
    setSafetyMetrics(prev => ({
      ...prev,
      snapshotsCreated: prev.snapshotsCreated + 1
    }));
    
    console.log(`📸 Manual snapshot created: ${snapshotId}`);
  };

  // Rollback to last good state
  const performRollback = () => {
    const snapshot = rollbackEngine.rollbackToLastGoodState();
    
    if (snapshot) {
      console.log('✅ Rollback successful');
      // In a real implementation, we'd restore the form data from the snapshot
      setFormData({
        goalTitle: 'Restored Emergency Fund',
        targetAmount: '10000',
        deadline: '2025-12-31'
      });
    } else {
      console.warn('⚠️ No good state found for rollback');
    }
  };

  // Get current safety status
  const currentMetrics = rollbackEngine.getMetrics();
  const errorRate = currentMetrics.totalOperations > 0 
    ? currentMetrics.errorCount / currentMetrics.totalOperations 
    : 0;
  
  const isHealthy = errorRate < 0.15 && currentMetrics.consecutiveFailures < 3;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🛡️ {title}</span>
          <Badge variant={isHealthy ? "default" : "destructive"}>
            {isHealthy ? "System Healthy" : "Safety Alert"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Interactive demonstration of rollback engine and safety systems
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Safety Metrics Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{currentMetrics.totalOperations}</div>
            <div className="text-xs text-muted-foreground">Operations</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{currentMetrics.totalOperations - currentMetrics.errorCount}</div>
            <div className="text-xs text-muted-foreground">Successful</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{currentMetrics.errorCount}</div>
            <div className="text-xs text-muted-foreground">Errors</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{safetyMetrics.snapshotsCreated}</div>
            <div className="text-xs text-muted-foreground">Snapshots</div>
          </div>
        </div>

        {/* Safety Alert */}
        {!isHealthy && (
          <Alert>
            <AlertDescription>
              ⚠️ High error rate detected! Safety systems are monitoring the situation.
              Error rate: {(errorRate * 100).toFixed(1)}%
            </AlertDescription>
          </Alert>
        )}

        {/* Demo Form Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goalTitle">Goal Title</Label>
            <Input
              id="goalTitle"
              value={formData.goalTitle}
              onChange={(e) => handleSafeUpdate('goalTitle', e.target.value)}
              placeholder="Enter your financial goal title..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Amount ($)</Label>
            <Input
              id="targetAmount"
              type="number"
              value={formData.targetAmount}
              onChange={(e) => handleSafeUpdate('targetAmount', e.target.value)}
              placeholder="10000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => handleSafeUpdate('deadline', e.target.value)}
            />
          </div>
        </div>

        {/* Safety Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <Button 
            onClick={createManualSnapshot}
            variant="outline"
            className="w-full"
          >
            📸 Create Snapshot
          </Button>
          
          <Button 
            onClick={performRollback}
            variant="outline"
            className="w-full"
          >
            🔄 Rollback to Safe State
          </Button>
          
          <Button 
            onClick={simulateError}
            variant="destructive"
            className="w-full"
          >
            ⚡ Simulate Errors
          </Button>
        </div>

        {/* System Status */}
        <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded">
          <div>Session ID: {currentMetrics.lastSuccessfulOperation ? 'Active' : 'Inactive'}</div>
          <div>Consecutive Failures: {currentMetrics.consecutiveFailures}</div>
          <div>Error Rate: {(errorRate * 100).toFixed(1)}%</div>
          <div>Last Success: {new Date(currentMetrics.lastSuccessfulOperation).toLocaleTimeString()}</div>
        </div>

        {/* Instructions */}
        <div className="text-sm text-muted-foreground p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium mb-2">💡 Try These Actions:</h4>
          <ul className="space-y-1 text-xs">
            <li>• Type in the form fields to trigger safe operations</li>
            <li>• Click "Create Snapshot" to manually save state</li>
            <li>• Use "Simulate Errors" to test safety triggers</li>
            <li>• Try "Rollback" to restore a previous safe state</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}