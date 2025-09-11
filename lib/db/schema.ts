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
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['student', 'parent', 'counselor', 'admin']);
export const applicationStatusEnum = pgEnum('application_status', ['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'waitlisted']);
export const scholarshipStatusEnum = pgEnum('scholarship_status', ['active', 'expired', 'upcoming', 'closed']);
export const requirementTypeEnum = pgEnum('requirement_type', ['essay', 'transcript', 'recommendation_letter', 'financial_document', 'portfolio', 'test_score', 'other']);
export const educationLevelEnum = pgEnum('education_level', ['high_school', 'undergraduate', 'graduate', 'doctoral', 'post_doctoral']);
export const notificationTypeEnum = pgEnum('notification_type', ['deadline_reminder', 'status_update', 'new_scholarship', 'system_alert']);

// Core Users Table (Extended from original)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('student'),
  profilePicture: text('profile_picture'),
  phone: varchar('phone', { length: 20 }),
  dateOfBirth: date('date_of_birth'),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zipCode: varchar('zip_code', { length: 10 }),
  country: varchar('country', { length: 100 }).default('United States'),
  educationLevel: educationLevelEnum('education_level'),
  educationalStatus: varchar('educational_status', { length: 50 }),
  educationalDescription: text('educational_description'),
  gpa: decimal('gpa', { precision: 3, scale: 2 }),
  graduationYear: integer('graduation_year'),
  school: varchar('school', { length: 200 }),
  major: varchar('major', { length: 100 }),
  isActive: boolean('is_active').default(true),
  emailVerified: boolean('email_verified').default(false),
  preferences: jsonb('preferences'), // JSON for user preferences
  resetToken: text('reset_token'), // Password reset token
  resetTokenExpiry: timestamp('reset_token_expiry'), // Reset token expiry
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// Scholarships Table
export const scholarships = pgTable('scholarships', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  provider: varchar('provider', { length: 150 }).notNull(),
  providerWebsite: text('provider_website'),
  eligibilityRequirements: text('eligibility_requirements').notNull(),
  applicationDeadline: timestamp('application_deadline').notNull(),
  awardDate: timestamp('award_date'),
  educationLevel: educationLevelEnum('education_level').notNull(),
  fieldOfStudy: varchar('field_of_study', { length: 100 }),
  gpaRequirement: decimal('gpa_requirement', { precision: 3, scale: 2 }),
  residencyRequirements: text('residency_requirements'),
  demographicRequirements: text('demographic_requirements'),
  status: scholarshipStatusEnum('status').notNull().default('active'),
  isRenewable: boolean('is_renewable').default(false),
  renewalRequirements: text('renewal_requirements'),
  applicationInstructions: text('application_instructions'),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 20 }),
  tags: jsonb('tags'), // Array of tags for categorization
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  createdBy: integer('created_by').references(() => users.id),
});

