'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Users, 
  FileText, 
  DollarSign, 
  Search, 
  Calendar,
  Target,
  BookOpen,
  MessageSquare,
  Download,
  Upload,
  Settings,
  PlayCircle,
  ChevronRight,
  CheckCircle,
  Clock,
  TrendingUp,
  Shield
} from 'lucide-react';
import { InviteParentModal } from '../parent-linking/invite-parent-modal';

interface WelcomeDashboardStats {
  totalTracked: number;
  applications: number;
  collaborators: number;
}

interface WelcomeDashboardProps {
  userName: string;
  stats?: WelcomeDashboardStats;
  onGetStarted?: () => void;
  onLoadSampleData?: () => void;
  onSetFinancialGoals?: () => void;
  onSetupProfile?: () => void;
  onGoToDashboard?: () => void;
}

export function WelcomeDashboard({ userName, stats, onGetStarted, onLoadSampleData, onSetFinancialGoals, onSetupProfile, onGoToDashboard }: WelcomeDashboardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Global click detector
  React.useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      console.log('🌍 GLOBAL CLICK DETECTED:', {
        target: (e.target as Element)?.tagName,
        className: (e.target as Element)?.className,
        x: e.clientX,
        y: e.clientY
      });
    };
    
    document.addEventListener('click', handleGlobalClick, true);
    return () => document.removeEventListener('click', handleGlobalClick, true);
  }, []);

  const features = [
    {
      icon: <Search className="h-6 w-6" />,
      title: "Scholarship Discovery",
      description: "Find scholarships that match your profile and interests",
      status: "available",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Deadline Tracking",
      description: "Never miss an application deadline with smart reminders",
      status: "available",
      color: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Application Management",
      description: "Track requirements, documents, and progress for each scholarship",
      status: "available",
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Family Collaboration",
      description: "Invite parents and counselors to help with applications",
      status: "available",
      color: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Financial Planning",
      description: "Set funding goals and track your scholarship earnings",
      status: "available",
      color: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Progress Analytics",
      description: "View success rates and optimize your application strategy",
      status: "available",
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
    }
  ];

  const futureFeatures = [
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "AI Essay Review",
      description: "Get intelligent feedback on your scholarship essays",
      status: "coming-soon"
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Interview Prep",
      description: "Practice with mock interviews and common questions",
      status: "coming-soon"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Scholarship Verification",
      description: "Verify legitimacy of scholarships and avoid scams",
      status: "planned"
    }
  ];

  const quickActions = [
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Add Your First Scholarship",
      description: "Start tracking a scholarship opportunity",
      action: "add-scholarship"
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Invite a Parent, Counselor, or Student",
      description: "Get help with your applications or help others",
      action: "invite-collaborator"
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: "Set Financial Goals",
      description: "Define your funding targets",
      action: "set-goals"
    },
    {
      icon: <Settings className="h-5 w-5" />,
      title: "Complete Your Profile",
      description: "Add academic and personal information",
      action: "setup-profile"
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-6">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center mb-4">
          <GraduationCap className="h-16 w-16 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Welcome to Scholarship Tracker Pro, {userName}!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Your journey to funding your education starts here. Let's help you discover, track, and win scholarships that match your goals.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              ${stats?.totalTracked ? stats.totalTracked.toLocaleString() : '0'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Tracked</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats?.applications || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Applications</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats?.collaborators || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Collaborators</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">∞</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Possibilities</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Dashboard Navigation - Show when user has scholarships */}
      {stats && (stats.applications > 0 || stats.totalTracked > 0) && (
        <div className="text-center">
          <Button 
            onClick={onGoToDashboard}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Go to Your Dashboard
          </Button>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            You have {stats.applications} scholarship{stats.applications !== 1 ? 's' : ''} being tracked
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Quick Start Actions
          </CardTitle>
          <CardDescription>
            Get started with these essential steps to maximize your scholarship success
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <div 
                key={action.action}
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors relative z-10"
                onMouseDown={() => console.log('🖱️ MOUSE DOWN on:', action.title)}
                onMouseUp={() => console.log('🖱️ MOUSE UP on:', action.title)}
                onPointerDown={() => console.log('👆 POINTER DOWN on:', action.title)}
                onPointerUp={() => console.log('👆 POINTER UP on:', action.title)}
                onClick={(e) => {
                  console.log('🔄 WELCOME DASHBOARD: Button clicked!', action.title);
                  console.log('🔄 Event details:', { target: e.target, currentTarget: e.currentTarget });
                  e.preventDefault();
                  e.stopPropagation();
                  
                  console.log(`Quick Action: ${action.title} (${action.action})`);
                  
                  switch (action.action) {
                    case 'add-scholarship':
                      console.log('🎓 WELCOME DASHBOARD: Add Your First Scholarship case reached!');
                      console.log('🚀 WELCOME DASHBOARD: Navigating to /quick-add-scholarship...');
                      window.location.href = '/quick-add-scholarship';
                      break;
                      
                    case 'invite-collaborator':
                      console.log('Opening invite modal...');
                      setShowInviteModal(true);
                      break;
                      
                    case 'set-goals':
                      if (onSetFinancialGoals) {
                        console.log('Opening financial goals modal...');
                        onSetFinancialGoals();
                      } else {
                        alert('Financial Goals handler not available');
                      }
                      break;
                      
                    case 'setup-profile':
                      if (onSetupProfile) {
                        console.log('Opening profile setup...');
                        onSetupProfile();
                      } else {
                        alert('Profile Setup handler not available');
                      }
                      break;
                      
                    default:
                      alert(`${action.title} feature - Coming soon`);
                  }
                }}
              >
                <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-4">
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Available Features
          </CardTitle>
          <CardDescription>
            Everything you need to manage your scholarship journey is ready to use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={feature.title} className="border rounded-lg p-4 space-y-3">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.color}`}>
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ready
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Future Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Coming Soon
          </CardTitle>
          <CardDescription>
            Exciting features we're building to make your scholarship journey even better
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {futureFeatures.map((feature, index) => (
              <div key={feature.title} className="border rounded-lg p-4 space-y-3 opacity-75">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 text-gray-400 dark:bg-gray-800">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {feature.status === 'coming-soon' ? 'Coming Soon' : 'Planned'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          size="lg" 
          onMouseDown={() => console.log('🖱️ MOUSE DOWN on: Bottom Add Scholarship Button')}
          onMouseUp={() => console.log('🖱️ MOUSE UP on: Bottom Add Scholarship Button')}
          onClick={(e) => {
            console.log('🔴 BOTTOM BUTTON: Add Scholarship clicked!');
            console.log('🚀 BOTTOM BUTTON: Navigating to /quick-add-scholarship...');
            window.location.href = '/quick-add-scholarship';
          }} 
          className="flex items-center gap-2 relative z-10"
        >
          <FileText className="h-5 w-5" />
          Add Your First Scholarship
        </Button>
        {onLoadSampleData && (
          <Button size="lg" variant="outline" onClick={onLoadSampleData} className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Load Sample Data (Demo)
          </Button>
        )}
      </div>

      {/* Help Section */}
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Need Help Getting Started?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Check out our quick tutorial or browse the help documentation
          </p>
          <div className="flex gap-2 justify-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => alert('Tutorial feature - This will open an interactive tutorial')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              View Tutorial
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => alert('Support feature - This will open the help center or contact support')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Get Support
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invite Parent Modal */}
      <InviteParentModal 
        isOpen={showInviteModal} 
        onClose={() => {
          console.log('Closing invite modal');
          setShowInviteModal(false);
        }} 
      />
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs rounded">
          Modal State: {showInviteModal ? 'OPEN' : 'CLOSED'}
        </div>
      )}
    </div>
  );
}