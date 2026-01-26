'use client';

import { ProviderAppointmentsContent } from '@/features/provider/components/ProviderAppointmentsContent';
import { use } from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    return <ProviderAppointmentsContent providerId={resolvedParams.id} />;
}
