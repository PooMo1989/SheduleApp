"use client";

import { trpc } from "@/lib/trpc/client";
import { Loader2, Calendar, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardStats() {
    const { data: stats, isLoading, isError } = trpc.dashboard.getStats.useQuery();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-1/2 bg-slate-200 rounded"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4 mb-8 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                <span className="font-medium">Error!</span> Failed to load dashboard statistics.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Bookings
                        <span className="text-xs font-normal text-muted-foreground ml-2">(This Month)</span>
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.monthBookings || 0}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Upcoming Appointments
                        <span className="text-xs font-normal text-muted-foreground ml-2">(7 Days)</span>
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.upcomingAppointments || 0}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Pending Approvals
                    </CardTitle>
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-amber-600">{stats?.pendingApprovals || 0}</div>
                </CardContent>
            </Card>
        </div>
    );
}
