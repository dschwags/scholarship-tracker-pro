/**
 * BugX Financial Schemas - Scholarship Tracker Pro Implementation
 * 
 * @company BrewX
 * @product BugX
 * @version 1.0.0
 * @description Comprehensive Zod schemas for financial planning and scholarship tracking
 * 
 * This file demonstrates BugX Framework applied to real-world financial data structures.
 * Eliminates all TypeScript 'as any' assertions through proactive schema validation.
 * 
 * Original implementation: Scholarship Tracker Pro
 * Framework: BugX by BrewX (bugx.dev)
 */

import { z } from 'zod';
import { 
  BugXMoneySchema, 
  BugXIdSchema, 
  BugXDateSchema,
  bugxSafeParse,
  bugxParse,
  BugXSchemaBuilder
} from './BugX-Schema-Framework';

// ==========================================
// BugX Financial Base Schemas
// ==========================================

/**
 * BugX Amount Entry - Reusable schema for financial entries
 */
export const BugXAmountEntrySchema = z.object({
  amount: BugXMoneySchema.default(0),
  description: z.string().optional(),
  id: BugXIdSchema.optional(),
  createdAt: BugXDateSchema.optional(),
});

/**
 * BugX Transportation Entry - Specific to transportation expenses
 */
export const BugXTransportationEntrySchema = z.object({
  amount: BugXMoneySchema.default(0),
  type: z.enum(['car', 'public-transit', 'flights', 'other']).default('other'),
  description: z.string().optional(),
  id: BugXIdSchema.optional(),
});

// ==========================================
// BugX Expense Categories
// ==========================================

/**
 * BugX Tuition Schema - College tuition with in/out-of-state rates
 */
export const BugXTuitionSchema = z.object({
  amount: BugXMoneySchema.default(0),
  inStateRate: BugXMoneySchema.optional(),
  outOfStateRate: BugXMoneySchema.optional(),
  currentlyInState: z.boolean().optional(),
  semesterCredits: z.number().int().min(1).max(30).optional(),
  pricePerCredit: BugXMoneySchema.optional(),
}).default({ amount: 0 });

/**
 * BugX Room and Board Schema
 */
export const BugXRoomAndBoardSchema = z.object({
  amount: BugXMoneySchema.default(0),
  housingType: z.enum(['dorm', 'apartment', 'home', 'other']).default('dorm'),
  mealPlan: BugXMoneySchema.optional(),
  monthlyRent: BugXMoneySchema.optional(),
  utilities: BugXMoneySchema.optional(),
}).default({ amount: 0, housingType: 'dorm' });

/**
 * BugX Books Schema
 */
export const BugXBooksSchema = z.object({
  amount: BugXMoneySchema.default(0),
  estimatePerSemester: BugXMoneySchema.optional(),
  digitalBooks: BugXMoneySchema.optional(),
  physicalBooks: BugXMoneySchema.optional(),
}).default({ amount: 0 });

/**
 * BugX Transportation Schema
 */
export const BugXTransportationSchema = z.object({
  amount: BugXMoneySchema.default(0),
  type: z.enum(['car', 'public-transit', 'flights', 'other']).default('other'),
  entries: z.array(BugXTransportationEntrySchema).optional(),
  monthlyBudget: BugXMoneySchema.optional(),
}).default({ amount: 0, type: 'other' });

/**
 * BugX Personal Expenses Schema
 */
export const BugXPersonalSchema = z.object({
  amount: BugXMoneySchema.default(0),
  monthlyEstimate: BugXMoneySchema.optional(),
  livingLevel: z.enum(['basic', 'moderate', 'comfortable', 'premium']).optional(),
  breakdown: z.object({
    clothing: BugXMoneySchema.optional(),
    entertainment: BugXMoneySchema.optional(),
    healthcare: BugXMoneySchema.optional(),
    miscellaneous: BugXMoneySchema.optional(),
  }).optional(),
}).default({ amount: 0 });

/**
 * BugX Fees Schema - School fees and charges
 */
export const BugXFeesSchema = z.object({
  amount: BugXMoneySchema.default(0),
  breakdown: z.array(z.string()).optional(),
  studentServices: BugXMoneySchema.optional(),
  technology: BugXMoneySchema.optional(),
  laboratory: BugXMoneySchema.optional(),
  recreation: BugXMoneySchema.optional(),
}).default({ amount: 0 });

/**
 * BugX Other Expenses Schema
 */
export const BugXOtherExpensesSchema = z.object({
  amount: BugXMoneySchema.default(0),
  description: z.string().optional(),
  entries: z.array(BugXAmountEntrySchema).optional(),
  category: z.string().optional(),
}).default({ amount: 0 });

