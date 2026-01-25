'use client';

import {
    CompanyProfileForm,
    BusinessHoursForm,
    BrandingForm,
    SettingsPaymentsTab,
    SettingsNotificationsTab,
    SettingsPermissionsTab,
} from '@/features/admin/components';
import { HorizontalTabs } from '@/components/common';

/**
 * Admin Settings Page (Tabbed)
 * Story 2.8.7: Unified Settings page with sub-tabs
 *
 * Tabs:
 * 1. Company Info - CompanyProfileForm + BusinessHoursForm
 * 2. Branding - BrandingForm
 * 3. Payments - Bank details, pay later config
 * 4. Notifications - Email templates (placeholder)
 * 5. Permissions - Default role permissions (placeholder)
 */
export default function AdminSettingsPage() {
    const tabs = [
        {
            id: 'company',
            label: 'Company Info',
            content: (
                <div className="p-6 space-y-8 max-w-4xl">
                    <CompanyProfileForm />
                    <BusinessHoursForm />
                </div>
            ),
        },
        {
            id: 'branding',
            label: 'Branding',
            content: (
                <div className="p-6 max-w-4xl">
                    <BrandingForm />
                </div>
            ),
        },
        {
            id: 'payments',
            label: 'Payments',
            content: <SettingsPaymentsTab />,
        },
        {
            id: 'notifications',
            label: 'Notifications',
            content: <SettingsNotificationsTab />,
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
                        Configure your company profile, branding, payments, and notifications.
                    </p>
                </div>

                {/* Tabbed Content */}
                <div className="bg-white rounded-lg border border-gray-200 min-h-[600px]">
                    <HorizontalTabs tabs={tabs} defaultTab="company" />
                </div>
            </div>
        </div>
    );
}
