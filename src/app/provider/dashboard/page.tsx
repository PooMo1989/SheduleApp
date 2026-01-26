import { redirect } from 'next/navigation';

/**
 * Provider Dashboard Redirect
 *
 * Redirects to /provider/appointments which is now the main provider entry point.
 * The provider portal uses the appointments page as the landing page per user-flow-v3.md.
 */
export default function ProviderDashboardPage() {
    redirect('/provider/appointments');
}
