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
// Using Dialog instead of AlertDialog
import { AlertTriangle, Trash2, Shield, Users, FileText } from 'lucide-react';
import { deleteUserAccount } from '@/lib/actions/user-management';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface DeleteAccountModalProps {
  children?: React.ReactNode;
}

export function DeleteAccountModal({ children }: DeleteAccountModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteUserAccount(confirmationText);
      
      if (result.success) {
        toast.success(result.message);
        // Redirect will happen automatically after successful deletion
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowFinalConfirmation(false);
      setIsOpen(false);
    }
  };

  const isConfirmationValid = confirmationText === 'DELETE MY ACCOUNT';

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children || (
            <Button variant="destructive" size="sm" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. Please review what will be permanently deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Warning Section */}
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                What will be deleted:
              </h4>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <li className="flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  All scholarship applications and progress data
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  All family and counselor connections
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  Your profile and account information
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  All comments, tasks, and collaboration history
                </li>
              </ul>
            </div>

            {/* Alternatives Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Consider these alternatives:
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Contact support to export your data before deleting</li>
                <li>• Remove specific collaborators instead of deleting everything</li>
                <li>• Contact support if you're having issues with your account</li>
              </ul>
            </div>

            {/* Confirmation Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmation" className="text-red-600 dark:text-red-400 font-medium">
                Type "DELETE MY ACCOUNT" to confirm:
              </Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="border-red-300 dark:border-red-700"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                This text must match exactly (case sensitive)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="destructive"
                onClick={() => setShowFinalConfirmation(true)}
                disabled={!isConfirmationValid}
                className="flex-1"
              >
                I Understand, Delete My Account
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Final Confirmation Dialog */}
      <Dialog open={showFinalConfirmation} onOpenChange={setShowFinalConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Final Confirmation
            </DialogTitle>
            <DialogDescription>
              <span className="block mb-2">
                Are you absolutely sure you want to delete your account?
              </span>
              <span className="font-medium text-red-600 dark:text-red-400">
                This action is permanent and cannot be undone.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowFinalConfirmation(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}