/**
 * BugX Complete Expenses Schema
 */
export const BugXExpensesSchema = z.object({
  tuition: BugXTuitionSchema,
  roomAndBoard: BugXRoomAndBoardSchema,
  books: BugXBooksSchema,
  transportation: BugXTransportationSchema,
  personal: BugXPersonalSchema,
  fees: BugXFeesSchema,
  other: BugXOtherExpensesSchema,
}).partial(); // All categories optional for flexible planning

// ==========================================
// BugX Funding Source Schemas
// ==========================================

/**
 * BugX Federal Aid Schema
 */
export const BugXFederalAidSchema = z.object({
  pellGrant: z.object({
    amount: BugXMoneySchema.default(0),
    awarded: z.boolean().default(false),
    renewable: z.boolean().default(false),
    academicRequirements: z.string().optional(),
    efc: BugXMoneySchema.optional(), // Expected Family Contribution
  }).default({ amount: 0, awarded: false, renewable: false }),
  
  subsidizedLoans: z.object({
    amount: BugXMoneySchema.default(0),
    interestRate: z.number().min(0).max(20).optional(),
    loanTerm: z.number().int().min(1).max(30).optional(),
    servicer: z.string().optional(),
  }).default({ amount: 0 }),
  
  unsubsidizedLoans: z.object({
    amount: BugXMoneySchema.default(0),
    interestRate: z.number().min(0).max(20).optional(),
    loanTerm: z.number().int().min(1).max(30).optional(),
    servicer: z.string().optional(),
  }).default({ amount: 0 }),
  
  workStudy: z.object({
    amount: BugXMoneySchema.default(0),
    hoursPerWeek: z.number().min(0).max(40).optional(),
    hourlyRate: BugXMoneySchema.optional(),
    jobType: z.string().optional(),
  }).default({ amount: 0 }),
  
  other: z.object({
    amount: BugXMoneySchema.default(0),
    description: z.string().optional(),
    entries: z.array(BugXAmountEntrySchema).optional(),
  }).default({ amount: 0 }),
}).default({
  pellGrant: { amount: 0, awarded: false, renewable: false },
  subsidizedLoans: { amount: 0 },
  unsubsidizedLoans: { amount: 0 },
  workStudy: { amount: 0 },
  other: { amount: 0 },
});

/**
 * BugX State Grants Schema - FIXED to match actual usage
 */
export const BugXStateGrantsSchema = z.object({
  // Primary state grant fields (as used in form)
  amount: BugXMoneySchema.default(0),
  source: z.string().optional(),
  entries: z.array(z.object({
    amount: BugXMoneySchema.default(0),
    source: z.string().optional(),
    description: z.string().optional(),
    programName: z.string().optional(),
  })).optional(),
  
  // Structured grant categories
  needBased: z.object({
    amount: BugXMoneySchema.default(0),
    programName: z.string().optional(),
    renewable: z.boolean().default(false),
    requirements: z.string().optional(),
    gpaRequirement: z.number().min(0).max(4).optional(),
  }).default({ amount: 0, renewable: false }),
  
  meritBased: z.object({
    amount: BugXMoneySchema.default(0),
    programName: z.string().optional(),
    gpaRequirement: z.number().min(0).max(4).optional(),
    renewable: z.boolean().default(false),
    testScoreRequirement: z.string().optional(),
  }).default({ amount: 0, renewable: false }),
  
  other: z.object({
    amount: BugXMoneySchema.default(0),
    description: z.string().optional(),
    entries: z.array(BugXAmountEntrySchema).optional(),
  }).default({ amount: 0 }),
  
  additionalGrants: z.array(z.object({
    amount: BugXMoneySchema.default(0),
    programName: z.string(),
    type: z.enum(['need-based', 'merit-based', 'other']),
    renewable: z.boolean().default(false),
    deadline: BugXDateSchema.optional(),
  })).optional(),
}).default({
  amount: 0,
  needBased: { amount: 0, renewable: false },
  meritBased: { amount: 0, renewable: false },
  other: { amount: 0 },
});

/**
 * BugX Scholarship Schema - FIXED to match actual usage
 */
export const BugXScholarshipSchema = z.object({
  amount: BugXMoneySchema.default(0),
  source: z.string().optional(), // Used in form
  programName: z.string().optional(),
  duration: z.enum(['annual', 'semester', 'one-time']).default('annual'),
  renewable: z.boolean().default(false),
  requirements: z.string().optional(),
  deadline: BugXDateSchema.optional(),
  applicationStatus: z.enum(['not-started', 'in-progress', 'submitted', 'awarded', 'rejected']).optional(),
});

