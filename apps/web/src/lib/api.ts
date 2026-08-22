const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface Ticket {
    id: string,
    subject: string,
    body: string,
    customerEmail: string,
    status: 'new' | 'triaged' | 'awaiting_review' | 'sent' | 'closed',
    priority: "P0" | "P1" | "P2" | "P3",
    category: 'billing' | 'technical' | 'account' | 'feature_request' | 'other',
    sentiment: string,
    draftReply: string,
    createdAt: string,

}

export interface ReplyPayload {
    ticketId: string;
    response: string;
    action: 'APPROVE' | 'REJECT' | 'SAVE_DRAFT'
}

export type AIRunEvent = {
    id: string;
    ticketId: string;
    type: 'AI_CLASSIFICATION' | 'SENTIMENT_ANALYSIS' | 'DRAFT_GENERATION';
    modelUsed?: string;
    promptTokens?: number;
    completionTokens?: number;
    latencyMs?: number;
    outputPayload: Record<string, any>;
    createdAt: string;
};
export type AgentActionEvent = {
    id: string;
    ticketId: string;
    agentId?: string;
    action: 'APPROVE' | 'REJECT' | 'SAVE_DRAFT' | 'MANUAL_OVERRIDE';
    note?: string;
    createdAt: string;
};

export type TimelineEvent = | ({ eventCategory: 'AI_RUN' } & AIRunEvent)
    | ({ eventCategory: 'AGENT_ACTION' } & AgentActionEvent)


export async function fetchTickets(): Promise<Ticket[]> {
    const res = await fetch(`${API_URL}/tickets`);
    if (!res.ok) {
        throw new Error("failed to fetch the tickets from backend API");
    }

    return res.json();
}

export async function fetchTicketsById(id: string): Promise<Ticket> {
    const res = await fetch(`${API_URL}/tickets/${id}`)

    if (!res) {
        throw new Error(`failed to fetch ticket ${id}`)
    }
    return res.json();
}
export async function sendTicketReply(payload: ReplyPayload): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`${API_URL}/tickets/${payload.ticketId}/reply`, {
        method: 'POST',
        headers: {
            'content-Type': 'application/json'
        },
        body: JSON.stringify({
            response: payload.response,
            action: payload.action
        })
    });
    if (!res.ok) {
        throw new Error('Failed to submit ticket reply')
    }
    return res.json();
}

export async function fetchTicketAuditTimeline(ticketId: string): Promise<TimelineEvent[]> {
    const res = await fetch(`api/tickets/${ticketId}/audit`);
    if (!res.ok) {
        throw new Error(`Failed to fetch audit timeline: ${res.statusText}`);

    }
    const data: TimelineEvent[] = await res.json();

    return data.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

export type PriorityLevel = 'P0' | 'P1' | 'P2' | 'P3';
export type TicketStatus = 'awaiting_review' | 'triaged' | 'sent' | 'closed' | 'new';

export interface InboxFilters {
    priority: PriorityLevel | 'ALL';
    category: string | 'ALL';
    status: TicketStatus | 'ALL';
    sortBy: 'priority' | 'newest';
};

export const PRIORITY_WEIGHTS: Record<string, number> = {
    P0: 0,
    P1: 1,
    P2: 2,
    P3: 3,
};