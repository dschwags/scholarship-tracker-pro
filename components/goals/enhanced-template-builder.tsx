at 'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Wand2, 
  Plus, 
  Settings, 
  CheckCircle2, 
  AlertCircle,
  DollarSign,
  GraduationCap,
  Home,
  Car,
  Heart,
  Laptop,
  BookOpen,
  Plane,
  PiggyBank
} from 'lucide-react';

// Enhanced template system with modular components
export interface TemplateComponent {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'essential' | 'academic' | 'living' | 'special' | 'emergency';
  expenses: Array<{
    key: string;
    title: string;
    placeholder: string;
    description: string;
    allowMultiple?: boolean;
    required?: boolean;
  }>;
  funding: string[];
  estimatedTotal: number;
}

export const TEMPLATE_COMPONENTS: Record<string, TemplateComponent> = {
  'core-academic': {
    id: 'core-academic',
    name: 'Core Academic Costs',
    description: 'Essential tuition, fees, and academic expenses',
    icon: <GraduationCap className="w-5 h-5" />,
    category: 'essential',
    expenses: [
      { key: 'tuition', title: '🎓 Tuition & Fees', placeholder: '35000', description: 'Tuition and mandatory fees', required: true },
      { key: 'books', title: '📚 Textbooks & Course Materials', placeholder: '1200', description: 'Required textbooks and supplies', required: true },
      { key: 'lab-fees', title: '🧪 Lab & Course Fees', placeholder: '500', description: 'Laboratory and special course fees' },
    ],
    funding: ['federalAid', 'stateGrants', 'scholarships'],
    estimatedTotal: 36700
  },
  
  'housing-meal': {
    id: 'housing-meal',
    name: 'Housing & Meals',
    description: 'Dormitory, apartments, and meal plans',
    icon: <Home className="w-5 h-5" />,
    category: 'living',
    expenses: [
      { key: 'dormitory', title: '🏠 Housing/Dormitory', placeholder: '12000', description: 'Dormitory or housing costs', required: true },
      { key: 'meal-plan', title: '🍽️ Meal Plan', placeholder: '4500', description: 'Campus dining or food expenses' },
      { key: 'utilities', title: '⚡ Utilities & Internet', placeholder: '800', description: 'Electricity, internet, phone' },
    ],
    funding: ['familyContribution', 'federalAid', 'employment'],
    estimatedTotal: 17300
  },

  'transportation': {
    id: 'transportation',
    name: 'Transportation',
    description: 'Travel between home and school, daily commuting',
    icon: <Car className="w-5 h-5" />,
    category: 'living',
    expenses: [
      { key: 'vehicle', title: '🚗 Vehicle Expenses', placeholder: '2000', description: 'Car payments, insurance, gas', allowMultiple: true },
      { key: 'flights', title: '✈️ Flight Travel', placeholder: '800', description: 'Home to school travel', allowMultiple: true },
      { key: 'public-transit', title: '🚌 Public Transportation', placeholder: '600', description: 'Bus passes, train tickets' },
    ],
    funding: ['familyContribution', 'employment'],
    estimatedTotal: 3400
  },

  'technology': {
    id: 'technology',
    name: 'Technology & Equipment',
    description: 'Laptops, software, and tech requirements',
    icon: <Laptop className="w-5 h-5" />,
    category: 'academic',
    expenses: [
      { key: 'laptop', title: '💻 Laptop/Computer', placeholder: '1500', description: 'Main computer for studies', required: true },
      { key: 'software', title: '🔧 Software & Licenses', placeholder: '500', description: 'Required software and subscriptions' },
      { key: 'accessories', title: '⌨️ Tech Accessories', placeholder: '300', description: 'Mouse, keyboard, monitor, etc.' },
    ],
    funding: ['scholarships', 'familyContribution', 'employment'],
    estimatedTotal: 2300
  },

  'personal-expenses': {
    id: 'personal-expenses',
    name: 'Personal & Health',
    description: 'Healthcare, personal items, and wellness',
    icon: <Heart className="w-5 h-5" />,
    category: 'living',
    expenses: [
      { key: 'health-insurance', title: '🏥 Health Insurance', placeholder: '2000', description: 'Student health insurance' },
      { key: 'personal-care', title: '🧴 Personal Care', placeholder: '800', description: 'Toiletries, clothing, personal items' },
      { key: 'entertainment', title: '🎯 Entertainment & Social', placeholder: '1200', description: 'Movies, activities, social events' },
    ],
    funding: ['familyContribution', 'employment'],
    estimatedTotal: 4000
  },

  'study-abroad': {
    id: 'study-abroad',
    name: 'Study Abroad',
    description: 'International programs and related costs',
    icon: <Plane className="w-5 h-5" />,
    category: 'special',
    expenses: [
      { key: 'program-fees', title: '🌍 Program Fees', placeholder: '8000', description: 'Study abroad program costs', required: true },
      { key: 'international-flights', title: '✈️ International Travel', placeholder: '1500', description: 'Round-trip international flights' },
      { key: 'visa-docs', title: '📋 Visa & Documentation', placeholder: '500', description: 'Visa, passport, permits' },
      { key: 'international-living', title: '🏠 International Living', placeholder: '4000', description: 'Housing and living expenses abroad' },
    ],
    funding: ['scholarships', 'familyContribution', 'stateGrants'],
    estimatedTotal: 14000
  },

  'emergency-fund': {
    id: 'emergency-fund',
    name: 'Emergency Fund',
    description: 'Safety net for unexpected expenses',
    icon: <PiggyBank className="w-5 h-5" />,
    category: 'emergency',
    expenses: [
      { key: 'medical-emergency', title: '🏥 Medical Emergencies', placeholder: '3000', description: 'Unexpected health costs' },
      { key: 'family-emergency', title: '👨‍👩‍👧‍👦 Family Support', placeholder: '2000', description: 'Family crisis support' },
      { key: 'academic-emergency', title: '🎓 Academic Emergencies', placeholder: '1500', description: 'Sudden academic expenses' },
      { key: 'technology-failure', title: '💻 Tech Replacement', placeholder: '1000', description: 'Device repairs/replacement' },
    ],
    funding: ['familyContribution', 'employment'],
    estimatedTotal: 7500
  },

  'graduate-prep': {
    id: 'graduate-prep',
    name: 'Graduate School Preparation',
    description: 'Tests, applications, and transition costs',
    icon: <BookOpen className="w-5 h-5" />,
    category: 'special',
    expenses: [
      { key: 'test-prep', title: '📖 Test Preparation', placeholder: '400', description: 'GRE, GMAT, test prep materials' },
      { key: 'standardized-tests', title: '✏️ Test Fees', placeholder: '300', description: 'GRE, GMAT, subject tests' },
      { key: 'applications', title: '📝 Application Fees', placeholder: '800', description: 'Graduate school applications' },
      { key: 'interview-travel', title: '🚗 Interview Travel', placeholder: '1200', description: 'Campus visits and interviews' },
    ],
    funding: ['scholarships', 'familyContribution', 'employment'],
    estimatedTotal: 2700
  }
};

