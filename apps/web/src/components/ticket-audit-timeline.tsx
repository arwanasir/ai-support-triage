'use client';

import { TimelineEvent } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, User, Cpu, CheckCircle2, Save, XCircle } from "lucide-react";

export function TicketAuditTimeline({ events }: { events: TimelineEvent[] }) {
    if (!events || events.length === 0) {
        return (
            <div className="p-4 text-center text-sm text-muted-foreground">
                No audit log history found for this ticket.
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    📜 Audit & Processing History
                </CardTitle>
                <CardDescription>
                    Chronological sequence of automated AI pipeline runs and human agent actions.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative before:absolute before:inset-0 before:left-[19px] before:w-[2px] before:bg-border">
                {events.map((event) => {
                    const isAI = event.eventCategory === 'AI_RUN';
                    const eventTime = new Date(event.createdAt).toLocaleString();

                    return (
                        <div key={event.id} className="relative flex items-start gap-4 pl-8">
                            {/* Timeline Node Icon */}
                            <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border bg-background text-foreground shadow-sm">
                                {isAI ? (
                                    <Bot className="h-4 w-4 text-blue-500" />
                                ) : (
                                    <User className="h-4 w-4 text-emerald-500" />
                                )}
                            </div>

                            {/* Event Content Box */}
                            <div className="flex-1 rounded-lg border p-3.5 bg-muted/20 text-xs space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">
                                            {isAI ? event.type : `Agent Action: ${event.action}`}
                                        </span>
                                        <Badge variant={isAI ? "secondary" : "outline"} className="text-[10px]">
                                            {isAI ? 'AI System' : 'Human Agent'}
                                        </Badge>
                                    </div>
                                    <time className="text-muted-foreground font-mono">{eventTime}</time>
                                </div>

                                {/* Specific details based on event type */}
                                {isAI ? (
                                    <div className="text-muted-foreground space-y-1">
                                        {event.modelUsed && (
                                            <p className="flex items-center gap-1 font-mono">
                                                <Cpu className="h-3 w-3" /> Model: {event.modelUsed}
                                            </p>
                                        )}
                                        <pre className="p-2 bg-background border rounded font-mono text-[11px] overflow-x-auto">
                                            {JSON.stringify(event.outputPayload, null, 2)}
                                        </pre>
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground space-y-1">
                                        {event.note && <p className="italic">"{event.note}"</p>}
                                        {event.agentId && <p className="font-mono text-[10px]">Actor ID: {event.agentId}</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}