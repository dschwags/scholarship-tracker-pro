'use client';

import { useState, useEffect, useMemo } from 'react';
// Session user type (from auth/session.ts)
interface SessionUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

// Section Components
import { DashboardStats } from './sections/dashboard-stats';
import { FinancialProgress } from './sections/financial-progress';
import { GapAnalysis } from './sections/gap-analysis';
// Financial components re-enabled after fixing infinite loops
// import { EmbeddedFinancialGoals } from './sections/embedded-financial-goals';
// import { EnhancedFinancialAnalytics } from './sections/enhanced-financial-analytics';
// import { FinancialCharts } from './sections/financial-charts';
import { ScholarshipTable } from './sections/scholarship-table';
// Progressive Disclosure Demo removed
// Safety systems removed for stability

// Modal
import { ScholarshipDetailModal } from '../scholarship/scholarship-detail-modal';


import { Button } from '@/components/ui/button';
import { InviteParentModal } from '../parent-linking/invite-parent-modal';
import { FinancialGoalsModal } from '../goals/financial-goals-modal';
import { useGoals } from '@/contexts/goals-context';
import { useFinancialAnalytics } from '@/lib/hooks/use-financial-analytics';
import { WelcomeDashboard } from '../onboarding/welcome-dashboard';

// Types
interface DashboardStats {
  applications: {
    total: number;
    submitted: number;
    draft: number;
    accepted: number;
    rejected: number;
  };
  funding: {
    won: number;
    potential?: number;
  };
  successRate: number;
}

interface RecentActivity {
  id: number;
  type: 'application' | 'scholarship' | 'deadline' | 'status';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

interface MainDashboardProps {
  user: SessionUser;
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  scholarships?: any[];
  financialGoals?: any[]; // Server-side financial goals data
  welcomeStats?: {
    applications: number;
    totalTracked: number;
    collaborators: number;
  };
  apiError?: string | null;
}

// Sample scholarship data (for demo purposes only - not used for new users)
const SAMPLE_SCHOLARSHIPS = [
  { 
    id: 1,
    title: "Merit Excellence Scholarship", 
    provider: "State University", 
    amount: 15000, 
    deadline: "2025-03-14", 
    status: "in progress", 
    completion: 85, 
    completionText: "5/6 completed", 
    category: "Merit",
    organizationUrl: "https://www.stateuniversity.edu/scholarships",
    applicationUrl: "https://apply.stateuniversity.edu/merit-excellence"
  },
  { 
    id: 2,
    title: "STEM Innovation Grant", 
    provider: "Tech Foundation", 
    amount: 8000, 
    deadline: "2025-02-28", 
    status: "submitted", 
    completion: 100, 
    completionText: "4/4 completed", 
    category: "STEM",
    organizationUrl: "https://www.techfoundation.org",
    applicationUrl: "https://grants.techfoundation.org/stem-innovation"
  },
  { 
    id: 3,
    title: "Community Service Award", 
    provider: "Local Community", 
    amount: 5000, 
    deadline: "2025-03-31", 
    status: "not started", 
    completion: 0, 
    completionText: "0/5 completed", 
    category: "Service",
    organizationUrl: "https://www.localcommunity.org/scholarships",
    applicationUrl: "https://apply.localcommunity.org/service-award"
  },
  { 
    id: 4,
    title: "Athletics Scholarship", 
    provider: "College Sports", 
    amount: 12000, 
    deadline: "2024-12-29", 
    status: "awarded", 
    completion: 100, 
    completionText: "3/3 completed", 
    category: "Athletics",
    organizationUrl: "https://www.collegesports.edu",
    applicationUrl: "https://recruiting.collegesports.edu/athletics-scholarship"
  },
  { 
    id: 5,
    title: "Need-Based Financial Aid", 
    provider: "Federal Aid", 
    amount: 7500, 
    deadline: "2025-05-14", 
    status: "in progress", 
    completion: 60, 
    completionText: "5/8 completed", 
    category: "Need-Based",
    organizationUrl: "https://www.federalaid.gov",
    applicationUrl: "https://fafsa.gov/need-based-aid"
  },
  { 
    id: 6,
    title: "Academic Excellence Award", 
    provider: "Private Foundation", 
    amount: 10000, 
    deadline: "2024-11-15", 
    status: "rejected", 
    completion: 100, 
    completionText: "5/5 completed", 
    category: "Merit",
    organizationUrl: "https://www.privatefoundation.org",
    applicationUrl: "https://apply.privatefoundation.org/academic-excellence"
  },
  { 
    id: 7,
    title: "Diversity & Inclusion Grant", 
    provider: "Diversity Foundation", 
    amount: 6000, 
    deadline: "2025-04-15", 
    status: "in progress", 
    completion: 40, 
    completionText: "2/5 completed", 
    category: "Diversity",
    organizationUrl: "https://www.diversityfoundation.org",
    applicationUrl: "https://grants.diversityfoundation.org/inclusion"
  },
  { 
    id: 8,
    title: "Research Excellence Fellowship", 
    provider: "Research Institute", 
    amount: 20000, 
    deadline: "2025-06-30", 
    status: "not started", 
    completion: 0, 
    completionText: "0/8 completed", 
    category: "Research",
    organizationUrl: "https://www.researchinstitute.edu",
    applicationUrl: "https://fellowships.researchinstitute.edu/excellence"
  }
];

export function MainDashboard({ user, stats, recentActivity, scholarships = [], financialGoals = [], welcomeStats, apiError }: MainDashboardProps) {
  // State Management - Initialize with scholarships from server
  const [scholarshipsData, setScholarshipsData] = useState<any[]>(scholarships);
  const [selectedScholarship, setSelectedScholarship] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedQuickView, setExpandedQuickView] = useState<number | null>(null);

