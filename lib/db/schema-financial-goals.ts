import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  date,
  jsonb,
  pgEnum,
  uuid,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enhanced Enums for Financial Goals
export const goalTypeEnum = pgEnum('goal_type', [
  'education', 'living', 'emergency', 'career', 'research', 'travel'
]);

export const calculationMethodEnum = pgEnum('calculation_method', [
  'template_based', 'manual_entry', 'ai_assisted', 'imported'
]);

export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high', 'critical']);

export const statusEnum = pgEnum('status', [
  'active', 'completed', 'paused', 'cancelled', 'under_review'
]);

export const residencyStatusEnum = pgEnum('residency_status', [
  'in_state', 'out_of_state', 'international', 'establishing_residency'
]);

export const schoolTypeEnum = pgEnum('school_type', [
  'public', 'private', 'community_college', 'trade_school', 'online', 'hybrid'
]);

export const enrollmentStatusEnum = pgEnum('enrollment_status', [
  'full_time', 'part_time', 'half_time', 'less_than_half_time'
]);

export const fundingResponsibilityEnum = pgEnum('funding_responsibility', [
  'self', 'family', 'mixed', 'employer', 'military'
]);

export const dependencyStatusEnum = pgEnum('dependency_status', [
  'dependent', 'independent', 'unknown', 'provisional'
]);

