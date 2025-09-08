'use client';

import { useState } from 'react';
import { X, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { inviteStudent } from '@/lib/actions/parent-linking';

interface InviteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteStudentModal({ isOpen, onClose }: InviteStudentModalProps) {
  const [studentEmail, setStudentEmail] = useState('');
  const [connectionType, setConnectionType] = useState<'parent' | 'counselor'>('parent');
  const [isLoading, setIsLoading] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentEmail.trim()) {
      toast.error('Please enter a student email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const result = await inviteStudent(studentEmail.trim(), connectionType);
      
      if (result.success && result.inviteToken) {
        setInviteToken(result.inviteToken);
        toast.success(result.message);
      } else {
        toast.error(result.message || 'Failed to create invitation');
      }
    } catch (error) {
      console.error('Error inviting student:', error);
      toast.error('An error occurred while creating the invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStudentEmail('');
    setConnectionType('parent');
    setInviteToken(null);
    onClose();
  };

  const getInviteLink = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/invite?token=${inviteToken}&type=student`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getInviteLink());
      toast.success('Invitation link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link to clipboard');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Invite a Student
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!inviteToken ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentEmail">Student Email Address</Label>
                <Input
                  id="studentEmail"
                  type="email"
                  placeholder="student@example.com"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label>Connection Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="parent"
                      checked={connectionType === 'parent'}
                      onChange={(e) => setConnectionType(e.target.value as 'parent')}
                      className="text-blue-600"
                    />
                    <span>Parent</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="counselor"
                      checked={connectionType === 'counselor'}
                      onChange={(e) => setConnectionType(e.target.value as 'counselor')}
                      className="text-blue-600"
                    />
                    <span>Counselor</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating Invitation...' : 'Create Invitation'}
                </Button>
              </div>
            </form>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Invitation Created!</h3>
                  <p className="text-gray-600">
                    Share this invitation link with the student:
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg break-all text-sm font-mono">
                    {getInviteLink()}
                  </div>

                  <div className="flex justify-center space-x-3">
                    <Button onClick={copyToClipboard} variant="outline">
                      Copy Link
                    </Button>
                    <Button onClick={handleClose}>
                      Done
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500">
                    This invitation link will expire in 7 days.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}