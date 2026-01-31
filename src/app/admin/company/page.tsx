'use client';

import {
    CompanyProfileForm,
    BusinessHoursForm,
    BrandingForm,
    SettingsPaymentsTab,
    SettingsNotificationsTab,
    ServiceCategoriesForm,
} from '@/features/admin/components';
import { HorizontalTabs } from '@/components/common';

/**
 * Admin Company Page (Tabbed)
 * Story 2.8.10: Tenant configuration page
 *
 * Tabs:
 * 1. General - CompanyProfileForm + BusinessHoursForm + BrandingForm
 * 2. Services - Service categories management
 * 3. Payments - Bank details
 * 4. Notifications - Templates
 */
export default function AdminCompanyPage() {
    const tabs = [
        {
            id: 'general',
            label: 'General',
            content: (
                <div className="p-6 space-y-8 max-w-4xl">
                    <CompanyProfileForm />
                    <BusinessHoursForm />
                    <BrandingForm />
                </div>
            ),
        },
        {
            id: 'services',
            label: 'Services',
            content: (
                <div className="p-6 max-w-4xl">
                    <ServiceCategoriesForm />
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
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Company Configuration</h1>
                    <p className="text-gray-500 mt-1">
                        Manage your business profile, branding, payments, and notifications.
                    </p>
                </div>

                {/* Tabbed Content */}
                <div className="bg-white rounded-lg border border-gray-200 min-h-[600px]">
                    <HorizontalTabs tabs={tabs} defaultTab="general" />
                </div>
            </div>
        </div>
    );
}
