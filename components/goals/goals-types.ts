// Goals Types and Interfaces

// Enhanced Financial Goal with comprehensive funding categories
export interface FinancialGoal {
  id: string;
  type: 'financial';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Goal scope and duration
  scope: 'annual' | 'degree-total' | 'semester';
  academicYear?: string; // e.g., "2024-2025"
  semesterCount?: number; // Number of semesters (when scope is 'semester')
  
  // Funding calculation method
  calculationMethod: 'manual-total' | 'detailed-breakdown';
  
  // Manual total (when calculationMethod is 'manual-total')
  targetAmount?: number;
  currentAmount?: number;
  deadline?: string;
  
  // Detailed breakdown (when calculationMethod is 'detailed-breakdown')
  expenses?: {
    tuition: {
      amount: number;
      inStateRate?: number;
      outOfStateRate?: number;
      currentlyInState?: boolean;
    };
    roomAndBoard: {
      amount: number;
      housingType: 'dorm' | 'apartment' | 'home' | 'other';
      mealPlan?: number;
    };
    books: {
      amount: number;
      estimatePerSemester?: number;
    };
    transportation: {
      amount: number;
      type: 'car' | 'public-transit' | 'flights' | 'other';
      entries?: Array<{
        amount: number;
        type: 'car' | 'public-transit' | 'flights' | 'other';
        description?: string;
      }>;
    };
    personal: {
      amount: number;
      monthlyEstimate?: number;
    };
    fees: {
      amount: number;
      breakdown?: string[];
    };
    other: {
      amount: number;
      description?: string;
      entries?: Array<{
        amount: number;
        description: string;
      }>;
    };
  };
  
  // Funding sources
  fundingSources?: {
    // Federal Aid
    federalAid: {
      pellGrant: {
        amount: number;
        awarded: boolean;
        renewable: boolean;
        academicRequirements?: string;
      };
      subsidizedLoans: {
        amount: number;
        interestRate?: number;
      };
      unsubsidizedLoans: {
        amount: number;
        interestRate?: number;
      };
      workStudy: {
        amount: number;
        hoursPerWeek?: number;
        hourlyRate?: number;
      };
      other: {
        amount: number;
        description?: string;
        entries?: Array<{
          amount: number;
          description: string;
        }>;
      };
    };
    
    // State Grants
    stateGrants: {
      needBased: {
        amount: number;
        programName?: string;
        renewable: boolean;
        requirements?: string;
      };
      meritBased: {
        amount: number;
        programName?: string;
        gpaRequirement?: number;
        renewable: boolean;
      };
      other: {
        amount: number;
        description?: string;
        entries?: Array<{
          amount: number;
          description: string;
        }>;
      };
      additionalGrants?: Array<{
        amount: number;
        programName: string;
        type: 'need-based' | 'merit-based' | 'other';
        renewable: boolean;
      }>;
    };
    
    // Scholarships
    scholarships: ScholarshipFunding[];
    
    // Family/Personal contributions
    familyContribution: {
      amount: number;
      expectedFamilyContribution?: number; // EFC from FAFSA
      parentContribution?: number;
      studentContribution?: number;
      studentSavings?: number;
      friendsContribution?: number; // Contributions from friends
      employerContribution?: number; // Employer tuition assistance/reimbursement
      otherEntries?: Array<{
        amount: number;
        description: string;
      }>;
    };
    
    // Employment
    employment: {
      amount: number;
      jobType: 'part-time' | 'full-time' | 'internship' | 'co-op';
      hoursPerWeek?: number;
      hourlyRate?: number;
    };
  };
  
  // Calculated totals (auto-computed from breakdown or manual)
  totalExpenses: number;
  totalFunding: number;
  remainingGap: number;
  
  // School information
  schoolInfo?: {
    name: string;
    state: string;
    isInState: boolean;
    costOfLiving: 'low' | 'medium' | 'high';
  };
  
  // Custom fields for additional tracking
  customFields?: Record<string, string>;
}

// Scholarship funding details for tracking renewals and conditions
export interface ScholarshipFunding {
  id: string;
  name: string;
  amount: number;
  duration: 'one-time' | 'annual' | 'semester';
  
  // Multi-year tracking
  isRenewable: boolean;
  renewalRequirements?: {
    minGPA: number;
    fullTimeEnrollment: boolean;
    majorRequirement?: string;
    communityService?: boolean;
    additionalRequirements?: string;
  };
  
  // Award timeline
  awardDate?: string;
  disbursementSchedule?: {
    fall?: number;
    spring?: number;
    summer?: number;
  };
  