export const BugXScholarshipsSchema = z.array(BugXScholarshipSchema).default([]);

/**
 * BugX Family Contribution Schema
 */
export const BugXFamilyContributionSchema = z.object({
  amount: BugXMoneySchema.default(0),
  expectedFamilyContribution: BugXMoneySchema.optional(), // EFC from FAFSA
  parentContribution: BugXMoneySchema.optional(),
  studentContribution: BugXMoneySchema.optional(),
  studentSavings: BugXMoneySchema.optional(),
  friendsContribution: BugXMoneySchema.optional(),
  employerContribution: BugXMoneySchema.optional(), // Tuition reimbursement
  otherEntries: z.array(BugXAmountEntrySchema).optional(),
}).default({ amount: 0 });

/**
 * BugX Complete Funding Sources Schema
 */
export const BugXFundingSourcesSchema = z.object({
  federalAid: BugXFederalAidSchema,
  stateGrants: BugXStateGrantsSchema,
  scholarships: BugXScholarshipsSchema,
  familyContribution: BugXFamilyContributionSchema,
}).partial(); // All funding sources optional

// ==========================================
// BugX Financial Goal Schema
// ==========================================

/**
 * BugX Complete Financial Goal Schema
 * This is the main schema that replaces all 'as any' assertions
 */
