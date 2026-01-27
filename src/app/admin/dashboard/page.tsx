import { DashboardStats } from '@/features/admin/components';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard | Admin',
    description: 'Overview of your business performance',
};

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

            {/* Stats Overview (Story 9.1) */}
            <DashboardStats />

            {/* Quick Actions Placeholder */}
            {/* We will add recent bookings list here in a future story */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 bg-white p-6 rounded-lg border border-slate-200">
                    <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
                    <p className="text-sm text-gray-500">More widgets coming in Tier 3...</p>
                </div>
            </div>
        </div>
    );
}
