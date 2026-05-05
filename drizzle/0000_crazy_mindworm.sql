CREATE TYPE "public"."category" AS ENUM('billing', 'technical', 'account', 'feature_request', 'other');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('P0', 'P1', 'P2', 'P3');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('new', 'triaged', 'awaiting_review', 'sent', 'closed');--> statement-breakpoint
CREATE TABLE "agents_action" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid,
	"tool_name" varchar(255) NOT NULL,
	"input" jsonb,
	"output" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid,
	"model" text NOT NULL,
	"prompt_hash" text NOT NULL,
	"input_tokens" integer NOT NULL,
	"output_tokens" integer NOT NULL,
	"cost_usd" numeric(10, 6),
	"latency_ms" integer NOT NULL,
	"response_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"customer_email" text NOT NULL,
	"status" "status" DEFAULT 'new' NOT NULL,
	"priority" "priority" DEFAULT 'P3' NOT NULL,
	"category" "category" DEFAULT 'other' NOT NULL,
	"sentiment" varchar(100),
	"draft_reply" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "agents_action" ADD CONSTRAINT "agents_action_run_id_ai_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."ai_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_runs" ADD CONSTRAINT "ai_runs_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;