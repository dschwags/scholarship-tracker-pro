-- Financial Goals Comprehensive Migration
-- This migration creates the complete financial goals system with AI-friendly architecture

-- Create enums first
DO $$ BEGIN
  CREATE TYPE "goal_type" AS ENUM('education', 'living', 'emergency', 'career', 'research', 'travel');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "calculation_method" AS ENUM('template_based', 'manual_entry', 'ai_assisted', 'imported');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "priority" AS ENUM('low', 'medium', 'high', 'critical');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "status" AS ENUM('active', 'completed', 'paused', 'cancelled', 'under_review');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "residency_status" AS ENUM('in_state', 'out_of_state', 'international', 'establishing_residency');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "school_type" AS ENUM('public', 'private', 'community_college', 'trade_school', 'online', 'hybrid');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "enrollment_status" AS ENUM('full_time', 'part_time', 'half_time', 'less_than_half_time');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "funding_responsibility" AS ENUM('self', 'family', 'mixed', 'employer', 'military');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "dependency_status" AS ENUM('dependent', 'independent', 'unknown', 'provisional');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enhanced users table with financial context
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "state_province" varchar(100);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "country" varchar(100) DEFAULT 'United States';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "planning_different_state" boolean DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "target_study_location" varchar(100);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "estimated_family_income_range" varchar(50);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "family_members_in_college" integer DEFAULT 1;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "primary_funding_responsibility" varchar(20);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "current_education_savings" decimal(12,2) DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "fafsa_dependency_status" varchar(20);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "date_of_birth" date;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "marital_status" varchar(20);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "has_dependents" boolean DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "planned_start_date" date;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "program_duration_years" decimal(3,1);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "enrollment_status" varchar(20);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "planning_to_work" boolean DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "work_hours_per_week" integer DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profile_confidence_score" decimal(3,2) DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_profile_validation" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "needs_manual_review" boolean DEFAULT false;

-- Core Financial Goals Table
CREATE TABLE IF NOT EXISTS "financial_goals" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id"),
  "title" varchar(200) NOT NULL,
  "description" text,
  "goal_type" "goal_type" DEFAULT 'education' NOT NULL,
  "target_amount" decimal(12,2) NOT NULL,
  "current_amount" decimal(12,2) DEFAULT '0',
  "deadline" timestamp,
  "priority" "priority" DEFAULT 'medium',
  "status" "status" DEFAULT 'active',
  "created_via_template" varchar(50),
  "calculation_method" "calculation_method" DEFAULT 'manual_entry',
  "ai_confidence_score" decimal(3,2) DEFAULT '0',
  "needs_human_review" boolean DEFAULT false,
  "target_state" varchar(100),
  "target_country" varchar(100) DEFAULT 'United States',
  "residency_status" "residency_status",
  "residency_timeline" varchar(50),
  "education_level" varchar(50),
  "school_type" "school_type",
  "program_type" varchar(50),
  "credit_hours_per_term" integer,
  "terms_per_year" integer DEFAULT 2,
  "program_duration_years" decimal(3,1),
  "estimated_efc" integer,
  "pell_eligible" boolean DEFAULT false,
  "state_aid_eligible" boolean DEFAULT false,
  "family_income_range" varchar(50),
  "planned_start_date" date,
  "planned_end_date" date,
  "academic_year" varchar(20),
  "last_validated" timestamp DEFAULT now(),
  "validation_warnings" jsonb DEFAULT '[]',
  "cross_field_issues" jsonb DEFAULT '[]',
  "sanity_check_results" jsonb DEFAULT '{}',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp
);

-- Goal Categories
CREATE TABLE IF NOT EXISTS "goal_categories" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(100) NOT NULL,
  "parent_category_id" integer REFERENCES "goal_categories"("id"),
  "conditional_rules" jsonb DEFAULT '{}',
  "required_fields" jsonb DEFAULT '[]',
  "calculation_formula" text,
  "min_amount" decimal(12,2),
  "max_amount" decimal(12,2),
  "typical_range" jsonb,
  "is_active" boolean DEFAULT true,
  "display_order" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now()
);

