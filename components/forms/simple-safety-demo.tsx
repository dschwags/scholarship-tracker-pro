"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { RollbackEngine } from "@/lib/safety-systems/rollback-engine";

interface FormData {
  monthlyIncome: string;
  monthlyExpenses: string;
  financialGoal: string;
  timeFrame: string;
}

interface SafetyMetrics {
  snapshotCount: number;
  errorCount: number;
  confidenceLevel: number;
  safetyStatus: 'safe' | 'warning' | 'critical';
  lastSnapshot: string;
}

export function SimpleSafetyDemo() {
  const rollbackEngine = new RollbackEngine('demo-session');
  const [formData, setFormData] = useState<FormData>({
    monthlyIncome: "",
    monthlyExpenses: "",
    financialGoal: "",
    timeFrame: ""
  });

  const [safetyMetrics, setSafetyMetrics] = useState<SafetyMetrics>({
    snapshotCount: 0,
    errorCount: 0,
    confidenceLevel: 100,
    safetyStatus: 'safe',
    lastSnapshot: 'Never'
  });

  const [messages, setMessages] = useState<string[]>([]);

  const addMessage = (message: string) => {
    setMessages(prev => [...prev.slice(-4), message]);
  };

  const createSnapshot = async () => {
    try {
      const snapshotId = rollbackEngine.createSnapshot(
        formData,
        { currentPhase: 'demo' },
        { disclosureContext: {} },
        'manual-demo'
      );

      setSafetyMetrics(prev => ({
        ...prev,
        snapshotCount: prev.snapshotCount + 1,
        lastSnapshot: new Date().toLocaleTimeString()
      }));

      addMessage('✅ Manual snapshot created successfully');
      return snapshotId;
    } catch (error) {
      addMessage('❌ Failed to create snapshot');
      return null;
    }
  };

  const simulateError = () => {
    setSafetyMetrics(prev => ({
      ...prev,
      errorCount: prev.errorCount + 1,
      confidenceLevel: Math.max(20, prev.confidenceLevel - 30),
      safetyStatus: prev.confidenceLevel < 50 ? 'critical' : 'warning'
    }));
    addMessage('⚠️ Simulated error detected - confidence reduced');
  };

  const rollbackToLastSnapshot = async () => {
    try {
      const snapshots = rollbackEngine.getSnapshots();
      if (snapshots.length > 0) {
        const lastSnapshotId = snapshots[snapshots.length - 1].id;
        const restoredSnapshot = rollbackEngine.rollbackToSnapshot(lastSnapshotId);
        if (restoredSnapshot && restoredSnapshot.formData) {
          setFormData(restoredSnapshot.formData as FormData);
          setSafetyMetrics(prev => ({
            ...prev,
            confidenceLevel: 100,
            safetyStatus: 'safe'
          }));
          addMessage('🔄 Rollback successful - form restored');
        } else {
          addMessage('❌ Rollback data not available');
        }
      } else {
        addMessage('❌ No snapshots available for rollback');
      }
    } catch (error) {
      addMessage('❌ Rollback failed');
    }
  };

  const resetDemo = () => {
    setFormData({
      monthlyIncome: "",
      monthlyExpenses: "",
      financialGoal: "",
      timeFrame: ""
    });
    setSafetyMetrics({
      snapshotCount: 0,
      errorCount: 0,
      confidenceLevel: 100,
      safetyStatus: 'safe',
      lastSnapshot: 'Never'
    });
    setMessages([]);
    rollbackEngine.clearSnapshots();
    addMessage('🔄 Demo reset complete');
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-create snapshot on significant changes
    if (value.length > 0 && value.length % 5 === 0) {
      createSnapshot();
      addMessage('📸 Auto-snapshot created');
    }
  };

  const getStatusColor = () => {
    switch (safetyMetrics.safetyStatus) {
      case 'safe': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🛡️ Interactive Safety Demo
            <Badge className={getStatusColor()}>
              {safetyMetrics.safetyStatus.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Safety Metrics Display */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {safetyMetrics.snapshotCount}
              </div>
              <div className="text-sm text-gray-600">Snapshots</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {safetyMetrics.errorCount}
              </div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {safetyMetrics.confidenceLevel}%
              </div>
              <div className="text-sm text-gray-600">Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">
                {safetyMetrics.lastSnapshot}
              </div>
              <div className="text-sm text-gray-600">Last Snapshot</div>
            </div>
          </div>

          {/* Demo Form */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="income">Monthly Income ($)</Label>
                <Input
                  id="income"
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  placeholder="5000"
                />
              </div>
              
              <div>
                <Label htmlFor="expenses">Monthly Expenses ($)</Label>
                <Input
                  id="expenses"
                  type="number"
                  value={formData.monthlyExpenses}
                  onChange={(e) => handleInputChange('monthlyExpenses', e.target.value)}
                  placeholder="3500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="goal">Financial Goal ($)</Label>
                <Input
                  id="goal"
                  type="number"
                  value={formData.financialGoal}
                  onChange={(e) => handleInputChange('financialGoal', e.target.value)}
                  placeholder="50000"
                />
              </div>
              
              <div>
                <Label htmlFor="timeframe">Time Frame (months)</Label>
                <Input
                  id="timeframe"
                  type="number"
                  value={formData.timeFrame}
                  onChange={(e) => handleInputChange('timeFrame', e.target.value)}
                  placeholder="24"
                />
              </div>
            </div>
          </div>

          {/* Safety Controls */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={createSnapshot} variant="outline">
              📸 Create Snapshot
            </Button>
            <Button onClick={simulateError} variant="destructive">
              ⚠️ Simulate Error
            </Button>
            <Button onClick={rollbackToLastSnapshot} variant="secondary">
              🔄 Rollback
            </Button>
            <Button onClick={resetDemo} variant="outline">
              🔄 Reset Demo
            </Button>
          </div>

          {/* Activity Log */}
          <div>
            <Label className="text-sm font-medium">Activity Log</Label>
            <div className="mt-2 space-y-1 h-24 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  Start typing in the form fields or use the safety controls above...
                </p>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className="text-sm font-mono">
                    {message}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <Alert>
            <AlertDescription>
              <strong>Try this:</strong> Fill out the form fields (snapshots auto-create every 5 characters), 
              click "Simulate Error" to trigger safety warnings, then use "Rollback" to restore the form to the last snapshot. 
              Watch the safety metrics update in real-time!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}