  const [isFinancialGoalsModalOpen, setIsFinancialGoalsModalOpen] = useState(false);
  const { goals, setGoals, initializeWithServerData } = useGoals();
  const [forceHideWelcome, setForceHideWelcome] = useState(false);
  
  // Initialize financial goals with server data when component mounts
  useEffect(() => {
    if (financialGoals && financialGoals.length >= 0) {
      console.log('🛠️ MainDashboard: Initializing goals context with server data:', {
        serverGoalsCount: financialGoals.length,
        hasInitMethod: typeof initializeWithServerData === 'function'
      });
      if (typeof initializeWithServerData === 'function') {
        initializeWithServerData(financialGoals);
      }
    }
  }, [financialGoals]); // ✅ BUGX: Removed initializeWithServerData from deps to prevent infinite loop
  
  // Initialize scholarshipsData when scholarships prop changes
  useEffect(() => {
    console.log('🔄 PROPS SCHOLARSHIPS CHANGED:', scholarships.length, 'items from server');
    setScholarshipsData(scholarships);
  }, [scholarships]);

  // ✅ ENHANCED BUGX FIX: Eliminate state cascade entirely - calculate shouldHideWelcome directly
  const shouldHideWelcome = scholarshipsData.length > 0 || forceHideWelcome;
  
  // Debug: Track scholarshipsData changes (NO STATE UPDATES)
  useEffect(() => {
    console.log('🔄 SCHOLARSHIPS STATE CHANGED:', scholarshipsData.length, 'items');
    scholarshipsData.forEach((s, i) => {
      console.log(`  🎓[${i}]:`, s.id, s.title || 'Untitled');
    });
    console.log('👤 Welcome screen visibility:', shouldHideWelcome ? 'hidden' : 'visible');
  }, [scholarshipsData, shouldHideWelcome]); // ✅ NO STATE UPDATES = NO INFINITE LOOPS
  
  // Mock student profile - replace with actual data (MEMOIZED to prevent infinite loops)
  const studentProfile = useMemo(() => ({
    firstName: user.name?.split(' ')[0] || 'Student',
    lastName: user.name?.split(' ')[1] || '',
    email: user.email,
    gpa: 3.7,
    major: 'Computer Science',
    graduationYear: 2025,
    school: 'State University'
  }), [user.name, user.email]);
  


  // Quick View Functions
  const toggleQuickView = (scholarshipId: number) => {
    setExpandedQuickView(expandedQuickView === scholarshipId ? null : scholarshipId);
    console.log('Toggle Quick View:', scholarshipId, expandedQuickView === scholarshipId ? 'Close' : 'Open');
  };

