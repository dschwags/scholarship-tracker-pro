export interface ExportOptions {
  includePersonalResponses: boolean;
  includeEligibilityCriteria: boolean;
  includeApplicationProgress: boolean;
  includeFinancialInfo: boolean;
  anonymizeData: boolean;
}

export interface ExportData {
  exportType: 'full-backup' | 'template' | 'portfolio';
  exportDate: string;
  exportVersion: string;
  exportedBy: string; // Student name or "Counselor Template"
  
  // Scholarship data (always included)
  scholarships: ScholarshipExportData[];
  
  // Conditional data based on export options
  studentProfile?: StudentProfileExport;
  financialGoals?: FinancialGoalsExport[];
  applicationData?: ApplicationExportData[];
  
  // Metadata
  metadata: {
    totalScholarships: number;
    completedApplications: number;
    pendingApplications: number;
    totalPotentialFunding: number;
    exportSettings: ExportOptions;
    financialAnalytics?: FinancialAnalytics;
  };
}

export interface FinancialAnalytics {
  totalAwarded: number;
  totalApplied: number;
  totalNeed: number;
  currentSavings: number;
  remainingNeed: number;
  fundingGap: number;
  gapCoveredByPending: number;
  remainingGapAfterPending: number;
  gapCoveragePercentage: number;
  applicationSuccessRate: number;
  averageAwardAmount: number;
  totalApplicationsSubmitted: number;
  
  // Additional fields for visual dashboard charts
  applicationsSubmitted?: number;
  applicationsAwarded?: number;
  applicationsInProgress?: number;
  
  statusBreakdown: {
    awarded: number;
    pending: number;
    draft: number;
    total: number;
  };
}

export interface ScholarshipExportData {
  id: string;
  name: string;
  organization?: string;
  applicationUrl?: string;
  amount: number;
  deadline: string;
  description: string;
  requirements: string[];
  eligibilityMet?: boolean; // Only if includeEligibilityCriteria
  applicationStatus?: 'not-started' | 'in-progress' | 'submitted' | 'awarded' | 'rejected';
  
  // Template fields (for counselor curation)
  recommendedFor?: string[]; // ["Engineering", "First-Generation", "Financial Need"]
  difficultyLevel?: 'easy' | 'medium' | 'competitive';
  curatedBy?: string; // Counselor name
  curatedDate?: string;
  
  // Application details (if included)
  applicationData?: {
    essays?: EssayExportData[];
    documents?: DocumentExportData[];
    personalNotes?: string;
  };
}

export interface StudentProfileExport {
  // Basic info (anonymized if requested)
  firstName?: string;
  lastName?: string;
  email?: string;
  
  // Academic info
  gpa?: number;
  major?: string;
  graduationYear?: number;
  school?: string;
  
  // Eligibility factors
  state?: string;
  ethnicity?: string;
  firstGeneration?: boolean;
  financialNeed?: boolean;
  
  // Anonymized version
  academicProfile?: {
    gpaRange: string; // "3.5-3.7"
    majorCategory: string; // "STEM"
    classStanding: string; // "Junior"
  };
}

export interface FinancialGoalsExport {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount?: number; // Exclude if anonymizing
  deadline: string;
  calculationMethod: string;
  
  // Anonymized version
  goalCategory?: string; // "Annual Tuition" vs specific amounts
}

export interface ApplicationExportData {
  scholarshipId: string;
  status: string;
  submissionDate?: string;
  
  // Include based on export options
  essays?: EssayExportData[];
  personalResponses?: any;
  
  // Template version (for sharing)
  requiredDocuments?: string[];
  estimatedTimeToComplete?: number;
  tips?: string[];
}

export interface EssayExportData {
  prompt: string;
  wordLimit: number;
  response?: string; // Only if includePersonalResponses
  
  // Template info
  sampleTips?: string[];
  commonThemes?: string[];
}

export interface DocumentExportData {
  name: string;
  required: boolean;
  submitted?: boolean;
  
  // Template info
  description?: string;
  whereToObtain?: string;
}

export interface ImportResult {
  success: boolean;
  summary: {
    scholarshipsImported: number;
    duplicatesFound: number;
    conflictsResolved: number;
    applicationsImported: number;
  };
  conflicts: ImportConflict[];
  errors: string[];
}

export interface ImportConflict {
  type: 'duplicate-scholarship' | 'date-conflict' | 'eligibility-mismatch';
  scholarshipName: string;
  existingData: any;
  importedData: any;
  resolution: 'merge' | 'replace' | 'skip' | 'manual';
}

// CSV/Excel export formats
export interface ScholarshipCSVRow {
  'Scholarship Name': string;
  'Amount': string;
  'Deadline': string;
  'Requirements': string;
  'Eligibility Met': string;
  'Application Status': string;
  'Website/Contact': string;
  'Notes': string;
  'Difficulty Level': string;
  'Recommended For': string;
}

export interface ApplicationCSVRow {
  'Scholarship Name': string;
  'Status': string;
  'Deadline': string;
  'Essay Required': string;
  'Documents Needed': string;
  'Submission Date': string;
  'Follow-up Date': string;
  'Notes': string;
}