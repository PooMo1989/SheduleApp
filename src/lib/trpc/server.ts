import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import superjson from 'superjson';
import type { Context } from './context';

/**
 * tRPC initialization for sheduleApp
 * 
 * Creates type-safe API building blocks with role-based access control.
 */
const t = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
            },
        };
    },
});

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;

/**
 * Public procedure - no authentication required
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authenticated user
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.user || !ctx.userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
    }
    return next({
        ctx: {
            ...ctx,
            user: ctx.user,
            userId: ctx.userId,
            tenantId: ctx.tenantId!,
            roles: ctx.roles,
        },
    });
});

/**
 * Admin procedure - requires admin role
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
    if (!ctx.roles.includes('admin')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
    }
    return next({ ctx });
});

/**
 * Provider procedure - requires provider or admin role
 */
export const providerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
    if (!ctx.roles.includes('provider') && !ctx.roles.includes('admin')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Provider access required' });
    }
    return next({ ctx });
});
