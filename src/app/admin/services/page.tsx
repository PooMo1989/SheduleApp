'use client';

import { ServicesPageLayout } from '@/features/service/components';

/**
 * Admin Services Page
 * New split-view layout with slide-in create/edit form
 * - Left: Services list with quick toggles
 * - Right: Info pane → Create/Edit form (slides in)
 * - Auto-save with smart defaults
 * - Numbered tabs (1, 2, 3)
 */
export default function AdminServicesPage() {
    return <ServicesPageLayout />;
}
