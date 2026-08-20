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

export async function fetchTickets(): Promise<Ticket[]> {
    const res = await fetch(`${API_URL}/tickets`);
    if (!res.ok) {
        throw new Error("failed to fetch the tickets from backend API");
    }

    return res.json();
}