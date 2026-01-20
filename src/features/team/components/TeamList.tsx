'use client';

import { trpc } from '@/lib/trpc/client';

/**
 * Team List Component
 * Story 2.4 & 2.5: Display team members with role actions
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

    const promoteToAdmin = trpc.team.promoteToAdmin.useMutation({
        onSuccess: () => {
            utils.team.getMembers.invalidate();
        },
    });

    const makeProvider = trpc.team.makeProvider.useMutation({
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

    const handlePromoteToAdmin = (userId: string, name: string | null) => {
        if (confirm(`Promote ${name || 'this user'} to Admin?`)) {
            promoteToAdmin.mutate({ userId });
        }
    };

    const handleMakeProvider = (userId: string, name: string | null) => {
        if (confirm(`Create a Provider profile for ${name || 'this user'}?`)) {
            makeProvider.mutate({ userId });
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
                                        <p className="text-sm text-gray-500 capitalize">
                                            {member.role}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                        Active
                                    </span>

                                    {/* Role Actions - per Story 2.5 */}
                                    {member.role !== 'admin' && (
                                        <button
                                            onClick={() => handlePromoteToAdmin(member.id, member.name)}
                                            disabled={promoteToAdmin.isPending}
                                            className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                                            title="Promote to Admin"
                                        >
                                            Promote to Admin
                                        </button>
                                    )}
                                    {member.role !== 'provider' && member.role !== 'admin' && (
                                        <button
                                            onClick={() => handleMakeProvider(member.id, member.name)}
                                            disabled={makeProvider.isPending}
                                            className="text-sm text-purple-600 hover:text-purple-700 disabled:opacity-50"
                                            title="Make Provider"
                                        >
                                            Make Provider
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
                                        Invited {formatDate(invite.invitedAt)}
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
