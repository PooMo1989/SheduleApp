'use client';

import { ProviderScheduleContent } from '@/features/provider/components/ProviderScheduleContent';
import { use } from 'react';

// Using 'use' for params unwrapping in newer Next.js versions
export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    return <ProviderScheduleContent providerId={resolvedParams.id} />;
}
