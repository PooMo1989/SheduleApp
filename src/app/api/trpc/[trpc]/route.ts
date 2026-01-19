import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/lib/trpc/context';

/**
 * tRPC API Route Handler
 * 
 * Handles all tRPC requests at /api/trpc/[trpc]
 * Uses the Fetch adapter for Next.js App Router compatibility
 */
const handler = (req: Request) =>
    fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: appRouter,
        createContext,
        onError:
            process.env.NODE_ENV === 'development'
                ? ({ path, error }) => {
                    console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
                }
                : undefined,
    });

export { handler as GET, handler as POST };
