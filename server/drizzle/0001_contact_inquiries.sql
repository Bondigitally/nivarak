CREATE TABLE "contact_inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" varchar(32) NOT NULL,
	"name" varchar(80) NOT NULL,
	"email" varchar(254) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"subject" varchar(120),
	"message" text NOT NULL,
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contact_inquiries_source_check" CHECK ("contact_inquiries"."source" IN ('contact_us', 'book_consultation')),
	CONSTRAINT "contact_inquiries_status_check" CHECK ("contact_inquiries"."status" IN ('new', 'reviewed', 'closed'))
);
--> statement-breakpoint
CREATE INDEX "contact_inquiries_created_at_idx" ON "contact_inquiries" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "contact_inquiries_source_idx" ON "contact_inquiries" USING btree ("source");
--> statement-breakpoint
CREATE INDEX "contact_inquiries_status_idx" ON "contact_inquiries" USING btree ("status");
