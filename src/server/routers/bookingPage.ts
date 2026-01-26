import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc/server";
import { TRPCError } from "@trpc/server";

export const bookingPageRouter = router({
    // 1. Get Tenant by Slug (Public)
    getTenantBySlug: publicProcedure
        .input(z.object({ slug: z.string() }))
        .query(async ({ ctx, input }) => {
            const { data: tenant, error } = await ctx.supabase
                .from("tenants")
                .select("id, name, slug, settings, created_at")
                .eq("slug", input.slug)
                .single();

            if (error || !tenant) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Company not found",
                });
            }

            return tenant;
        }),

    // 2. Get Services for Booking Page
    getServices: publicProcedure
        .input(z.object({ tenantId: z.string() }))
        .query(async ({ ctx, input }) => {
            const { data: services, error } = await ctx.supabase
                .from("services")
                .select(`
          id, 
          name, 
          description, 
          duration_minutes, 
          price, 
          currency,
          image_url,
          category_id,
          pricing_type,
          location_type,
          custom_url_slug
        `)
                .eq("tenant_id", input.tenantId)
                .eq("is_active", true)
                .eq("visibility", "public")
                .order("display_order", { ascending: true });

            if (error) {
                console.error(error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch services",
                });
            }

            return services;
        }),

    // 3. Get Providers for a Service
    getProvidersForService: publicProcedure
        .input(z.object({ serviceId: z.string(), tenantId: z.string() }))
        .query(async ({ ctx, input }) => {
            // First get direct assignments
            const { data: serviceProviders, error } = await ctx.supabase
                .from("service_providers")
                .select(`
            provider:providers (
              id,
              name,
              bio,
              photo_url,
              title
            ),
            custom_price,
            custom_duration_minutes
          `)
                .eq("service_id", input.serviceId)
                .eq("is_active", true);

            if (error) {
                console.error(error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch providers",
                });
            }

            // Flatten and return
            return serviceProviders
                .map((sp) => {
                    if (!sp.provider) return null;
                    const provider = sp.provider as { id: string; name: string; bio: string | null; photo_url: string | null; title: string | null };
                    return {
                        id: provider.id,
                        name: provider.name,
                        bio: provider.bio,
                        photo_url: provider.photo_url,
                        title: provider.title,
                        custom_price: sp.custom_price,
                        custom_duration_minutes: sp.custom_duration_minutes
                    };
                })
                .filter((p): p is NonNullable<typeof p> => p !== null);
        }),
});