  // Status tracking
  status: 'pending' | 'awarded' | 'rejected' | 'renewed' | 'lost';
  academicYears: string[]; // Years this scholarship applies to
  
  // Requirements tracking
  requirementsMet?: boolean;
  currentGPA?: number;
  notes?: string;
}

export interface AcademicGoal {
  id: string;
  type: 'academic';
  title: string;
  targetGPA: number;
  currentGPA: number;
  targetGraduationDate: string;
  major: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  milestones: AcademicMilestone[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CareerGoal {
  id: string;
  type: 'career';
  title: string;
  targetPosition: string;
  targetCompany?: string;
  targetIndustry: string;
  targetSalary?: number;
  deadline?: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  skills: SkillRequirement[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalGoal {
  id: string;
  type: 'personal';
  title: string;
  description: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  category: 'health' | 'relationships' | 'hobbies' | 'volunteer' | 'other';
  isActive: boolean;
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

export interface AcademicMilestone {
  id: string;
  title: string;
  deadline: string;
  completed: boolean;
  description?: string;
}

export interface SkillRequirement {
  id: string;
  skill: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  targetLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export type Goal = FinancialGoal | AcademicGoal | CareerGoal | PersonalGoal;

export interface GoalsData {
  financial: FinancialGoal[];
  academic: AcademicGoal[];
  career: CareerGoal[];
  personal: PersonalGoal[];
}

export interface GoalFormData {
  type: Goal['type'];
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  isActive: boolean;
  
  // Financial specific - Enhanced
  template?: FinancialGoalTemplate;
  scope?: FinancialGoal['scope'];
  academicYear?: string;
  semesterCount?: number;
  calculationMethod?: FinancialGoal['calculationMethod'];
  targetAmount?: number;
  currentAmount?: number;
  deadline?: string;
  expenses?: FinancialGoal['expenses'];
  fundingSources?: FinancialGoal['fundingSources'];
  schoolInfo?: FinancialGoal['schoolInfo'];
  
  // Academic specific
  targetGPA?: number;
  currentGPA?: number;
  targetGraduationDate?: string;
  major?: string;
  milestones?: AcademicMilestone[];
  
  // Career specific
  targetPosition?: string;
  targetCompany?: string;
  targetIndustry?: string;
  targetSalary?: number;
  skills?: SkillRequirement[];
  
  // Personal specific
  personalCategory?: PersonalGoal['category'];
  progress?: number;
}

// Enhanced constants for financial goals
export const FUNDING_SCOPES = {
  annual: 'Annual (One Academic Year)',
  semester: 'Semester',
  'degree-total': 'Total Degree Cost'
} as const;

// Predefined financial goal titles to make it easier for students
export const FINANCIAL_GOAL_TEMPLATES = {
  'tuition-annual': {
    title: 'Annual Tuition & Fees',
    description: 'Cover tuition, fees, and academic costs for one academic year',
    recommendedScope: 'annual' as const,
    category: 'academic-expenses'
  },
  'room-board-annual': {
    title: 'Room & Board for Academic Year',
    description: 'Housing and meal plan costs for dormitory or off-campus living',
    recommendedScope: 'annual' as const,
    category: 'living-expenses'
  },
  'semester-expenses': {
    title: 'Semester Expenses',
    description: 'All expenses for a single semester including tuition, books, and living costs',
    recommendedScope: 'semester' as const,
    category: 'semester-funding'
  },
  'books-supplies': {
    title: 'Books & Supplies',
    description: 'Textbooks, course materials, lab fees, and academic supplies',
    recommendedScope: 'annual' as const,
    category: 'academic-materials'
  },
  'degree-total': {
    title: 'Complete Degree Funding',
    description: 'Total funding needed for entire undergraduate or graduate program',
    recommendedScope: 'degree-total' as const,
    category: 'comprehensive'
  },
  'emergency-fund': {
    title: 'Emergency Fund',
    description: 'Emergency savings for unexpected expenses during college',
    recommendedScope: 'annual' as const,
    category: 'emergency'
  },
  'study-abroad': {
    title: 'Study Abroad Program',
    description: 'Additional costs for international study programs',
    recommendedScope: 'semester' as const,
    category: 'special-programs'
  },
  'summer-classes': {
    title: 'Summer Session Funding',
    description: 'Tuition and expenses for summer courses',
    recommendedScope: 'semester' as const,
    category: 'summer-programs'
  },
  'graduate-school': {
    title: 'Graduate School Preparation',
    description: 'Funding for graduate school applications, tests, and first year',
    recommendedScope: 'annual' as const,
    category: 'graduate-prep'
  },
  'laptop-technology': {
    title: 'Technology & Equipment',
    description: 'Laptop, software, and technology needs for academic success',
    recommendedScope: 'degree-total' as const,
    category: 'technology'
  },
  'custom': {
    title: 'Custom Goal',
    description: 'Create your own financial goal with custom details',
    recommendedScope: 'annual' as const,
    category: 'custom'
  }
} as const;

export type FinancialGoalTemplate = keyof typeof FINANCIAL_GOAL_TEMPLATES;

export const CALCULATION_METHODS = {
  'manual-total': 'Enter Total Amount',
  'detailed-breakdown': 'Detailed Expense & Funding Breakdown'
} as const;

export const HOUSING_TYPES = {
  dorm: 'Dormitory/Residence Hall',
  apartment: 'Off-Campus Apartment',
  home: 'Living at Home',
  other: 'Other'
} as const;

export const TRANSPORTATION_TYPES = {
  car: 'Personal Vehicle',
  'public-transit': 'Public Transportation',
  flights: 'Flights (Home/School)',
  other: 'Other'
} as const;

export const JOB_TYPES = {
  'part-time': 'Part-Time Job',
  'full-time': 'Full-Time Job',
  internship: 'Internship',
  'co-op': 'Co-op Program'
} as const;

export const SCHOLARSHIP_DURATIONS = {
  'one-time': 'One-Time Award',
  annual: 'Annual (Renewable)',
  semester: 'Per Semester'
} as const;

export const SCHOLARSHIP_STATUSES = {
  pending: 'Application Pending',
  awarded: 'Awarded',
  rejected: 'Not Selected',
  renewed: 'Successfully Renewed',
  lost: 'Lost/Not Renewed'
} as const;

export const COST_OF_LIVING_LEVELS = {
  low: 'Low Cost Area',
  medium: 'Average Cost Area',
  high: 'High Cost Area'
} as const;

export const GOAL_CATEGORIES = {
  personal: ['health', 'relationships', 'hobbies', 'volunteer', 'other'],
} as const;

export const PRIORITY_LEVELS = ['high', 'medium', 'low'] as const;
export const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const;

// Template-specific expense configurations
export const TEMPLATE_EXPENSE_CONFIGS = {
  'laptop-technology': {
    expenses: [
      { key: 'laptop', title: '💻 Laptop/Computer', placeholder: '1500', description: 'Main computer for studies' },
      { key: 'software', title: '🔧 Software & Licenses', placeholder: '500', description: 'Required software and subscriptions' },
      { key: 'accessories', title: '⌨️ Accessories & Peripherals', placeholder: '300', description: 'Mouse, keyboard, monitor, etc.' },
      { key: 'maintenance', title: '🔧 Maintenance & Support', placeholder: '200', description: 'Warranty, repairs, technical support' },
    ],
    defaultFunding: ['scholarships', 'familyContribution', 'employment']
  },
  'books-supplies': {
    expenses: [
      { key: 'textbooks', title: '📚 Textbooks', placeholder: '800', description: 'Required course textbooks' },
      { key: 'supplies', title: '✏️ Academic Supplies', placeholder: '200', description: 'Notebooks, pens, calculators' },
      { key: 'lab-fees', title: '🧪 Lab Fees & Materials', placeholder: '150', description: 'Laboratory access and materials' },
      { key: 'digital', title: '💻 Digital Resources', placeholder: '100', description: 'Online access codes, e-books' },
    ],
    defaultFunding: ['scholarships', 'familyContribution']
  },
  'study-abroad': {
    expenses: [
      { key: 'program-fees', title: '🌍 Program Fees', placeholder: '5000', description: 'Study abroad program costs' },
      { key: 'flights', title: '✈️ International Travel', placeholder: '1200', description: 'Round-trip flights' },
      { key: 'housing', title: '🏠 International Housing', placeholder: '3000', description: 'Accommodation abroad' },
      { key: 'visa-docs', title: '📋 Visa & Documentation', placeholder: '500', description: 'Visa, passport, permits' },
      { key: 'living-expenses', title: '🍽️ Living Expenses', placeholder: '2000', description: 'Food, local transport, activities' },
    ],
    defaultFunding: ['scholarships', 'familyContribution', 'stateGrants']
  },
  'emergency-fund': {
    expenses: [
      { key: 'medical', title: '🏥 Medical Emergencies', placeholder: '2000', description: 'Unexpected health costs' },
      { key: 'family', title: '👨‍👩‍👧‍👦 Family Emergencies', placeholder: '1500', description: 'Family crisis support' },
      { key: 'academic', title: '🎓 Academic Emergencies', placeholder: '1000', description: 'Sudden academic expenses' },
      { key: 'technology', title: '💻 Technology Failures', placeholder: '800', description: 'Device repairs/replacement' },
    ],
    defaultFunding: ['familyContribution', 'employment']
  },
  'graduate-school': {
    expenses: [
      { key: 'applications', title: '📝 Application Fees', placeholder: '500', description: 'Graduate school applications' },
      { key: 'test-prep', title: '📖 Test Preparation', placeholder: '300', description: 'GRE, GMAT, test prep materials' },
      { key: 'test-fees', title: '✏️ Standardized Tests', placeholder: '200', description: 'GRE, GMAT, subject tests' },
      { key: 'interviews', title: '🚗 Interview Travel', placeholder: '800', description: 'Campus visits and interviews' },
      { key: 'first-year', title: '🎓 First Year Expenses', placeholder: '25000', description: 'First year tuition estimate' },
    ],
    defaultFunding: ['scholarships', 'familyContribution', 'employment']
  },
  // Default configuration for standard college templates
  'default': {
    expenses: [
      { key: 'tuition', title: '🎓 Tuition & Fees', placeholder: '35000', description: 'Tuition and mandatory fees' },
      { key: 'housing', title: '🏠 Housing', placeholder: '12000', description: 'Dormitory or housing costs' },
      { key: 'transportation', title: '🚗 Transportation', placeholder: '2000', description: 'Travel and commuting costs', allowMultiple: true },
      { key: 'personal', title: '👤 Personal Expenses', placeholder: '3000', description: 'Personal and miscellaneous costs' },
      { key: 'other', title: '📚 Other Expenses', placeholder: '1000', description: 'Books, supplies, and other costs', allowMultiple: true },
    ],
    defaultFunding: ['federalAid', 'stateGrants', 'scholarships', 'familyContribution']
  }
} as const;

// Helper function to get template configuration
export const getTemplateConfig = (template: FinancialGoalTemplate | '') => {
  if (!template || template === 'custom') return TEMPLATE_EXPENSE_CONFIGS.default;
  return TEMPLATE_EXPENSE_CONFIGS[template as keyof typeof TEMPLATE_EXPENSE_CONFIGS] || TEMPLATE_EXPENSE_CONFIGS.default;
};

// Helper functions for financial calculations
export const calculateTotalExpenses = (expenses: FinancialGoal['expenses']): number => {
  if (!expenses) return 0;
  
  let total = 0;
  
  // Add base amounts for all expense categories
  Object.values(expenses).forEach(expense => {
    if (expense && typeof expense.amount === 'number') {
      total += expense.amount;
    }
  });
  
  // Add additional entries for transportation
  if (expenses.transportation?.entries) {
    total += expenses.transportation.entries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
  }
  
  // Add additional entries for other expenses
  if (expenses.other?.entries) {
    total += expenses.other.entries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
  }
  
  return total;
};

export const calculateTotalFunding = (fundingSources: FinancialGoal['fundingSources']): number => {
  if (!fundingSources) return 0;
  
  let total = 0;
  
  // Federal Aid
  const federal = fundingSources.federalAid;
  if (federal) {
    total += federal.pellGrant?.amount || 0;
    total += federal.subsidizedLoans?.amount || 0;
    total += federal.unsubsidizedLoans?.amount || 0;
    total += federal.workStudy?.amount || 0;
    total += federal.other?.amount || 0;
  }
  
  // State Grants
  const state = fundingSources.stateGrants;
  if (state) {
    total += state.needBased?.amount || 0;
    total += state.meritBased?.amount || 0;
    total += state.other?.amount || 0;
    // Add entries if they exist
    if (state.entries) {
      total += state.entries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
    }
  }
  
  // Scholarships
  if (fundingSources.scholarships) {
    total += fundingSources.scholarships.reduce((sum, scholarship) => sum + (scholarship.amount || 0), 0);
  }
  
  // Family contribution
  const family = fundingSources.familyContribution;
  if (family) {
    total += family.amount || 0;
    total += family.friendsContribution || 0;
    total += family.employerContribution || 0;
  }
  
  // Employment
  const employment = fundingSources.employment;
  if (employment) {
    total += employment.amount || 0;
  }
  
  return total;
};