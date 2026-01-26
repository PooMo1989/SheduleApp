'use client';

import {
    SettingsPermissionsTab,
} from '@/features/admin/components';
import { HorizontalTabs } from '@/components/common';

/**
 * Admin Settings Page (Restructured)
 * Story 2.8.11: SaaS Relationship Hub
 *
 * Tabs:
 * 1. Account - SaaS billing/subscription status (Placeholder)
 * 2. Permissions - Default role permissions
 */
export default function AdminSettingsPage() {
    const tabs = [
        {
            id: 'account',
            label: 'Account',
            content: (
                <div className="p-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">My Subscription</h3>
                        <p className="text-gray-500 mb-4">Manage your subscription and billing with the platform.</p>
                        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-md inline-block text-sm font-medium">
                            Coming Soon in Phase 4
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'permissions',
            label: 'Permissions',
            content: <SettingsPermissionsTab />,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 mt-1">
                        Manage your account subscription and system permissions.
                    </p>
                </div>

                {/* Tabbed Content */}
                <div className="bg-white rounded-lg border border-gray-200 min-h-[600px]">
                    <HorizontalTabs tabs={tabs} defaultTab="account" />
                </div>
            </div>
        </div>
    );
}
