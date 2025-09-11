'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';
import { safeAccess } from '@/components/bugx/BugX-Schema-Framework';

// EXACT 11:10 AM Conditional Logic Implementation
interface RegistrationConditionalLogic {
  Student: {
    showEducationLevel: boolean;
    showInstitutionField: boolean;
    educationLevelOptions: Record<string, {
      showField: string | false;
      placeholder?: string;
      fieldType?: 'text' | 'textarea';
      displayNote?: string | null;
      noteType?: string | null;
    }>;
    standardFields: string[];
    additionalFields: string[];
  };
  Parent: {
    showEducationLevel: boolean;
    showInstitutionField: boolean;
    hideFields: string[];
    standardFields: string[];
    additionalFeatures: {
      childLinking: boolean;
      displayNote: string;
    };
  };
  Counselor: {
    showEducationLevel: boolean;
    showInstitutionField: boolean;
    institutionField: {
      label: string;
      placeholder: string;
      fieldType: string;
      required: boolean;
    };
    standardFields: string[];
  };
}

const registrationConditionalLogic: RegistrationConditionalLogic = {
  Student: {
    showEducationLevel: true,
    showInstitutionField: false,
    educationLevelOptions: {
      "Currently enrolled (specify school below)": {
        showField: "Current Institution",
        placeholder: "Enter your current school or university name",
        fieldType: "text"
      },
      "Accepted/Planning to attend (specify school below)": {
        showField: "Future Institution", 
        placeholder: "Enter the school you'll be attending",
        fieldType: "text"
      },
      "Applying to multiple schools": {
        showField: false,
        displayNote: "You can add schools later in your profile",
        noteType: "info"
      },
      "Community college planning 4-year transfer": {
        showField: "Current Institution",
        placeholder: "Enter your current community college name",
        fieldType: "text"
      },
      "Military/Veteran pursuing education": {
        showField: false,
        displayNote: "Veteran-specific resources note",
        noteType: "veteran-resources"
      },
      "Adult learner/Returning to school": {
        showField: false,
        displayNote: "Adult learner resources note", 
        noteType: "adult-learner-resources"
      },
      "Working toward specific funding goal": {
        showField: false,
        displayNote: null,
        noteType: null
      },
      "Exploring options to maximize scholarships": {
        showField: false,
        displayNote: null,
        noteType: null
      },
      "Other (please describe)": {
        showField: "Please describe your situation",
        placeholder: "Please describe your situation/goal/path",
        fieldType: "textarea"
      }
    },
    standardFields: ["Full Name", "Email Address", "Password", "Phone Number (Optional)"],
    additionalFields: ["Education Level", "Expected Graduation Year"]
  },
  Parent: {
    showEducationLevel: false,
    showInstitutionField: false,
    hideFields: ["Education Level", "Institution fields"],
    standardFields: ["Full Name", "Email Address", "Password", "Phone Number (Optional)"],
    additionalFeatures: {
      childLinking: true,
      displayNote: "You'll be able to link with your student after account creation"
    }
  },
  Counselor: {
    showEducationLevel: false,
    showInstitutionField: true,
    institutionField: {
      label: "Institution/Organization",
      placeholder: "Enter your school, organization, or institution name",
      fieldType: "text",
      required: true
    },
    standardFields: ["Full Name", "Email Address", "Password", "Phone Number (Optional)"]
  }
};

interface ValidatedRegistrationFormProps {
  onSubmit?: (data: Record<string, any>) => void;
}

