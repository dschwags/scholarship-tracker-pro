'use client'

import { useState } from 'react'
import { Bell, Mail, Smartphone, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { UserPreferences } from '@/lib/types/user-preferences'

interface NotificationSettingsProps {
  user: {
    id: number
    name?: string | null
    email: string
    role: string
  }
  preferences: UserPreferences | null
}

export function NotificationSettings({ user, preferences }: NotificationSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const notificationPrefs = preferences?.notifications || {
    email: {
      enabled: true,
      deadlineReminders: true,
      applicationUpdates: true,
      newScholarships: true,
      weeklyDigest: false,
      marketing: false,
    },
    push: {
      enabled: false,
      deadlineReminders: true,
      applicationUpdates: true,
      newScholarships: false,
    },
    inApp: {
      enabled: true,
      deadlineReminders: true,
      applicationUpdates: true,
      newScholarships: true,
    },
    reminderTiming: {
      deadlineWarning: 7,
      followUpReminders: true,
      customTimes: ['09:00', '17:00'],
    },
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose what email notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Master toggle for all email notifications
              </p>
            </div>
            <Switch 
              checked={notificationPrefs.email.enabled}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Deadline Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about upcoming application deadlines
              </p>
            </div>
            <Switch 
              checked={notificationPrefs.email.deadlineReminders}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Application Updates</Label>
              <p className="text-sm text-muted-foreground">
                Status changes on your scholarship applications
              </p>
            </div>
            <Switch 
              checked={notificationPrefs.email.applicationUpdates}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">New Scholarships</Label>
              <p className="text-sm text-muted-foreground">
                Notifications when new scholarships match your profile
              </p>
            </div>
            <Switch 
              checked={notificationPrefs.email.newScholarships}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">
                Summary of your scholarship activities
              </p>
            </div>
            <Switch 
              checked={notificationPrefs.email.weeklyDigest}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Manage push notifications to your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Allow push notifications from this application
              </p>
            </div>
            <Switch 
              checked={notificationPrefs.push.enabled}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Deadline Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Push alerts for upcoming deadlines
              </p>
            </div>
            <Switch 
              checked={notificationPrefs.push.deadlineReminders}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Application Status</Label>
              <p className="text-sm text-muted-foreground">
                Push alerts for application status changes
              </p>
            </div>
            <Switch 
              checked={notificationPrefs.push.applicationUpdates}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Reminder Settings
          </CardTitle>
          <CardDescription>
            Configure when you want to receive reminders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Follow-up Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded to follow up on applications
              </p>
            </div>
            <Switch 
              checked={notificationPrefs.reminderTiming.followUpReminders}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Notification Preferences'}
        </Button>
      </div>
    </div>
  )
}