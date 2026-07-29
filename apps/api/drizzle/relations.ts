import { relations } from "drizzle-orm/relations";
import { tickets, aiRuns, agentsAction } from "./schema";

export const aiRunsRelations = relations(aiRuns, ({one, many}) => ({
	ticket: one(tickets, {
		fields: [aiRuns.ticketId],
		references: [tickets.id]
	}),
	agentsActions: many(agentsAction),
}));

export const ticketsRelations = relations(tickets, ({many}) => ({
	aiRuns: many(aiRuns),
}));

export const agentsActionRelations = relations(agentsAction, ({one}) => ({
	aiRun: one(aiRuns, {
		fields: [agentsAction.runId],
		references: [aiRuns.id]
	}),
}));