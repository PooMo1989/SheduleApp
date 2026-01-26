'use client';

import { ProviderDetail } from '@/features/admin/components';

interface ProviderDetailPageProps {
    params: {
        id: string;
    };
}

/**
 * Provider Detail Page (Mobile/Deep Link)
 * Story 2.8.5
 */
export default function ProviderDetailPage({ params }: ProviderDetailPageProps) {
    return <ProviderDetail providerId={params.id} />;
}
