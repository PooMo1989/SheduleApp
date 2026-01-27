import { router, adminProcedure } from "@/lib/trpc/server";


export const dashboardRouter = router({
    /**
     * Get basic dashboard statistics
     */
    getStats: adminProcedure
        .query(async ({ ctx }) => {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

            // 1. Total Bookings (This Month)
            const { count: monthBookingsCount, error: monthError } = await ctx.supabase
                .from("bookings")
                .select("*", { count: "exact", head: true })
                .eq("tenant_id", ctx.tenantId)
                .gte("created_at", startOfMonth)
                .lte("created_at", endOfMonth);

            if (monthError) console.error("Error fetching month stats:", monthError);

            // 2. Upcoming Appointments (Next 7 Days)
            const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
            const { count: upcomingCount, error: upcomingError } = await ctx.supabase
                .from("bookings")
                .select("*", { count: "exact", head: true })
                .eq("tenant_id", ctx.tenantId)
                .in("status", ["confirmed", "pending"])
                .gte("start_time", now.toISOString())
                .lte("start_time", nextWeek);

            if (upcomingError) console.error("Error fetching upcoming stats:", upcomingError);

            // 3. Pending Approvals
            const { count: pendingCount, error: pendingError } = await ctx.supabase
                .from("bookings")
                .select("*", { count: "exact", head: true })
                .eq("tenant_id", ctx.tenantId)
                .eq("status", "pending");

            if (pendingError) console.error("Error fetching pending stats:", pendingError);

            return {
                monthBookings: monthBookingsCount || 0,
                upcomingAppointments: upcomingCount || 0,
                pendingApprovals: pendingCount || 0,
            };
        }),
});
