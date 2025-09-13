'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, User, Edit3 } from 'lucide-react';
import { getAlternatingRowClasses } from '@/lib/utils/alternating-colors';

interface CollaborativeScholarshipRowProps {
  scholarship: any;
  index: number;
  onOpenModal: (scholarship: any) => void;
  onAddComment?: (scholarshipId: number, comment: string, assignedTo?: number) => void;
  collaborators?: Array<{
    id: number;
    name: string;
    role: 'student' | 'parent' | 'counselor';
  }>;
  lastEditedBy?: {
    name: string;
    timestamp: string;
    role: 'student' | 'parent' | 'counselor';
  };
  hasUnreadComments?: boolean;
  commentCount?: number;
}

export function CollaborativeScholarshipRow({
  scholarship,
  index,
  onOpenModal,
  onAddComment,
  collaborators = [],
  lastEditedBy,
  hasUnreadComments = false,
  commentCount = 0
}: CollaborativeScholarshipRowProps) {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState('');

  const handleAddComment = () => {
    if (comment.trim() && onAddComment) {
      onAddComment(scholarship.id, comment.trim());
      setComment('');
      setShowCommentInput(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'not started': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      'in progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'submitted': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'awarded': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[status as keyof typeof colors] || colors['not started'];
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'parent':
        return '👤';
      case 'counselor':
        return '🎓';
      default:
        return '📚';
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, color: 'text-red-600 dark:text-red-400' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-red-600 dark:text-red-400' };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} days left`, color: 'text-orange-600 dark:text-orange-400' };
    } else {
      return { text: `${diffDays} days left`, color: 'text-green-600 dark:text-green-400' };
    }
  };

  const deadlineInfo = formatDeadline(scholarship.deadline);

  return (
    <div className="space-y-2">
      {/* Main row */}
      <div 
        className={getAlternatingRowClasses(index, {
          className: "p-4 rounded-lg cursor-pointer transition-all duration-200",
          hoverEnabled: true
        } as any)}
        onClick={() => onOpenModal(scholarship)}
      >
        <div className="flex items-center justify-between">
          {/* Scholarship Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {scholarship.title}
              </h3>
              <Badge variant="secondary" className={getStatusColor(scholarship.status)}>
                {scholarship.status}
              </Badge>
              {hasUnreadComments && (
                <Badge variant="destructive" className="text-xs">
                  New
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{scholarship.provider}</span>
              <span>${scholarship.amount?.toLocaleString()}</span>
              <span className={deadlineInfo.color}>{deadlineInfo.text}</span>
              <span>{scholarship.completionText}</span>
            </div>

            {/* Collaboration indicators */}
            <div className="flex items-center gap-4 mt-2">
              {/* Last edited info */}
              {lastEditedBy && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Edit3 className="h-3 w-3" />
                  <span>
                    {getRoleIcon(lastEditedBy.role)} {lastEditedBy.name} • {lastEditedBy.timestamp}
                  </span>
                </div>
              )}

              {/* Active collaborators */}
              {collaborators.length > 0 && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <div className="flex gap-1">
                    {collaborators.slice(0, 3).map((collaborator) => (
                      <span key={collaborator.id} className="text-xs text-muted-foreground" title={collaborator.name}>
                        {getRoleIcon(collaborator.role)}
                      </span>
                    ))}
                    {collaborators.length > 3 && (
                      <span className="text-xs text-muted-foreground">+{collaborators.length - 3}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Comments indicator */}
              {commentCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  <span>{commentCount} comment{commentCount !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowCommentInput(!showCommentInput);
              }}
              className="flex items-center gap-1"
            >
              <MessageSquare className="h-4 w-4" />
              {commentCount > 0 ? commentCount : 'Add'}
            </Button>
          </div>
        </div>
      </div>

      {/* Comment input */}
      {showCommentInput && (
        <div className="ml-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          <div className="space-y-2">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment or task for collaborators..."
              className="w-full p-2 text-sm border rounded resize-none"
              rows={2}
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddComment} disabled={!comment.trim()}>
                Add Comment
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => {
                  setShowCommentInput(false);
                  setComment('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}