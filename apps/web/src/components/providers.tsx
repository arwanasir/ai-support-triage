'use client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode, useState } from "react";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from '@/components/ui/sonner';
export default function Providers({ children }: { children: ReactNode }) {

    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 5,
                        refetchInterval: 3000
                    }
                }
            })
    );
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                {children}
                <Toaster position="bottom-right" richColors />
            </AuthProvider>
        </QueryClientProvider>

    )
}