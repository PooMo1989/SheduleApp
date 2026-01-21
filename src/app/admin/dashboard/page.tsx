import Link from 'next/link';
import {
    Calendar,
    Briefcase,
    Users,
    Building2,
    Code2,
    ArrowRight,
} from 'lucide-react';

const quickActions = [
    {
        title: 'Manage Services',
        description: 'Add or edit your service catalog',
        href: '/admin/services',
        icon: Briefcase,
        color: 'bg-blue-500',
    },
    {
        title: 'Team Members',
        description: 'Invite staff and manage providers',
        href: '/admin/team',
        icon: Users,
        color: 'bg-green-500',
    },
    {
        title: 'Company Profile',
        description: 'Update your business branding',
        href: '/admin/company',
        icon: Building2,
        color: 'bg-purple-500',
    },
    {
        title: 'Get Widget Code',
        description: 'Embed booking on your website',
        href: '/admin/widget',
        icon: Code2,
        color: 'bg-orange-500',
    },
];

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
                <p className="text-neutral-600 mt-1">
                    Welcome back! Here&apos;s an overview of your business.
                </p>
            </div>

            {/* Stats Cards (Placeholder) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900">0</p>
                            <p className="text-sm text-neutral-500">Today&apos;s Bookings</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900">0</p>
                            <p className="text-sm text-neutral-500">Team Members</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900">0</p>
                            <p className="text-sm text-neutral-500">Active Services</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900">0</p>
                            <p className="text-sm text-neutral-500">Pending Approvals</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={action.href}
                                href={action.href}
                                className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 hover:shadow-md transition-shadow flex items-center gap-4 group"
                            >
                                <div className={`p-3 rounded-lg ${action.color}`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                                        {action.title}
                                    </h3>
                                    <p className="text-sm text-neutral-500">{action.description}</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-primary-600 transition-colors" />
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
