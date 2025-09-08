'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Mail, Copy, Check } from 'lucide-react';
import { inviteParent, inviteStudent } from '@/lib/actions/parent-linking';
import { toast } from 'sonner';

interface InviteParentModalProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export function InviteParentModal({ children, isOpen: externalIsOpen, onClose }: InviteParentModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onClose ? (open: boolean) => { if (!open) onClose(); } : setInternalIsOpen;
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [connectionType, setConnectionType] = useState<'parent' | 'counselor' | 'student'>('parent');
  const [isLoading, setIsLoading] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteeEmail.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      let result;
      if (connectionType === 'student') {
        // When inviting a student, use the reverse invitation function
        result = await inviteStudent(inviteeEmail.trim(), 'parent'); // Current user becomes the parent role
      } else {
        // When inviting parent or counselor, use the regular function
        result = await inviteParent(inviteeEmail.trim(), connectionType);
      }
      
      if (result.success && result.inviteToken) {
        setInviteToken(result.inviteToken);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to create invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!inviteToken) return;
    
    const inviteUrl = `${window.location.origin}/invite?token=${inviteToken}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success('Invitation link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
    setInviteeEmail('');
    setConnectionType('parent');
    setInviteToken(null);
    setCopied(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invite Parent, Counselor, or Student
          </DialogTitle>
          <DialogDescription>
            Send an invitation to connect with someone for collaborative scholarship management.
          </DialogDescription>
        </DialogHeader>

        {!inviteToken ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteeEmail">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="inviteeEmail"
                  type="email"
                  placeholder="email@example.com"
                  value={inviteeEmail}
                  onChange={(e) => setInviteeEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="connectionType">Connection Type</Label>
              <Select value={connectionType} onValueChange={(value: 'parent' | 'counselor' | 'student') => setConnectionType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Parent/Guardian</SelectItem>
                  <SelectItem value="counselor">School Counselor</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Creating Invitation...' : 'Create Invitation'}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">
                Invitation Created Successfully!
              </h3>
              <p className="text-sm text-green-600 dark:text-green-300 mb-3">
                Share this link with the {connectionType === 'student' ? 'student' : connectionType === 'counselor' ? 'counselor' : 'parent/guardian'} so they can connect to your account:
              </p>
              
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/invite?token=${inviteToken}`}
                  readOnly
                  className="text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex-shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>• This invitation link expires in 7 days</p>
              <p>• The {connectionType === 'student' ? 'student' : connectionType === 'counselor' ? 'counselor' : 'parent/guardian'} will need to create an account or log in to accept</p>
              <p>• They&apos;ll be able to view and edit scholarships with you</p>
            </div>

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}