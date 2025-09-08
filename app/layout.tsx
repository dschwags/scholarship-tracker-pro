import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import Header from '@/components/header';
import { ThemeProvider } from '@/contexts/theme-context';
import { GoalsProvider } from '@/contexts/goals-context';
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
  
  return (
    <html
      lang="en"
      className={`${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-background text-foreground">
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
      </body>
    </html>
  );
}
