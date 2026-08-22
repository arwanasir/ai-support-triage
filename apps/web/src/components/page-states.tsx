'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Inbox, FilterX, AlertTriangle, FileQuestion, RefreshCw } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
    icon?: 'inbox' | 'filter' | 'notFound';
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    actionHref?: string;
}

export function EmptyState({
    icon = 'inbox',
    title,
    description,
    actionLabel,
    onAction,
    actionHref,
}: EmptyStateProps) {
    return (
        <Card className="border-dashed border-2 my-6">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                    {icon === 'inbox' && <Inbox className="h-8 w-8 text-muted-foreground" />}
                    {icon === 'filter' && <FilterX className="h-8 w-8 text-muted-foreground" />}
                    {icon === 'notFound' && <FileQuestion className="h-8 w-8 text-muted-foreground" />}
                </div>
                <h3 className="text-lg font-semibold tracking-tight mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground max-w-sm mb-6">{description}</p>

                {actionLabel && onAction && (
                    <Button variant="outline" size="sm" onClick={onAction}>
                        {actionLabel}
                    </Button>
                )}

                {actionLabel && actionHref && (
                    <Button size="sm" asChild>
                        <Link href={actionHref}>{actionLabel}</Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

export function ErrorState({
    title = "Something went wrong",
    message = "Failed to load data from the server. Please verify your connection.",
    onRetry,
}: ErrorStateProps) {
    return (
        <Card className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 my-6">
            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 mb-3">
                    <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-red-900 dark:text-red-200 mb-1">{title}</h3>
                <p className="text-xs text-red-600/80 dark:text-red-400 max-w-md mb-5">{message}</p>

                {onRetry && (
                    <Button variant="outline" size="sm" onClick={onRetry} className="gap-2 border-red-300 dark:border-red-800">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Try Again
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}