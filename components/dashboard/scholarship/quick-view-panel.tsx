'use client';

import { Progress } from '@/components/ui/progress';

interface QuickViewPanelProps {
  scholarship: any;
}

export function QuickViewPanel({ scholarship }: QuickViewPanelProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="col-span-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-600 p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Basic Info & Links */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600 pb-1">
            📋 Quick Info
          </h4>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Category:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{scholarship.category}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Amount:</span>
              <span className="ml-2 font-medium text-green-600 dark:text-green-400">{formatCurrency(scholarship.amount)}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Deadline:</span>
              <span className="ml-2 font-medium text-red-600 dark:text-red-400">
                {new Date(scholarship.deadline).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="pt-2">
              <div className="flex flex-col gap-1">
                <a 
                  href={scholarship.organizationUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs hover:underline"
                  onClick={() => console.log('Quick view organization link clicked:', scholarship.organizationUrl)}
                >
                  🏢 {scholarship.provider} Website ⬈
                </a>
                <a 
                  href={scholarship.applicationUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-xs hover:underline"
                  onClick={() => console.log('Quick view application link clicked:', scholarship.applicationUrl)}
                >
                  📝 Application Portal ⬈
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Requirements Summary */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600 pb-1">
            📋 Key Requirements
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Official transcript</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Letters of recommendation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Personal essay</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>GPA verification (3.5+ required)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Test scores (SAT 1300+)</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 pt-1">
              🟢 Complete • 🟡 In Progress • 🔵 Required
            </div>
          </div>
        </div>
        
        {/* Progress & Notes */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600 pb-1">
            📊 Progress & Notes
          </h4>
          <div className="space-y-2">
            <div className="text-xs">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600 dark:text-gray-400">Completion:</span>
                <span className="font-medium">{scholarship.completion}%</span>
              </div>
              <Progress value={scholarship.completion} className="h-1.5" />
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded p-2">
              <div className="text-xs text-yellow-800 dark:text-yellow-200">
                📝 <strong>Next:</strong> Complete personal essay on engineering passion
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded p-2">
              <div className="text-xs text-blue-800 dark:text-blue-200">
                💡 <strong>Tip:</strong> Highlight community service experience
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}