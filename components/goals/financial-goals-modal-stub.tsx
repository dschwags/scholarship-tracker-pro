import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Wrench } from 'lucide-react';

interface FinancialGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated?: () => void;
}

export function FinancialGoalsModal({ isOpen, onClose, onGoalCreated }: FinancialGoalsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-amber-500" />
            Financial Planning
          </DialogTitle>
          <DialogDescription>
            Feature temporarily under maintenance
          </DialogDescription>
        </DialogHeader>
        
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <AlertCircle className="h-4 w-4" />
              Under Development
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-amber-600 dark:text-amber-200">
              The financial planning system is being rebuilt for a better experience. 
              All other scholarship tracking features are fully functional.
            </p>
            
            <div className="text-xs text-amber-500 dark:text-amber-400 space-y-1">
              <div>✅ Scholarship tracking & applications</div>
              <div>✅ Dashboard & statistics</div>
              <div>✅ Export & import functionality</div>
              <div>✅ Parent-student collaboration</div>
              <div>🔄 Financial planning (coming soon)</div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export the same interface for compatibility
export type { FinancialGoalsModalProps };