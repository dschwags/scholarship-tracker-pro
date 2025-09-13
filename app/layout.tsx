import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUserData } from '@/lib/actions/user-data';
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
  const sessionUser = await getUserData();
  
  return (
    <html
      lang="en"
      className={`${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-background text-foreground">
        <FeatureFlagProvider 
          userRole={sessionUser?.role === 'admin' ? 'admin' : sessionUser ? 'user' : 'user'}
          userId={sessionUser?.id?.toString()}
        >
          <AuthProvider initialUser={sessionUser}>
            <ThemeProvider>
              <GoalsProvider>
            <SWRConfig
              value={{
                fallback: {
                  // Pre-populate with server-side user data
                  '/api/user': sessionUser
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
