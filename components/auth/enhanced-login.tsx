'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Loader2, Users, UserCheck, ShieldCheck } from 'lucide-react';
import { signIn, signUp } from '@/app/(login)/actions';
import { ActionState } from '@/lib/auth/middleware';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function EnhancedLogin({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [selectedRole, setSelectedRole] = useState('student');
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' }
  );

  const roleIcons = {
    student: GraduationCap,
    parent: Users,
    counselor: UserCheck,
    admin: ShieldCheck,
  };

  const roleDescriptions = {
    student: 'Manage your scholarship applications and track progress',
    parent: 'Monitor and support your child\'s scholarship journey',
    counselor: 'Guide students and manage scholarship programs',
    admin: 'Full system administration access',
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          {mode === 'signin' ? 'Welcome Back' : 'Join STP'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {mode === 'signin'
            ? 'Sign in to your Scholarship Tracker Pro account'
            : 'Create your Scholarship Tracker Pro account'
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {mode === 'signin' 
                ? 'Enter your credentials to access your account'
                : 'Fill in your information to get started'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" action={formAction}>
              <input type="hidden" name="redirect" value={redirect || ''} />
              
              {mode === 'signup' && (
                <>
                  {/* Role Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">I am a...</Label>
                    <RadioGroup 
                      value={selectedRole} 
                      onValueChange={setSelectedRole}
                      name="role"
                      className="grid grid-cols-1 gap-3"
                    >
                      {Object.entries(roleDescriptions).filter(([role]) => role !== 'admin').map(([role, description]) => {
                        const Icon = roleIcons[role as keyof typeof roleIcons];
                        return (
                          <div key={role} className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors">
                            <RadioGroupItem value={role} id={role} />
                            <Icon className="h-5 w-5 text-primary" />
                            <div className="flex-1">
                              <Label htmlFor={role} className="font-medium capitalize cursor-pointer">
                                {role}
                              </Label>
                              <p className="text-xs text-muted-foreground">{description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>

                  {/* Name Field */}
                  <div>
                    <Label htmlFor="name" className="block text-sm font-medium">
                      Full Name
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        defaultValue={state.name}
                        required={mode === 'signup'}
                        maxLength={100}
                        className="rounded-lg"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                </> 
              )}

              {/* Email Field */}
              <div>
                <Label htmlFor="email" className="block text-sm font-medium">
                  Email Address
                </Label>
                <div className="mt-1">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    defaultValue={state.email}
                    required
                    maxLength={50}
                    className="rounded-lg"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <Label htmlFor="password" className="block text-sm font-medium">
                  Password
                </Label>
                <div className="mt-1">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    defaultValue={state.password}
                    required
                    minLength={8}
                    maxLength={100}
                    className="rounded-lg"
                    placeholder="Enter your password"
                  />
                </div>
                {mode === 'signup' && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Must be at least 8 characters long
                  </p>
                )}
                {mode === 'signin' && (
                  <div className="flex justify-end mt-1">
                    <Link 
                      href="/forgot-password"
                      className="text-xs text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                )}
              </div>

              {mode === 'signup' && selectedRole === 'student' && (
                <>
                  {/* Education Level */}
                  <div>
                    <Label htmlFor="educationLevel" className="block text-sm font-medium">
                      Education Level
                    </Label>
                    <div className="mt-1">
                      <Select name="educationLevel">
                        <SelectTrigger className="rounded-lg">
                          <SelectValue placeholder="Select your education level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high_school">High School</SelectItem>
                          <SelectItem value="undergraduate">Undergraduate</SelectItem>
                          <SelectItem value="graduate">Graduate</SelectItem>
                          <SelectItem value="doctoral">Doctoral</SelectItem>
                          <SelectItem value="post_doctoral">Post-Doctoral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* School */}
                  <div>
                    <Label htmlFor="school" className="block text-sm font-medium">
                      School/University
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="school"
                        name="school"
                        type="text"
                        maxLength={200}
                        className="rounded-lg"
                        placeholder="Enter your school or university"
                      />
                    </div>
                  </div>

                  {/* Graduation Year */}
                  <div>
                    <Label htmlFor="graduationYear" className="block text-sm font-medium">
                      Expected Graduation Year
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="graduationYear"
                        name="graduationYear"
                        type="number"
                        min="2020"
                        max="2040"
                        className="rounded-lg"
                        placeholder="2025"
                      />
                    </div>
                  </div>
                </>
              )}

              {mode === 'signup' && (
                <div>
                  <Label htmlFor="phone" className="block text-sm font-medium">
                    Phone Number <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      maxLength={20}
                      className="rounded-lg"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              )}

              {state?.error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg">
                  {state.error}
                </div>
              )}

              <div>
                <Button
                  type="submit"
                  className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={pending}
                >
                  {pending ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : mode === 'signin' ? (
                    'Sign In'
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                {mode === 'signin'
                  ? 'New to STP?'
                  : 'Already have an account?'}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href={`${mode === 'signin' ? '/sign-up' : '/sign-in'}${
                redirect ? `?redirect=${redirect}` : ''
              }`}
              className="w-full flex justify-center py-2 px-4 border border-input rounded-lg shadow-sm text-sm font-medium text-foreground bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              {mode === 'signin'
                ? 'Create an account'
                : 'Sign in to existing account'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}