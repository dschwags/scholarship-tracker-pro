/**
 * Progressive Disclosure Demo Page
 * 
 * Demonstrates the progressive disclosure system with financial goal creation.
 * Shows how fields appear intelligently based on user input and AI guidance.
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Zap, 
  Eye, 
  BarChart3, 
  Users, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { ProgressiveFinancialForm } from '@/components/goals/progressive-financial-form';

export default function ProgressiveDisclosureDemoPage() {
  const [demoMode, setDemoMode] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [completedDemo, setCompletedDemo] = useState(false);

  const handleFormSubmit = async (data: Record<string, any>) => {
    console.log('Progressive form submitted:', data);
    setCompletedDemo(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert(`Financial goal "${data.title}" created with progressive disclosure assistance!`);
  };

  const expertiseLevels = [
    {
      level: 'beginner' as const,
      title: 'Beginner',
      description: 'New to financial planning',
      color: 'bg-green-100 text-green-800'
    },
    {
      level: 'intermediate' as const,
      title: 'Intermediate',
      description: 'Some experience with budgeting',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      level: 'advanced' as const,
      title: 'Advanced',
      description: 'Experienced with financial planning',
      color: 'bg-purple-100 text-purple-800'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Eye className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Progressive Disclosure System
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Experience intelligent form adaptation that reveals fields progressively 
            based on your expertise level, input patterns, and AI-powered insights.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Eye className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Smart Visibility</h3>
              <p className="text-sm text-gray-600">
                Fields appear only when contextually relevant
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Brain className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">AI Guidance</h3>
              <p className="text-sm text-gray-600">
                Intelligent suggestions based on input patterns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <BarChart3 className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Adaptive Order</h3>
              <p className="text-sm text-gray-600">
                Field order adapts to user expertise level
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Real-time</h3>
              <p className="text-sm text-gray-600">
                Instant feedback and progressive revelation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Expertise Level Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Your Experience Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {expertiseLevels.map((level) => (
                <Card 
                  key={level.level}
                  className={`cursor-pointer transition-all duration-200 ${
                    demoMode === level.level 
                      ? 'ring-2 ring-indigo-500 bg-indigo-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setDemoMode(level.level)}
                >
                  <CardContent className="pt-4 text-center">
                    <Badge className={level.color}>
                      {level.title}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-2">
                      {level.description}
                    </p>
                    {demoMode === level.level && (
                      <CheckCircle className="w-5 h-5 text-indigo-600 mx-auto mt-2" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demo Tabs */}
        <Tabs defaultValue="demo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="demo">Interactive Demo</TabsTrigger>
            <TabsTrigger value="explanation">How It Works</TabsTrigger>
          </TabsList>

          {/* Interactive Demo */}
          <TabsContent value="demo" className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    Create Financial Goal - {demoMode} Mode
                  </CardTitle>
                  {completedDemo && (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Demo Completed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ProgressiveFinancialForm
                  onSubmit={handleFormSubmit}
                  userExpertiseLevel={demoMode}
                  initialData={{}}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Explanation */}
          <TabsContent value="explanation" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progressive Disclosure Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Field Dependencies</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Target Amount → Current Savings</li>
                      <li>• Basic Info → Monthly Contribution</li>
                      <li>• Large Goals (>$10k) → Detailed Planning</li>
                      <li>• Low Confidence → Clarification Fields</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Expertise Adaptation</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Beginner: More help text, simpler flow</li>
                      <li>• Intermediate: Balanced assistance</li>
                      <li>• Advanced: All fields available, minimal help</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Integration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Confidence Scoring</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Field completeness and quality</li>
                      <li>• Logical consistency checks</li>
                      <li>• Pattern recognition</li>
                      <li>• Historical data validation</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Dynamic Suggestions</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Real-time value recommendations</li>
                      <li>• Next step guidance</li>
                      <li>• Error prevention</li>
                      <li>• Contextual help</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Try These Interactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Beginner Mode</h4>
                      <ol className="text-sm space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">1</span>
                          Start with just a title to see guidance appear
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">2</span>
                          Notice how help text appears for each field
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">3</span>
                          See fields appear one by one based on completion
                        </li>
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Advanced Mode</h4>
                      <ol className="text-sm space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">1</span>
                          Multiple fields visible simultaneously
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">2</span>
                          Advanced calculation options appear
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">3</span>
                          Minimal guidance, faster completion
                        </li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}