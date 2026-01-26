'use client';

import { use } from 'react';
import { ServicePortal } from '@/features/service/components';

interface EditServicePageProps {
    params: Promise<{ id: string }>;
}

/**
 * Edit Service Page
 * Story 2.3.1: Service Setup Tabbed Portal
 */
export default function EditServicePage({ params }: EditServicePageProps) {
    const { id } = use(params);
    return <ServicePortal serviceId={id} />;
}
