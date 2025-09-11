import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import Header from '@/components/header';
import { ThemeProvider } from '@/contexts/theme-context';
import { GoalsProvider } from '@/contexts/goals-context';
import { FeatureFlagProvider } from '@/lib/feature-flags/hooks';
import { AuthProvider } from '@/contexts/auth-context';
import { siteConfig } from '@/lib/config';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Get user data server-side to prevent client-side flickering
  const user = await getUser();
  
  // Convert User to SessionUser format for AuthProvider
  const sessionUser = user ? {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  } : null;
  
  return (
    <html
      lang="en"
      className={`${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-background text-foreground">
        <FeatureFlagProvider 
          userRole={user?.role === 'admin' ? 'admin' : user ? 'user' : 'user'}
          userId={user?.id?.toString()}
        >
          <AuthProvider initialUser={sessionUser}>
            <ThemeProvider>
              <GoalsProvider>
            <SWRConfig
              value={{
                fallback: {
                  // Pre-populate with server-side user data
                  '/api/user': user
                }
              }}
            >
              <div className="flex flex-col min-h-screen">
                <Header />
                {children}
                <Toaster richColors position="top-right" />
              </div>
            </SWRConfig>
              </GoalsProvider>
            </ThemeProvider>
          </AuthProvider>
        </FeatureFlagProvider>
      </body>
    </html>
  );
}
