'use client';

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import { SearchFilterBar, HorizontalTabs } from '@/components/common';
import Image from 'next/image';

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
    // const [pendingExpanded, setPendingExpanded] = useState(true);

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

    // --- Render Helpers ---

    const renderMemberList = (list: typeof filteredMembers) => {
        if (list.length === 0) {
            return (
                <p className="text-gray-500 text-sm py-4">
                    {searchQuery ? 'No members match your search' : 'No team members found'}
                </p>
            );
        }
        return (
            <div className="space-y-2">
                {list.map((member) => (
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
                                <Image
                                    src={member.avatarUrl}
                                    alt={member.name || ''}
                                    width={40}
                                    height={40}
                                    className="rounded-full object-cover"
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
        );
    };

    const renderInviteList = (list: typeof filteredInvites) => {
        if (list.length === 0) {
            return (
                <p className="text-gray-500 text-sm py-4">
                    {searchQuery ? 'No invitations match your search' : 'No pending invitations'}
                </p>
            );
        }
        return (
            <div className="space-y-2">
                {list.map((invite) => (
                    <div
                        key={invite.id}
                        className="bg-white border border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
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
                ))}
            </div>
        );
    };

    // --- Tab Definitions ---

    const tabs = [
        {
            id: 'all',
            label: `All (${filteredMembers.length + filteredInvites.length})`,
            content: (
                <div className="space-y-6 pt-4">
                    {filteredMembers.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Active Members</h4>
                            {renderMemberList(filteredMembers)}
                        </div>
                    )}
                    {filteredInvites.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Pending Invitations</h4>
                            {renderInviteList(filteredInvites)}
                        </div>
                    )}
                    {filteredMembers.length === 0 && filteredInvites.length === 0 && (
                        <p className="text-gray-500 text-sm py-4">No members or invitations found.</p>
                    )}
                </div>
            )
        },
        {
            id: 'active',
            label: `Active (${filteredMembers.length})`,
            content: <div className="pt-4">{renderMemberList(filteredMembers)}</div>
        },
        {
            id: 'pending',
            label: `Pending (${filteredInvites.length})`,
            content: <div className="pt-4">{renderInviteList(filteredInvites)}</div>
        }
    ];

    return (
        <div className="h-full flex flex-col">
            {/* Search Bar - Fixed at top */}
            <div className="mb-4">
                <SearchFilterBar
                    searchPlaceholder="Search by name or position..."
                    onSearch={setSearchQuery}
                />
            </div>

            {/* Tabs & Content */}
            <div className="flex-1 overflow-hidden">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
                    {/* HorizontalTabs handles its own scrolling for content */}
                    <HorizontalTabs tabs={tabs} defaultTab="all" />
                </div>
            </div>
        </div>
    );
}