-- Goal Expenses
CREATE TABLE IF NOT EXISTS "goal_expenses" (
  "id" serial PRIMARY KEY NOT NULL,
  "goal_id" integer NOT NULL REFERENCES "financial_goals"("id"),
  "category_id" integer REFERENCES "goal_categories"("id"),
  "name" varchar(200) NOT NULL,
  "amount" decimal(12,2) NOT NULL,
  "is_estimated" boolean DEFAULT true,
  "frequency" varchar(20) DEFAULT 'one_time',
  "applies_if_conditions" jsonb DEFAULT '{}',
  "calculation_base" varchar(50),
  "credit_hours" integer,
  "semester_count" integer,
  "location_dependent" boolean DEFAULT false,
  "base_location" varchar(100),
  "confidence_level" decimal(3,2) DEFAULT '0.5',
  "data_source" varchar(100),
  "last_updated" timestamp DEFAULT now(),
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Goal Funding Sources
CREATE TABLE IF NOT EXISTS "goal_funding_sources" (
  "id" serial PRIMARY KEY NOT NULL,
  "goal_id" integer NOT NULL REFERENCES "financial_goals"("id"),
  "source_name" varchar(200) NOT NULL,
  "source_type" varchar(50) NOT NULL,
  "amount" decimal(12,2) NOT NULL,
  "probability_percentage" integer DEFAULT 50,
  "eligibility_criteria" jsonb DEFAULT '{}',
  "deadline" timestamp,
  "renewable" boolean DEFAULT false,
  "renewal_conditions" jsonb DEFAULT '{}',
  "application_status" varchar(30) DEFAULT 'not_applied',
  "confirmed_amount" decimal(12,2) DEFAULT '0',
  "confidence_score" decimal(3,2) DEFAULT '0.5',
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- AI Decision Trees
CREATE TABLE IF NOT EXISTS "ai_decision_trees" (
  "id" varchar(100) PRIMARY KEY NOT NULL,
  "name" varchar(200) NOT NULL,
  "description" text,
  "version" varchar(20) DEFAULT '1.0',
  "root_question" jsonb NOT NULL,
  "decision_nodes" jsonb NOT NULL,
  "outcome_actions" jsonb NOT NULL,
  "ai_prompt" text NOT NULL,
  "critical_rules" text[],
  "common_mistakes" text[],
  "fallback_strategy" text,
  "input_validation" jsonb,
  "output_validation" jsonb,
  "sanity_checks" jsonb,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now()
);

-- AI Form Contexts
CREATE TABLE IF NOT EXISTS "ai_form_contexts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id"),
  "session_id" varchar(100),
  "current_phase" varchar(50),
  "completed_sections" text[],
  "visible_fields" text[],
  "inferred_data" jsonb DEFAULT '{}',
  "confidence_scores" jsonb DEFAULT '{}',
  "uncertainty_flags" jsonb DEFAULT '[]',
  "pending_actions" jsonb DEFAULT '[]',
  "validation_results" jsonb DEFAULT '{}',
  "detected_conflicts" jsonb DEFAULT '[]',
  "resolution_attempts" integer DEFAULT 0,
  "needs_manual_intervention" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "expires_at" timestamp DEFAULT (now() + interval '24 hours')
);

-- Cost Calculation Templates
CREATE TABLE IF NOT EXISTS "cost_calculation_templates" (
  "id" varchar(100) PRIMARY KEY NOT NULL,
  "name" varchar(200) NOT NULL,
  "description" text,
  "applies_when" jsonb NOT NULL,
  "geographic_scope" text[],
  "education_levels" text[],
  "school_types" text[],
  "base_calculations" jsonb NOT NULL,
  "conditional_additions" jsonb DEFAULT '[]',
  "discount_rules" jsonb DEFAULT '[]',
  "ai_selection_rules" text,
  "validation_prompts" text[],
  "common_errors" text[],
  "typical_ranges" jsonb NOT NULL,
  "warning_thresholds" jsonb,
  "last_updated" timestamp DEFAULT now(),
  "is_active" boolean DEFAULT true
);

-- Validation Rules
CREATE TABLE IF NOT EXISTS "validation_rules" (
  "id" varchar(100) PRIMARY KEY NOT NULL,
  "name" varchar(200) NOT NULL,
  "category" varchar(50),
  "rule_expression" text NOT NULL,
  "error_message" text NOT NULL,
  "severity" varchar(20) DEFAULT 'error',
  "ai_detection_prompt" text,
  "ai_resolution_prompt" text,
  "fallback_action" varchar(50),
  "applies_to_fields" text[],
  "requires_fields" text[],
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now()
);

