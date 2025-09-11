'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, Settings, X, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPreferences } from '@/lib/types/user-preferences'
import { ComponentUser } from '@/types/user'
import { AccountSettings } from './account-settings'
import { FinancialSettings } from './financial-settings'

interface SettingsLayoutProps {
  user: ComponentUser
  preferences: UserPreferences | null
}

export function SettingsLayout({ user, preferences }: SettingsLayoutProps) {
  const [activeTab, setActiveTab] = useState('account')
  
  // Check URL parameters to set initial tab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get('tab')
      if (tabParam && ['account', 'financial'].includes(tabParam)) {
        setActiveTab(tabParam)
      }
    }
  }, [])

  const tabs = [
    {
      id: 'account',
      label: 'Account',
      icon: User,
      description: 'Manage your profile and account details'
    },
    {
      id: 'financial',
      label: 'Financial',
      icon: DollarSign,
      description: 'Configure financial goals and preferences'
    }
  ]

  return (
    <div className="relative">
      {/* Close button in top-right corner */}
      <div className="absolute top-0 right-0 z-10">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <X className="h-4 w-4" />
            Close
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </CardTitle>
            <CardDescription>
              Choose a category to configure your preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                      activeTab === tab.id 
                        ? 'bg-muted border-r-2 border-primary text-primary' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{tab.label}</div>
                      <div className="text-xs text-muted-foreground hidden lg:block">
                        {tab.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Account Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>{' '}
                <span className="font-medium">{user.name || 'Not set'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>{' '}
                <span className="font-medium">{user.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Role:</span>{' '}
                <span className="font-medium capitalize">{user.role}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

        <div className="lg:col-span-3">
          <div className="space-y-6">
            {activeTab === 'account' && (
              <AccountSettings user={user} preferences={preferences} />
            )}
            {activeTab === 'financial' && (
              <FinancialSettings user={user} preferences={preferences} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}