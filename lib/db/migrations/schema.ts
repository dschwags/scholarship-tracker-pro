import { pgTable, serial, integer, varchar, numeric, jsonb, timestamp, boolean, text, unique, date, uuid, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const applicationStatus = pgEnum("application_status", ['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'waitlisted'])
export const calculationMethod = pgEnum("calculation_method", ['template_based', 'manual_entry', 'ai_assisted', 'imported'])
export const dependencyStatus = pgEnum("dependency_status", ['dependent', 'independent', 'unknown', 'provisional'])
export const educationLevel = pgEnum("education_level", ['high_school', 'undergraduate', 'graduate', 'doctoral', 'post_doctoral'])
export const enrollmentStatus = pgEnum("enrollment_status", ['full_time', 'part_time', 'half_time', 'less_than_half_time'])
export const fundingResponsibility = pgEnum("funding_responsibility", ['self', 'family', 'mixed', 'employer', 'military'])
export const goalType = pgEnum("goal_type", ['education', 'living', 'emergency', 'career', 'research', 'travel'])
export const notificationType = pgEnum("notification_type", ['deadline_reminder', 'status_update', 'new_scholarship', 'system_alert'])
export const priority = pgEnum("priority", ['low', 'medium', 'high', 'critical'])
export const requirementType = pgEnum("requirement_type", ['essay', 'transcript', 'recommendation_letter', 'financial_document', 'portfolio', 'test_score', 'other'])
export const residencyStatus = pgEnum("residency_status", ['in_state', 'out_of_state', 'international', 'establishing_residency'])
export const scholarshipStatus = pgEnum("scholarship_status", ['active', 'expired', 'upcoming', 'closed'])
export const schoolType = pgEnum("school_type", ['public', 'private', 'community_college', 'trade_school', 'online', 'hybrid'])
export const status = pgEnum("status", ['active', 'completed', 'paused', 'cancelled', 'under_review'])
export const userRole = pgEnum("user_role", ['student', 'parent', 'counselor', 'admin'])


export const goalFundingSources = pgTable("goal_funding_sources", {
	id: serial().primaryKey().notNull(),
	goalId: integer("goal_id").notNull(),
	sourceName: varchar("source_name", { length: 200 }).notNull(),
	sourceType: varchar("source_type", { length: 50 }).notNull(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	probabilityPercentage: integer("probability_percentage").default(50),
	eligibilityCriteria: jsonb("eligibility_criteria").default({}),
	deadline: timestamp({ mode: 'string' }),
	renewable: boolean().default(false),
	renewalConditions: jsonb("renewal_conditions").default({}),
	applicationStatus: varchar("application_status", { length: 30 }).default('not_applied'),
	confirmedAmount: numeric("confirmed_amount", { precision: 12, scale:  2 }).default('0'),
	confidenceScore: numeric("confidence_score", { precision: 3, scale:  2 }).default('0.5'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const goalProgress = pgTable("goal_progress", {
	id: serial().primaryKey().notNull(),
	goalId: integer("goal_id").notNull(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	progressType: varchar("progress_type", { length: 30 }).notNull(),
	description: text(),
	triggeredBy: varchar("triggered_by", { length: 50 }),
	milestoneConditions: jsonb("milestone_conditions"),
	recordedAt: timestamp("recorded_at", { mode: 'string' }).defaultNow(),
	recordedBy: integer("recorded_by"),
});

export const validationRules = pgTable("validation_rules", {
	id: varchar({ length: 100 }).primaryKey().notNull(),
	name: varchar({ length: 200 }).notNull(),
	category: varchar({ length: 50 }),
	ruleExpression: text("rule_expression").notNull(),
	errorMessage: text("error_message").notNull(),
	severity: varchar({ length: 20 }).default('error'),
	aiDetectionPrompt: text("ai_detection_prompt"),
	aiResolutionPrompt: text("ai_resolution_prompt"),
	fallbackAction: varchar("fallback_action", { length: 50 }),
	appliesToFields: text("applies_to_fields").array(),
	requiresFields: text("requires_fields").array(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }),
	email: varchar({ length: 255 }).notNull(),
	passwordHash: text("password_hash").notNull(),
	role: userRole().default('student').notNull(),
	profilePicture: text("profile_picture"),
	phone: varchar({ length: 20 }),
	dateOfBirth: date("date_of_birth"),
	address: text(),
	city: varchar({ length: 100 }),
	state: varchar({ length: 50 }),
	zipCode: varchar("zip_code", { length: 10 }),
	country: varchar({ length: 100 }).default('United States'),
	educationLevel: educationLevel("education_level"),
	gpa: numeric({ precision: 3, scale:  2 }),
	graduationYear: integer("graduation_year"),
	school: varchar({ length: 200 }),
	major: varchar({ length: 100 }),
	isActive: boolean("is_active").default(true),
	emailVerified: boolean("email_verified").default(false),
	preferences: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	resetToken: text("reset_token"),
	resetTokenExpiry: timestamp("reset_token_expiry", { mode: 'string' }),
	educationalStatus: varchar("educational_status", { length: 50 }),
	educationalDescription: text("educational_description"),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const activityLogs = pgTable("activity_logs", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	action: text().notNull(),
	entityType: varchar("entity_type", { length: 50 }),
	entityId: integer("entity_id"),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
	metadata: jsonb(),
});

export const applications = pgTable("applications", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	scholarshipId: integer("scholarship_id").notNull(),
	status: applicationStatus().default('draft').notNull(),
	submittedAt: timestamp("submitted_at", { mode: 'string' }),
	statusUpdatedAt: timestamp("status_updated_at", { mode: 'string' }),
	decisionDate: timestamp("decision_date", { mode: 'string' }),
	awardAmount: numeric("award_amount", { precision: 12, scale:  2 }),
	notes: text(),
	applicationData: jsonb("application_data"),
	rejectionReason: text("rejection_reason"),
	isArchived: boolean("is_archived").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const applicationRequirements = pgTable("application_requirements", {
	id: serial().primaryKey().notNull(),
	applicationId: integer("application_id").notNull(),
	requirementId: integer("requirement_id").notNull(),
	isCompleted: boolean("is_completed").default(false),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	fileLinks: jsonb("file_links"),
	textResponse: text("text_response"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const requirements = pgTable("requirements", {
	id: serial().primaryKey().notNull(),
	scholarshipId: integer("scholarship_id").notNull(),
	type: requirementType().notNull(),
	title: varchar({ length: 150 }).notNull(),
	description: text().notNull(),
	isRequired: boolean("is_required").default(true),
	maxFileSize: integer("max_file_size"),
	acceptedFileTypes: jsonb("accepted_file_types"),
	wordLimit: integer("word_limit"),
	instructions: text(),
	order: integer().default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const scholarships = pgTable("scholarships", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 200 }).notNull(),
	description: text().notNull(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	currency: varchar({ length: 3 }).default('USD'),
	provider: varchar({ length: 150 }).notNull(),
	providerWebsite: text("provider_website"),
	eligibilityRequirements: text("eligibility_requirements").notNull(),
	applicationDeadline: timestamp("application_deadline", { mode: 'string' }).notNull(),
	awardDate: timestamp("award_date", { mode: 'string' }),
	educationLevel: educationLevel("education_level").notNull(),
	fieldOfStudy: varchar("field_of_study", { length: 100 }),
	gpaRequirement: numeric("gpa_requirement", { precision: 3, scale:  2 }),
	residencyRequirements: text("residency_requirements"),
	demographicRequirements: text("demographic_requirements"),
	status: scholarshipStatus().default('active').notNull(),
	isRenewable: boolean("is_renewable").default(false),
	renewalRequirements: text("renewal_requirements"),
	applicationInstructions: text("application_instructions"),
	contactEmail: varchar("contact_email", { length: 255 }),
	contactPhone: varchar("contact_phone", { length: 20 }),
	tags: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: integer("created_by"),
});

export const fileLinks = pgTable("file_links", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	applicationId: integer("application_id"),
	requirementId: integer("requirement_id"),
	fileName: varchar("file_name", { length: 255 }).notNull(),
	fileType: varchar("file_type", { length: 50 }),
	fileSize: integer("file_size"),
	externalUrl: text("external_url").notNull(),
	provider: varchar({ length: 50 }),
	providerFileId: text("provider_file_id"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	type: notificationType().notNull(),
	title: varchar({ length: 150 }).notNull(),
	message: text().notNull(),
	actionUrl: text("action_url"),
	isRead: boolean("is_read").default(false),
	readAt: timestamp("read_at", { mode: 'string' }),
	scheduledFor: timestamp("scheduled_for", { mode: 'string' }),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const savedScholarships = pgTable("saved_scholarships", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	scholarshipId: integer("scholarship_id").notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const userConnections = pgTable("user_connections", {
	id: serial().primaryKey().notNull(),
	parentUserId: integer("parent_user_id").notNull(),
	childUserId: integer("child_user_id").notNull(),
	connectionType: varchar("connection_type", { length: 20 }).notNull(),
	isActive: boolean("is_active").default(true),
	permissions: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const financialGoals = pgTable("financial_goals", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	title: varchar({ length: 200 }).notNull(),
	description: text(),
	goalType: goalType("goal_type").default('education').notNull(),
	targetAmount: numeric("target_amount", { precision: 12, scale:  2 }).notNull(),
	currentAmount: numeric("current_amount", { precision: 12, scale:  2 }).default('0'),
	deadline: timestamp({ mode: 'string' }),
	priority: priority().default('medium'),
	status: status().default('active'),
	createdViaTemplate: varchar("created_via_template", { length: 50 }),
	calculationMethod: calculationMethod("calculation_method").default('manual_entry'),
	aiConfidenceScore: numeric("ai_confidence_score", { precision: 3, scale:  2 }).default('0'),
	needsHumanReview: boolean("needs_human_review").default(false),
	targetState: varchar("target_state", { length: 100 }),
	targetCountry: varchar("target_country", { length: 100 }).default('United States'),
	residencyStatus: residencyStatus("residency_status"),
	residencyTimeline: varchar("residency_timeline", { length: 50 }),
	educationLevel: varchar("education_level", { length: 50 }),
	schoolType: schoolType("school_type"),
	programType: varchar("program_type", { length: 50 }),
	creditHoursPerTerm: integer("credit_hours_per_term"),
	termsPerYear: integer("terms_per_year").default(2),
	programDurationYears: numeric("program_duration_years", { precision: 3, scale:  1 }),
	estimatedEfc: integer("estimated_efc"),
	pellEligible: boolean("pell_eligible").default(false),
	stateAidEligible: boolean("state_aid_eligible").default(false),
	familyIncomeRange: varchar("family_income_range", { length: 50 }),
	plannedStartDate: date("planned_start_date"),
	plannedEndDate: date("planned_end_date"),
	academicYear: varchar("academic_year", { length: 20 }),
	lastValidated: timestamp("last_validated", { mode: 'string' }).defaultNow(),
	validationWarnings: jsonb("validation_warnings").default([]),
	crossFieldIssues: jsonb("cross_field_issues").default([]),
	sanityCheckResults: jsonb("sanity_check_results").default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const costCalculationTemplates = pgTable("cost_calculation_templates", {
	id: varchar({ length: 100 }).primaryKey().notNull(),
	name: varchar({ length: 200 }).notNull(),
	description: text(),
	appliesWhen: jsonb("applies_when").notNull(),
	geographicScope: text("geographic_scope").array(),
	educationLevels: text("education_levels").array(),
	schoolTypes: text("school_types").array(),
	baseCalculations: jsonb("base_calculations").notNull(),
	conditionalAdditions: jsonb("conditional_additions").default([]),
	discountRules: jsonb("discount_rules").default([]),
	aiSelectionRules: text("ai_selection_rules"),
	validationPrompts: text("validation_prompts").array(),
	commonErrors: text("common_errors").array(),
	typicalRanges: jsonb("typical_ranges").notNull(),
	warningThresholds: jsonb("warning_thresholds"),
	lastUpdated: timestamp("last_updated", { mode: 'string' }).defaultNow(),
	isActive: boolean("is_active").default(true),
});

export const goalCategories = pgTable("goal_categories", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	parentCategoryId: integer("parent_category_id"),
	conditionalRules: jsonb("conditional_rules").default({}),
	requiredFields: jsonb("required_fields").default([]),
	calculationFormula: text("calculation_formula"),
	minAmount: numeric("min_amount", { precision: 12, scale:  2 }),
	maxAmount: numeric("max_amount", { precision: 12, scale:  2 }),
	typicalRange: jsonb("typical_range"),
	isActive: boolean("is_active").default(true),
	displayOrder: integer("display_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const goalExpenses = pgTable("goal_expenses", {
	id: serial().primaryKey().notNull(),
	goalId: integer("goal_id").notNull(),
	categoryId: integer("category_id"),
	name: varchar({ length: 200 }).notNull(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	isEstimated: boolean("is_estimated").default(true),
	frequency: varchar({ length: 20 }).default('one_time'),
	appliesIfConditions: jsonb("applies_if_conditions").default({}),
	calculationBase: varchar("calculation_base", { length: 50 }),
	creditHours: integer("credit_hours"),
	semesterCount: integer("semester_count"),
	locationDependent: boolean("location_dependent").default(false),
	baseLocation: varchar("base_location", { length: 100 }),
	confidenceLevel: numeric("confidence_level", { precision: 3, scale:  2 }).default('0.5'),
	dataSource: varchar("data_source", { length: 100 }),
	lastUpdated: timestamp("last_updated", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const aiFormContexts = pgTable("ai_form_contexts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	sessionId: varchar("session_id", { length: 100 }),
	currentPhase: varchar("current_phase", { length: 50 }),
	completedSections: text("completed_sections").array(),
	visibleFields: text("visible_fields").array(),
	inferredData: jsonb("inferred_data").default({}),
	confidenceScores: jsonb("confidence_scores").default({}),
	uncertaintyFlags: jsonb("uncertainty_flags").default([]),
	pendingActions: jsonb("pending_actions").default([]),
	validationResults: jsonb("validation_results").default({}),
	detectedConflicts: jsonb("detected_conflicts").default([]),
	resolutionAttempts: integer("resolution_attempts").default(0),
	needsManualIntervention: boolean("needs_manual_intervention").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).defaultNow(),
});

export const aiDecisionTrees = pgTable("ai_decision_trees", {
	id: varchar({ length: 100 }).primaryKey().notNull(),
	name: varchar({ length: 200 }).notNull(),
	description: text(),
	version: varchar({ length: 20 }).default('1.0'),
	rootQuestion: jsonb("root_question").notNull(),
	decisionNodes: jsonb("decision_nodes").notNull(),
	outcomeActions: jsonb("outcome_actions").notNull(),
	aiPrompt: text("ai_prompt").notNull(),
	criticalRules: text("critical_rules").array(),
	commonMistakes: text("common_mistakes").array(),
	fallbackStrategy: text("fallback_strategy"),
	inputValidation: jsonb("input_validation"),
	outputValidation: jsonb("output_validation"),
	sanityChecks: jsonb("sanity_checks"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});
