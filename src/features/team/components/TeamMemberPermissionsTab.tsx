'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

interface TeamMember {
    id: string;
    permissions: Record<string, Record<string, boolean>> | null;
}

interface TeamMemberPermissionsTabProps {
    member: TeamMember;
}

interface PermissionGroup {
    id: string;
    label: string;
    description: string;
    permissions: {
        key: string;
        label: string;
    }[];
}

const permissionGroups: PermissionGroup[] = [
    {
        id: 'services',
        label: 'Services',
        description: 'Manage service catalog',
        permissions: [
            { key: 'view', label: 'View services' },
            { key: 'add', label: 'Add services' },
            { key: 'edit', label: 'Edit services' },
            { key: 'delete', label: 'Delete services' },
        ],
    },
    {
        id: 'providers',
        label: 'Providers',
        description: 'Manage provider profiles',
        permissions: [
            { key: 'view', label: 'View providers' },
            { key: 'add', label: 'Add providers' },
            { key: 'edit', label: 'Edit providers' },
            { key: 'delete', label: 'Delete providers' },
        ],
    },
    {
        id: 'bookings',
        label: 'Bookings',
        description: 'Access to appointments',
        permissions: [
            { key: 'view', label: 'View all bookings' },
            { key: 'manage', label: 'Manage bookings' },
        ],
    },
    {
        id: 'team',
        label: 'Team',
        description: 'Manage team members',
        permissions: [
            { key: 'view', label: 'View team' },
            { key: 'invite', label: 'Invite members' },
            { key: 'edit', label: 'Edit members' },
        ],
    },
    {
        id: 'payments',
        label: 'Payments',
        description: 'Access payment information',
        permissions: [
            { key: 'view', label: 'View payments' },
            { key: 'refund', label: 'Process refunds' },
        ],
    },
    {
        id: 'company',
        label: 'Company',
        description: 'Company settings',
        permissions: [
            { key: 'edit', label: 'Edit company settings' },
        ],
    },
];

/**
 * Team Member Permissions Tab
 * Story 2.4.5: Grouped permission toggles by category
 */
export function TeamMemberPermissionsTab({ member }: TeamMemberPermissionsTabProps) {
    const [localPermissions, setLocalPermissions] = useState<Record<string, Record<string, boolean>>>(
        member.permissions || {}
    );
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const utils = trpc.useUtils();

    const updatePermissions = trpc.team.updatePermissions.useMutation({
        onSuccess: () => {
            utils.team.getById.invalidate({ userId: member.id });
            utils.team.getMembers.invalidate();
            setSuccessMessage('Permissions saved successfully');
            setTimeout(() => setSuccessMessage(null), 3000);
        },
    });

    const getPermissionValue = (groupId: string, permKey: string): boolean => {
        return localPermissions[groupId]?.[permKey] ?? false;
    };

    const handlePermissionChange = (groupId: string, permKey: string, value: boolean) => {
        setLocalPermissions((prev) => ({
            ...prev,
            [groupId]: {
                ...prev[groupId],
                [permKey]: value,
            },
        }));
    };

    const handleSave = () => {
        updatePermissions.mutate({
            userId: member.id,
            permissions: localPermissions,
        });
    };

    const hasChanges = JSON.stringify(localPermissions) !== JSON.stringify(member.permissions || {});

    return (
        <div className="p-6">
            <div className="max-w-2xl space-y-6">
                <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Permissions</h3>
                    <p className="text-xs text-gray-500">
                        Control what this team member can access and manage
                    </p>
                </div>

                {/* Permission Groups */}
                <div className="space-y-6">
                    {permissionGroups.map((group) => (
                        <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Group Header */}
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                <h4 className="text-sm font-medium text-gray-900">{group.label}</h4>
                                <p className="text-xs text-gray-500">{group.description}</p>
                            </div>

                            {/* Permissions List */}
                            <div className="divide-y divide-gray-100">
                                {group.permissions.map((perm) => (
                                    <div
                                        key={perm.key}
                                        className="px-4 py-3 flex items-center justify-between"
                                    >
                                        <span className="text-sm text-gray-700">{perm.label}</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={getPermissionValue(group.id, perm.key)}
                                                onChange={(e) =>
                                                    handlePermissionChange(group.id, perm.key, e.target.checked)
                                                }
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                        <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        <span className="text-sm text-green-700">{successMessage}</span>
                    </div>
                )}

                {/* Error Message */}
                {updatePermissions.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <span className="text-sm text-red-700">{updatePermissions.error.message}</span>
                    </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                        onClick={handleSave}
                        disabled={updatePermissions.isPending || !hasChanges}
                        className={`
                            px-4 py-2 rounded-lg font-medium transition-colors
                            ${updatePermissions.isPending || !hasChanges
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-teal-600 text-white hover:bg-teal-700'
                            }
                        `}
                    >
                        {updatePermissions.isPending ? 'Saving...' : 'Save Permissions'}
                    </button>
                </div>
            </div>
        </div>
    );
}