  // Modal Functions
  const openScholarshipModal = (scholarship: any) => {
    console.log('Opening scholarship modal for:', scholarship.title);
    
    // Transform scholarship data for modal (preserving original structure)
    const modalScholarship = {
      ...scholarship,
      description: scholarship.description || 'Comprehensive scholarship opportunity',
      contacts: [
        {
          id: '1',
          name: `${scholarship.provider} Admissions`,
          role: 'Scholarship Coordinator',
          email: `scholarships@${scholarship.provider.toLowerCase().replace(/\s+/g, '')}.edu`,
          phone: '(555) 123-4567',
          links: [
            { id: '1', label: 'Website', url: scholarship.organizationUrl },
            { id: '2', label: 'Application', url: scholarship.applicationUrl }
          ],
          notes: 'Primary contact for all scholarship inquiries',
          isExpanded: false
        }
      ],
      documentRequirements: [
        { id: '1', label: 'Official transcript', isRequired: true, isCompleted: scholarship.completion > 80, isCustom: false },
        { id: '2', label: 'Letters of recommendation', isRequired: true, isCompleted: scholarship.completion > 60, isCustom: false },
        { id: '3', label: 'Personal essay', isRequired: true, isCompleted: scholarship.completion > 40, isCustom: false },
        { id: '4', label: 'Financial aid forms', isRequired: false, isCompleted: scholarship.completion > 20, isCustom: false }
      ],
      academicRequirements: [
        { id: '1', label: 'GPA verification', isRequired: true, isCompleted: scholarship.completion > 70, isCustom: false, customValue: '3.5+ required' },
        { id: '2', label: 'Test scores', isRequired: scholarship.category === 'STEM', isCompleted: scholarship.completion > 50, isCustom: false, customValue: 'SAT 1300+ or ACT 28+' }
      ],
      activityRequirements: [
        { id: '1', label: 'Community service', isRequired: scholarship.category === 'Service', isCompleted: scholarship.completion > 30, isCustom: false, customValue: '100+ hours' },
        { id: '2', label: 'Leadership experience', isRequired: false, isCompleted: scholarship.completion > 80, isCustom: false }
      ],
      processRequirements: [
        { id: '1', label: 'Application submitted', isRequired: true, isCompleted: scholarship.status === 'submitted' || scholarship.status === 'awarded', isCustom: false },
        { id: '2', label: 'Interview completed', isRequired: scholarship.amount > 10000, isCompleted: scholarship.completion === 100, isCustom: false }
      ],
      financialRequirements: [
        { id: '1', label: 'FAFSA completed', isRequired: scholarship.category === 'Need-Based', isCompleted: scholarship.completion > 60, isCustom: false }
      ],
      customRequirements: []
    };
    
    setSelectedScholarship(modalScholarship);
    setIsModalOpen(true);
  };

  const closeScholarshipModal = () => {
    console.log('Closing scholarship modal');
    setIsModalOpen(false);
    setSelectedScholarship(null);
  };

  const saveScholarship = (updatedScholarship: any) => {
    console.log('🚀 SAVE OPERATION STARTED');
    console.log('📝 Scholarship to save:', {
      id: updatedScholarship.id,
      title: updatedScholarship.title,
      amount: updatedScholarship.amount,
      status: updatedScholarship.status
    });
    
    setScholarshipsData(prevScholarships => {
      console.log('📊 Previous scholarships count:', prevScholarships.length);
      
      // Check if this is a new scholarship (not in existing list)
      const existingIndex = prevScholarships.findIndex(s => s.id === updatedScholarship.id);
      console.log('🔍 Existing scholarship index:', existingIndex);
      
      let newArray;
      if (existingIndex >= 0) {
        // Update existing scholarship
        console.log('✏️ Updating existing scholarship at index:', existingIndex);
        newArray = prevScholarships.map(scholarship => 
          scholarship.id === updatedScholarship.id 
            ? { ...scholarship, ...updatedScholarship }
            : scholarship
        );
      } else {
        // Add new scholarship
        console.log('➕ Adding NEW scholarship');
        newArray = [...prevScholarships, updatedScholarship];
      }
      
      console.log('📈 New scholarships count:', newArray.length);
      console.log('📋 New scholarships array:', newArray.map(s => ({ id: s.id, title: s.title })));
      return newArray;
    });
    
    console.log('✅ Welcome screen will auto-hide (calculated from scholarshipsData.length)');
    // ✅ BUGX: No need to set forceHideWelcome state - shouldHideWelcome is calculated directly
    
    console.log('🎉 SAVE OPERATION COMPLETED');
  };

  // Create new scholarship
  const createScholarship = (newScholarshipData: any) => {
    console.log('Creating new scholarship:', newScholarshipData.title);
    
    // Add the new scholarship to the state
    setScholarshipsData(prevScholarships => [
      ...prevScholarships,
      newScholarshipData
    ]);
    
    console.log('New scholarship created successfully:', newScholarshipData);
  };

