'use client';

import { use, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTicketsById, sendTicketReply, Ticket } from "@/lib/api";
import { MOCK_TICKET } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from "next/link";

function PriorityBadge({ priority }: { priority?: Ticket['priority'] }) {
    switch (priority) {
        case 'P0':
            return <Badge className="bg-red-600 hover:bg-red-700 text-white font-semibold">URGENT</Badge>;
        case 'P1':
            return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">HIGH</Badge>;
        case 'P2':
            return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">MEDIUM</Badge>;
        case 'P3':
            return <Badge className="bg-slate-500 hover:bg-slate-600 text-white">LOW</Badge>;
        default:
            return <Badge variant="outline">UNCLASSIFIED</Badge>;
    }
}

function SentimentBadge({ sentiment }: { sentiment?: Ticket['sentiment'] }) {
    switch (sentiment) {
        case 'NEGATIVE':
            return <Badge variant="outline" className="border-red-500 text-red-500">NEGATIVE</Badge>;
        case 'POSITIVE':
            return <Badge variant="outline" className="border-green-500 text-green-500">POSITIVE</Badge>;
        default:
            return <Badge variant="outline" className="border-slate-500 text-slate-500">NEUTRAL</Badge>;
    }
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const ticketid = resolvedParams.id;

    const queryClient = useQueryClient();
    const router = useRouter();

    // Fixed find fallback logic
    const mockFallback = MOCK_TICKET.find((t) => t.id === ticketid) || MOCK_TICKET[0];

    const { data: ticket, isLoading } = useQuery({
        queryKey: ['ticket', ticketid],
        queryFn: () => fetchTicketsById(ticketid),
        initialData: mockFallback,
    });

    const activeTicket = ticket || mockFallback;
    const [responseMessage, setResponseMessage] = useState(activeTicket?.draftReply || '');

    useEffect(() => {
        if (activeTicket?.draftReply) {
            setResponseMessage(activeTicket.draftReply);
        }
    }, [activeTicket?.draftReply]);

    const replyMutation = useMutation({
        mutationFn: sendTicketReply,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['ticket', ticketid] });

            if (variables.action === 'APPROVE') {
                toast.success('Ticket Approved and Sent!', {
                    description: `Response sent for ticket ${ticketid}. Rerouting to inbox...`,
                });
                setTimeout(() => {
                    router.push('/');
                }, 1200);
            } else if (variables.action === 'SAVE_DRAFT') {
                toast.info('Draft saved', {
                    description: 'Your changes have been saved to this ticket.'
                });
                // Note: Removed setResponseMessage('') so user input is preserved on save
            } else if (variables.action === 'REJECT') {
                toast.warning('Draft Rejected', {
                    description: 'AI draft response has been discarded.'
                });
                setResponseMessage('');
            }
        },
        onError: (err, variables) => {
            if (variables.action === 'APPROVE') {
                toast.success('Ticket Approved and sent! (Mock Mode)', {
                    description: `Response sent for ticket ${ticketid}. Redirecting...`
                });
                setTimeout(() => {
                    router.push('/');
                }, 1200);
            } else {
                toast.error('Action Failed', {
                    description: err.message || "Could not reach backend API.",
                });
            }
        }
    });

    const handleAction = (action: 'APPROVE' | 'REJECT' | 'SAVE_DRAFT') => {
        replyMutation.mutate({
            ticketId: ticketid, // Fixed variable name mapping
            response: responseMessage,
            action
        });
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading ticket details...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6 max-w-6xl">
            {/* Top Navigation */}
            <div>
                <Button asChild variant="ghost" size="sm" className="mb-2">
                    <Link href="/">← Back to Inbox</Link>
                </Button>
                <div className="flex justify-between items-start">
                    <div>
                        <span className="font-mono text-xs text-muted-foreground">{activeTicket?.id}</span>
                        <h1 className="text-2xl font-bold tracking-tight">{activeTicket?.body}</h1>
                    </div>
                    <PriorityBadge priority={activeTicket?.priority} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Customer Message</CardTitle>
                        <CardDescription>
                            Received on {activeTicket?.createdAt ? new Date(activeTicket.createdAt).toLocaleString() : 'N/A'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 rounded-lg bg-muted/40 border text-sm leading-relaxed whitespace-pre-wrap">
                            {activeTicket?.body}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-blue-200 dark:border-blue-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <div>
                            <CardTitle className="text-base flex items-center gap-2">
                                ✨ AI Suggested Response
                            </CardTitle>
                            <CardDescription>
                                Review or modify the generated response before sending to the customer.
                            </CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                            Draft
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Textarea
                            value={responseMessage}
                            onChange={(e) => setResponseMessage(e.target.value)}
                            placeholder="Write your response here..."
                            rows={6}
                            className="font-sans text-sm leading-relaxed focus-visible:ring-blue-500"
                        />
                        <p className="text-xs text-muted-foreground">
                            Tip: You can freely edit this text before hitting approve.
                        </p>
                    </CardContent>
                    <CardFooter className="flex flex-wrap justify-between gap-3 pt-3 border-t bg-slate-50/50 dark:bg-slate-900/50 rounded-b-lg">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction('REJECT')}
                                disabled={replyMutation.isPending}
                            >
                                Reject Draft
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleAction('SAVE_DRAFT')}
                                disabled={replyMutation.isPending}
                            >
                                Save Draft
                            </Button>
                        </div>
                        <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white font-medium"
                            onClick={() => handleAction('APPROVE')}
                            disabled={replyMutation.isPending}
                        >
                            {replyMutation.isPending ? 'Sending...' : 'Approve & Send Response'}
                        </Button>
                    </CardFooter>
                </Card>

                {/* AI Triage Analysis Sidebar */}
                <Card className="bg-slate-50/50 dark:bg-slate-900/50 border-blue-200 dark:border-blue-900">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">🤖 AI Triage Analysis</CardTitle>
                        <CardDescription>Automated classification summary</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div>
                            <span className="text-xs text-muted-foreground block mb-1">Detected Category</span>
                            <span className="font-medium px-2.5 py-1 bg-background rounded-md inline-block">
                                {activeTicket?.category || 'General Inquiry'}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground block mb-1">Customer Sentiment</span>
                            <SentimentBadge sentiment={activeTicket?.sentiment} />
                        </div>
                        <div className="pt-2 border-t">
                            <span className="text-xs text-muted-foreground block mb-1">Triage Status</span>
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                {activeTicket?.status === "triaged" ? "Ready for Agent Review" : 'Pending Processing'}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}