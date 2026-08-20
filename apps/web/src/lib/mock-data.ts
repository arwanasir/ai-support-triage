import { Ticket } from "./api";

export const MOCK_TICKET: Ticket[] = [
    {
        id: 'tkt-001',
        subject: 'Payment gateway failing during checkout',
        body: 'Customers are reporting 500 errors when attempting to submit credit card payments.',
        customerEmail: "tk-001@gmail.com",
        status: 'triaged',
        priority: 'P0',
        category: 'billing',
        sentiment: 'NEGATIVE',
        draftReply: 'We are aware of the issue affecting payment processing and our engineering team is investigating.',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    },
    {
        id: 'tkt-002',
        subject: 'How do I change my profile avatar?',
        body: 'I went to account settings but cannot find the upload button for profile photos.',
        customerEmail: "tk-002@gmail.com",
        status: 'triaged',
        priority: 'P3',
        category: 'account',
        sentiment: 'NEUTRAL',
        draftReply: 'You can update your avatar by navigating to Settings -> Profile -> Edit Picture.',
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    },
    {
        id: 'tkt-003',
        subject: 'Feature request: Dark mode export',
        body: 'Love the platform! Would be great to export PDF reports in dark mode.',
        customerEmail: "tk-003@gmail.com",
        status: 'awaiting_review',
        priority: 'P2',
        category: 'feature_request',
        sentiment: 'POSITIVE',
        draftReply: 'You can update your theme by navigating to Settings -> appearance -> theme -> dark mode',
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    },
]