-- Goal Progress Tracking
CREATE TABLE IF NOT EXISTS "goal_progress" (
  "id" serial PRIMARY KEY NOT NULL,
  "goal_id" integer NOT NULL REFERENCES "financial_goals"("id"),
  "amount" decimal(12,2) NOT NULL,
  "progress_type" varchar(30) NOT NULL,
  "description" text,
  "triggered_by" varchar(50),
  "milestone_conditions" jsonb,
  "recorded_at" timestamp DEFAULT now(),
  "recorded_by" integer REFERENCES "users"("id")
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_financial_goals_user_id" ON "financial_goals" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_financial_goals_status" ON "financial_goals" ("status");
CREATE INDEX IF NOT EXISTS "idx_goal_expenses_goal_id" ON "goal_expenses" ("goal_id");
CREATE INDEX IF NOT EXISTS "idx_goal_funding_sources_goal_id" ON "goal_funding_sources" ("goal_id");
CREATE INDEX IF NOT EXISTS "idx_ai_form_contexts_user_id" ON "ai_form_contexts" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_ai_form_contexts_expires_at" ON "ai_form_contexts" ("expires_at");
CREATE INDEX IF NOT EXISTS "idx_goal_progress_goal_id" ON "goal_progress" ("goal_id");

-- Insert seed data for goal categories
INSERT INTO "goal_categories" ("name", "conditional_rules", "typical_range", "display_order") VALUES
('Tuition', '{"requires": ["education_level", "school_type", "residency_status"]}', '{"min": 2000, "max": 70000}', 1),
('Room & Board', '{"requires": ["living_arrangement"]}', '{"min": 8000, "max": 20000}', 2),
('Books & Supplies', '{"applies_to": ["all_education_levels"]}', '{"min": 500, "max": 3000}', 3),
('Transportation', '{"conditional": "location_dependent"}', '{"min": 200, "max": 5000}', 4),
('Personal Expenses', '{"applies_to": ["all_students"]}', '{"min": 1000, "max": 4000}', 5),
('Technology', '{"conditional": "program_requires_technology"}', '{"min": 500, "max": 3000}', 6),
('Lab Fees', '{"applies_when": {"program_type": ["science", "engineering", "medical"]}}', '{"min": 200, "max": 2000}', 7);

-- Insert seed validation rules
INSERT INTO "validation_rules" ("id", "name", "category", "rule_expression", "error_message", "severity") VALUES
('age_dependency_consistency', 'Age vs Dependency Status Consistency', 'cross_field', 'age >= 24 AND fafsa_dependency_status = "dependent"', 'Students 24+ are typically considered independent for financial aid', 'warning'),
('international_residency_conflict', 'International Residency Conflict', 'cross_field', 'country != "United States" AND residency_status = "in_state"', 'International students cannot have in-state residency status', 'error'),
('tuition_reasonableness_community', 'Community College Tuition Range', 'sanity_check', 'school_type = "community_college" AND tuition_amount > 8000', 'Community college tuition above $8,000 is unusually high', 'warning'),
('pell_income_eligibility', 'Pell Grant Income Eligibility', 'business_rule', 'family_income_range LIKE "%150k%" AND pell_eligible = true', 'Pell Grant eligibility unlikely with family income over $150k', 'warning');

-- Insert seed cost calculation templates
INSERT INTO "cost_calculation_templates" ("id", "name", "applies_when", "base_calculations", "typical_ranges") VALUES
('community_college_2yr', 'Community College (2-year)', '{"school_type": "community_college", "education_level": "associates"}', '{"tuition_per_credit": 150, "fees": 500, "books": 1200}', '{"total_annual": {"min": 3000, "max": 8000}}'),
('public_in_state_4yr', 'Public University (In-State)', '{"school_type": "public", "residency_status": "in_state", "education_level": "undergraduate"}', '{"base_tuition": 12000, "fees": 1500}', '{"total_annual": {"min": 8000, "max": 25000}}'),
('public_out_state_4yr', 'Public University (Out-of-State)', '{"school_type": "public", "residency_status": "out_of_state", "education_level": "undergraduate"}', '{"base_tuition": 28000, "fees": 1500}', '{"total_annual": {"min": 20000, "max": 50000}}'),
('private_4yr', 'Private University', '{"school_type": "private", "education_level": "undergraduate"}', '{"base_tuition": 45000, "fees": 2000}', '{"total_annual": {"min": 30000, "max": 80000}}');

-- Insert seed AI decision trees
INSERT INTO "ai_decision_trees" ("id", "name", "root_question", "decision_nodes", "outcome_actions", "ai_prompt") VALUES
('tuition_calculation', 'Tuition Cost Calculation', 
'{"question": "What type of educational institution?", "field": "school_type"}',
'[{"condition": {"school_type": "community_college"}, "next": "credit_hours"}, {"condition": {"school_type": "public"}, "next": "residency_status"}]',
'[{"action": "calculate_tuition", "template": "community_college_2yr"}, {"action": "validate_range", "min": 2000, "max": 8000}]',
'Calculate tuition costs based on school type, residency, and education level. Always verify residency status for public schools.');