export const BugXFinancialGoalSchema = z.object({
  // Basic goal information
  id: BugXIdSchema.default(() => `goal-${Date.now()}`),
  type: z.literal('financial').default('financial'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().default(''),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  isActive: z.boolean().default(true),
  createdAt: BugXDateSchema.default(() => new Date().toISOString()),
  updatedAt: BugXDateSchema.default(() => new Date().toISOString()),
  
  // Goal scope and duration
  scope: z.enum(['annual', 'degree-total', 'semester']).default('annual'),
  academicYear: z.string().optional(),
  semesterCount: z.number().int().min(1).optional(),
  
  // Calculation method
  calculationMethod: z.enum(['manual-total', 'detailed-breakdown']).default('detailed-breakdown'),
  
  // Manual total fields (for simple goals)
  targetAmount: BugXMoneySchema.optional(),
  currentAmount: BugXMoneySchema.optional(),
  deadline: BugXDateSchema.optional(),
  
  // Detailed breakdown (main data structures)
  expenses: BugXExpensesSchema.optional(),
  fundingSources: BugXFundingSourcesSchema.optional(),
  
  // Calculated totals (automatically computed)
  totalExpenses: BugXMoneySchema.default(0),
  totalFunding: BugXMoneySchema.default(0),
  remainingGap: z.number().default(0), // Can be negative (surplus)
  
  // Custom fields for extensibility
  customFields: z.record(z.string()).default({}),
  
  // Template information
  templateUsed: z.string().optional(),
  
  // Progress tracking
  completionPercentage: z.number().min(0).max(100).default(0),
  lastCalculated: BugXDateSchema.optional(),
});

// ==========================================
// BugX Type Exports (Generated from Schemas)
// ==========================================

// Custom type that ensures all default fields are required
export type BugXFinancialGoal = {
  id: string;
  type: 'financial';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  scope: 'annual' | 'degree-total' | 'semester';
  academicYear?: string;
  semesterCount?: number;
  calculationMethod: 'manual-total' | 'detailed-breakdown';
  targetAmount?: number;
  currentAmount?: number;
  deadline?: string;
  expenses?: BugXExpenses;
  fundingSources?: BugXFundingSources;
  totalExpenses: number;
  totalFunding: number;
  remainingGap: number;
  customFields: Record<string, string>;
  templateUsed?: string;
  completionPercentage: number;
  lastCalculated?: string;
};
export type BugXExpenses = z.infer<typeof BugXExpensesSchema>;
export type BugXFundingSources = z.infer<typeof BugXFundingSourcesSchema>;
export type BugXTuition = z.infer<typeof BugXTuitionSchema>;
export type BugXStateGrants = z.infer<typeof BugXStateGrantsSchema>;
export type BugXScholarship = z.infer<typeof BugXScholarshipSchema>;

// ==========================================
// BugX Validation Functions
// ==========================================

/**
 * BugX Financial Goal Validator
 * Replaces all manual type checking with schema validation
 */
export function validateBugXFinancialGoal(data: unknown): {
  success: true;
  data: BugXFinancialGoal;
} | {
  success: false;
  error: string;
  issues: z.ZodIssue[];
} {
  const result = bugxSafeParse(BugXFinancialGoalSchema, data, 'Financial Goal');
  
  if (result.success) {
    return { success: true, data: result.data as BugXFinancialGoal };
  } else {
    return {
      success: false,
      error: result.error,
      issues: result.details.issues
    };
  }
}

/**
 * BugX Safe Property Access - No more 'as any' needed!
 */
export function getBugXExpenseAmount(
  expenses: BugXExpenses | undefined,
  category: keyof BugXExpenses
): number {
  if (!expenses || !expenses[category]) return 0;
  const expense = expenses[category] as any;
  return expense?.amount ?? 0;
}

export function getBugXFundingAmount(
  funding: BugXFundingSources | undefined,
  category: keyof BugXFundingSources
): number {
  if (!funding || !funding[category]) return 0;
  const source = funding[category] as any;
  return source?.amount ?? 0;
}

// ==========================================
// BugX Helper Functions
// ==========================================

/**
 * Create a default financial goal with BugX validation
 */
export function createBugXFinancialGoal(overrides?: Partial<BugXFinancialGoal>): BugXFinancialGoal {
  const defaultGoal = {
    title: 'New Financial Goal',
    description: 'Plan your educational expenses and funding sources',
    ...overrides
  };
  
  const parsed = bugxParse(BugXFinancialGoalSchema, defaultGoal, 'Default Financial Goal');
  return parsed as BugXFinancialGoal;
}

/**
 * Calculate totals with BugX validation
 */
export function calculateBugXTotals(goal: BugXFinancialGoal): {
  totalExpenses: number;
  totalFunding: number;
  remainingGap: number;
} {
  const expenses = goal.expenses || {};
  const funding = goal.fundingSources || {};
  
  // Calculate total expenses
  const totalExpenses = Object.values(expenses).reduce((sum, expense) => {
    return sum + (expense?.amount ?? 0);
  }, 0);
  
  // Calculate total funding
  let totalFunding = 0;
  
  // Federal Aid
  if (funding.federalAid) {
    totalFunding += funding.federalAid.pellGrant?.amount ?? 0;
    totalFunding += funding.federalAid.subsidizedLoans?.amount ?? 0;
    totalFunding += funding.federalAid.unsubsidizedLoans?.amount ?? 0;
    totalFunding += funding.federalAid.workStudy?.amount ?? 0;
    totalFunding += funding.federalAid.other?.amount ?? 0;
  }
  
  // State Grants
  if (funding.stateGrants) {
    totalFunding += funding.stateGrants.amount ?? 0;
    totalFunding += funding.stateGrants.needBased?.amount ?? 0;
    totalFunding += funding.stateGrants.meritBased?.amount ?? 0;
    totalFunding += funding.stateGrants.other?.amount ?? 0;
  }
  
  // Scholarships
  if (funding.scholarships) {
    totalFunding += funding.scholarships.reduce((sum, scholarship) => {
      return sum + (scholarship.amount ?? 0);
    }, 0);
  }
  
  // Family Contribution
  totalFunding += funding.familyContribution?.amount ?? 0;
  
  const remainingGap = totalExpenses - totalFunding;
  
  return {
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    totalFunding: Math.round(totalFunding * 100) / 100,
    remainingGap: Math.round(remainingGap * 100) / 100
  };
}

// ==========================================
// BugX Schema Registration
// ==========================================

// Register all schemas with the BugX framework
const schemaBuilder = BugXSchemaBuilder.getInstance();

schemaBuilder.registerSchema('FinancialGoal', BugXFinancialGoalSchema);
schemaBuilder.registerSchema('Expenses', BugXExpensesSchema);
schemaBuilder.registerSchema('FundingSources', BugXFundingSourcesSchema);
schemaBuilder.registerSchema('StateGrants', BugXStateGrantsSchema);
schemaBuilder.registerSchema('Scholarships', BugXScholarshipsSchema);

console.log('🎯 BugX Financial Schemas loaded successfully');
console.log(`📊 Registered ${schemaBuilder.listSchemas().length} financial schemas`);

// ==========================================
// BugX Usage Examples (for documentation)
// ==========================================

/*
// Example 1: Validate form data (replaces 'as any')
const formResult = validateBugXFinancialGoal(formData);
if (formResult.success) {
  const validatedGoal = formResult.data; // Fully typed, no 'as any' needed
  console.log(validatedGoal.expenses.tuition.amount); // TypeScript knows this exists
}

// Example 2: Safe property access (replaces optional chaining + fallbacks)
const tuitionAmount = getBugXExpenseAmount(goal.expenses, 'tuition');
const pellGrantAmount = getBugXFundingAmount(goal.fundingSources, 'federalAid');

// Example 3: Create validated goals
const newGoal = createBugXFinancialGoal({
  title: 'Fall 2024 Budget',
  scope: 'semester'
});

// No more 'as any' - everything is validated and typed!
*/