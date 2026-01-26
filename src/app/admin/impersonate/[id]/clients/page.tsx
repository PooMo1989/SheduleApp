'use client';

import { ProviderClientsContent } from '@/features/provider/components/ProviderClientsContent';
import { use } from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    return <ProviderClientsContent providerId={resolvedParams.id} />;
}
