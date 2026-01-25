'use client';

import { Clock } from 'lucide-react';

/**
 * Team Member Activity Tab
 * Story 2.4.5: Placeholder for future activity log
 */
export function TeamMemberActivityTab() {
    return (
        <div className="p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
                Activity Log Coming Soon
            </h3>
            <p className="text-sm text-gray-500 max-w-sm">
                Track login history, actions taken, and changes made by this team member.
            </p>
        </div>
    );
}
