'use client';

import { Badge } from "@/components/ui/badge";
import { PriorityLevel } from "@/lib/api";

interface PriorityBadgeProps {
    priority?: PriorityLevel | string;
    showLabel?: boolean;
}

export function PriorityBadge({ priority, showLabel = true }: PriorityBadgeProps) {
    switch (priority) {
        case 'P0':
            return (
                <Badge className="bg-red-600 hover:bg-red-700 text-white font-bold tracking-wide shadow-sm animate-pulse">
                    {showLabel ? 'P0 • URGENT' : 'P0'}
                </Badge>
            );
        case 'P1':
            return (
                <Badge className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                    {showLabel ? 'P1 • HIGH' : 'P1'}
                </Badge>
            );
        case 'P2':
            return (
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-medium">
                    {showLabel ? 'P2 • MEDIUM' : 'P2'}
                </Badge>
            );
        case 'P3':
            return (
                <Badge className="bg-slate-500 hover:bg-slate-600 text-white">
                    {showLabel ? 'P3 • LOW' : 'P3'}
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className="text-muted-foreground">
                    UNCLASSIFIED
                </Badge>
            );
    }
}