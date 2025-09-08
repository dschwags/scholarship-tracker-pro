'use client';

import Link from 'next/link';
import { useState, Suspense, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CircleIcon, LogOut, User as UserIcon, Settings, DollarSign, Bell, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/db/schema';
import useSWR, { mutate } from 'swr';
import ThemeControls from './theme-controls';
import { siteConfig } from '@/lib/config';

const fetcher = async (url: string) => {
  console.log('🚀 SWR Fetcher: Starting request to', url);
  try {
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include', // Ensure cookies are sent
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📦 SWR Fetcher: Response received:', {
      status: res.status,
      ok: res.ok,
      url: res.url
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('📄 SWR Fetcher: Data parsed:', {
      hasData: !!data,
      dataType: typeof data,
      isUserObject: data && typeof data === 'object' && 'email' in data,
      userEmail: data?.email
    });
    
    return data;
  } catch (error) {
    console.error('🚨 SWR Fetcher: Error occurred:', error);
    throw error;
  }
};

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSignInButtons, setShowSignInButtons] = useState(false);
  const { data: user, error, isValidating, mutate } = useSWR<User>('/api/user', fetcher, {
    fallbackData: undefined,
    revalidateOnFocus: true,
    revalidateOnMount: true,
    revalidateOnReconnect: true,
    refreshInterval: 0,
    dedupingInterval: 1000, // 1 second for debugging
    errorRetryCount: 5,
    errorRetryInterval: 500,
    keepPreviousData: false,
    onError: (error) => {
      console.error('🚨 UserMenu SWR Error:', error);
    },
    onSuccess: (data) => {
      console.log('✅ UserMenu SWR Success callback triggered!');
      console.log('📈 SWR Success data details:', {
        hasData: !!data,
        dataType: typeof data,
        isNull: data === null,
        isUser: data && typeof data === 'object' && 'email' in data,
        userEmail: data?.email,
        userName: data?.name
      });
    },
    onLoadingSlow: () => {
      console.log('🐌 UserMenu SWR: Loading is slow...');
    }
  });
  const router = useRouter();

  // Use useEffect to delay showing sign-in buttons
  useEffect(() => {
    console.log('🔍 UserMenu Auth State Check:', {
      hasUser: !!user,
      userEmail: user?.email,
      userName: user?.name,
      isValidating,
      error: !!error,
      showSignInButtons
    });
    
    if (!user && !isValidating) {
      const timer = setTimeout(() => {
        console.log('📝 UserMenu: Setting showSignInButtons to TRUE (no user found)');
        setShowSignInButtons(true);
      }, 200); // Small delay to prevent flickering
      return () => clearTimeout(timer);
    } else {
      console.log('📝 UserMenu: Setting showSignInButtons to FALSE (user found or validating)');
      setShowSignInButtons(false);
    }
  }, [user, isValidating, error, showSignInButtons]);

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
  }



  // Debug user state
  console.log('🔍 UserMenu Render Decision:', {
    hasUser: !!user,
    hasEmail: !!user?.email,
    userObject: user,
    willShowUserMenu: !!(user && user.email)
  });

  // If we have a user, show the user menu (even while validating)
  if (user && user.email) {
    console.log('✅ UserMenu: Rendering user menu for:', user.name || user.email);
    return (
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger>
          <Avatar className="cursor-pointer size-9">
            <AvatarImage alt={user.name || ''} />
            <AvatarFallback>
              {user.email
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5 text-sm font-medium text-foreground">
            <div className="flex items-center">
              <UserIcon className="mr-2 h-4 w-4" />
              <span className="truncate">{user.name || user.email}</span>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer" 
            onClick={() => {
              setIsMenuOpen(false)
              router.push('/connections')
            }}
          >
            <Users className="mr-2 h-4 w-4" />
            <span>Family & Counselors</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer" 
            onClick={() => {
              setIsMenuOpen(false)
              router.push('/settings')
            }}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Account Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings?tab=financial" className="cursor-pointer">
              <DollarSign className="mr-2 h-4 w-4" />
              <span>Financial Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer" 
            onClick={() => {
              setIsMenuOpen(false)
              alert('Notification settings - This will open notification preferences')
            }}
          >
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifications</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action={handleSignOut} className="w-full">
            <button type="submit" className="flex w-full">
              <DropdownMenuItem className="w-full flex-1 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Show loading state while validating and no user data
  if (isValidating && !user) {
    console.log('⏳ UserMenu: Showing loading state (validating && no user)');
    return (
      <div className="flex items-center space-x-4">
        <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
      </div>
    );
  }

  // Show sign in buttons only after delay when we're sure there's no user
  if (showSignInButtons) {
    console.log('🔑 UserMenu: Showing sign-in buttons');
    return (
      <div className="flex items-center space-x-4">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/sign-in">Sign In</Link>
        </Button>
        <Button asChild className="rounded-full">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </div>
    );
  }

  // If we have no user data and we're not showing sign-in buttons yet, show loading  
  console.log('⏳ UserMenu: Showing fallback loading state');
  return (
    <div className="flex items-center space-x-4">
      <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
    </div>
  );


}

export default function Header() {
  return (
    <header className="border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center">
            <CircleIcon className="h-6 w-6 text-primary" />
            <div className="ml-2">
              <div className="text-xl font-semibold text-foreground">STP</div>
              <div className="text-xs text-gray-500 -mt-1">Scholarship Tracker Pro</div>
            </div>
          </Link>

        </div>
        <div className="flex items-center space-x-4">
          <ThemeControls />
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}