import { router, publicProcedure } from '@/lib/trpc/server';
import { createClient } from '@/lib/supabase/server';
import { authRouter } from './auth';

/**
 * Root tRPC Router for sheduleApp
 * 
 * All routers are merged here. Add new routers as features are implemented:
 * - booking (Epic 3)
 * - service (Epic 2)
 * - provider (Epic 2)
 * - admin (Epic 2)
 */
export const appRouter = router({
    // Auth router for registration, login, etc.
    auth: authRouter,

    /**
     * Health check endpoint
     * Verifies tRPC is working correctly
     * 
     * Usage: trpc.health.useQuery()
     * Returns: { status: 'ok', timestamp: string }
     */
    health: publicProcedure.query(() => {
        return {
            status: 'ok' as const,
            timestamp: new Date().toISOString(),
        };
    }),

    /**
     * Database health check endpoint
     * Verifies Supabase connection is working
     * 
     * Usage: trpc.dbHealth.useQuery()
     * Returns: { connected: boolean, timestamp: string, error?: string }
     */
    dbHealth: publicProcedure.query(async () => {
        try {
            const supabase = await createClient();

            // Query the tenants table to verify schema is set up
            const { data, error } = await supabase
                .from('tenants')
                .select('id, slug')
                .limit(1);

            if (error) {
                return {
                    connected: false,
                    timestamp: new Date().toISOString(),
                    error: error.message,
                    tables: { tenants: false },
                };
            }

            return {
                connected: true,
                timestamp: new Date().toISOString(),
                tables: { tenants: true },
                defaultTenant: data?.[0] ?? null,
            };
        } catch (err) {
            return {
                connected: false,
                timestamp: new Date().toISOString(),
                error: err instanceof Error ? err.message : 'Unknown error',
            };
        }
    }),
});

// Export type for client-side type inference
export type AppRouter = typeof appRouter;
