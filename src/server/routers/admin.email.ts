import { router, adminProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const emailRouter = router({
    /**
     * Get a template by event type
     */
    getTemplate: adminProcedure
        .input(z.object({
            eventType: z.enum(['booking_confirmation', 'booking_cancellation', 'provider_notification']),
        }))
        .query(async ({ ctx, input }) => {
            const { data, error } = await ctx.supabase
                .from('email_templates')
                .select('*')
                .eq('tenant_id', ctx.tenantId)
                .eq('event_type', input.eventType)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
                throw error;
            }

            return data || null;
        }),

    /**
     * Save (Upsert) a template
     */
    saveTemplate: adminProcedure
        .input(z.object({
            eventType: z.enum(['booking_confirmation', 'booking_cancellation', 'provider_notification']),
            subject: z.string().min(1),
            body: z.string().min(1),
        }))
        .mutation(async ({ ctx, input }) => {
            const { error } = await ctx.supabase
                .from('email_templates')
                .upsert({
                    tenant_id: ctx.tenantId,
                    event_type: input.eventType,
                    subject_template: input.subject,
                    body_template: input.body,
                }, {
                    onConflict: 'tenant_id, event_type'
                });

            if (error) {
                console.error("Error saving template:", error);
                throw new Error("Failed to save template");
            }

            return { success: true };
        }),
});
