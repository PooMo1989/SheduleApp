'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { useState } from 'react';
import superjson from 'superjson';
import type { AppRouter } from '@/server/routers/_app';

/**
 * Create the tRPC React client
 * This is used throughout the client-side app for type-safe API calls
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Get the base URL for API requests
 * Works for both server-side and client-side rendering
 */
function getBaseUrl() {
    if (typeof window !== 'undefined') {
        // Browser: use relative URL
        return '';
    }
    // Server-side: use absolute URL
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    // Development: localhost
    return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * TRPCProvider component
 * Wraps the app with QueryClient and tRPC client
 */
export function TRPCProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Stale time of 5 minutes for most queries
                        staleTime: 5 * 60 * 1000,
                        // Retry failed queries once
                        retry: 1,
                    },
                },
            })
    );

    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: `${getBaseUrl()}/api/trpc`,
                    transformer: superjson,
                }),
            ],
        })
    );

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </trpc.Provider>
    );
}