  // Enhanced Financial Analytics Integration (LEGACY REFERENCES REMOVED)
  const {
    metrics: financialMetrics,
    isUsingNewSystem,
    hasRealGoalsData,
    refreshData: refreshFinancialData
  } = useFinancialAnalytics(stats, user.id);

  // Simple stats calculation without legacy dependencies (BugX SAFE)
  const enhancedStats = useMemo(() => ({ enhanced: false, funding: null }), []);
  
  // Memoized current stats to prevent recreation loops (NO CIRCULAR DEPENDENCIES)
  const currentStats = useMemo(() => {
    if (scholarships.length > 0) {
      return stats;
    }
    
    const awarded = scholarshipsData.filter(s => s.status === 'awarded');
    const completed = scholarshipsData.filter(s => s.status === 'awarded' || s.status === 'rejected');
    const notRejected = scholarshipsData.filter(s => s.status !== 'rejected');
    
    // Calculate base values WITHOUT using enhancedStats to prevent circular dependency
    const baseWon = awarded.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
    const basePotential = notRejected.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
    const baseTotal = scholarshipsData.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
    
    return {
      applications: {
        total: scholarshipsData.length,
        submitted: scholarshipsData.filter(s => s.status === 'submitted').length,
        draft: scholarshipsData.filter(s => s.status === 'not started').length,
        accepted: awarded.length,
        rejected: scholarshipsData.filter(s => s.status === 'rejected').length,
      },
      funding: {
        won: baseWon,
        potential: basePotential,
        total: baseTotal
      },
      successRate: completed.length > 0 ? Math.round((awarded.length / completed.length) * 100) : 0
    };
  }, [scholarships.length, stats, scholarshipsData]);  // Removed circular dependencies
  
  // Enhanced stats with financial analytics (SEPARATE from currentStats to prevent circular dependency)
  const enhancedCurrentStats = useMemo(() => {
    if (!enhancedStats.enhanced) {
      return currentStats;
    }
    
    return {
      ...currentStats,
      // Enhanced analytics fields when available
      enhanced: enhancedStats.enhanced,
      hasRealGoalsData,
      isUsingNewSystem,
      financialMetrics,
      // Override funding with enhanced data if available
      funding: {
        ...(currentStats.funding as any),
        won: (enhancedStats.funding as any)?.won ?? (currentStats.funding as any)?.won,
        potential: (enhancedStats.funding as any)?.potential ?? (currentStats.funding as any)?.potential,
        total: (enhancedStats.funding as any)?.total ?? (currentStats.funding as any)?.total
      }
    };
  }, [currentStats, enhancedStats, hasRealGoalsData, isUsingNewSystem, financialMetrics]);
  
  console.log('📊 Current stats being used:', {
    source: scholarships.length > 0 ? 'server-calculated' : 'client-calculated',
    totalApplications: (enhancedCurrentStats as any).applications.total,
    totalTracked: (enhancedCurrentStats as any).funding.won + ((enhancedCurrentStats as any).funding.potential || 0),
    scholarshipsFromServer: scholarships.length,
    scholarshipsFromState: scholarshipsData.length
  });

  // Bypass welcome screen entirely - users should go directly to main dashboard
  // Use real scholarship data from props if available, otherwise fall back to local state
  const activeScholarships = scholarships.length > 0 ? scholarships : scholarshipsData;
  const shouldShowWelcome = false; // Disabled welcome screen per user request
  
  console.log('Checking welcome condition:', {
    propsScholarshipsLength: scholarships.length,
    localScholarshipsLength: scholarshipsData.length,
    activeScholarshipsLength: activeScholarships.length,

    forceHideWelcome,
    shouldShowWelcome,
    apiError
  });
  
