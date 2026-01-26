'use client';

import { ProviderProfileContent } from '@/features/provider/components/ProviderProfileContent';
import { use } from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    return <ProviderProfileContent providerId={resolvedParams.id} />;
}
