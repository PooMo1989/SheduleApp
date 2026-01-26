'use client';

import { HorizontalTabs } from '@/components/common/HorizontalTabs';
import { useUserProfile } from '@/features/auth/hooks/useUserProfile';
import { PersonalInfoTab } from './PersonalInfoTab';
import { MyScheduleTab } from './MyScheduleTab';

/**
 * Profile Page Component (Story 2.8.8)
 *
 * Unified profile page for all user roles using HorizontalTabs.
 * - Personal Info tab: All users
 * - My Schedule tab: Only dual-role users (admin/owner + provider)
 *
 * Based on user-flow-v3.md Section 13 - Profile Sub-Tabs:
 * - For Owner/Admin: Personal Info only
 * - For Dual-Role (Admin + Provider): Personal Info + My Schedule/Availability
 * - For Provider-Only: Personal Info (bio, photo, contact preferences, notifications)
 */
export function ProfilePage() {
    const { profile, isLoading } = useUserProfile();

    // Determine if user has dual-role (admin/owner + provider)
    const roles = profile?.roles || [];
    const isAdminOrOwner = roles.includes('admin') || roles.includes('owner');
    const isProvider = roles.includes('provider');
    const isDualRole = isAdminOrOwner && isProvider;

    // Build tabs based on user role
    const tabs = [
        {
            id: 'personal',
            label: 'Personal Info',
            content: <PersonalInfoTab />,
        },
    ];

    // Add My Schedule tab for dual-role users
    if (isDualRole) {
        tabs.push({
            id: 'schedule',
            label: 'My Schedule',
            content: <MyScheduleTab />,
        });
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Profile</h1>
                    <p className="text-neutral-600 mt-1">Manage your personal information</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 h-96 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Profile</h1>
                <p className="text-neutral-600 mt-1">
                    {isDualRole
                        ? 'Manage your personal information and provider schedule'
                        : 'Manage your personal information'}
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                <HorizontalTabs tabs={tabs} defaultTab="personal" />
            </div>
        </div>
    );
}
