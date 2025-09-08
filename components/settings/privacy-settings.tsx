'use client'

import { useState } from 'react'
import { Eye, Shield, Database, ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { UserPreferences } from '@/lib/types/user-preferences'

interface PrivacySettingsProps {
  user: {
    id: number
    name?: string | null
    email: string
    role: string
  }
  preferences: UserPreferences | null
}

export function PrivacySettings({ user, preferences }: PrivacySettingsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const profilePrefs = preferences?.profile || {
    profileVisibility: 'private' as const,
    showEmail: false,
    showGPA: false,
    showSchool: true,
  }

  return (
    <div className="space-y-6">
      {/* Profile Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Profile Visibility
          </CardTitle>
          <CardDescription>
            Control who can see your profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">Profile Visibility</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Choose who can view your profile and activity
            </p>
            <Select value={profilePrefs.profileVisibility} disabled={isLoading}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Public - Anyone can view
                  </div>
                </SelectItem>
                <SelectItem value="members">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Members Only - Registered users only
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Private - Only you can view
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Information Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Information Sharing
          </CardTitle>
          <CardDescription>
            Choose what information to display on your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Show Email Address</Label>
              <p className="text-sm text-muted-foreground">
                Display your email address on your public profile
              </p>
            </div>
            <Switch 
              checked={profilePrefs.showEmail}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Show GPA</Label>
              <p className="text-sm text-muted-foreground">
                Display your GPA information publicly
              </p>
            </div>
            <Switch 
              checked={profilePrefs.showGPA}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Show School</Label>
              <p className="text-sm text-muted-foreground">
                Display your school/university name
              </p>
            </div>
            <Switch 
              checked={profilePrefs.showSchool}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Actions
          </CardTitle>
          <CardDescription>
            Manage your account and data preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" disabled={true}>
              Download My Data
            </Button>
            <Button variant="outline" disabled={true}>
              Request Data Deletion
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Contact support for data export or deletion requests. 
            These actions may take up to 30 days to process.
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Privacy Preferences'}
        </Button>
      </div>
    </div>
  )
}