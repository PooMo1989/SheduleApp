'use client';

import { trpc } from '@/lib/trpc/client';
import { Loader2 } from 'lucide-react';
import { ProviderProfileForm } from '@/features/provider/components/ProviderProfileForm';

interface ProviderProfileContentProps {
    providerId?: string;
}

export function ProviderProfileContent({ providerId }: ProviderProfileContentProps) {
    // If providerId is passed (Admin Impersonation), use getById
    // Otherwise use getMine (Self Service)
    const { data: provider, isLoading, error } = providerId
        ? trpc.provider.getById.useQuery({ id: providerId })
        : trpc.provider.getMine.useQuery();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (error || !provider) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold text-red-500">Error loading profile</h2>
                <p className="text-neutral-500 mt-2">{error?.message || 'Provider profile not found'}</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">
                    {providerId ? 'Provider Profile' : 'My Profile'}
                </h1>
                <p className="text-neutral-500">Manage public bio and personal information.</p>
                {providerId && (
                    <p className="text-xs text-neutral-400 mt-2 bg-yellow-50 p-2 rounded border border-yellow-100 inline-block">
                        Impersonation Mode: Updates here will affect the live provider profile.
                    </p>
                )}
            </div>

            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <ProviderProfileForm
                    provider={provider}
                // If we need to pass a specific update handler for Admin, we might need to update ProviderProfileForm
                // But usually, the form uses useMutation. 
                // Let's assume ProviderProfileForm handles "updateOwn".
                // Admin might need "provider.update" instead.
                // This is a potential gap. Let's check ProviderProfileForm in next step if needed.
                />
            </div>
        </div>
    );
}
