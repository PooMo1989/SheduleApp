'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { SearchFilterBar } from '@/components/common';

interface TeamListProps {
    onSelectMember?: (memberId: string) => void;
    selectedMemberId?: string | null;
}

/**
 * Team List Component
 * Story 2.4.7: Enhanced team list with search, filtering, and member selection
 */
export function TeamList({ onSelectMember, selectedMemberId }: TeamListProps) {
    const { data, isLoading, error } = trpc.team.getMembers.useQuery();
    const utils = trpc.useUtils();
    const [searchQuery, setSearchQuery] = useState('');
    const [pendingExpanded, setPendingExpanded] = useState(true);

    const updateMember = trpc.team.updateMember.useMutation({
        onSuccess: () => {
            utils.team.getMembers.invalidate();
        },
    });

    const resendInvite = trpc.team.resendInvite.useMutation({
        onSuccess: () => {
            utils.team.getMembers.invalidate();
        },
    });

    const cancelInvite = trpc.team.cancelInvite.useMutation({
        onSuccess: () => {
            utils.team.getMembers.invalidate();
        },
    });

    // Filter members by search query (name or position)
    const members = data?.members;
    const pendingInvites = data?.pendingInvites;

    const filteredMembers = useMemo(() => {
        if (!members) return [];
        if (!searchQuery.trim()) return members;

        const query = searchQuery.toLowerCase();
        return members.filter(
            (member) =>
                member.name?.toLowerCase().includes(query) ||
                member.position?.toLowerCase().includes(query)
        );
    }, [members, searchQuery]);

    // Filter pending invites by search query
    const filteredInvites = useMemo(() => {
        if (!pendingInvites) return [];
        if (!searchQuery.trim()) return pendingInvites;

        const query = searchQuery.toLowerCase();
        return pendingInvites.filter(
            (invite) =>
                invite.name?.toLowerCase().includes(query) ||
                invite.email?.toLowerCase().includes(query) ||
                invite.position?.toLowerCase().includes(query)
        );
    }, [pendingInvites, searchQuery]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                {[1, 2, 3].map((i) => (
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

    const handleToggleActive = (userId: string, currentIsActive: boolean) => {
        updateMember.mutate({ userId, isActive: !currentIsActive });
    };

    const formatDate = (date: string | null) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString();
    };

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <SearchFilterBar
                searchPlaceholder="Search by name or position..."
                onSearch={setSearchQuery}
            />

            {/* Active Members */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Team Members ({filteredMembers.length})
                </h3>
                {filteredMembers.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4">
                        {searchQuery ? 'No members match your search' : 'No team members yet'}
                    </p>
                ) : (
                    <div className="space-y-2">
                        {filteredMembers.map((member) => (
                            <div
                                key={member.id}
                                onClick={() => onSelectMember?.(member.id)}
                                className={`
                                    bg-white border rounded-lg p-4 flex items-center justify-between
                                    transition-colors cursor-pointer
                                    ${selectedMemberId === member.id
                                        ? 'border-teal-500 ring-1 ring-teal-500'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }
                                    ${!member.isActive ? 'opacity-60' : ''}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    {member.avatarUrl ? (
                                        <img
                                            src={member.avatarUrl}
                                            alt={member.name || ''}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                            <span className="text-teal-700 font-medium">
                                                {member.name?.charAt(0).toUpperCase() || '?'}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {member.name || 'Unnamed'}
                                        </p>
                                        {member.position && (
                                            <p className="text-sm text-gray-500">{member.position}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Active Toggle */}
                                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={member.isActive}
                                            onChange={() => handleToggleActive(member.id, member.isActive)}
                                            disabled={updateMember.isPending}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                                        <span className="ml-2 text-xs text-gray-500">
                                            {member.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pending Invitations - Collapsible */}
            {(data?.pendingInvites?.length ?? 0) > 0 && (
                <div className="border-t pt-4">
                    <button
                        onClick={() => setPendingExpanded(!pendingExpanded)}
                        className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3 w-full text-left"
                    >
                        {pendingExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                        ) : (
                            <ChevronRight className="w-5 h-5" />
                        )}
                        Pending Invitations ({filteredInvites.length})
                    </button>

                    {pendingExpanded && (
                        <div className="space-y-2">
                            {filteredInvites.length === 0 ? (
                                <p className="text-gray-500 text-sm py-2">
                                    No invitations match your search
                                </p>
                            ) : (
                                filteredInvites.map((invite) => (
                                    <div
                                        key={invite.id}
                                        className="bg-white border border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Placeholder Avatar */}
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                <span className="text-gray-400 font-medium">
                                                    {invite.name?.charAt(0).toUpperCase() ||
                                                        invite.email?.charAt(0).toUpperCase() ||
                                                        '?'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-700">
                                                    {invite.name || invite.email}
                                                </p>
                                                {invite.name && (
                                                    <p className="text-sm text-gray-400">{invite.email}</p>
                                                )}
                                                {invite.position && (
                                                    <p className="text-xs text-gray-400">{invite.position}</p>
                                                )}
                                                <p className="text-xs text-gray-400">
                                                    Invited {formatDate(invite.invitedAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                                Pending
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
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
