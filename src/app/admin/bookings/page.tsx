'use client';

import { BookingList } from '@/features/admin/components';
import { trpc } from '@/lib/trpc/client';
import { AlertCircle, CheckCircle, Calendar } from 'lucide-react';

export default function AdminBookingsPage() {
    const { data: stats } = trpc.dashboard.getStats.useQuery();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Bookings</h1>
                <p className="text-slate-600 mt-1">Manage all booking requests and appointments</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-amber-600 font-medium">Pending Approval</p>
                            <p className="text-2xl font-bold text-amber-900">{stats?.pendingApprovals || 0}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-amber-500" />
                    </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Upcoming</p>
                            <p className="text-2xl font-bold text-green-900">{stats?.upcomingAppointments || 0}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600 font-medium">Total (This Month)</p>
                            <p className="text-2xl font-bold text-slate-900">{stats?.monthBookings || 0}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-slate-500" />
                    </div>
                </div>
            </div>

            {/* Bookings List */}
            <BookingList />
        </div>
    );
}
