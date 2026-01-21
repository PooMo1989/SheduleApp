'use client';

import { trpc } from '@/lib/trpc/client';

/**
 * Team List Component
 * Story 2.4 & 2.4.1: Display team members with multi-role actions
 */
export function TeamList() {
    const { data, isLoading, error } = trpc.team.getMembers.useQuery();
    const utils = trpc.useUtils();

    const resendInvite = trpc.team.resendInvite.useMutation({
        onSuccess: () => {
            utils.team.getMembers.invalidate();
            alert('Invitation resent!');
        },
    });

    const cancelInvite = trpc.team.cancelInvite.useMutation({
        onSuccess: () => {
            utils.team.getMembers.invalidate();
        },
    });

    const addRole = trpc.team.addRole.useMutation({
        onSuccess: () => {
            utils.team.getMembers.invalidate();
        },
    });

    const removeRole = trpc.team.removeRole.useMutation({
        onSuccess: () => {
            utils.team.getMembers.invalidate();
        },
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse bg-gray-100 h-16 rounded-lg" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                Failed to load team: {error.message}
            </div>
        );
    }

    const formatDate = (date: string | null) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString();
    };

    const formatRoles = (roles: string[]) => {
        return roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ');
    };

    const handleAddRole = (userId: string, name: string | null, role: 'admin' | 'provider') => {
        if (confirm(`Add ${role} role to ${name || 'this user'}?`)) {
            addRole.mutate({ userId, role });
        }
    };

    const handleRemoveRole = (userId: string, name: string | null, role: 'admin' | 'provider', rolesCount: number) => {
        if (rolesCount <= 1) {
            alert('User must have at least one role');
            return;
        }
        if (confirm(`Remove ${role} role from ${name || 'this user'}?`)) {
            removeRole.mutate({ userId, role });
        }
    };

    return (
        <div className="space-y-6">
            {/* Active Members */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Team Members ({data?.members.length || 0})
                </h3>
                {data?.members.length === 0 ? (
                    <p className="text-gray-500 text-sm">No team members yet</p>
                ) : (
                    <div className="space-y-2">
                        {data?.members.map(member => (
                            <div
                                key={member.id}
                                className="bg-white border rounded-lg p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                        <span className="text-teal-700 font-medium">
                                            {member.name?.charAt(0).toUpperCase() || '?'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {member.name || 'Unnamed'}
                                        </p>
                                        <div className="flex items-center gap-1 mt-1">
                                            {member.roles.map(role => (
                                                <span
                                                    key={role}
                                                    className={`px-2 py-0.5 text-xs rounded-full ${role === 'admin'
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : role === 'provider'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                        Active
                                    </span>

                                    {/* Add/Remove Role Actions */}
                                    {!member.roles.includes('admin') && (
                                        <button
                                            onClick={() => handleAddRole(member.id, member.name, 'admin')}
                                            disabled={addRole.isPending}
                                            className="text-sm text-purple-600 hover:text-purple-700 disabled:opacity-50"
                                        >
                                            +Admin
                                        </button>
                                    )}
                                    {member.roles.includes('admin') && (
                                        <button
                                            onClick={() => handleRemoveRole(member.id, member.name, 'admin', member.roles.length)}
                                            disabled={removeRole.isPending}
                                            className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                                        >
                                            -Admin
                                        </button>
                                    )}
                                    {!member.roles.includes('provider') && (
                                        <button
                                            onClick={() => handleAddRole(member.id, member.name, 'provider')}
                                            disabled={addRole.isPending}
                                            className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                                        >
                                            +Provider
                                        </button>
                                    )}
                                    {member.roles.includes('provider') && (
                                        <button
                                            onClick={() => handleRemoveRole(member.id, member.name, 'provider', member.roles.length)}
                                            disabled={removeRole.isPending}
                                            className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                                        >
                                            -Provider
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pending Invitations */}
            {data?.pendingInvites && data.pendingInvites.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Pending Invitations ({data.pendingInvites.length})
                    </h3>
                    <div className="space-y-2">
                        {data.pendingInvites.map(invite => (
                            <div
                                key={invite.id}
                                className="bg-white border border-dashed rounded-lg p-4 flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-medium text-gray-700">{invite.email}</p>
                                    <p className="text-sm text-gray-400">
                                        Invited {formatDate(invite.invitedAt)} • Roles: {formatRoles(invite.roles)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                        Invited
                                    </span>
                                    <button
                                        onClick={() => resendInvite.mutate({ invitationId: invite.id })}
                                        disabled={resendInvite.isPending}
                                        className="text-sm text-teal-600 hover:text-teal-700 disabled:opacity-50"
                                    >
                                        Resend
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Cancel this invitation?')) {
                                                cancelInvite.mutate({ invitationId: invite.id });
                                            }
                                        }}
                                        disabled={cancelInvite.isPending}
                                        className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
