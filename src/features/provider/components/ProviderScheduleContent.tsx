'use client';

import { trpc } from '@/lib/trpc/client';
import { Loader2, AlertCircle } from 'lucide-react';
import { WeeklyScheduleEditor } from '@/components/availability/WeeklyScheduleEditor';
import { DateOverrideManager } from '@/components/availability/DateOverrideManager';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ProviderScheduleContentProps {
    providerId?: string;
}

export function ProviderScheduleContent({ providerId }: ProviderScheduleContentProps) {
    // Use getSchedule which handles both self (if undefined) and specific provider (if admin)
    const { data: schedule, isLoading, error, refetch } = trpc.schedule.getSchedule.useQuery(
        providerId ? { providerId } : undefined
    );

    // We also need provider details for autonomy check
    // If providerId is passed, we need a way to fetch that provider's details as admin
    // For now, let's assume getMine works for self, and we need a getById for admin
    // But wait, the original code used trpc.provider.getMine

    // Let's use a conditional query or a unified one if available
    // For now, if providerId is present, we might skip the autonomy check or need a new router
    // Checking autonomy is nice but not strictly blocking for the view

    const { data: provider } = trpc.provider.getMine.useQuery(undefined, {
        enabled: !providerId // Only fetch "mine" if we are the provider
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (error || !schedule) {
        return (
            <div className="p-8 text-center text-red-500">
                Error loading schedule: {error?.message}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                    {providerId ? 'Provider Schedule' : 'My Schedule'}
                </h1>
                <p className="text-neutral-500">Manage weekly availability and exceptions.</p>
            </div>

            {/* Only show autonomy warning if we loaded the provider profile and applicable */}
            {provider?.schedule_autonomy === 'approval_required' && !providerId && (
                <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="text-yellow-800">Approval Required</AlertTitle>
                    <AlertDescription className="text-yellow-700">
                        Your schedule changes require admin approval before they become public.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white p-6 rounded-lg border shadow-sm">
                        <WeeklyScheduleEditor
                            baseSchedule={schedule.baseSchedule}
                            onScheduleChange={refetch}
                            providerId={providerId} // Pass to editor if it needs it for mutations
                        />
                    </section>
                </div>

                <div className="space-y-8">
                    <section className="bg-white p-6 rounded-lg border shadow-sm">
                        <DateOverrideManager
                            overrides={schedule.overrides}
                            onOverrideChange={refetch}
                            providerId={providerId}
                        />
                    </section>

                    <section className="bg-slate-50 p-6 rounded-lg border">
                        <h4 className="font-medium mb-2">Calendar Sync</h4>
                        <p className="text-sm text-neutral-500 mb-4">
                            Connect Google Calendar to automatically block times when you have other events.
                        </p>
                        <button className="text-sm text-blue-600 font-medium hover:underline" disabled>
                            Connect Google Calendar (Coming Soon)
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
}
