'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Wand2, 
  Zap, 
  Target,
  GraduationCap,
  Home,
  BookOpen,
  Laptop,
  Plane,
  PiggyBank,
  Plus
} from 'lucide-react';
import { EnhancedTemplateBuilder } from './enhanced-template-builder';
import { FINANCIAL_GOAL_TEMPLATES, FinancialGoalTemplate } from './goals-types';

interface TemplateSelectorProps {
  onTemplateSelect: (template: FinancialGoalTemplate | 'custom-builder') => void;
  onCustomTemplate: (template: any) => void;
}

const QUICK_TEMPLATES = [
  {
    id: 'tuition-annual' as FinancialGoalTemplate,
    title: 'Annual Tuition & Fees',
    description: 'Standard tuition, fees, and basic academic costs',
    icon: <GraduationCap className="w-6 h-6" />,
    estimatedAmount: '$35,000 - $50,000',
    popular: true,
    components: ['Core academic costs', 'Basic fees']
  },
  {
    id: 'room-board-annual' as FinancialGoalTemplate,
    title: 'Room & Board',
    description: 'Housing, meals, and living expenses for academic year',
    icon: <Home className="w-6 h-6" />,
    estimatedAmount: '$15,000 - $20,000',
    popular: true,
    components: ['Housing costs', 'Meal plans', 'Utilities']
  },
  {
    id: 'semester-expenses' as FinancialGoalTemplate,
    title: 'Semester Expenses',
    description: 'Complete semester funding including all major costs',
    icon: <Target className="w-6 h-6" />,
    estimatedAmount: '$25,000 - $35,000',
    popular: true,
    components: ['Tuition', 'Housing', 'Books', 'Personal expenses']
  },
  {
    id: 'books-supplies' as FinancialGoalTemplate,
    title: 'Books & Supplies',
    description: 'Textbooks, materials, and academic supplies',
    icon: <BookOpen className="w-6 h-6" />,
    estimatedAmount: '$1,200 - $2,000',
    popular: false,
    components: ['Textbooks', 'Lab materials', 'Digital resources']
  },
  {
    id: 'laptop-technology' as FinancialGoalTemplate,
    title: 'Technology & Equipment',
    description: 'Laptop, software, and tech requirements',
    icon: <Laptop className="w-6 h-6" />,
    estimatedAmount: '$2,000 - $3,500',
    popular: false,
    components: ['Computer hardware', 'Software licenses', 'Accessories']
  },
  {
    id: 'study-abroad' as FinancialGoalTemplate,
    title: 'Study Abroad',
    description: 'International programs and travel costs',
    icon: <Plane className="w-6 h-6" />,
    estimatedAmount: '$15,000 - $25,000',
    popular: false,
    components: ['Program fees', 'Travel', 'International housing']
  },
  {
    id: 'emergency-fund' as FinancialGoalTemplate,
    title: 'Emergency Fund',
    description: 'Safety net for unexpected expenses',
    icon: <PiggyBank className="w-6 h-6" />,
    estimatedAmount: '$3,000 - $8,000',
    popular: false,
    components: ['Medical emergency', 'Family support', 'Academic crisis']
  }
] as const;

export function TemplateSelector({ onTemplateSelect, onCustomTemplate }: TemplateSelectorProps) {
  const [showBuilder, setShowBuilder] = useState(false);

  if (showBuilder) {
    return (
      <EnhancedTemplateBuilder
        onTemplateCreate={(template) => {
          onCustomTemplate(template);
          setShowBuilder(false);
        }}
        onCancel={() => setShowBuilder(false)}
      />
    );
  }

  const popularTemplates = QUICK_TEMPLATES.filter(t => t.popular);
  const otherTemplates = QUICK_TEMPLATES.filter(t => !t.popular);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose Your Financial Goal Template</h2>
        <p className="text-gray-600">
          Start with a template or build a custom plan tailored to your needs
        </p>
      </div>

      {/* Quick Builder Option */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Wand2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  Smart Template Builder
                  <Badge variant="default" className="bg-purple-600">
                    Recommended
                  </Badge>
                </h3>
                <p className="text-gray-600 mt-1">
                  Answer a few questions and we'll build the perfect template for your situation
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>✨ Personalized categories</span>
                  <span>🎯 Accurate estimates</span>
                  <span>⚡ Quick setup</span>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setShowBuilder(true)}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Build My Template
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-sm text-gray-500">or choose a quick template</span>
        <Separator className="flex-1" />
      </div>

      {/* Popular Templates */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold">Most Popular</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularTemplates.map(template => (
            <Card 
              key={template.id}
              className="cursor-pointer hover:shadow-lg transition-all hover:border-blue-300"
              onClick={() => onTemplateSelect(template.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600">
                      {template.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base">{template.title}</CardTitle>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    Popular
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">{template.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Estimated Range:</span>
                    <span className="font-medium text-green-600">{template.estimatedAmount}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Includes: {template.components.join(', ')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Other Templates */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Specialized Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {otherTemplates.map(template => (
            <Card 
              key={template.id}
              className="cursor-pointer hover:shadow-md transition-all hover:border-gray-300"
              onClick={() => onTemplateSelect(template.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="text-gray-600">
                    {template.icon}
                  </div>
                  <CardTitle className="text-sm">{template.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-gray-600">{template.description}</p>
                <div className="text-xs font-medium text-green-600">
                  {template.estimatedAmount}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Option */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <Plus className="w-8 h-8 text-gray-400 mx-auto" />
            <div>
              <h3 className="font-semibold">Start from Scratch</h3>
              <p className="text-sm text-gray-600">
                Create a completely custom goal with your own categories
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => onTemplateSelect('custom')}
            >
              Custom Goal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}