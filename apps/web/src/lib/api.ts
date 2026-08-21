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