'use client';

import { useState } from 'react';
import { TeamList, InviteForm, TeamMemberDetail } from '@/features/team/components';
import { ListDetailSplitView } from '@/components/common';

/**
 * Admin Team Page
 * Story 2.4: Team Invitations & Member Management
 * Story 2.4.5: Team Member Detail View with ListDetailSplitView
 */
export default function AdminTeamPage() {
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

    return (
        <div className="h-[calc(100vh-4rem)] bg-gray-50">
            <ListDetailSplitView
                list={
                    <div className="p-4 md:p-6 space-y-6">
                        {/* Header */}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
                            <p className="text-gray-500 mt-1">
                                Invite team members and manage your staff
                            </p>
                        </div>

                        {/* Invite Form */}
                        <InviteForm />

                        {/* Team List */}
                        <TeamList
                            onSelectMember={setSelectedMemberId}
                            selectedMemberId={selectedMemberId}
                        />
                    </div>
                }
                detail={
                    selectedMemberId ? (
                        <TeamMemberDetail memberId={selectedMemberId} />
                    ) : null
                }
                onClose={() => setSelectedMemberId(null)}
            />
        </div>
    );
}