// Applications Table
export const applications = pgTable('applications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  scholarshipId: integer('scholarship_id').notNull().references(() => scholarships.id),
  status: applicationStatusEnum('status').notNull().default('draft'),
  submittedAt: timestamp('submitted_at'),
  statusUpdatedAt: timestamp('status_updated_at'),
  decisionDate: timestamp('decision_date'),
  awardAmount: decimal('award_amount', { precision: 12, scale: 2 }),
  notes: text('notes'),
  applicationData: jsonb('application_data'), // Store form responses
  rejectionReason: text('rejection_reason'),
  isArchived: boolean('is_archived').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Requirements Table
export const requirements = pgTable('requirements', {
  id: serial('id').primaryKey(),
  scholarshipId: integer('scholarship_id').notNull().references(() => scholarships.id),
  type: requirementTypeEnum('type').notNull(),
  title: varchar('title', { length: 150 }).notNull(),
  description: text('description').notNull(),
  isRequired: boolean('is_required').default(true),
  maxFileSize: integer('max_file_size'), // in MB
  acceptedFileTypes: jsonb('accepted_file_types'), // Array of file extensions
  wordLimit: integer('word_limit'),
  instructions: text('instructions'),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Application Requirements (Junction table for tracking completion)
export const applicationRequirements = pgTable('application_requirements', {
  id: serial('id').primaryKey(),
  applicationId: integer('application_id').notNull().references(() => applications.id),
  requirementId: integer('requirement_id').notNull().references(() => requirements.id),
  isCompleted: boolean('is_completed').default(false),
  completedAt: timestamp('completed_at'),
  fileLinks: jsonb('file_links'), // Array of external file links
  textResponse: text('text_response'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// User Connections (Parent-Child, Counselor-Student relationships)
export const userConnections = pgTable('user_connections', {
  id: serial('id').primaryKey(),
  parentUserId: integer('parent_user_id').notNull().references(() => users.id),
  childUserId: integer('child_user_id').notNull().references(() => users.id),
  connectionType: varchar('connection_type', { length: 20 }).notNull(), // 'parent', 'counselor'
  isActive: boolean('is_active').default(true),
  permissions: jsonb('permissions'), // What the parent/counselor can see/do
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Notifications Table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 150 }).notNull(),
  message: text('message').notNull(),
  actionUrl: text('action_url'),
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  scheduledFor: timestamp('scheduled_for'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Activity Logs (Enhanced)
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  action: text('action').notNull(),
  entityType: varchar('entity_type', { length: 50 }), // 'scholarship', 'application', 'user', etc.
  entityId: integer('entity_id'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  metadata: jsonb('metadata'), // JSON field for additional data
});

// External File Links
export const fileLinks = pgTable('file_links', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  applicationId: integer('application_id').references(() => applications.id),
  requirementId: integer('requirement_id').references(() => requirements.id),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileType: varchar('file_type', { length: 50 }),
  fileSize: integer('file_size'), // in bytes
  externalUrl: text('external_url').notNull(),
  provider: varchar('provider', { length: 50 }), // 'google_drive', 'onedrive', 'dropbox', etc.
  providerFileId: text('provider_file_id'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// User Saved Scholarships (Wishlist/Bookmarks)
export const savedScholarships = pgTable('saved_scholarships', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  scholarshipId: integer('scholarship_id').notNull().references(() => scholarships.id),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  applications: many(applications),
  activityLogs: many(activityLogs),
  notifications: many(notifications),
  fileLinks: many(fileLinks),
  savedScholarships: many(savedScholarships),
  parentConnections: many(userConnections, { relationName: 'parentConnection' }),
  childConnections: many(userConnections, { relationName: 'childConnection' }),
}));

export const scholarshipsRelations = relations(scholarships, ({ many, one }) => ({
  applications: many(applications),
  requirements: many(requirements),
  savedBy: many(savedScholarships),
  createdBy: one(users, {
    fields: [scholarships.createdBy],
    references: [users.id],
  }),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
  scholarship: one(scholarships, {
    fields: [applications.scholarshipId],
    references: [scholarships.id],
  }),
  applicationRequirements: many(applicationRequirements),
  fileLinks: many(fileLinks),
}));

export const requirementsRelations = relations(requirements, ({ one, many }) => ({
  scholarship: one(scholarships, {
    fields: [requirements.scholarshipId],
    references: [scholarships.id],
  }),
  applicationRequirements: many(applicationRequirements),
  fileLinks: many(fileLinks),
}));

export const applicationRequirementsRelations = relations(applicationRequirements, ({ one }) => ({
  application: one(applications, {
    fields: [applicationRequirements.applicationId],
    references: [applications.id],
  }),
  requirement: one(requirements, {
    fields: [applicationRequirements.requirementId],
    references: [requirements.id],
  }),
}));

export const userConnectionsRelations = relations(userConnections, ({ one }) => ({
  parentUser: one(users, {
    fields: [userConnections.parentUserId],
    references: [users.id],
    relationName: 'parentConnection',
  }),
  childUser: one(users, {
    fields: [userConnections.childUserId],
    references: [users.id],
    relationName: 'childConnection',
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const fileLinksRelations = relations(fileLinks, ({ one }) => ({
  user: one(users, {
    fields: [fileLinks.userId],
    references: [users.id],
  }),
  application: one(applications, {
    fields: [fileLinks.applicationId],
    references: [applications.id],
  }),
  requirement: one(requirements, {
    fields: [fileLinks.requirementId],
    references: [requirements.id],
  }),
}));

export const savedScholarshipsRelations = relations(savedScholarships, ({ one }) => ({
  user: one(users, {
    fields: [savedScholarships.userId],
    references: [users.id],
  }),
  scholarship: one(scholarships, {
    fields: [savedScholarships.scholarshipId],
    references: [scholarships.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Scholarship = typeof scholarships.$inferSelect;
export type NewScholarship = typeof scholarships.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type Requirement = typeof requirements.$inferSelect;
export type NewRequirement = typeof requirements.$inferInsert;
export type ApplicationRequirement = typeof applicationRequirements.$inferSelect;
export type NewApplicationRequirement = typeof applicationRequirements.$inferInsert;
export type UserConnection = typeof userConnections.$inferSelect;
export type NewUserConnection = typeof userConnections.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type FileLink = typeof fileLinks.$inferSelect;
export type NewFileLink = typeof fileLinks.$inferInsert;
export type SavedScholarship = typeof savedScholarships.$inferSelect;
export type NewSavedScholarship = typeof savedScholarships.$inferInsert;

// Activity Types
export enum ActivityType {
  // User Activities
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  
  // Scholarship Activities
  SCHOLARSHIP_VIEWED = 'SCHOLARSHIP_VIEWED',
  SCHOLARSHIP_SAVED = 'SCHOLARSHIP_SAVED',
  SCHOLARSHIP_UNSAVED = 'SCHOLARSHIP_UNSAVED',
  SCHOLARSHIP_SEARCHED = 'SCHOLARSHIP_SEARCHED',
  
  // Application Activities
  APPLICATION_CREATED = 'APPLICATION_CREATED',
  APPLICATION_UPDATED = 'APPLICATION_UPDATED',
  APPLICATION_SUBMITTED = 'APPLICATION_SUBMITTED',
  APPLICATION_DELETED = 'APPLICATION_DELETED',
  APPLICATION_STATUS_CHANGED = 'APPLICATION_STATUS_CHANGED',
  
  // Requirement Activities
  REQUIREMENT_COMPLETED = 'REQUIREMENT_COMPLETED',
  REQUIREMENT_UPDATED = 'REQUIREMENT_UPDATED',
  FILE_UPLOADED = 'FILE_UPLOADED',
  FILE_DELETED = 'FILE_DELETED',
  
  // System Activities
  NOTIFICATION_SENT = 'NOTIFICATION_SENT',
  EXPORT_GENERATED = 'EXPORT_GENERATED',
  DATA_IMPORTED = 'DATA_IMPORTED',
}