import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '@/lib/trpc/server';
import { TRPCError } from '@trpc/server';

/**
 * Zod schemas for tenant settings validation
 */

// Business hours for a single day
const dayHoursSchema = z.object({
    open: z.string().nullable(),
    close: z.string().nullable(),
    enabled: z.boolean(),
});

// Full business hours schema (all days of week)
const businessHoursSchema = z.object({
    monday: dayHoursSchema,
    tuesday: dayHoursSchema,
    wednesday: dayHoursSchema,
    thursday: dayHoursSchema,
    friday: dayHoursSchema,
    saturday: dayHoursSchema,
    sunday: dayHoursSchema,
});

// Branding colors schema
const brandingSchema = z.object({
    primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
    secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
    background_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
    text_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
});

// Update settings input schema
const updateSettingsSchema = z.object({
    name: z.string().min(1, 'Company name is required').max(100).optional(),
    slug: z.string()
        .min(3, 'Slug must be at least 3 characters')
        .max(50)
        .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
        .optional(),
    logo_url: z.string().url('Invalid URL').nullable().optional(),
    timezone: z.string().optional(),
    currency: z.string().length(3, 'Currency must be 3 characters (e.g., LKR, USD)').optional(),
    business_hours: businessHoursSchema.optional(),
    branding: brandingSchema.optional(),
    allow_guest_checkout: z.boolean().optional(),
    address: z.string().max(500).nullable().optional(),
    contact_email: z.string().email('Invalid email').nullable().optional(),
    contact_phone: z.string().max(20).nullable().optional(),
    website_url: z.string().url('Invalid URL').nullable().optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type BusinessHours = z.infer<typeof businessHoursSchema>;
export type Branding = z.infer<typeof brandingSchema>;

/**
 * Admin Router
 * Handles tenant settings and admin-only operations
 */
export const adminRouter = router({
    /**
     * Get current tenant settings
     * Any authenticated user can view settings (for widget theming)
     */
    getSettings: protectedProcedure.query(async ({ ctx }) => {
        const { data, error } = await ctx.supabase
            .from('tenants')
            .select('*')
            .eq('id', ctx.tenantId)
            .single();

        if (error || !data) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Tenant not found',
            });
        }

        return {
            id: data.id,
            name: data.name,
            slug: data.slug,
            logo_url: data.logo_url,
            timezone: data.timezone,
            currency: data.currency,
            business_hours: data.business_hours as BusinessHours | null,
            branding: data.branding as Branding | null,
            allow_guest_checkout: data.allow_guest_checkout,
            address: data.address,
            contact_email: data.contact_email,
            contact_phone: data.contact_phone,
            website_url: data.website_url,
            created_at: data.created_at,
            updated_at: data.updated_at,
        };
    }),

    /**
     * Update tenant settings
     * Only admins can update settings
     */
    updateSettings: adminProcedure
        .input(updateSettingsSchema)
        .mutation(async ({ ctx, input }) => {
            // Check if slug is being changed and if it's unique
            if (input.slug) {
                const { data: existingTenant } = await ctx.supabase
                    .from('tenants')
                    .select('id')
                    .eq('slug', input.slug)
                    .neq('id', ctx.tenantId)
                    .single();

                if (existingTenant) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'This URL slug is already taken. Please choose another.',
                    });
                }
            }

            const { data, error } = await ctx.supabase
                .from('tenants')
                .update({
                    ...input,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', ctx.tenantId)
                .select()
                .single();

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to update settings',
                    cause: error,
                });
            }

            return {
                success: true,
                tenant: data,
            };
        }),

    /**
     * Check if a slug is available
     */
    checkSlugAvailability: protectedProcedure
        .input(z.object({ slug: z.string() }))
        .query(async ({ ctx, input }) => {
            const { data } = await ctx.supabase
                .from('tenants')
                .select('id')
                .eq('slug', input.slug)
                .neq('id', ctx.tenantId)
                .single();

            return {
                available: !data,
                slug: input.slug,
            };
        }),
});

export type AdminRouter = typeof adminRouter;
