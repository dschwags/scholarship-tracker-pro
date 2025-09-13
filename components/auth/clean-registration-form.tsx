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

// EXACT 11:10 AM Conditional Logic - Simplified Types
type UserRole = 'Student' | 'Parent' | 'Counselor';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  educationLevel: string;
  institution: string;
  description: string;
  graduationYear: string;
  counselorInstitution: string;
}

// Education Level Options (EXACT from 11:10 AM map)
const EDUCATION_LEVELS = [
  'Currently enrolled (specify school below)',
  'Accepted/Planning to attend (specify school below)',
  'Applying to multiple schools',
  'Community college planning 4-year transfer',
  'Military/Veteran pursuing education',
  'Adult learner/Returning to school',
  'Working toward specific funding goal',
  'Exploring options to maximize scholarships',
  'Other (please describe)'
];

// Map custom education level strings to database enum values
const mapEducationLevelToEnum = (educationLevel: string): string | null => {
  switch (educationLevel) {
    case 'Currently enrolled (specify school below)':
    case 'Accepted/Planning to attend (specify school below)':
    case 'Applying to multiple schools':
      return 'undergraduate'; // Most common case
    case 'Community college planning 4-year transfer':
      return 'high_school'; // Associate's level
    case 'Military/Veteran pursuing education':
    case 'Adult learner/Returning to school':
    case 'Working toward specific funding goal':
    case 'Exploring options to maximize scholarships':
      return 'undergraduate'; // Default to undergraduate
    case 'Other (please describe)':
      return 'undergraduate'; // Default fallback
    default:
      return null; // Let validation handle empty/invalid values
  }
};

// Map custom strings to educational status enum values
const mapEducationalStatusToEnum = (educationLevel: string): string | null => {
  switch (educationLevel) {
    case 'Currently enrolled (specify school below)':
      return 'currently_enrolled';
    case 'Accepted/Planning to attend (specify school below)':
      return 'accepted_planning';
    case 'Applying to multiple schools':
      return 'applying_multiple';
    case 'Community college planning 4-year transfer':
      return 'community_college';
    case 'Military/Veteran pursuing education':
      return 'military_veteran';
    case 'Adult learner/Returning to school':
      return 'adult_learner';
    case 'Working toward specific funding goal':
      return 'funding_goal';
    case 'Exploring options to maximize scholarships':
      return 'exploring_options';
    case 'Other (please describe)':
      return 'other';
    default:
      return null;
  }
};

interface CleanRegistrationFormProps {
  onSubmit?: (data: FormData & { role: UserRole }) => void;
}

