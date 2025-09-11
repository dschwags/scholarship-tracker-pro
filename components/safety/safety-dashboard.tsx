/**
 * Safety Dashboard Component
 * 
 * Provides monitoring, controls, and visualization for the
 * rollback engine and safety systems.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useRollbackEngine } from '@/lib/safety-systems/rollback-engine';
import { useFeatureFlag } from '@/lib/feature-flags/hooks';

interface SafetyDashboardProps {
  sessionId?: string;
  showDetailedMetrics?: boolean;
}

export function SafetyDashboard({ 
  sessionId = 'demo', 
  showDetailedMetrics = true 
}: SafetyDashboardProps) {
  const rollbackEngine = useRollbackEngine(sessionId);
  const [metrics, setMetrics] = useState<any>(null);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Feature flags
  const rollbackEnabled = useFeatureFlag('rollback_system_enabled');
  const safetyEnabled = useFeatureFlag('safety_systems_enabled');
  const emergencyModeEnabled = useFeatureFlag('emergency_mode_enabled');

  // Refresh data
  const refreshData = () => {
    setMetrics(rollbackEngine.getMetrics());
    setSnapshots(rollbackEngine.getSnapshots());
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    refreshData();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [rollbackEngine]);

  // Create demo snapshot
  const createDemoSnapshot = () => {
    const demoFormData = {
      title: 'Emergency Fund Goal',
      targetAmount: 10000,
      currentAmount: 2500,
      deadline: '2025-12-31'
    };

    const demoAIState = {
      currentPhase: 'goal_creation',
      completedSections: ['basic_info'],
      confidenceScores: { title: 0.9, targetAmount: 0.8, deadline: 0.7 },
      inferredData: demoFormData
    };

    const demoProgressiveState = {
      disclosureContext: { userExpertiseLevel: 'intermediate' },
      visibleFields: ['title', 'targetAmount', 'deadline'],
      expertiseLevel: 'intermediate'
    };

    rollbackEngine.createSnapshot(
      demoFormData,
      demoAIState,
      demoProgressiveState,
      'demo_snapshot'
    );
    refreshData();
  };

  // Record demo operation
  const recordDemoOperation = (success: boolean) => {
    rollbackEngine.recordOperation(
      'form_update',
      success,
      success ? 0.8 : 0.2,
      { demo: true, timestamp: new Date().toISOString() }
    );
    refreshData();
  };

  // Simulate error scenario
  const simulateErrorScenario = () => {
    // Record multiple failures to trigger safety systems
    for (let i = 0; i < 6; i++) {
      rollbackEngine.recordOperation('ai_inference', false, 0.1);
    }
    refreshData();
  };

  if (!rollbackEnabled || !safetyEnabled) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-yellow-600">⚠️ Safety Systems Disabled</CardTitle>
          <CardDescription>
            Rollback and safety systems are currently disabled via feature flags.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const errorRate = metrics ? (metrics.totalOperations > 0 ? metrics.errorCount / metrics.totalOperations : 0) : 0;
  const isHealthy = errorRate < 0.1 && (metrics?.consecutiveFailures || 0) < 3;

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🛡️ Safety System Status
            <Badge variant={isHealthy ? "default" : "destructive"}>
              {isHealthy ? "Healthy" : "Issues Detected"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Real-time monitoring of rollback engine and safety triggers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Health Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics?.totalOperations || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Operations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {metrics?.errorCount || 0}
              </div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {snapshots.length}
              </div>
              <div className="text-sm text-muted-foreground">Snapshots</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {metrics?.consecutiveFailures || 0}
              </div>
              <div className="text-sm text-muted-foreground">Consecutive Failures</div>
            </div>
          </div>

          {/* Error Rate Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Error Rate</span>
              <span>{(errorRate * 100).toFixed(1)}%</span>
            </div>
            <Progress 
              value={errorRate * 100} 
              className={errorRate > 0.15 ? "bg-red-100" : "bg-green-100"}
            />
            {errorRate > 0.15 && (
              <Alert>
                <AlertDescription>
                  ⚠️ High error rate detected! Safety triggers may activate.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Safety Controls */}
      <Card>
        <CardHeader>
          <CardTitle>🎛️ Safety Controls</CardTitle>
          <CardDescription>
            Manual controls for testing and managing the safety system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={createDemoSnapshot}
              variant="outline"
              className="w-full"
            >
              📸 Create Snapshot
            </Button>
            <Button 
              onClick={() => recordDemoOperation(true)}
              variant="outline"
              className="w-full text-green-600"
            >
              ✅ Log Success
            </Button>
            <Button 
              onClick={() => recordDemoOperation(false)}
              variant="outline"
              className="w-full text-red-600"
            >
              ❌ Log Error
            </Button>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <Button 
              onClick={simulateErrorScenario}
              variant="destructive"
              className="w-full"
            >
              🚨 Simulate Error Scenario
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              This will trigger multiple failures to demonstrate safety system activation
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Snapshot Management */}
      <Card>
        <CardHeader>
          <CardTitle>📸 Snapshot Management</CardTitle>
          <CardDescription>
            Available rollback points and state snapshots
          </CardDescription>
        </CardHeader>
        <CardContent>
          {snapshots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No snapshots available. Create one using the controls above.
            </div>
          ) : (
            <div className="space-y-2">
              {snapshots.map((snapshot, index) => (
                <div
                  key={snapshot.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <div className="font-medium">{snapshot.id}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(snapshot.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {snapshot.checksum}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        rollbackEngine.rollbackToSnapshot(snapshot.id);
                        refreshData();
                      }}
                    >
                      🔄 Rollback
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      {showDetailedMetrics && metrics && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Detailed Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Operation Metrics</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total Operations:</span>
                    <span>{metrics.totalOperations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Count:</span>
                    <span>{metrics.errorCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span>{((1 - errorRate) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consecutive Failures:</span>
                    <span>{metrics.consecutiveFailures}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">System Health</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Last Success:</span>
                    <span className="text-xs">
                      {new Date(metrics.lastSuccessfulOperation).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Confidence Drift:</span>
                    <span>{(metrics.confidenceDrift * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data Corruption:</span>
                    <span>{metrics.dataCorruptionCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emergency Mode:</span>
                    <Badge variant={emergencyModeEnabled ? "destructive" : "default"}>
                      {emergencyModeEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Flag Status */}
      <Card>
        <CardHeader>
          <CardTitle>🏁 Feature Flag Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Rollback System:</span>
              <Badge variant={rollbackEnabled ? "default" : "secondary"}>
                {rollbackEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Safety Systems:</span>
              <Badge variant={safetyEnabled ? "default" : "secondary"}>
                {safetyEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Emergency Mode:</span>
              <Badge variant={emergencyModeEnabled ? "destructive" : "default"}>
                {emergencyModeEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}