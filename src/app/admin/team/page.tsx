import { TeamList, InviteForm } from '@/features/team/components';

/**
 * Admin Team Page
 * Story 2.4: Team Invitations & Member Management
 */
export default function AdminTeamPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
                    <p className="text-gray-500 mt-1">
                        Invite team members and manage your staff
                    </p>
                </div>

                {/* Invite Form */}
                <div className="mb-8">
                    <InviteForm />
                </div>

                {/* Team List */}
                <TeamList />
            </div>
        </div>
    );
}
