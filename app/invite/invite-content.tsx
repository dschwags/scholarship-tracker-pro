'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { acceptParentInvitation, acceptStudentInvitation } from '@/lib/actions/parent-linking';
import { toast } from 'sonner';
import Link from 'next/link';

interface InviteData {
  studentId?: number;
  studentName?: string;
  studentEmail?: string;
  parentId?: number;
  parentName?: string;
  parentEmail?: string;
  connectionType: string;
  expires: string;
  inviteType?: 'parent' | 'student';
}

export default function InvitePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'accepted' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('invalid');
      setErrorMessage('No invitation token provided');
      setIsLoading(false);
      return;
    }

    // Decode and validate the invitation token
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Check if token is expired
      if (new Date(decoded.expires) < new Date()) {
        setStatus('invalid');
        setErrorMessage('This invitation has expired');
        setIsLoading(false);
        return;
      }
      
      setInviteData(decoded);
      setStatus('valid');
    } catch (error) {
      setStatus('invalid');
      setErrorMessage('Invalid invitation link');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  const handleAcceptInvitation = async () => {
    const token = searchParams.get('token');
    if (!token) return;

    setIsAccepting(true);
    try {
      let result;
      
      // Determine which acceptance function to use based on invite type
      if (inviteData?.inviteType === 'student') {
        result = await acceptStudentInvitation(token);
      } else {
        // Default to parent invitation for backwards compatibility
        result = await acceptParentInvitation(token);
      }
      
      if (result.success) {
        setStatus('accepted');
        toast.success(result.message);
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        setStatus('error');
        setErrorMessage(result.message);
        toast.error(result.message);
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Failed to accept invitation. Please try again.');
      toast.error('Failed to accept invitation');
    } finally {
      setIsAccepting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-red-600 dark:text-red-400">Invalid Invitation</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'accepted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-green-600 dark:text-green-400">Connection Successful!</CardTitle>
            <CardDescription>
              {inviteData?.inviteType === 'student' 
                ? `You're now connected to ${inviteData?.parentName}'s guidance.` 
                : `You're now connected to ${inviteData?.studentName}'s scholarship account.`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-sm text-muted-foreground space-y-1">
              <p>You can now:</p>
              <ul className="text-left space-y-1 mt-2">
                <li>• View and edit scholarships together</li>
                <li>• Add comments and create tasks</li>
                <li>• Access shared financial information</li>
                <li>• Track application progress</li>
              </ul>
            </div>
            
            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-3">
                Redirecting to dashboard in a few seconds...
              </p>
              <Link href="/dashboard">
                <Button className="w-full">
                  Go to Dashboard Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-red-600 dark:text-red-400">Connection Failed</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button onClick={handleAcceptInvitation} disabled={isAccepting} className="w-full">
              {isAccepting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                'Try Again'
              )}
            </Button>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Valid invitation - show acceptance interface
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle>Scholarship Account Invitation</CardTitle>
          <CardDescription>
            You&apos;ve been invited to collaborate on scholarship applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 text-center">
            {inviteData?.inviteType === 'student' ? (
              <>
                <p className="font-medium">{inviteData?.parentName}</p>
                <p className="text-sm text-muted-foreground">{inviteData?.parentEmail}</p>
                <p className="text-sm">
                  has invited you as a student to collaborate on scholarship applications
                </p>
              </>
            ) : (
              <>
                <p className="font-medium">{inviteData?.studentName}</p>
                <p className="text-sm text-muted-foreground">{inviteData?.studentEmail}</p>
                <p className="text-sm">
                  has invited you as their <span className="font-medium capitalize">{inviteData?.connectionType}</span>
                </p>
              </>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">
              What you&apos;ll be able to do:
            </h4>
            <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
              <li>• View and edit scholarship applications</li>
              <li>• Add comments and create task reminders</li>
              <li>• Access shared financial information</li>
              <li>• Track application deadlines and progress</li>
              <li>• Receive notifications about updates</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleAcceptInvitation} 
              disabled={isAccepting}
              className="w-full"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Accepting Invitation...
                </>
              ) : (
                'Accept Invitation'
              )}
            </Button>
            
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Maybe Later
              </Button>
            </Link>
          </div>

          <div className="text-xs text-center text-muted-foreground">
            <p>This invitation expires on {new Date(inviteData?.expires || '').toLocaleDateString()}</p>
            <p className="mt-1">
              You must be logged in with {inviteData?.inviteType === 'student' ? inviteData?.studentEmail : inviteData?.parentEmail} to accept
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}