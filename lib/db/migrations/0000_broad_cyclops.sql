CREATE TYPE "public"."application_status" AS ENUM('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'waitlisted');--> statement-breakpoint
CREATE TYPE "public"."education_level" AS ENUM('high_school', 'undergraduate', 'graduate', 'doctoral', 'post_doctoral');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('deadline_reminder', 'status_update', 'new_scholarship', 'system_alert');--> statement-breakpoint
CREATE TYPE "public"."requirement_type" AS ENUM('essay', 'transcript', 'recommendation_letter', 'financial_document', 'portfolio', 'test_score', 'other');--> statement-breakpoint
CREATE TYPE "public"."scholarship_status" AS ENUM('active', 'expired', 'upcoming', 'closed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('student', 'parent', 'counselor', 'admin');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"action" text NOT NULL,
	"entity_type" varchar(50),
	"entity_id" integer,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "application_requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"requirement_id" integer NOT NULL,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"file_links" jsonb,
	"text_response" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"scholarship_id" integer NOT NULL,
	"status" "application_status" DEFAULT 'draft' NOT NULL,
	"submitted_at" timestamp,
	"status_updated_at" timestamp,
	"decision_date" timestamp,
	"award_amount" numeric(12, 2),
	"notes" text,
	"application_data" jsonb,
	"rejection_reason" text,
	"is_archived" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"application_id" integer,
	"requirement_id" integer,
	"file_name" varchar(255) NOT NULL,
	"file_type" varchar(50),
	"file_size" integer,
	"external_url" text NOT NULL,
	"provider" varchar(50),
	"provider_file_id" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(150) NOT NULL,
	"message" text NOT NULL,
	"action_url" text,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"scheduled_for" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"scholarship_id" integer NOT NULL,
	"type" "requirement_type" NOT NULL,
	"title" varchar(150) NOT NULL,
	"description" text NOT NULL,
	"is_required" boolean DEFAULT true,
	"max_file_size" integer,
	"accepted_file_types" jsonb,
	"word_limit" integer,
	"instructions" text,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_scholarships" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"scholarship_id" integer NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scholarships" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"provider" varchar(150) NOT NULL,
	"provider_website" text,
	"eligibility_requirements" text NOT NULL,
	"application_deadline" timestamp NOT NULL,
	"award_date" timestamp,
	"education_level" "education_level" NOT NULL,
	"field_of_study" varchar(100),
	"gpa_requirement" numeric(3, 2),
	"residency_requirements" text,
	"demographic_requirements" text,
	"status" "scholarship_status" DEFAULT 'active' NOT NULL,
	"is_renewable" boolean DEFAULT false,
	"renewal_requirements" text,
	"application_instructions" text,
	"contact_email" varchar(255),
	"contact_phone" varchar(20),
	"tags" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer
);
--> statement-breakpoint
CREATE TABLE "user_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_user_id" integer NOT NULL,
	"child_user_id" integer NOT NULL,
	"connection_type" varchar(20) NOT NULL,
	"is_active" boolean DEFAULT true,
	"permissions" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100),
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'student' NOT NULL,
	"profile_picture" text,
	"phone" varchar(20),
	"date_of_birth" date,
	"address" text,
	"city" varchar(100),
	"state" varchar(50),
	"zip_code" varchar(10),
	"country" varchar(100) DEFAULT 'United States',
	"education_level" "education_level",
	"gpa" numeric(3, 2),
	"graduation_year" integer,
	"school" varchar(200),
	"major" varchar(100),
	"is_active" boolean DEFAULT true,
	"email_verified" boolean DEFAULT false,
	"preferences" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_requirements" ADD CONSTRAINT "application_requirements_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_requirements" ADD CONSTRAINT "application_requirements_requirement_id_requirements_id_fk" FOREIGN KEY ("requirement_id") REFERENCES "public"."requirements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_scholarship_id_scholarships_id_fk" FOREIGN KEY ("scholarship_id") REFERENCES "public"."scholarships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_links" ADD CONSTRAINT "file_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_links" ADD CONSTRAINT "file_links_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_links" ADD CONSTRAINT "file_links_requirement_id_requirements_id_fk" FOREIGN KEY ("requirement_id") REFERENCES "public"."requirements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_scholarship_id_scholarships_id_fk" FOREIGN KEY ("scholarship_id") REFERENCES "public"."scholarships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_scholarships" ADD CONSTRAINT "saved_scholarships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_scholarships" ADD CONSTRAINT "saved_scholarships_scholarship_id_scholarships_id_fk" FOREIGN KEY ("scholarship_id") REFERENCES "public"."scholarships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scholarships" ADD CONSTRAINT "scholarships_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_connections" ADD CONSTRAINT "user_connections_parent_user_id_users_id_fk" FOREIGN KEY ("parent_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_connections" ADD CONSTRAINT "user_connections_child_user_id_users_id_fk" FOREIGN KEY ("child_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;