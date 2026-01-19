'use client';

import { useRouter } from 'next/navigation';
import { logout } from '@/features/auth/actions/logout';

/**
 * Logout Button Component
 * Handles user sign out with loading state
 */
export function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
        router.refresh();
    };

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        >
            Sign Out
        </button>
    );
}
