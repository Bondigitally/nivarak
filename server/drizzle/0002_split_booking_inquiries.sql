-- Separate book-consultation leads from contact-us inquiries so a future
-- slot-based booking modal can grow without mixing marketing contact traffic.

CREATE TABLE IF NOT EXISTS "booking_inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(80) NOT NULL,
	"email" varchar(254) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"message" text NOT NULL,
	"preferred_slot_start" timestamp with time zone,
	"preferred_slot_end" timestamp with time zone,
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "booking_inquiries_status_check" CHECK ("booking_inquiries"."status" IN ('new', 'reviewed', 'scheduled', 'closed'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "booking_inquiries_created_at_idx" ON "booking_inquiries" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "booking_inquiries_status_idx" ON "booking_inquiries" USING btree ("status");
--> statement-breakpoint
INSERT INTO "booking_inquiries" ("id", "name", "email", "phone", "message", "status", "created_at")
SELECT "id", "name", "email", "phone", "message", "status", "created_at"
FROM "contact_inquiries"
WHERE "source" = 'book_consultation'
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
DELETE FROM "contact_inquiries" WHERE "source" = 'book_consultation';
--> statement-breakpoint
DROP INDEX IF EXISTS "contact_inquiries_source_idx";
--> statement-breakpoint
ALTER TABLE "contact_inquiries" DROP CONSTRAINT IF EXISTS "contact_inquiries_source_check";
--> statement-breakpoint
ALTER TABLE "contact_inquiries" DROP COLUMN IF EXISTS "source";
