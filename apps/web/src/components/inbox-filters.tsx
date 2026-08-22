'use client';

import { InboxFilters, PriorityLevel, TicketStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

interface InboxFilterProps {
    filters: InboxFilters;
    categories: string[];
    onChange: (newFilters: InboxFilters) => void;
    onReset: () => void;
}

export function InboxFilterBar({ filters, categories, onChange, onReset }: InboxFilterProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-card border rounded-lg shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mr-1">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Filters:</span>
                </div>

                {/* Priority Filter */}
                <Select
                    value={filters.priority}
                    onValueChange={(val) => onChange({ ...filters, priority: val as PriorityLevel | 'ALL' })}
                >
                    <SelectTrigger className="w-[130px] h-9 text-xs">
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Priorities</SelectItem>
                        <SelectItem value="P0">P0 - Urgent</SelectItem>
                        <SelectItem value="P1">P1 - High</SelectItem>
                        <SelectItem value="P2">P2 - Medium</SelectItem>
                        <SelectItem value="P3">P3 - Low</SelectItem>
                    </SelectContent>
                </Select>

                {/* Category Filter */}
                <Select
                    value={filters.category}
                    onValueChange={(val) => onChange({ ...filters, category: val })}
                >
                    <SelectTrigger className="w-[160px] h-9 text-xs">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Categories</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                                {cat}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                    value={filters.status}
                    onValueChange={(val) => onChange({ ...filters, status: val as TicketStatus | 'ALL' })}
                >
                    <SelectTrigger className="w-[140px] h-9 text-xs">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Statuses</SelectItem>
                        <SelectItem value="triaged">Triaged</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>

                {/* Reset Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReset}
                    className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Reset
                </Button>
            </div>

            {/* Sorting Control */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Sort by:</span>
                <Select
                    value={filters.sortBy}
                    onValueChange={(val) => onChange({ ...filters, sortBy: val as 'priority' | 'newest' })}
                >
                    <SelectTrigger className="w-[150px] h-9 text-xs font-medium">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="priority">Priority (P0 → P3)</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}