// Core Financial Goals Table
export const financialGoals = pgTable('financial_goals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  
  // Core Goal Information
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  goalType: goalTypeEnum('goal_type').notNull().default('education'),
  targetAmount: decimal('target_amount', { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal('current_amount', { precision: 12, scale: 2 }).default('0'),
  deadline: timestamp('deadline'),
  priority: priorityEnum('priority').default('medium'),
  status: statusEnum('status').default('active'),
  
  // AI and Template Context
  createdViaTemplate: varchar('created_via_template', { length: 50 }),
  calculationMethod: calculationMethodEnum('calculation_method').default('manual_entry'),
  aiConfidenceScore: decimal('ai_confidence_score', { precision: 3, scale: 2 }).default('0'),
  needsHumanReview: boolean('needs_human_review').default(false),
  
  // Geographic Context (Critical for Cost Calculations)
  targetState: varchar('target_state', { length: 100 }),
  targetCountry: varchar('target_country', { length: 100 }).default('United States'),
  residencyStatus: residencyStatusEnum('residency_status'),
  residencyTimeline: varchar('residency_timeline', { length: 50 }),
  
  // Academic Context
  educationLevel: varchar('education_level', { length: 50 }),
  schoolType: schoolTypeEnum('school_type'),
  programType: varchar('program_type', { length: 50 }),
  creditHoursPerTerm: integer('credit_hours_per_term'),
  termsPerYear: integer('terms_per_year').default(2),
  programDurationYears: decimal('program_duration_years', { precision: 3, scale: 1 }),
  
  // Financial Aid Context
  estimatedEFC: integer('estimated_efc'), // Expected Family Contribution
  pellEligible: boolean('pell_eligible').default(false),
  stateAidEligible: boolean('state_aid_eligible').default(false),
  familyIncomeRange: varchar('family_income_range', { length: 50 }),
  
  // Timeline Information
  plannedStartDate: date('planned_start_date'),
  plannedEndDate: date('planned_end_date'),
  academicYear: varchar('academic_year', { length: 20 }),
  
  // Validation and Quality Control
  lastValidated: timestamp('last_validated').defaultNow(),
  validationWarnings: jsonb('validation_warnings').default('[]'),
  crossFieldIssues: jsonb('cross_field_issues').default('[]'),
  sanityCheckResults: jsonb('sanity_check_results').default('{}'),
  
  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// Goal Categories with Conditional Logic
export const goalCategories = pgTable('goal_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  parentCategoryId: integer('parent_category_id').references(() => goalCategories.id),
  
  // Conditional Logic Rules
  conditionalRules: jsonb('conditional_rules').default('{}'),
  requiredFields: jsonb('required_fields').default('[]'),
  calculationFormula: text('calculation_formula'),
  
  // Validation Rules
  minAmount: decimal('min_amount', { precision: 12, scale: 2 }),
  maxAmount: decimal('max_amount', { precision: 12, scale: 2 }),
  typicalRange: jsonb('typical_range'),
  
  isActive: boolean('is_active').default(true),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Enhanced Goal Expenses with Smart Categorization
export const goalExpenses = pgTable('goal_expenses', {
  id: serial('id').primaryKey(),
  goalId: integer('goal_id').notNull().references(() => financialGoals.id),
  categoryId: integer('category_id').references(() => goalCategories.id),
  
  // Core Fields
  name: varchar('name', { length: 200 }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  isEstimated: boolean('is_estimated').default(true),
  frequency: varchar('frequency', { length: 20 }).default('one_time'),
  
  // Conditional Logic Fields
  appliesIfConditions: jsonb('applies_if_conditions').default('{}'),
  calculationBase: varchar('calculation_base', { length: 50 }),
  
  // Academic-Specific Conditionals
  creditHours: integer('credit_hours'),
  semesterCount: integer('semester_count'),
  
  // Geographic Conditionals
  locationDependent: boolean('location_dependent').default(false),
  baseLocation: varchar('base_location', { length: 100 }),
  
  // Validation Data
  confidenceLevel: decimal('confidence_level', { precision: 3, scale: 2 }).default('0.5'),
  dataSource: varchar('data_source', { length: 100 }),
  lastUpdated: timestamp('last_updated').defaultNow(),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Funding Sources with Eligibility Logic
export const goalFundingSources = pgTable('goal_funding_sources', {
  id: serial('id').primaryKey(),
  goalId: integer('goal_id').notNull().references(() => financialGoals.id),
  
  // Source Details
  sourceName: varchar('source_name', { length: 200 }).notNull(),
  sourceType: varchar('source_type', { length: 50 }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  probabilityPercentage: integer('probability_percentage').default(50),
  
  // Conditional Eligibility
  eligibilityCriteria: jsonb('eligibility_criteria').default('{}'),
  deadline: timestamp('deadline'),
  renewable: boolean('renewable').default(false),
  renewalConditions: jsonb('renewal_conditions').default('{}'),
  
  // Status Tracking
  applicationStatus: varchar('application_status', { length: 30 }).default('not_applied'),
  confirmedAmount: decimal('confirmed_amount', { precision: 12, scale: 2 }).default('0'),
  
  // Metadata
  confidenceScore: decimal('confidence_score', { precision: 3, scale: 2 }).default('0.5'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// AI Decision Trees
export const aiDecisionTrees = pgTable('ai_decision_trees', {
  id: varchar('id', { length: 100 }).primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  version: varchar('version', { length: 20 }).default('1.0'),
  
  // Decision Tree Structure
  rootQuestion: jsonb('root_question').notNull(),
  decisionNodes: jsonb('decision_nodes').notNull(),
  outcomeActions: jsonb('outcome_actions').notNull(),
  
  // AI Instructions
  aiPrompt: text('ai_prompt').notNull(),
  criticalRules: text('critical_rules').array(),
  commonMistakes: text('common_mistakes').array(),
  fallbackStrategy: text('fallback_strategy'),
  
  // Validation Rules
  inputValidation: jsonb('input_validation'),
  outputValidation: jsonb('output_validation'),
  sanityChecks: jsonb('sanity_checks'),
  
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// AI Form Context for Session Management
export const aiFormContexts = pgTable('ai_form_contexts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').notNull().references(() => users.id),
  sessionId: varchar('session_id', { length: 100 }),
  
  // Current Form State
  currentPhase: varchar('current_phase', { length: 50 }),
  completedSections: text('completed_sections').array(),
  visibleFields: text('visible_fields').array(),
  
  // AI Inference Data
  inferredData: jsonb('inferred_data').default('{}'),
  confidenceScores: jsonb('confidence_scores').default('{}'),
  uncertaintyFlags: jsonb('uncertainty_flags').default('[]'),
  
  // Next Actions Queue
  pendingActions: jsonb('pending_actions').default('[]'),
  validationResults: jsonb('validation_results').default('{}'),
  
  // Error Recovery
  detectedConflicts: jsonb('detected_conflicts').default('[]'),
  resolutionAttempts: integer('resolution_attempts').default(0),
  needsManualIntervention: boolean('needs_manual_intervention').default(false),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  expiresAt: timestamp('expires_at').defaultNow(), // 24 hours from now
});

// Cost Calculation Templates
export const costCalculationTemplates = pgTable('cost_calculation_templates', {
  id: varchar('id', { length: 100 }).primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  
  // Applicability Rules
  appliesWhen: jsonb('applies_when').notNull(),
  geographicScope: text('geographic_scope').array(),
  educationLevels: text('education_levels').array(),
  schoolTypes: text('school_types').array(),
  
  // Calculation Logic
  baseCalculations: jsonb('base_calculations').notNull(),
  conditionalAdditions: jsonb('conditional_additions').default('[]'),
  discountRules: jsonb('discount_rules').default('[]'),
  
  // AI Guidance
  aiSelectionRules: text('ai_selection_rules'),
  validationPrompts: text('validation_prompts').array(),
  commonErrors: text('common_errors').array(),
  
  // Cost Ranges (Sanity Checks)
  typicalRanges: jsonb('typical_ranges').notNull(),
  warningThresholds: jsonb('warning_thresholds'),
  
  lastUpdated: timestamp('last_updated').defaultNow(),
  isActive: boolean('is_active').default(true),
});

// Comprehensive Validation Rules
export const validationRules = pgTable('validation_rules', {
  id: varchar('id', { length: 100 }).primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  category: varchar('category', { length: 50 }),
  
  // Rule Definition
  ruleExpression: text('rule_expression').notNull(),
  errorMessage: text('error_message').notNull(),
  severity: varchar('severity', { length: 20 }).default('error'),
  
  // AI Instructions
  aiDetectionPrompt: text('ai_detection_prompt'),
  aiResolutionPrompt: text('ai_resolution_prompt'),
  fallbackAction: varchar('fallback_action', { length: 50 }),
  
  // Rule Context
  appliesToFields: text('applies_to_fields').array(),
  requiresFields: text('requires_fields').array(),
  
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Goal Progress Tracking
export const goalProgress = pgTable('goal_progress', {
  id: serial('id').primaryKey(),
  goalId: integer('goal_id').notNull().references(() => financialGoals.id),
  
  // Progress Details
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  progressType: varchar('progress_type', { length: 30 }).notNull(),
  description: text('description'),
  
  // Conditional Triggers
  triggeredBy: varchar('triggered_by', { length: 50 }),
  milestoneConditions: jsonb('milestone_conditions'),
  
  // Metadata
  recordedAt: timestamp('recorded_at').defaultNow(),
  recordedBy: integer('recorded_by').references(() => users.id),
});

// Relations
export const financialGoalsRelations = relations(financialGoals, ({ one, many }) => ({
  user: one(users, {
    fields: [financialGoals.userId],
    references: [users.id],
  }),
  expenses: many(goalExpenses),
  fundingSources: many(goalFundingSources),
  progress: many(goalProgress),
}));

export const goalExpensesRelations = relations(goalExpenses, ({ one }) => ({
  goal: one(financialGoals, {
    fields: [goalExpenses.goalId],
    references: [financialGoals.id],
  }),
  category: one(goalCategories, {
    fields: [goalExpenses.categoryId],
    references: [goalCategories.id],
  }),
}));

export const goalFundingSourcesRelations = relations(goalFundingSources, ({ one }) => ({
  goal: one(financialGoals, {
    fields: [goalFundingSources.goalId],
    references: [financialGoals.id],
  }),
}));

export const aiFormContextsRelations = relations(aiFormContexts, ({ one }) => ({
  user: one(users, {
    fields: [aiFormContexts.userId],
    references: [users.id],
  }),
}));

export const goalProgressRelations = relations(goalProgress, ({ one }) => ({
  goal: one(financialGoals, {
    fields: [goalProgress.goalId],
    references: [financialGoals.id],
  }),
  recordedByUser: one(users, {
    fields: [goalProgress.recordedBy],
    references: [users.id],
  }),
}));

// Import users table reference (assuming it exists in main schema)
import { users } from './schema';