  if (shouldShowWelcome) {
    console.log('Rendering WelcomeDashboard with handlers:', {
      onGetStarted: 'function provided',
      onSetFinancialGoals: 'function provided',
      onSetupProfile: 'function provided'
    });
    return (
      <WelcomeDashboard 
        userName={user.name || 'Student'}
        stats={welcomeStats || {
          totalTracked: (enhancedCurrentStats as any).funding.potential || 0,
          applications: (enhancedCurrentStats as any).applications.total,
          collaborators: 0
        }}
        onGetStarted={() => {
          console.log('🎓 MAIN DASHBOARD: "Add Your First Scholarship" clicked!');
          console.log('onGetStarted called - opening scholarship modal');
          // Create a new blank scholarship to get started with proper structure
          const newScholarship = {
            id: Date.now(),
            title: '',
            amount: 0,
            deadline: '',
            status: 'not started' as const,
            completion: 0,
            completionText: '0/0 completed',
            category: '',
            provider: '',
            organizationUrl: '',
            applicationUrl: '',
            description: '',
            contacts: [
              {
                id: '1',
                name: '',
                role: '',
                email: '',
                phone: '',
                links: [],
                notes: '',
                isExpanded: true
              }
            ],
            documentRequirements: [],
            academicRequirements: [],
            activityRequirements: [],
            processRequirements: [],
            financialRequirements: [],
            customRequirements: []
          };
          console.log('📝 MAIN DASHBOARD: Setting scholarship and opening modal...');
          setSelectedScholarship(newScholarship);
          setIsModalOpen(true);
          console.log('✅ MAIN DASHBOARD: Modal should be open now');
        }}
        onLoadSampleData={() => {
          setScholarshipsData(SAMPLE_SCHOLARSHIPS);
        }}
        onSetFinancialGoals={() => {
          console.log('onSetFinancialGoals called - opening financial goals modal');
          setIsFinancialGoalsModalOpen(true);
        }}
        onSetupProfile={() => {
          alert('Profile setup feature - This will open the user profile configuration interface');
        }}
        onGoToDashboard={() => {
          console.log('onGoToDashboard called - forcing hide of welcome screen');
          setForceHideWelcome(true);
        }}
      />
    );
  }

  console.log('Rendering main dashboard - scholarshipsData.length:', scholarshipsData.length);
  return (
    <div className="relative space-y-2 min-h-screen transition-colors">
      {/* Dashboard Header with Export/Import Toggle */}
      <div className="flex justify-end items-center mb-4">
        <div className="flex items-center gap-2">
          <InviteParentModal />
        </div>
      </div>
      
      {/* Dashboard Content */}
      {/* Compact Single Line Stats */}
      <DashboardStats stats={enhancedCurrentStats as any} />

      {/* Embedded Financial Goals - Re-enabled after fixing infinite loops */}
      {/* TEMPORARILY DISABLED: EmbeddedFinancialGoals - causing safety system triggers */}
      {/* <EmbeddedFinancialGoals stats={enhancedCurrentStats} /> */}
      
      {/* Advanced Analytics - Temporarily disabled until module resolution fixed */}
      {/* 
      <EnhancedFinancialAnalytics stats={enhancedCurrentStats} />
      <FinancialCharts stats={enhancedCurrentStats} />
      */}

      {/* Legacy Financial Progress & Analytics - Seamless Container */}
      <div className="bg-gradient-to-r from-green-50 to-yellow-50 dark:from-green-950 dark:to-yellow-950 border border-green-200 dark:border-green-800 rounded-lg p-0 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="relative">
            <div className="absolute right-0 top-6 bottom-6 w-px bg-green-200/50 dark:bg-green-700/50 lg:block hidden"></div>
            <FinancialProgress stats={enhancedCurrentStats as any} />
          </div>
          <GapAnalysis stats={enhancedCurrentStats as any} />
        </div>
      </div>

      {/* Scholarship Applications Table - Moved Above Diagnostic Menus */}
      <ScholarshipTable 
        scholarshipsData={scholarshipsData}
        expandedQuickView={expandedQuickView}
        onOpenModal={openScholarshipModal}
        onCreateScholarship={createScholarship}
      />

      {/* Diagnostic and Safety Systems - REMOVED FOR STABILITY */}

      {/* Scholarship Detail Modal */}
      {selectedScholarship && (
        <ScholarshipDetailModal
          scholarship={selectedScholarship}
          isOpen={isModalOpen}
          onClose={closeScholarshipModal}
          onSave={saveScholarship}
        />
      )}

      {/* Financial Goals Modal */}
      <FinancialGoalsModal
        isOpen={isFinancialGoalsModalOpen}
        onClose={() => setIsFinancialGoalsModalOpen(false)}
        onSaveGoals={(savedGoals) => {
          console.log('💰 Saving financial goals:', savedGoals);
          // Update goals context with the new financial goals
          const updatedGoals = { ...goals };
          updatedGoals.financial = savedGoals;
          setGoals(updatedGoals);
          setIsFinancialGoalsModalOpen(false);
        }}
        initialGoals={goals.financial || []}
        mode="create"
        editingGoal={null}
      />
    </div>
  );
}