interface EnhancedTemplateBuilderProps {
  onTemplateCreate: (template: any) => void;
  onCancel: () => void;
}

export function EnhancedTemplateBuilder({ onTemplateCreate, onCancel }: EnhancedTemplateBuilderProps) {
  const [selectedComponents, setSelectedComponents] = useState<Set<string>>(new Set(['core-academic']));
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [additionalFields, setAdditionalFields] = useState<Array<{id: string, title: string, description: string}>>([]);

  const handleComponentToggle = useCallback((componentId: string) => {
    const newSelected = new Set(selectedComponents);
    if (newSelected.has(componentId)) {
      // Don't allow removing core-academic as it's essential
      if (componentId !== 'core-academic') {
        newSelected.delete(componentId);
      }
    } else {
      newSelected.add(componentId);
    }
    setSelectedComponents(newSelected);
  }, [selectedComponents]);

  const getEstimatedTotal = useCallback(() => {
    return Array.from(selectedComponents).reduce((total, componentId) => {
      return total + (TEMPLATE_COMPONENTS[componentId]?.estimatedTotal || 0);
    }, 0);
  }, [selectedComponents]);

  const getCategoryComponents = (category: TemplateComponent['category']) => {
    return Object.values(TEMPLATE_COMPONENTS).filter(comp => comp.category === category);
  };

  const addCustomField = () => {
    const newId = `custom-${Date.now()}`;
    setAdditionalFields([...additionalFields, {
      id: newId,
      title: '',
      description: ''
    }]);
  };

  const updateCustomField = (id: string, field: 'title' | 'description', value: string) => {
    setAdditionalFields(fields => 
      fields.map(f => f.id === id ? { ...f, [field]: value } : f)
    );
  };

  const removeCustomField = (id: string) => {
    setAdditionalFields(fields => fields.filter(f => f.id !== id));
  };

  const generateTemplate = () => {
    const template = {
      id: `custom-${Date.now()}`,
      title: customTitle || 'Custom Financial Goal',
      description: customDescription || 'Personalized financial planning template',
      components: Array.from(selectedComponents),
      expenses: [] as Array<{
        key: string;
        title: string;
        placeholder: string;
        description: string;
        allowMultiple?: boolean;
        required?: boolean;
      }>,
      funding: [] as string[],
      customFields: additionalFields.filter(f => f.title.trim()),
      estimatedTotal: getEstimatedTotal()
    };

    // Combine all expenses from selected components
    selectedComponents.forEach(componentId => {
      const component = TEMPLATE_COMPONENTS[componentId];
      if (component) {
        template.expenses.push(...component.expenses);
        template.funding.push(...component.funding);
      }
    });

    // Remove duplicates from funding
    template.funding = [...new Set(template.funding)];

    onTemplateCreate(template);
  };

  const categoryOrder: TemplateComponent['category'][] = ['essential', 'academic', 'living', 'special', 'emergency'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Wand2 className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Build Your Financial Goal</h2>
        </div>
        <p className="text-gray-600">
          Select the components that match your educational funding needs
        </p>
      </div>

      {/* Template Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Goal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              placeholder="e.g., Junior Year Comprehensive Plan"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Brief description of your financial goal"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Component Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Select Your Expense Categories
          </CardTitle>
          <p className="text-sm text-gray-600">
            Choose all categories that apply to your situation. Estimated total: <strong>${getEstimatedTotal().toLocaleString()}</strong>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {categoryOrder.map(category => {
            const components = getCategoryComponents(category);
            if (components.length === 0) return null;

            const categoryLabels = {
              essential: '🎯 Essential Academic',
              academic: '📚 Academic Enhancement', 
              living: '🏠 Living Expenses',
              special: '✨ Special Programs',
              emergency: '🛡️ Safety & Emergency'
            };

            return (
              <div key={category} className="space-y-3">
                <h3 className="font-semibold text-lg border-b pb-1">
                  {categoryLabels[category]}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {components.map(component => {
                    const isSelected = selectedComponents.has(component.id);
                    const isRequired = component.id === 'core-academic';
                    
                    return (
                      <Card 
                        key={component.id}
                        className={`cursor-pointer transition-all ${
                          isSelected 
                            ? 'ring-2 ring-blue-500 bg-blue-50' 
                            : 'hover:bg-gray-50'
                        } ${isRequired ? 'opacity-90' : ''}`}
                        onClick={() => !isRequired && handleComponentToggle(component.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                checked={isSelected}
                                disabled={isRequired}
                                onChange={() => handleComponentToggle(component.id)}
                              />
                              {component.icon}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{component.name}</h4>
                                <Badge variant="outline">
                                  ${component.estimatedTotal.toLocaleString()}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{component.description}</p>
                              {isRequired && (
                                <Badge variant="default" className="text-xs">
                                  Required
                                </Badge>
                              )}
                              <div className="text-xs text-gray-500">
                                {component.expenses.length} expense categories
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Advanced Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Additional Custom Fields
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
          </CardTitle>
        </CardHeader>
        {showAdvanced && (
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Add custom expense categories specific to your situation
            </p>
            
            {additionalFields.map(field => (
              <div key={field.id} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label>Custom Field Title</Label>
                  <Input
                    placeholder="e.g., Research Materials"
                    value={field.title}
                    onChange={(e) => updateCustomField(field.id, 'title', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label>Description</Label>
                  <Input
                    placeholder="Brief description"
                    value={field.description}
                    onChange={(e) => updateCustomField(field.id, 'description', e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeCustomField(field.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
            
            <Button
              variant="outline"
              onClick={addCustomField}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Field
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Summary & Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Estimated Total:</span>
              <span className="text-blue-600">${getEstimatedTotal().toLocaleString()}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertCircle className="w-4 h-4" />
              This is an estimate. You'll be able to adjust all amounts in the detailed form.
            </div>
            
            <Separator />
            
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={generateTemplate} className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Create Financial Goal
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}