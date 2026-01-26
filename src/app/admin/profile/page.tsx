import { ProfilePage } from '@/features/profile/components';

/**
 * Admin Profile Page (Story 2.8.8)
 *
 * Uses the shared ProfilePage component which automatically
 * shows the appropriate tabs based on user role.
 */
export default function AdminProfilePageRoute() {
    return <ProfilePage />;
}
