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
import { useRouter, usePathname } from 'next/navigation';
import { ApiUser } from '@/types/api';
import { mutate } from 'swr';
import ThemeControls from './theme-controls';
import { siteConfig } from '@/lib/config';
import { useAuthUser } from '@/contexts/auth-context';

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // ✅ BUGX: Removed showSignInButtons state to eliminate useEffect infinite loops
  const user = useAuthUser(); // Use auth context instead of SWR
  const router = useRouter();

  // ✅ BUGX CRITICAL FIX: Remove ALL useEffect hooks to eliminate infinite loops
  // Calculate showSignInButtons directly without state updates
  const shouldShowSignInButtons = !user;
  
  console.log('🔍 UserMenu Auth State Check:', {
    hasUser: !!user,
    userEmail: user?.email,
    userName: user?.name,
    shouldShowSignInButtons
  });

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
              {user.name
                ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
                : user.email.charAt(0).toUpperCase()}
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

  // No loading state needed since we use auth context directly

  // Show sign in buttons when there's no user (calculated directly)
  if (shouldShowSignInButtons) {
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

// Conditional UserMenu that hides on landing page
function ConditionalUserMenu() {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  
  // On landing page, don't show any auth UI in header
  // (Get Started & Sign In buttons are in the main content)
  if (isLandingPage) {
    console.log('🏠 ConditionalUserMenu: Landing page detected, hiding auth UI');
    return null;
  }
  
  // On all other pages, show normal UserMenu
  return <UserMenu />;
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
            <ConditionalUserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}