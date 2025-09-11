/**
 * AI-Enhanced Form Demo Page
 * 
 * Demonstrates the AI Decision Engine integration with progressive
 * disclosure and intelligent form assistance.
 */

'use client';

import { AIEnhancedForm } from '@/components/forms/ai-enhanced-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Zap, Target, Users } from 'lucide-react';

export default function AIFormDemoPage() {
  // Handle form submission
  const handleFormSubmit = async (data: Record<string, any>) => {
    console.log('Form submitted with AI assistance:', data);
    
    // Here you would normally send to your API
    // For demo, just show success
    alert(`Goal "${data.title}" created successfully with AI assistance!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              AI-Enhanced Financial Planning
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience intelligent form assistance with progressive disclosure, 
            real-time validation, and AI-powered suggestions.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold">Real-Time Intelligence</h3>
              </div>
              <p className="text-sm text-gray-600">
                AI processes each field update instantly, providing intelligent 
                suggestions and progressive form disclosure.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold">Smart Validation</h3>
              </div>
              <p className="text-sm text-gray-600">
                Advanced validation rules detect conflicts, suggest improvements, 
                and ensure data consistency.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Human-AI Collaboration</h3>
              </div>
              <p className="text-sm text-gray-600">
                Seamless handoff to human review when AI confidence is low 
                or complex decisions are needed.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Form */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-xl">
              Create Your Financial Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AIEnhancedForm
              initialData={{
                title: '',
                targetAmount: '',
                currentAmount: '',
                deadline: ''
              }}
              onSubmit={handleFormSubmit}
            />
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">AI Decision Engine</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Processes field updates through decision trees</li>
                  <li>• Calculates confidence scores for each input</li>
                  <li>• Detects data conflicts and suggests resolutions</li>
                  <li>• Applies progressive disclosure rules</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Progressive Disclosure</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Shows relevant fields based on previous inputs</li>
                  <li>• Prevents information overload</li>
                  <li>• Guides users through complex financial planning</li>
                  <li>• Adapts to user expertise level</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Try These Interactions:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>1. Enter a goal title and watch the confidence score update</li>
                <li>2. Add a target amount - AI will provide context-aware suggestions</li>
                <li>3. Notice how related fields become visible progressively</li>
                <li>4. Enter conflicting data to see AI conflict detection in action</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}