export function CleanRegistrationForm({ onSubmit }: CleanRegistrationFormProps) {
  try {
    // Safe state initialization
    const [selectedRole, setSelectedRole] = useState<UserRole>('Student');
    const [selectedEducationLevel, setSelectedEducationLevel] = useState<string>('');
    const [formData, setFormData] = useState<FormData>({
      fullName: '',
      email: '',
      password: '',
      phone: '',
      educationLevel: '',
      institution: '',
      description: '',
      graduationYear: '',
      counselorInstitution: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Safe event handlers
    const handleRoleChange = useCallback((role: UserRole) => {
      try {
        setSelectedRole(role);
        setSelectedEducationLevel('');
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
        setFormData(prev => ({ ...prev, educationLevel }));
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Education level change error:', err);
      }
    }, []);

    const handleInputChange = useCallback((field: keyof FormData, value: string) => {
      try {
        setFormData(prev => ({ ...prev, [field]: value }));
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
          ...formData,
          role: selectedRole,
          educationLevel: mapEducationLevelToEnum(selectedEducationLevel) || '',
          educationalStatus: mapEducationalStatusToEnum(selectedEducationLevel) || ''
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

    // Helper functions for conditional logic
    const shouldShowEducationLevel = (): boolean => {
      return selectedRole === 'Student';
    };

    const shouldShowInstitutionField = (): boolean => {
      if (selectedRole === 'Student') {
        return selectedEducationLevel === 'Currently enrolled (specify school below)' ||
               selectedEducationLevel === 'Accepted/Planning to attend (specify school below)' ||
               selectedEducationLevel === 'Community college planning 4-year transfer';
      }
      if (selectedRole === 'Counselor') {
        return true;
      }
      return false;
    };

    const shouldShowDescriptionField = (): boolean => {
      return selectedRole === 'Student' && selectedEducationLevel === 'Other (please describe)';
    };

    const getInstitutionLabel = (): string => {
      if (selectedRole === 'Counselor') {
        return 'Institution/Organization';
      }
      if (selectedEducationLevel === 'Currently enrolled (specify school below)') {
        return 'Current Institution';
      }
      if (selectedEducationLevel === 'Accepted/Planning to attend (specify school below)') {
        return 'Future Institution';
      }
      if (selectedEducationLevel === 'Community college planning 4-year transfer') {
        return 'Current Institution';
      }
      return 'Institution';
    };

    const getInstitutionPlaceholder = (): string => {
      if (selectedRole === 'Counselor') {
        return 'Enter your school, organization, or institution name';
      }
      if (selectedEducationLevel === 'Currently enrolled (specify school below)') {
        return 'Enter your current school or university name';
      }
      if (selectedEducationLevel === 'Accepted/Planning to attend (specify school below)') {
        return 'Enter the school you\'ll be attending';
      }
      if (selectedEducationLevel === 'Community college planning 4-year transfer') {
        return 'Enter your current community college name';
      }
      return 'Enter institution name';
    };

    const getDisplayNote = (): string | null => {
      if (selectedRole === 'Parent') {
        return 'You\'ll be able to link with your student after account creation';
      }
      if (selectedRole === 'Student') {
        if (selectedEducationLevel === 'Applying to multiple schools') {
          return 'You can add schools later in your profile';
        }
        if (selectedEducationLevel === 'Military/Veteran pursuing education') {
          return 'Veteran-specific resources note';
        }
        if (selectedEducationLevel === 'Adult learner/Returning to school') {
          return 'Adult learner resources note';
        }
      }
      return null;
    };

    // Always return complete JSX
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="error-message bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="max-w-md w-full space-y-8">
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
                <div>
                  <Label className="text-base font-medium text-gray-900">I am a...</Label>
                  <RadioGroup
                    value={selectedRole}
                    onValueChange={(value) => handleRoleChange(value as UserRole)}
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

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
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
                      value={formData.email}
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
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
                  </div>
                </div>

                {shouldShowEducationLevel() && (
                  <div>
                    <Label htmlFor="educationLevel">Education Level</Label>
                    <Select value={selectedEducationLevel} onValueChange={handleEducationLevelChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your education level" />
                      </SelectTrigger>
                      <SelectContent>
                        {EDUCATION_LEVELS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {shouldShowInstitutionField() && (
                  <div>
                    <Label htmlFor="institution">{getInstitutionLabel()}</Label>
                    <Input
                      id="institution"
                      type="text"
                      placeholder={getInstitutionPlaceholder()}
                      value={selectedRole === 'Counselor' ? formData.counselorInstitution : formData.institution}
                      onChange={(e) => handleInputChange(
                        selectedRole === 'Counselor' ? 'counselorInstitution' : 'institution', 
                        e.target.value
                      )}
                      required={selectedRole === 'Counselor'}
                    />
                  </div>
                )}

                {shouldShowDescriptionField() && (
                  <div>
                    <Label htmlFor="description">Please describe your situation</Label>
                    <Textarea
                      id="description"
                      placeholder="Please describe your situation/goal/path"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                  </div>
                )}

                {selectedRole === 'Student' && (
                  <div>
                    <Label htmlFor="graduationYear">Expected Graduation Year</Label>
                    <Input
                      id="graduationYear"
                      type="number"
                      placeholder="2025"
                      value={formData.graduationYear}
                      onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

                {getDisplayNote() && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
                    <p className="text-sm">{getDisplayNote()}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

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
    console.error('CleanRegistrationForm render error:', error);
    return (
      <div className="error-fallback bg-red-50 p-4 rounded">
        <h3>Error loading registration form</h3>
        <p>Please try refreshing the page.</p>
      </div>
    );
  }
}