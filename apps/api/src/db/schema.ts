import { pgTable, text, integer, timestamp, jsonb, uuid, pgEnum, varchar, numeric } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum('status', ["new", "triaged", "awaiting_review", "sent", "closed"]);
export const priorityEnum = pgEnum('priority', ["P0", "P1", "P2", "P3"]);
export const categoryEnum = pgEnum("category", ["billing", "technical", "account", "feature_request", "other"]);

export const tickets = pgTable("tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body").notNull(),
  customerEmail: text("customer_email").notNull(), 
  status: statusEnum("status").notNull().default("new"),
  priority: priorityEnum("priority").notNull().default("P3"),
  category: categoryEnum("category").notNull().default("other"), 
  sentiment: varchar("sentiment", { length: 100 }),
  draftReply: text("draft_reply"), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});



export const ai_runs = pgTable("ai_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id").references(() => tickets.id, { onDelete: 'cascade' }), 
  model: text("model").notNull(),
  promptHash: text("prompt_hash").notNull(),
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  costUsd: numeric("cost_usd", { precision: 10, scale: 6 }), 
  latencyMs: integer("latency_ms").notNull(),
  responseJson: jsonb("response_json"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});


export const agents_action = pgTable("agents_action", {
  id: uuid("id").primaryKey().defaultRandom(),
  runId: uuid("run_id").references(() => ai_runs.id, { onDelete: 'cascade' }), 
  toolName: varchar("tool_name", { length: 255 }).notNull(),
  input: jsonb("input"),
  output: jsonb("output"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});