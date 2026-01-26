'use client';

import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ProviderProfileForm } from '@/features/provider/components/ProviderProfileForm';

export default function ProviderProfilePage() {
    const { data: provider, isLoading, error } = trpc.provider.getMine.useQuery();

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
                <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
                <p className="text-neutral-500">Manage your public bio and personal information.</p>
            </div>

            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <ProviderProfileForm provider={provider} />
            </div>
        </div>
    );
}
