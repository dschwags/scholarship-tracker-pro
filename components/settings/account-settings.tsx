'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, CheckCircle2, ChevronDown, ChevronRight, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

import { 
  updateUserProfile, 
  changePassword, 
  changeEmail
} from '@/lib/actions/user-settings'
import { getPasswordRequirements } from '@/lib/utils/password-validation'
import { UserPreferences } from '@/lib/types/user-preferences'
// import { DeleteAccountModal } from './delete-account-modal'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
  gpa: z.number().min(0).max(4.0).optional().or(z.literal('')),
  graduationYear: z.number().min(2020).max(2035).optional().or(z.literal('')),
  school: z.string().max(200, 'School name too long').optional(),
  major: z.string().max(100, 'Major too long').optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/\d/, 'Must contain number')
    .regex(/[!@#$%^&*(),.?\":{}|<>]/, 'Must contain special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

const emailSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>
type EmailForm = z.infer<typeof emailSchema>

interface AccountSettingsProps {
  user: {
    id: number
    name?: string | null
    email: string
    role: string
    gpa?: number | null
    graduationYear?: number | null
    school?: string | null
    major?: string | null
  }
  preferences: UserPreferences | null
}

export function AccountSettings({ user, preferences }: AccountSettingsProps) {
  const [isPending, startTransition] = useTransition()
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [isPasswordSectionExpanded, setIsPasswordSectionExpanded] = useState(false)
  const [isEmailSectionExpanded, setIsEmailSectionExpanded] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      bio: preferences?.profile?.bio || '',
      gpa: user.gpa || '',
      graduationYear: user.graduationYear || '',
      school: user.school || '',
      major: user.major || '',
    }
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  })

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      newEmail: '',
      password: '',
    }
  })

  const onProfileSubmit = (data: ProfileForm) => {
    startTransition(async () => {
      const result = await updateUserProfile({
        name: data.name,
        gpa: data.gpa === '' ? undefined : Number(data.gpa),
        graduationYear: data.graduationYear === '' ? undefined : Number(data.graduationYear),
        school: data.school || undefined,
        major: data.major || undefined,
      })
      
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      })
    })
  }

  const onPasswordSubmit = (data: PasswordForm) => {
    setMessage(null) // Clear previous messages
    startTransition(async () => {
      try {
        const result = await changePassword({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        })
        
        setMessage({
          type: result.success ? 'success' : 'error',
          text: result.message
        })

        if (result.success) {
          passwordForm.reset()
          setShowPasswords({ current: false, new: false, confirm: false })
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'An unexpected error occurred. Please try again.'
        })
        console.error('Password change error:', error)
      }
    })
  }

  const onEmailSubmit = (data: EmailForm) => {
    startTransition(async () => {
      const result = await changeEmail({
        newEmail: data.newEmail,
        password: data.password,
      })
      
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      })

      if (result.success) {
        emailForm.reset()
      }
    })
  }

  const passwordRequirements = getPasswordRequirements()

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </span>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and academic details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...profileForm.register('name')}
                  disabled={isPending}
                />
                {profileForm.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {profileForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="gpa">GPA</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  placeholder="3.75"
                  {...profileForm.register('gpa', { valueAsNumber: true })}
                  disabled={isPending}
                />
                {profileForm.formState.errors.gpa && (
                  <p className="text-sm text-red-600 mt-1">
                    {profileForm.formState.errors.gpa.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="school">School/University</Label>
                <Input
                  id="school"
                  {...profileForm.register('school')}
                  placeholder="University of Example"
                  disabled={isPending}
                />
                {profileForm.formState.errors.school && (
                  <p className="text-sm text-red-600 mt-1">
                    {profileForm.formState.errors.school.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="graduationYear">Graduation Year</Label>
                <Input
                  id="graduationYear"
                  type="number"
                  min="2020"
                  max="2035"
                  placeholder="2025"
                  {...profileForm.register('graduationYear', { valueAsNumber: true })}
                  disabled={isPending}
                />
                {profileForm.formState.errors.graduationYear && (
                  <p className="text-sm text-red-600 mt-1">
                    {profileForm.formState.errors.graduationYear.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="major">Major</Label>
                <Input
                  id="major"
                  {...profileForm.register('major')}
                  placeholder="Computer Science"
                  disabled={isPending}
                />
                {profileForm.formState.errors.major && (
                  <p className="text-sm text-red-600 mt-1">
                    {profileForm.formState.errors.major.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                {...profileForm.register('bio')}
                placeholder="Tell us about yourself..."
                disabled={isPending}
                rows={3}
              />
              {profileForm.formState.errors.bio && (
                <p className="text-sm text-red-600 mt-1">
                  {profileForm.formState.errors.bio.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPasswordSectionExpanded(!isPasswordSectionExpanded)}
              className="ml-auto hover:bg-muted/50 transition-colors"
            >
              {isPasswordSectionExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="ml-1">
                {isPasswordSectionExpanded ? 'Collapse' : 'Expand'}
              </span>
            </Button>
          </div>
        </CardHeader>
        {!isPasswordSectionExpanded && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Click "Expand" to change your password securely
            </p>
          </CardContent>
        )}
        {isPasswordSectionExpanded && (
          <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? 'text' : 'password'}
                  {...passwordForm.register('currentPassword')}
                  disabled={isPending}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-red-600 mt-1">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  {...passwordForm.register('newPassword')}
                  disabled={isPending}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-red-600 mt-1">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  {...passwordForm.register('confirmPassword')}
                  disabled={isPending}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-sm mb-2">Password Requirements:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                {passwordRequirements.requirements.map((req, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-gray-400 rounded-full" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
          </CardContent>
        )}
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Change Email Address
              </CardTitle>
              <CardDescription>
                Update your email address (requires password confirmation)
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEmailSectionExpanded(!isEmailSectionExpanded)}
              className="ml-auto hover:bg-muted/50 transition-colors"
            >
              {isEmailSectionExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="ml-1">
                {isEmailSectionExpanded ? 'Collapse' : 'Expand'}
              </span>
            </Button>
          </div>
        </CardHeader>
        {!isEmailSectionExpanded && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Click "Expand" to update your email address
            </p>
          </CardContent>
        )}
        {isEmailSectionExpanded && (
          <CardContent>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
            <div>
              <Label>Current Email</Label>
              <Input value={user.email} disabled className="bg-gray-50" />
            </div>

            <div>
              <Label htmlFor="newEmail">New Email Address</Label>
              <Input
                id="newEmail"
                type="email"
                {...emailForm.register('newEmail')}
                disabled={isPending}
              />
              {emailForm.formState.errors.newEmail && (
                <p className="text-sm text-red-600 mt-1">
                  {emailForm.formState.errors.newEmail.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="passwordConfirm">Confirm with Password</Label>
              <Input
                id="passwordConfirm"
                type="password"
                {...emailForm.register('password')}
                disabled={isPending}
              />
              {emailForm.formState.errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {emailForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending ? 'Updating...' : 'Update Email'}
            </Button>
          </form>
          </CardContent>
        )}
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that will permanently affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-900/10">
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-200">Delete Account</h4>
              <p className="text-sm text-red-600 dark:text-red-400">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive" size="sm" disabled>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account (Coming Soon)
            </Button>
            {/* <DeleteAccountModal>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </DeleteAccountModal> */}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}