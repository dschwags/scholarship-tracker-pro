"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export function SafetyDemoBasic() {
  const [formData, setFormData] = useState({
    income: "",
    expenses: "",
    goal: "",
    timeframe: ""
  });

  const [metrics, setMetrics] = useState({
    snapshots: 0,
    errors: 0,
    confidence: 100,
    status: "safe"
  });

  const [messages, setMessages] = useState([]);
  const [savedSnapshot, setSavedSnapshot] = useState(null);

  const addMessage = (message) => {
    setMessages(prev => [...prev.slice(-3), message]);
  };

  const createSnapshot = () => {
    setSavedSnapshot({ ...formData });
    setMetrics(prev => ({
      ...prev,
      snapshots: prev.snapshots + 1
    }));
    addMessage("✅ Snapshot created successfully");
  };

  const simulateError = () => {
    setMetrics(prev => ({
      ...prev,
      errors: prev.errors + 1,
      confidence: Math.max(20, prev.confidence - 30),
      status: prev.confidence < 50 ? "critical" : "warning"
    }));
    addMessage("⚠️ Error detected - confidence reduced");
  };

  const rollback = () => {
    if (savedSnapshot) {
      setFormData(savedSnapshot);
      setMetrics(prev => ({
        ...prev,
        confidence: 100,
        status: "safe"
      }));
      addMessage("🔄 Rollback successful");
    } else {
      addMessage("❌ No snapshot available");
    }
  };

  const resetDemo = () => {
    setFormData({
      income: "",
      expenses: "",
      goal: "",
      timeframe: ""
    });
    setMetrics({
      snapshots: 0,
      errors: 0,
      confidence: 100,
      status: "safe"
    });
    setMessages([]);
    setSavedSnapshot(null);
    addMessage("🔄 Demo reset");
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-snapshot every 5 characters
    if (value.length > 0 && value.length % 5 === 0) {
      createSnapshot();
    }
  };

  const getStatusColor = () => {
    switch (metrics.status) {
      case "safe": return "bg-green-500";
      case "warning": return "bg-yellow-500";
      case "critical": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🛡️ Safety Systems Demo
          <Badge className={getStatusColor()}>
            {metrics.status.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{metrics.snapshots}</div>
            <div className="text-sm text-gray-600">Snapshots</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{metrics.errors}</div>
            <div className="text-sm text-gray-600">Errors</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{metrics.confidence}%</div>
            <div className="text-sm text-gray-600">Confidence</div>
          </div>
          <div>
            <div className="text-sm font-medium">{savedSnapshot ? "Available" : "None"}</div>
            <div className="text-sm text-gray-600">Snapshot</div>
          </div>
        </div>

        {/* Form */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="income">Monthly Income ($)</Label>
            <Input
              id="income"
              type="number"
              value={formData.income}
              onChange={(e) => handleInputChange("income", e.target.value)}
              placeholder="5000"
            />
          </div>
          
          <div>
            <Label htmlFor="expenses">Monthly Expenses ($)</Label>
            <Input
              id="expenses"
              type="number"
              value={formData.expenses}
              onChange={(e) => handleInputChange("expenses", e.target.value)}
              placeholder="3500"
            />
          </div>

          <div>
            <Label htmlFor="goal">Financial Goal ($)</Label>
            <Input
              id="goal"
              type="number"
              value={formData.goal}
              onChange={(e) => handleInputChange("goal", e.target.value)}
              placeholder="50000"
            />
          </div>
          
          <div>
            <Label htmlFor="timeframe">Time Frame (months)</Label>
            <Input
              id="timeframe"
              type="number"
              value={formData.timeframe}
              onChange={(e) => handleInputChange("timeframe", e.target.value)}
              placeholder="24"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={createSnapshot} variant="outline">
            📸 Create Snapshot
          </Button>
          <Button onClick={simulateError} variant="destructive">
            ⚠️ Simulate Error
          </Button>
          <Button onClick={rollback} variant="secondary">
            🔄 Rollback
          </Button>
          <Button onClick={resetDemo} variant="outline">
            🔄 Reset
          </Button>
        </div>

        {/* Messages */}
        <div>
          <Label className="text-sm font-medium">Activity Log</Label>
          <div className="mt-2 h-20 overflow-y-auto space-y-1">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                Start typing or use controls above...
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
            <strong>Try this:</strong> Fill out the form (snapshots auto-create every 5 characters), 
            click "Simulate Error" to trigger warnings, then use "Rollback" to restore data.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}