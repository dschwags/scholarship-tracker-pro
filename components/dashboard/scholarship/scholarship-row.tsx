'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getAlternatingRowClasses } from '@/lib/utils/alternating-colors';

interface ScholarshipRowProps {
  scholarship: any;
  searchQuery: string;
  onOpenModal: (scholarship: any) => void;
  index: number;
}

export function ScholarshipRow({ 
  scholarship, 
  searchQuery, 
  onOpenModal,
  index 
}: ScholarshipRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'awarded': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700';
      case 'rejected': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700';
      case 'submitted': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700';
      case 'in progress': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
    }
  };

  const highlightSearchText = (text: string | null | undefined, query: string) => {
    // Return empty string if text is null/undefined, or original text if no query
    if (!text) return '';
    if (!query) return text;
    
    // Ensure text is a string
    const textStr = String(text);
    
    try {
      const regex = new RegExp(`(${query})`, 'gi');
      return textStr.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-200 px-0">$1</mark>');
    } catch (error) {
      console.warn('Error in highlightSearchText:', error);
      return textStr;
    }
  };

  // Helper function to format deadline or show edit button
  const formatDeadlineOrEdit = (deadline: string) => {
    if (!deadline || deadline === '' || deadline === 'Invalid Date') {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent row expansion
            onOpenModal(scholarship);
          }}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline cursor-pointer"
          title="Click to set deadline"
        >
          Edit ⟲
        </button>
      );
    }
    
    try {
      const date = new Date(deadline);
      if (isNaN(date.getTime())) {
        return (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent row expansion
              onOpenModal(scholarship);
            }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline cursor-pointer"
            title="Click to set deadline"
          >
            Edit ⟲
          </button>
        );
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent row expansion
            onOpenModal(scholarship);
          }}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline cursor-pointer"
          title="Click to set deadline"
        >
          Edit ⟲
        </button>
      );
    }
  };

  // Use shared alternating colors utility
  const rowClasses = getAlternatingRowClasses(index);

  return (
    <div>
      {/* Main Row - Always Visible */}
      <div 
        className={`grid grid-cols-7 gap-4 p-3 border-b border-gray-200 dark:border-gray-700 transition-all duration-200 items-center cursor-pointer hover:shadow-sm ${rowClasses}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
      {/* Column 1: Scholarship Info */}
      <div>
        {/* Organization Link - Top */}
        <div className="text-sm mb-0.5 leading-tight">
          <a 
            href={scholarship.organizationUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline inline"
            onClick={() => console.log('Organization link clicked:', scholarship.organizationUrl)}
          >
            {searchQuery ? (
              <span dangerouslySetInnerHTML={{
                __html: highlightSearchText(scholarship.provider || 'Unknown Provider', searchQuery) + ' ⬈'
              }} />
            ) : (
              <>{scholarship.provider || 'Unknown Provider'} ⬈</>
            )}
          </a>
        </div>
        
        {/* Scholarship Title as Application Link - Main */}
        <div className="text-sm mb-0.5 leading-tight">
          <a 
            href={scholarship.applicationUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:underline inline"
            onClick={() => console.log('Application link clicked:', scholarship.applicationUrl)}
          >
            {searchQuery ? (
              <span dangerouslySetInnerHTML={{
                __html: highlightSearchText(scholarship.title || 'Untitled Scholarship', searchQuery) + ' ⬈'
              }} />
            ) : (
              <>{scholarship.title || 'Untitled Scholarship'} ⬈</>
            )}
          </a>
        </div>
        
        {/* Category - Plain Text */}
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {searchQuery ? (
            <span dangerouslySetInnerHTML={{
              __html: highlightSearchText(scholarship.category || 'Uncategorized', searchQuery)
            }} />
          ) : (
            scholarship.category || 'Uncategorized'
          )}
        </div>
      </div>

      {/* Column 2: Amount */}
      <div className="font-semibold">${Math.round(parseFloat(scholarship.amount) || 0).toLocaleString()}</div>

      {/* Column 3: Deadline */}
      <div>
        {formatDeadlineOrEdit(scholarship.deadline)}
      </div>

      {/* Column 4: Progress */}
      <div>
        <div className="text-sm text-muted-foreground mb-1">{scholarship.completionText}</div>
        <Progress value={scholarship.completion} className="h-2" />
        <div className="text-right text-xs text-muted-foreground mt-1">{scholarship.completion}%</div>
      </div>

      {/* Column 5: Status */}
      <div>
        <Badge className={`text-xs ${getStatusBadgeColor(scholarship.status)}`}>
          {scholarship.status}
        </Badge>
      </div>

      {/* Column 6: View */}
      <div className="flex justify-start items-center">
        <span 
          className="text-xl cursor-pointer select-none"
          style={{letterSpacing: '-0.1em', fontSize: '20px'}}
          title="Click row to expand"
        >
          ⊙⊙
        </span>
      </div>

      {/* Column 7: Edit */}
      <div className="flex justify-start">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-10 w-10 p-0 text-xl flex items-center justify-center"
          title="Edit"
          onClick={(e) => {
            e.stopPropagation(); // Prevent row expansion
            console.log('Edit clicked for:', scholarship.title);
            onOpenModal(scholarship);
          }}
        >
          <span style={{transform: 'translateY(-1px)', fontSize: '24px'}}>⟲</span>
        </Button>
      </div>
      </div>

      {/* Expandable Content - Quick Info */}
      {isExpanded && (
        <div className={`border-b border-gray-200 dark:border-gray-700 ${index % 2 === 0 ? 'bg-gray-100/80 dark:bg-gray-800/50' : 'bg-gray-50/80 dark:bg-gray-800/30'}`}>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quick Info */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium">📄 Quick Info</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div><span className="text-muted-foreground">Category:</span> <span className="font-medium">{scholarship.category}</span></div>
                  <div><span className="text-muted-foreground">Amount:</span> <span className="font-medium">${Math.round(parseFloat(scholarship.amount) || 0).toLocaleString()}</span></div>
                  <div><span className="text-muted-foreground">Deadline:</span> <span className="font-medium">{new Date(scholarship.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span></div>
                  <div className="flex items-center gap-2 mt-3">
                    <a href={scholarship.organizationUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">🌐 {scholarship.provider} Website ⬈</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={scholarship.applicationUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:underline">📋 Application Portal ⬈</a>
                  </div>
                </div>
              </div>

              {/* Key Requirements */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium">🗝️ Key Requirements</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Official transcript</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Letters of recommendation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span>Personal essay</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>GPA verification (3.5+ required)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Test scores (SAT 1300+)</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-xs">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span><span>Complete</span>
                    <span className="w-2 h-2 bg-yellow-500 rounded-full ml-3"></span><span>In Progress</span>
                    <span className="w-2 h-2 bg-blue-500 rounded-full ml-3"></span><span>Required</span>
                  </div>
                </div>
              </div>

              {/* Progress & Notes */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium">📊 Progress & Notes</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-muted-foreground">Completion:</span>
                      <span className="font-medium">{scholarship.completion}%</span>
                    </div>
                    <Progress value={scholarship.completion} className="h-2" />
                  </div>
                  {scholarship.completion < 100 && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-md border border-orange-200 dark:border-orange-800">
                      <div className="flex items-start gap-2">
                        <span className="text-orange-600 dark:text-orange-400">⚡</span>
                        <div>
                          <div className="font-medium text-orange-800 dark:text-orange-300">Next:</div>
                          <div className="text-orange-700 dark:text-orange-400">Complete personal essay on engineering passion</div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400">💡</span>
                      <div>
                        <div className="font-medium text-blue-800 dark:text-blue-300">Tip:</div>
                        <div className="text-blue-700 dark:text-blue-400">Highlight community service experience</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}