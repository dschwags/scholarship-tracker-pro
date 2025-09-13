import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, X } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { getUserPreferences } from '@/lib/actions/user-settings'
import { SettingsLayout } from '@/components/settings/settings-layout'
import { Button } from '@/components/ui/button'
import { ComponentUser } from '@/types/user'

export default async function SettingsPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/sign-in')
  }
  
  // Use dynamic imports to avoid bundling database code in client
  const { db } = await import('@/lib/db/drizzle');
  const { users } = await import('@/lib/db/schema');
  const { eq } = await import('drizzle-orm');
  
  // Fetch complete user data from database
  const userData = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1)
  if (!userData[0]) {
    redirect('/sign-in')
  }
  
  const user = userData[0]
  const preferences = await getUserPreferences()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <X className="h-4 w-4" />
                  Exit Settings
                </Button>
              </Link>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        
        <SettingsLayout user={user as ComponentUser} preferences={preferences} />
      </div>
    </div>
  )
}