import { pgTable, uuid, text, timestamp, foreignKey, integer, numeric, jsonb, varchar, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const category = pgEnum("category", ['billing', 'technical', 'account', 'feature_request', 'other'])
export const priority = pgEnum("priority", ['P0', 'P1', 'P2', 'P3'])
export const status = pgEnum("status", ['new', 'triaged', 'awaiting_review', 'sent', 'closed'])


export const dlqJobs = pgTable("dlqJobs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	ticketId: uuid("ticket_id").notNull(),
	jobId: text("job_id").notNull(),
	errorMessage: text("error_message").notNull(),
	failedAt: timestamp("failed_at", { mode: 'string' }).defaultNow().notNull(),
});

export const aiRuns = pgTable("ai_runs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	ticketId: uuid("ticket_id"),
	model: text().notNull(),
	promptHash: text("prompt_hash").notNull(),
	inputTokens: integer("input_tokens").notNull(),
	outputTokens: integer("output_tokens").notNull(),
	costUsd: numeric("cost_usd", { precision: 10, scale:  6 }),
	latencyMs: integer("latency_ms").notNull(),
	responseJson: jsonb("response_json"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.ticketId],
			foreignColumns: [tickets.id],
			name: "ai_runs_ticket_id_tickets_id_fk"
		}).onDelete("cascade"),
]);

export const agentsAction = pgTable("agents_action", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	runId: uuid("run_id"),
	toolName: varchar("tool_name", { length: 255 }).notNull(),
	input: jsonb(),
	output: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.runId],
			foreignColumns: [aiRuns.id],
			name: "agents_action_run_id_ai_runs_id_fk"
		}).onDelete("cascade"),
]);

export const tickets = pgTable("tickets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	subject: varchar({ length: 255 }).notNull(),
	body: text().notNull(),
	customerEmail: text("customer_email").notNull(),
	status: status().default('new').notNull(),
	priority: priority().default('P3').notNull(),
	category: category().default('other').notNull(),
	sentiment: varchar({ length: 100 }),
	draftReply: text("draft_reply"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});