export function ValidatedRegistrationForm({ onSubmit }: ValidatedRegistrationFormProps) {
  try {
    // Safe state initialization with error boundaries
    const [selectedRole, setSelectedRole] = useState<'Student' | 'Parent' | 'Counselor'>('Student');
    const [selectedEducationLevel, setSelectedEducationLevel] = useState<string>('');
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Safe event handlers with error boundaries
    const handleRoleChange = useCallback((role: 'Student' | 'Parent' | 'Counselor') => {
      try {
        setSelectedRole(role);
        setSelectedEducationLevel(''); // Reset education level when role changes
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Role change error:', err);
      }
    }, []);

    const handleEducationLevelChange = useCallback((educationLevel: string) => {
      try {
        setSelectedEducationLevel(educationLevel);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Education level change error:', err);
      }
    }, []);

    const handleInputChange = useCallback((field: string, value: string) => {
      try {
        setFormData(prev => ({ ...(prev || {}), [field]: value }));
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Input change error:', err);
      }
    }, []);

    const handleSubmit = useCallback((event: React.FormEvent) => {
      try {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const submitData = {
          role: selectedRole,
          educationLevel: selectedEducationLevel,
          ...formData
        };

        if (onSubmit) {
          onSubmit(submitData);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Form submission error:', err);
      } finally {
        setLoading(false);
      }
    }, [selectedRole, selectedEducationLevel, formData, onSubmit]);

    // Get current role logic safely - since selectedRole is controlled, this will always exist
    const currentRoleLogic = registrationConditionalLogic[selectedRole];
    
    // Get current education option safely - only Student role has educationLevelOptions
    const currentEducationOption = selectedEducationLevel && selectedRole === 'Student'
      ? ((currentRoleLogic as any).educationLevelOptions?.[selectedEducationLevel]) || {
          showField: false,
          placeholder: '',
          fieldType: 'text' as const,
          displayNote: null,
          noteType: null
        }
      : {
          showField: false,
          placeholder: '',
          fieldType: 'text' as const,
          displayNote: null,
          noteType: null
        };

    // Always return complete JSX structure
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="error-message bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="max-w-md w-full space-y-8">
          {/* Header - EXACT from screenshots */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Join STP</h2>
            <p className="mt-2 text-sm text-gray-600">
              Create your Scholarship Tracker Pro account
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>Fill in your information to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection - EXACT from screenshots */}
                <div>
                  <Label className="text-base font-medium text-gray-900">I am a...</Label>
                  <RadioGroup
                    value={selectedRole}
                    onValueChange={(value) => handleRoleChange(value as 'Student' | 'Parent' | 'Counselor')}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="Student" id="student" />
                      <div className="flex-1">
                        <Label htmlFor="student" className="font-medium">Student</Label>
                        <p className="text-sm text-gray-500">Manage your scholarship applications and track progress</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="Parent" id="parent" />
                      <div className="flex-1">
                        <Label htmlFor="parent" className="font-medium">Parent</Label>
                        <p className="text-sm text-gray-500">Monitor and support your child's scholarship journey</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="Counselor" id="counselor" />
                      <div className="flex-1">
                        <Label htmlFor="counselor" className="font-medium">Counselor</Label>
                        <p className="text-sm text-gray-500">Guide students and manage scholarship programs</p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Standard Fields - Always Shown */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName || ''}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password || ''}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
                  </div>
                </div>

                {/* CONDITIONAL FIELDS - Student Education Level */}
                {selectedRole === 'Student' && currentRoleLogic.showEducationLevel && (
                  <div>
                    <Label htmlFor="educationLevel">Education Level</Label>
                    <Select value={selectedEducationLevel} onValueChange={handleEducationLevelChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your education level" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(selectedRole === 'Student' ? ((currentRoleLogic as any).educationLevelOptions || {}) : {}).map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* CONDITIONAL FIELDS - Institution Field (Student) */}
                {selectedRole === 'Student' && 
                 selectedEducationLevel && 
                 currentEducationOption.showField && 
                 currentEducationOption.fieldType === 'text' && (
                  <div>
                    <Label htmlFor="institution">{currentEducationOption.showField}</Label>
                    <Input
                      id="institution"
                      type="text"
                      placeholder={currentEducationOption.placeholder || ''}
                      value={formData.institution || ''}
                      onChange={(e) => handleInputChange('institution', e.target.value)}
                    />
                  </div>
                )}

                {/* CONDITIONAL FIELDS - Description Field (Student Other) */}
                {selectedRole === 'Student' && 
                 selectedEducationLevel && 
                 currentEducationOption.showField && 
                 currentEducationOption.fieldType === 'textarea' && (
                  <div>
                    <Label htmlFor="description">{currentEducationOption.showField}</Label>
                    <Textarea
                      id="description"
                      placeholder={currentEducationOption.placeholder || ''}
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                  </div>
                )}

                {/* CONDITIONAL FIELDS - Institution Field (Counselor) */}
                {selectedRole === 'Counselor' && currentRoleLogic.showInstitutionField && 'institutionField' in currentRoleLogic && (
                  <div>
                    <Label htmlFor="counselorInstitution">
                      {currentRoleLogic.institutionField?.label || 'Institution/Organization'}
                    </Label>
                    <Input
                      id="counselorInstitution"
                      type="text"
                      placeholder={currentRoleLogic.institutionField?.placeholder || ''}
                      value={formData.counselorInstitution || ''}
                      onChange={(e) => handleInputChange('counselorInstitution', e.target.value)}
                      required={currentRoleLogic.institutionField?.required || false}
                    />
                  </div>
                )}

                {/* Expected Graduation Year (Student only) */}
                {selectedRole === 'Student' && (
                  <div>
                    <Label htmlFor="graduationYear">Expected Graduation Year</Label>
                    <Input
                      id="graduationYear"
                      type="number"
                      placeholder="2025"
                      value={formData.graduationYear || ''}
                      onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                    />
                  </div>
                )}

                {/* Phone Number (Optional) - Always Shown */}
                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

                {/* Display Notes */}
                {selectedEducationLevel && currentEducationOption.displayNote && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
                    <p className="text-sm">{currentEducationOption.displayNote}</p>
                  </div>
                )}

                {selectedRole === 'Parent' && (currentRoleLogic as any).additionalFeatures?.displayNote && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
                    <p className="text-sm">{(currentRoleLogic as any).additionalFeatures.displayNote}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button className="font-medium text-blue-600 hover:text-blue-500">
                    Sign in to existing account
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    // Global error boundary
    console.error('ValidatedRegistrationForm render error:', error);
    return (
      <div className="error-fallback bg-red-50 p-4 rounded">
        <h3>Error loading registration form</h3>
        <p>Please try refreshing the page.</p>
      </div>
    );
  }
}