CREATE TABLE "dlqJobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"job_id" text NOT NULL,
	"error_message" text NOT NULL,
	"failed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "updated_at" SET NOT NULL;