'use client';

import { HorizontalTabs } from '@/components/common';
import { trpc } from '@/lib/trpc/client';
import { TeamMemberDetailsTab } from './TeamMemberDetailsTab';
import { TeamMemberPermissionsTab } from './TeamMemberPermissionsTab';
import { TeamMemberActivityTab } from './TeamMemberActivityTab';

interface TeamMemberDetailProps {
    memberId: string;
}

/**
 * Team Member Detail View
 * Story 2.4.5: Displays member details in a tabbed interface
 */
export function TeamMemberDetail({ memberId }: TeamMemberDetailProps) {
    const { data: member, isLoading, error } = trpc.team.getById.useQuery({ userId: memberId });

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full" />
                        <div className="space-y-2">
                            <div className="h-5 bg-gray-200 rounded w-32" />
                            <div className="h-4 bg-gray-200 rounded w-24" />
                        </div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded" />
                    <div className="space-y-3">
                        <div className="h-8 bg-gray-200 rounded" />
                        <div className="h-8 bg-gray-200 rounded" />
                        <div className="h-8 bg-gray-200 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !member) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    {error?.message || 'Failed to load team member'}
                </div>
            </div>
        );
    }

    const tabs = [
        {
            id: 'details',
            label: 'Details',
            content: <TeamMemberDetailsTab member={member} />,
        },
        {
            id: 'management',
            label: 'Management',
            content: (
                <div className="p-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Assigned Responsibilities</h3>
                        <p className="text-gray-500 mb-4">Assign specific providers, services, and clients to this team member.</p>
                        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-md inline-block text-sm font-medium">
                            Coming Soon in Phase 3
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'permissions',
            label: 'Permissions',
            content: <TeamMemberPermissionsTab member={member} />,
        },
        {
            id: 'activity',
            label: 'Activity',
            content: <TeamMemberActivityTab />,
        },
    ];

    return (
        <div className="h-full flex flex-col">
            {/* Member Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-4">
                    {member.avatarUrl ? (
                        <img
                            src={member.avatarUrl}
                            alt={member.name || ''}
                            className="w-14 h-14 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
                            <span className="text-teal-700 text-xl font-medium">
                                {member.name?.charAt(0).toUpperCase() || '?'}
                            </span>
                        </div>
                    )}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {member.name || 'Unnamed'}
                        </h2>
                        {member.position && (
                            <p className="text-sm text-gray-500">{member.position}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                            {member.roles?.map((role) => (
                                <span
                                    key={role}
                                    className={`px-2 py-0.5 text-xs rounded-full ${role === 'admin'
                                            ? 'bg-purple-100 text-purple-700'
                                            : role === 'provider'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </span>
                            ))}
                            <span
                                className={`px-2 py-0.5 text-xs rounded-full ${member.isActive
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-500'
                                    }`}
                            >
                                {member.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex-1 overflow-hidden">
                <HorizontalTabs tabs={tabs} defaultTab="details" />
            </div>
        </div>
    );
}
