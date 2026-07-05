CREATE TABLE "aging_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"assessed_by" uuid NOT NULL,
	"assessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" varchar(20) DEFAULT 'ias_p_v2' NOT NULL,
	"parameters" jsonb NOT NULL,
	"domain_scores" jsonb NOT NULL,
	"raw_score" integer NOT NULL,
	"max_score" integer NOT NULL,
	"ias_percentage" numeric(5, 2) NOT NULL,
	"risk_band" varchar(30) NOT NULL,
	"recommended_pathway" varchar(50) NOT NULL,
	"clinician_pathway_override" varchar(50),
	"override_reason" text,
	"encounter_id" uuid,
	"proxy_relationship" varchar(50),
	"proxy_proximity" varchar(30),
	"visit_frequency" varchar(30),
	"parent_age" integer,
	"living_situation" varchar(30),
	"living_situation_other" varchar(100),
	"red_flags" jsonb DEFAULT '[]'::jsonb,
	"red_flag_count" integer DEFAULT 0,
	"red_flag_urgency" varchar(30),
	CONSTRAINT "aging_scores_risk_band_check" CHECK ("aging_scores"."risk_band" IN ('strong_independent', 'independent_vulnerable', 'supported_independence', 'limited_independence', 'high_dependence', 'low', 'moderate', 'high', 'critical'))
);
--> statement-breakpoint
CREATE TABLE "alert_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid,
	"parameter_type" varchar(50) NOT NULL,
	"condition" varchar(20) NOT NULL,
	"threshold_value" numeric(10, 2) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"created_by" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "alert_rules_condition_check" CHECK ("alert_rules"."condition" IN ('lt', 'gt', 'lte', 'gte')),
	CONSTRAINT "alert_rules_severity_check" CHECK ("alert_rules"."severity" IN ('info', 'warning', 'critical'))
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"alert_type" varchar(50) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"title" varchar(255) NOT NULL,
	"body" text,
	"source_entity_type" varchar(50),
	"source_entity_id" uuid,
	"deduplication_key" varchar(255),
	"triggered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"acknowledged_by" uuid,
	"acknowledged_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"auto_resolve" boolean DEFAULT false,
	CONSTRAINT "alerts_severity_check" CHECK ("alerts"."severity" IN ('info', 'warning', 'critical')),
	CONSTRAINT "alerts_status_check" CHECK ("alerts"."status" IN ('open', 'acknowledged', 'resolved'))
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"actor_role" varchar(50),
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid,
	"patient_id" uuid,
	"old_value" jsonb,
	"new_value" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "caregiver_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"relationship" varchar(50) NOT NULL,
	"access_scope" jsonb DEFAULT '[]'::jsonb,
	"granted_by" uuid NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"consent_documented" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"category" varchar(50) NOT NULL,
	"report_date" date,
	"storage_path" text NOT NULL,
	"file_size_bytes" bigint,
	"mime_type" varchar(100),
	"scan_status" varchar(20) DEFAULT 'pending',
	"uploaded_by" uuid NOT NULL,
	"encounter_id" uuid,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "encounter_cognitive" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" uuid NOT NULL,
	"cognitive_status" varchar(30) NOT NULL,
	"orientation_observed" varchar(30) NOT NULL,
	"consistency_with_previous" varchar(30) NOT NULL,
	"memory_concern_type" jsonb,
	"behaviour_changes" jsonb,
	"medication_management_ability" varchar(30),
	"capacity_concern" boolean,
	"carer_cognitive_report" varchar(30),
	"clinician_notes" text,
	"formal_screening_completed" boolean,
	"formal_screening_tool" varchar(20),
	"formal_screen_score" numeric(5, 1),
	"referral_cognitive" varchar(30),
	"cross_flag_cognitive_nutritional" boolean DEFAULT false,
	"cross_flag_cognitive_medicines" boolean DEFAULT false,
	CONSTRAINT "cog_status_check" CHECK ("encounter_cognitive"."cognitive_status" IN ('no_change', 'improved', 'possible_decline', 'clear_decline', 'unable_to_assess')),
	CONSTRAINT "cog_orient_check" CHECK ("encounter_cognitive"."orientation_observed" IN ('fully_oriented', 'minor_confusion', 'moderate_confusion', 'severely_disoriented')),
	CONSTRAINT "cog_consist_check" CHECK ("encounter_cognitive"."consistency_with_previous" IN ('consistent', 'minor_discrepancies', 'significant_discrepancies', 'first_visit'))
);
--> statement-breakpoint
CREATE TABLE "encounter_medical" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" uuid NOT NULL,
	"medications_status" varchar(30) NOT NULL,
	"vitals" jsonb,
	"chronic_condition_status" varchar(30) NOT NULL,
	"acute_concern_present" boolean NOT NULL,
	"medication_adherence" varchar(30),
	"side_effects" jsonb,
	"prescriber_review_needed" boolean,
	"pain_level" integer,
	"clinician_notes" text,
	"escalation_level" varchar(30),
	"referred_to" varchar(30),
	"referred_to_other" text,
	"referral_date" date,
	"referral_urgency" varchar(20),
	CONSTRAINT "med_status_check" CHECK ("encounter_medical"."medications_status" IN ('no_change', 'new_added', 'removed', 'dose_changed', 'concerns_flagged')),
	CONSTRAINT "med_chronic_check" CHECK ("encounter_medical"."chronic_condition_status" IN ('stable', 'deteriorating', 'improved', 'new_condition'))
);
--> statement-breakpoint
CREATE TABLE "encounter_mobility" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" uuid NOT NULL,
	"mobility_status" varchar(30) NOT NULL,
	"assistive_equipment" jsonb NOT NULL,
	"fall_in_last_period" varchar(10) NOT NULL,
	"fall_date" date,
	"gait_balance" varchar(30),
	"transfer_ability" varchar(30),
	"pain_on_movement" boolean,
	"pain_on_movement_location" text,
	"home_environment_risk" jsonb,
	"clinician_notes" text,
	"formal_assessment_needed" boolean,
	"formal_assessment_type" varchar(30),
	"referral_mobility" varchar(30),
	"urgent_mobility_concern" boolean,
	CONSTRAINT "mob_status_check" CHECK ("encounter_mobility"."mobility_status" IN ('no_change', 'improved', 'declined', 'first_visit')),
	CONSTRAINT "mob_fall_check" CHECK ("encounter_mobility"."fall_in_last_period" IN ('yes', 'no', 'unknown'))
);
--> statement-breakpoint
CREATE TABLE "encounter_nutritional" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" uuid NOT NULL,
	"nutritional_status" varchar(30) NOT NULL,
	"appetite_change" varchar(30) NOT NULL,
	"meal_preparation" varchar(30) NOT NULL,
	"weight_value" numeric(5, 1),
	"weight_source" varchar(20),
	"hydration_status" varchar(30),
	"dietary_restrictions" jsonb,
	"food_access" varchar(30),
	"supplements_in_use" varchar(500),
	"clinician_notes" text,
	"must_score" integer,
	"referral_nutritional" varchar(30),
	"cross_flag_cognitive_nutritional" boolean DEFAULT false,
	CONSTRAINT "nut_status_check" CHECK ("encounter_nutritional"."nutritional_status" IN ('no_change', 'concern_noted', 'improved', 'first_visit')),
	CONSTRAINT "nut_appetite_check" CHECK ("encounter_nutritional"."appetite_change" IN ('no_change', 'increased', 'decreased', 'very_poor', 'unable_to_assess')),
	CONSTRAINT "nut_meal_check" CHECK ("encounter_nutritional"."meal_preparation" IN ('independent', 'needs_prompting', 'needs_assistance', 'cannot_prepare'))
);
--> statement-breakpoint
CREATE TABLE "encounter_social" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" uuid NOT NULL,
	"social_status" varchar(30) NOT NULL,
	"meaningful_social_contact" varchar(30) NOT NULL,
	"living_situation" varchar(30) NOT NULL,
	"isolation_indicators" jsonb,
	"carer_family_involvement" varchar(30),
	"community_participation" varchar(30),
	"safeguarding_concern" boolean,
	"technology_access" jsonb,
	"clinician_notes" text,
	"safeguarding_level" varchar(30),
	"referral_social" varchar(50),
	CONSTRAINT "soc_status_check" CHECK ("encounter_social"."social_status" IN ('no_change', 'improved', 'declined', 'first_visit')),
	CONSTRAINT "soc_contact_check" CHECK ("encounter_social"."meaningful_social_contact" IN ('daily', 'several_times', 'once', 'none')),
	CONSTRAINT "soc_living_check" CHECK ("encounter_social"."living_situation" IN ('alone', 'with_spouse', 'with_family', 'shared_care_home', 'other'))
);
--> statement-breakpoint
CREATE TABLE "encounters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"encounter_date" timestamp with time zone NOT NULL,
	"encounter_type" varchar(30) NOT NULL,
	"clinician_id" uuid NOT NULL,
	"clinician_role" varchar(30) NOT NULL,
	"primary_reason" varchar(30) NOT NULL,
	"primary_reason_notes" text,
	"overall_clinical_impression" varchar(30) NOT NULL,
	"next_visit_date" date,
	"next_visit_frequency" varchar(20),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"amendment_of" uuid,
	"amendment_reason" text,
	"completed_at" timestamp with time zone,
	"completed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "encounters_type_check" CHECK ("encounters"."encounter_type" IN ('home_visit', 'telehealth', 'clinic', 'carer_report', 'emergency', 'review')),
	CONSTRAINT "encounters_role_check" CHECK ("encounters"."clinician_role" IN ('gp', 'nurse', 'carer', 'physiotherapist', 'ot', 'social_worker', 'other')),
	CONSTRAINT "encounters_reason_check" CHECK ("encounters"."primary_reason" IN ('medical', 'medicines_review', 'mobility', 'social', 'nutritional', 'cognitive', 'routine', 'emergency', 'other')),
	CONSTRAINT "encounters_impression_check" CHECK ("encounters"."overall_clinical_impression" IN ('stable', 'monitor_closely', 'action_required', 'urgent')),
	CONSTRAINT "encounters_status_check" CHECK ("encounters"."status" IN ('draft', 'completed', 'amended'))
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_user_id" uuid NOT NULL,
	"channel" varchar(20) NOT NULL,
	"type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'queued' NOT NULL,
	"payload" jsonb,
	"provider_message_id" varchar(255),
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"failed_reason" text,
	"related_alert_id" uuid,
	"related_task_id" uuid
);
--> statement-breakpoint
CREATE TABLE "otp_store" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"identifier_type" varchar(10) NOT NULL,
	"otp_hash" text NOT NULL,
	"purpose" varchar(30) DEFAULT 'login' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "otp_identifier_type_check" CHECK ("otp_store"."identifier_type" IN ('phone', 'email')),
	CONSTRAINT "otp_purpose_check" CHECK ("otp_store"."purpose" IN ('login', 'verify', 'reset'))
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"mrn" varchar(50) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"date_of_birth" date NOT NULL,
	"gender" varchar(20) NOT NULL,
	"blood_group" varchar(10),
	"primary_language" varchar(10) DEFAULT 'en',
	"address" jsonb,
	"medical_history" jsonb,
	"emergency_contact" jsonb,
	"current_care_pathway" varchar(50) DEFAULT 'home_care',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "patients_mrn_unique" UNIQUE("mrn")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"permissions" jsonb DEFAULT '[]'::jsonb,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_family_id" varchar(36) NOT NULL,
	"refresh_token_hash" text NOT NULL,
	"device_id" varchar(255),
	"ip_address" varchar(45),
	"user_agent" text,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"is_revoked" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(50) NOT NULL,
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"status" varchar(20) DEFAULT 'created' NOT NULL,
	"assigned_to" uuid,
	"assigned_role" varchar(50),
	"due_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"source_encounter_id" uuid,
	"source_alert_id" uuid,
	"completed_at" timestamp with time zone,
	"completed_by" uuid,
	"completion_note" text,
	"escalation_level" integer DEFAULT 0,
	"escalated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tasks_status_check" CHECK ("tasks"."status" IN ('created', 'assigned', 'in_progress', 'completed', 'escalated', 'cancelled')),
	CONSTRAINT "tasks_priority_check" CHECK ("tasks"."priority" IN ('low', 'medium', 'high', 'urgent')),
	CONSTRAINT "tasks_category_check" CHECK ("tasks"."category" IN ('medication', 'follow_up', 'lab', 'visit', 'equipment', 'other'))
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"assigned_by" uuid,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(15) NOT NULL,
	"email" varchar(255),
	"full_name" varchar(255) NOT NULL,
	"password_hash" text,
	"preferred_language" varchar(10) DEFAULT 'en',
	"avatar_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vitals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"encounter_id" uuid,
	"parameter_type" varchar(50) NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"unit" varchar(20) NOT NULL,
	"recorded_at" timestamp with time zone NOT NULL,
	"recorded_by" uuid NOT NULL,
	"device_id" uuid,
	"source" varchar(20) DEFAULT 'manual',
	"notes" text,
	"is_deleted" boolean DEFAULT false,
	CONSTRAINT "vitals_source_check" CHECK ("vitals"."source" IN ('manual', 'device', 'imported'))
);
--> statement-breakpoint
ALTER TABLE "aging_scores" ADD CONSTRAINT "aging_scores_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aging_scores" ADD CONSTRAINT "aging_scores_assessed_by_users_id_fk" FOREIGN KEY ("assessed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aging_scores" ADD CONSTRAINT "aging_scores_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_acknowledged_by_users_id_fk" FOREIGN KEY ("acknowledged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_links" ADD CONSTRAINT "caregiver_links_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_links" ADD CONSTRAINT "caregiver_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_links" ADD CONSTRAINT "caregiver_links_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_cognitive" ADD CONSTRAINT "encounter_cognitive_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_medical" ADD CONSTRAINT "encounter_medical_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_mobility" ADD CONSTRAINT "encounter_mobility_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_nutritional" ADD CONSTRAINT "encounter_nutritional_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_social" ADD CONSTRAINT "encounter_social_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_clinician_id_users_id_fk" FOREIGN KEY ("clinician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_user_id_users_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_source_encounter_id_encounters_id_fk" FOREIGN KEY ("source_encounter_id") REFERENCES "public"."encounters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "aging_scores_patient_time_idx" ON "aging_scores" USING btree ("patient_id","assessed_at");--> statement-breakpoint
CREATE INDEX "aging_scores_version_idx" ON "aging_scores" USING btree ("version");--> statement-breakpoint
CREATE INDEX "alert_rules_patient_param_idx" ON "alert_rules" USING btree ("patient_id","parameter_type");--> statement-breakpoint
CREATE INDEX "alerts_patient_status_idx" ON "alerts" USING btree ("patient_id","status");--> statement-breakpoint
CREATE INDEX "alerts_severity_status_idx" ON "alerts" USING btree ("severity","status");--> statement-breakpoint
CREATE INDEX "alerts_triggered_at_idx" ON "alerts" USING btree ("triggered_at");--> statement-breakpoint
CREATE INDEX "alerts_dedup_key_idx" ON "alerts" USING btree ("deduplication_key");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_time_idx" ON "audit_logs" USING btree ("actor_id","occurred_at");--> statement-breakpoint
CREATE INDEX "audit_logs_patient_time_idx" ON "audit_logs" USING btree ("patient_id","occurred_at");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "caregiver_links_patient_idx" ON "caregiver_links" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "caregiver_links_user_idx" ON "caregiver_links" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "documents_patient_category_idx" ON "documents" USING btree ("patient_id","category");--> statement-breakpoint
CREATE INDEX "documents_patient_date_idx" ON "documents" USING btree ("patient_id","report_date");--> statement-breakpoint
CREATE UNIQUE INDEX "enc_cognitive_encounter_idx" ON "encounter_cognitive" USING btree ("encounter_id");--> statement-breakpoint
CREATE UNIQUE INDEX "enc_medical_encounter_idx" ON "encounter_medical" USING btree ("encounter_id");--> statement-breakpoint
CREATE UNIQUE INDEX "enc_mobility_encounter_idx" ON "encounter_mobility" USING btree ("encounter_id");--> statement-breakpoint
CREATE UNIQUE INDEX "enc_nutritional_encounter_idx" ON "encounter_nutritional" USING btree ("encounter_id");--> statement-breakpoint
CREATE UNIQUE INDEX "enc_social_encounter_idx" ON "encounter_social" USING btree ("encounter_id");--> statement-breakpoint
CREATE INDEX "encounters_patient_date_idx" ON "encounters" USING btree ("patient_id","encounter_date");--> statement-breakpoint
CREATE INDEX "encounters_clinician_idx" ON "encounters" USING btree ("clinician_id");--> statement-breakpoint
CREATE INDEX "encounters_status_idx" ON "encounters" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notifications_recipient_idx" ON "notifications" USING btree ("recipient_user_id");--> statement-breakpoint
CREATE INDEX "notifications_status_idx" ON "notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "otp_store_identifier_type_idx" ON "otp_store" USING btree ("identifier","identifier_type");--> statement-breakpoint
CREATE INDEX "patients_care_pathway_idx" ON "patients" USING btree ("current_care_pathway");--> statement-breakpoint
CREATE INDEX "patients_created_by_idx" ON "patients" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_family_idx" ON "sessions" USING btree ("token_family_id");--> statement-breakpoint
CREATE INDEX "tasks_patient_idx" ON "tasks" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "tasks_assigned_status_idx" ON "tasks" USING btree ("assigned_to","status");--> statement-breakpoint
CREATE INDEX "tasks_due_status_idx" ON "tasks" USING btree ("due_at","status");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "user_roles_user_role_unique" ON "user_roles" USING btree ("user_id","role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_phone_unique" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "vitals_patient_param_time_idx" ON "vitals" USING btree ("patient_id","parameter_type","recorded_at");