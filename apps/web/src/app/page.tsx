'use client'

import { useQuery } from "@tanstack/react-query";
import { fetchTickets, Ticket } from "@/lib/api";
import { MOCK_TICKET } from "@/lib/mock-data";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";


function PriorityBadge({ priority }: { priority?: Ticket['priority'] }) {
  switch (priority) {
    case 'P0':
      return <Badge className="bg-red-600 hover:bg-red-700 text-white font-semibold">URGENT</Badge>
    case 'P1':
      return <Badge className="bg-orange-500 hover:bg-orange-600 text-white ">HIGH</Badge>
    case 'P2':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white ">MEDIUM</Badge>
    case 'P3':
      return <Badge className="bg-slate-500 hover:bg-slate-600 text-white ">LOW</Badge>
    default:
      return <Badge variant="outline">UNCLASSIFIED</Badge>


  }
}

function StatusBadge({ status }: { status: Ticket['status'] }) {
  switch (status) {
    case 'sent':
      return <Badge variant='outline' className="border-green-600 text-green-600">SENT</Badge>
    case 'triaged':
      return <Badge variant='outline' className="border-blue-600 text-blue-600">TIRAGED</Badge>
    case 'awaiting_review':
      return <Badge variant='outline' className="border-amber-600 text-amber-600">AWAITING_REVIEW</Badge>
    case 'closed':
      return <Badge variant='outline' className="border-gray-600 text-gray-600">CLOSED</Badge>
    default:
      return <Badge variant='outline' className="border-amber-300 text-amber-400">NEW</Badge>

  }


}

export default function InboxPage() {
  const { user } = useAuth();
  const { data: tickets, isLoading, isError } = useQuery({
    queryKey: ['tickets'],
    queryFn: fetchTickets,
    initialData: MOCK_TICKET
  });

  const activateTickets = tickets && tickets.length > 0 ? tickets : MOCK_TICKET;

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/*Header Banner*/}
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Ticket Inbox</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Logged in as <span className="font-semibold text-foreground">{user?.name}</span>({user?.email})
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            Live Polling Active
          </Badge>
        </div>
      </div>
      {/*Main Inbox Card */}
      <Card>
        <CardHeader>
          <CardTitle>Incoming Ticket</CardTitle>
          <CardDescription>
            Triage,classify, and respond to tickets prioritized by AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading tickets stream ...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead className="w-[120px]">Priority</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="w-[140px]">Category</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className=" text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activateTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-xs font-medium">{ticket.id}</TableCell>
                    <TableCell>
                      <PriorityBadge priority={ticket.priority} />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{ticket.body}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {ticket.category}
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
    </div>
  )


}