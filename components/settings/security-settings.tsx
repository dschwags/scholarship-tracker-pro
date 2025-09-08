'use client'

import { useState } from 'react'
import { Shield, Smartphone, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPreferences } from '@/lib/types/user-preferences'

interface SecuritySettingsProps {
  user: {
    id: number
    name?: string | null
    email: string
    role: string
  }
  preferences: UserPreferences | null
}

export function SecuritySettings({ user, preferences }: SecuritySettingsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const securityPrefs = preferences?.security || {
    twoFactorEnabled: false,
    sessionTimeout: 60,
    loginAlerts: true,
    requirePasswordForSensitive: false,
    allowedDevices: [],
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable 2FA</Label>
              <p className="text-sm text-muted-foreground">
                Require a verification code when signing in
              </p>
            </div>
            <Switch 
              checked={securityPrefs.twoFactorEnabled}
              disabled={isLoading}
            />
          </div>

          {!securityPrefs.twoFactorEnabled && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  2FA is recommended for account security
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Enable two-factor authentication to protect your scholarship data
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Settings
          </CardTitle>
          <CardDescription>
            Manage your login sessions and timeout preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">Session Timeout</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Automatically log out after a period of inactivity
            </p>
            <Select value={securityPrefs.sessionTimeout.toString()} disabled={isLoading}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="480">8 hours</SelectItem>
                <SelectItem value="1440">24 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Login Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when your account is accessed
              </p>
            </div>
            <Switch 
              checked={securityPrefs.loginAlerts}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Password for Sensitive Actions</Label>
              <p className="text-sm text-muted-foreground">
                Require password confirmation for sensitive operations
              </p>
            </div>
            <Switch 
              checked={securityPrefs.requirePasswordForSensitive}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Device Management
          </CardTitle>
          <CardDescription>
            Manage devices that have access to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <p className="font-medium">Current Browser</p>
                <p className="text-sm text-muted-foreground">
                  Last used: Just now
                </p>
              </div>
              <span className="text-sm text-green-600 font-medium">Current</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Security Settings'}
        </Button>
      </div>
    </div>
  )
}