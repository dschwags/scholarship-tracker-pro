'use client'

import { useState } from 'react'
import { DollarSign, Download, Target, PieChart, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { UserPreferences } from '@/lib/types/user-preferences'
import { getFormItemClasses } from '@/lib/utils/alternating-colors'

interface FinancialSettingsProps {
  user: {
    id: number
    name?: string | null
    email: string
    role: string
  }
  preferences: UserPreferences | null
}

export function FinancialSettings({ user, preferences }: FinancialSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  // Initialize with current preferences or defaults
  const [financialPrefs, setFinancialPrefs] = useState(() => preferences?.financial || {
    currency: 'USD' as const,
    privacy: {
      showAmounts: true,
      showGoals: true,
      anonymizeExports: false,
    },
    goalSettings: {
      autoCalculateNeed: true,
      includeOtherAid: true,
      trackingCategories: ['tuition', 'books', 'living', 'other'],
    },
    exportDefaults: {
      format: 'html' as const,
      includePersonalData: true,
      includeFinancialData: true,
      includeApplicationProgress: true,
    },
  })
  
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  
  const handleSave = async () => {
    setIsLoading(true)
    setSaveMessage(null)
    
    try {
      // Here you would call an API to save the preferences
      // For now, we'll simulate a save operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSaveMessage({
        type: 'success',
        text: 'Financial preferences saved successfully!'
      })
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: 'Failed to save preferences. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const updatePrivacySetting = (key: string, value: boolean) => {
    setFinancialPrefs(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }))
  }
  
  const updateGoalSetting = (key: string, value: boolean) => {
    setFinancialPrefs(prev => ({
      ...prev,
      goalSettings: {
        ...prev.goalSettings,
        [key]: value
      }
    }))
  }
  
  const updateCurrency = (currency: string) => {
    setFinancialPrefs(prev => ({
      ...prev,
      currency: currency as 'USD' | 'CAD' | 'EUR' | 'GBP'
    }))
  }
  
  const updateExportFormat = (format: string) => {
    setFinancialPrefs(prev => ({
      ...prev,
      exportDefaults: {
        ...prev.exportDefaults,
        format: format as 'html' | 'pdf' | 'rtf' | 'txt'
      }
    }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Currency & Display
          </CardTitle>
          <CardDescription>
            Configure how financial amounts are displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">Default Currency</Label>
            <p className="text-sm text-muted-foreground mb-2">
              All monetary amounts will be displayed in this currency
            </p>
            <Select value={financialPrefs.currency} disabled={isLoading} onValueChange={updateCurrency}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">🇺🇸 US Dollar (USD)</SelectItem>
                <SelectItem value="CAD">🇨🇦 Canadian Dollar (CAD)</SelectItem>
                <SelectItem value="EUR">🇪🇺 Euro (EUR)</SelectItem>
                <SelectItem value="GBP">🇬🇧 British Pound (GBP)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Financial Privacy
          </CardTitle>
          <CardDescription>
            Control the visibility of your financial information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            {
              key: 'showAmounts',
              label: 'Show Dollar Amounts',
              description: 'Display specific amounts instead of general ranges',
              checked: financialPrefs.privacy.showAmounts
            },
            {
              key: 'showGoals',
              label: 'Show Financial Goals',
              description: 'Display your financial goals in dashboard summaries',
              checked: financialPrefs.privacy.showGoals
            },
            {
              key: 'anonymizeExports',
              label: 'Anonymize Exports',
              description: 'Remove personal identifying information from exported data',
              checked: financialPrefs.privacy.anonymizeExports
            }
          ].map((setting, index) => (
            <div key={setting.key} className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${getFormItemClasses(index)}`}>
              <div>
                <Label className="text-base font-medium">{setting.label}</Label>
                <p className="text-sm text-muted-foreground">
                  {setting.description}
                </p>
              </div>
              <Switch 
                checked={setting.checked}
                disabled={isLoading}
                onCheckedChange={(checked) => updatePrivacySetting(setting.key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Financial Goal Settings
          </CardTitle>
          <CardDescription>
            Configure how financial goals are calculated and tracked
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            {
              key: 'autoCalculateNeed',
              label: 'Auto-Calculate Need',
              description: 'Automatically calculate remaining financial need based on goals',
              checked: financialPrefs.goalSettings.autoCalculateNeed
            },
            {
              key: 'includeOtherAid',
              label: 'Include Other Financial Aid',
              description: 'Factor in grants, loans, and other aid when calculating need',
              checked: financialPrefs.goalSettings.includeOtherAid
            }
          ].map((setting, index) => (
            <div key={setting.key} className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${getFormItemClasses(index)}`}>
              <div>
                <Label className="text-base font-medium">{setting.label}</Label>
                <p className="text-sm text-muted-foreground">
                  {setting.description}
                </p>
              </div>
              <Switch 
                checked={setting.checked}
                disabled={isLoading}
                onCheckedChange={(checked) => updateGoalSetting(setting.key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Defaults
          </CardTitle>
          <CardDescription>
            Set your preferred settings for data exports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">Default Export Format</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Your preferred format when exporting scholarship data
            </p>
            <Select value={financialPrefs.exportDefaults.format} disabled={isLoading} onValueChange={updateExportFormat}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="html">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    HTML (Recommended)
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Document
                  </div>
                </SelectItem>
                <SelectItem value="rtf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    RTF (Word Compatible)
                  </div>
                </SelectItem>
                <SelectItem value="txt">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Plain Text
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {saveMessage && (
        <div className={`p-4 rounded-lg ${
          saveMessage.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {saveMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {saveMessage.text}
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <Button disabled={isLoading} onClick={handleSave}>
          {isLoading ? 'Saving...' : 'Save Financial Preferences'}
        </Button>
      </div>
    </div>
  )
}