'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTickets, Ticket, InboxFilters, PRIORITY_WEIGHTS } from '@/lib/api';
import { MOCK_TICKET } from '@/lib/mock-data';
import { InboxFilterBar } from '@/components/inbox-filters';
import { EmptyState, ErrorState } from '@/components/page-states';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Helper function to render color-coded priority badges
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

// Helper function to render status badges
function StatusBadge({ status }: { status: Ticket['status'] }) {
  switch (status) {
    case 'sent':
      return <Badge variant="outline" className="border-green-600 text-green-600">Resolved</Badge>;
    case 'triaged':
      return <Badge variant="outline" className="border-blue-600 text-blue-600">AI Processed</Badge>;
    default:
      return <Badge variant="outline" className="border-amber-500 text-amber-500">Pending</Badge>;
  }
}

export default function InboxPage() {
  const { user } = useAuth();

  // Fetch tickets with auto-polling enabled via TanStack Query
  const { data: tickets = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['tickets'],
    queryFn: fetchTickets,
    initialData: MOCK_TICKET,
  });

  const [filters, setFilters] = useState<InboxFilters>({
    priority: 'ALL',
    category: 'ALL',
    status: 'ALL',
    sortBy: 'priority',
  });

  const availableCategories = useMemo(() => {
    const categories = tickets.map((t) => t.category).filter(Boolean) as string[];
    return Array.from(new Set(categories));
  }, [tickets]);

  const processedTickets = useMemo(() => {
    return tickets
      .filter((ticket) => {
        // Filter Priority
        if (filters.priority !== 'ALL' && ticket.priority !== filters.priority) return false;
        // Filter Category
        if (filters.category !== 'ALL' && ticket.category !== filters.category) return false;
        // Filter Status
        if (filters.status !== 'ALL' && ticket.status !== filters.status) return false;
        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'priority') {
          const weightA = PRIORITY_WEIGHTS[a.priority || 'P3'] ?? 4;
          const weightB = PRIORITY_WEIGHTS[b.priority || 'P3'] ?? 4;
          if (weightA !== weightB) return weightA - weightB; // P0 comes first
        }
        // Fallback or explicit 'newest' sort
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tickets, filters]);

  const resetFilters = () => {
    setFilters({
      priority: 'ALL',
      category: 'ALL',
      status: 'ALL',
      sortBy: 'priority',
    });
  };
  const hasActiveFilters =
    filters.priority !== 'ALL' || filters.category !== 'ALL' || filters.status !== 'ALL';

  const activeTickets = tickets && tickets.length > 0 ? tickets : MOCK_TICKET;

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header Banner */}
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Ticket Inbox</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Logged in as <span className="font-semibold text-foreground">{user?.name}</span> ({user?.email})
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            Live Polling Active (3s)
          </Badge>
        </div>
      </div>

      {/* Main Inbox Card */}
      <Card>
        <CardHeader>
          <CardTitle>Incoming Tickets</CardTitle>
          <CardDescription>
            Triage, classify, and respond to tickets prioritized by AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading ticket stream...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead className="w-[120px]">Priority</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="w-[140px]">Category</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="text-right w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-mono text-xs font-medium">{ticket.id}</TableCell>
                    <TableCell>
                      <PriorityBadge priority={ticket.priority} />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{ticket.subject}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {ticket.body}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium px-2 py-1 bg-muted rounded-md">
                        {ticket.category || 'Unassigned'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={ticket.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/tickets/${ticket.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support Agent Inbox</h1>
          <p className="text-xs text-muted-foreground">
            Showing {processedTickets.length} of {tickets.length} total tickets
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <InboxFilterBar
        filters={filters}
        categories={availableCategories}
        onChange={setFilters}
        onReset={resetFilters}
      />
      {/* ERROR STATE */}
      {isError && (
        <ErrorState
          title="Failed to load inbox tickets"
          message={error?.message || "There was a problem reaching the server."}
          onRetry={() => refetch()}
        />
      )}
      {/* LOADING STATE */}
      {isLoading && (
        <div className="p-12 text-center text-sm text-muted-foreground">
          Loading support inbox...
        </div>
      )}

      {/* EMPTY STATES */}
      {!isLoading && !isError && (
        <>
          {/* Case 1: Backend has no tickets */}
          {tickets.length === 0 && (
            <EmptyState
              icon="inbox"
              title="All Caught Up! (Inbox Zero)"
              description="There are currently no tickets waiting in the queue."
            />
          )}
          {/* Case 2: Filters returned 0 results */}
          {tickets.length > 0 && processedTickets.length === 0 && (
            <EmptyState
              icon="filter"
              title="No tickets match your filters"
              description="Try adjusting or clearing your priority, category, or status filters."
              actionLabel="Reset All Filters"
              onAction={resetFilters}
            />
          )}
          {/* Render List when tickets exist */}
          {processedTickets.length > 0 && (
            <div className="grid gap-3">
              {/* Your ticket card mapping */}
            </div>
          )}
        </>
      )}

      {/* Ticket List Rendering */}
      {/* Map through `processedTickets` here */}
    </div>

  );
}