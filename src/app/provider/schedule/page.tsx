'use client';

import { trpc } from '@/lib/trpc/client';
import { Loader2, AlertCircle } from 'lucide-react';
import { WeeklyScheduleEditor } from '@/components/availability/WeeklyScheduleEditor';
import { DateOverrideManager } from '@/components/availability/DateOverrideManager';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ProviderSchedulePage() {
    const { data: schedule, isLoading, error, refetch } = trpc.schedule.getMine.useQuery();
    const { data: provider } = trpc.provider.getMine.useQuery();

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
                <h1 className="text-2xl font-bold tracking-tight">My Schedule</h1>
                <p className="text-neutral-500">Manage your weekly availability and exceptions.</p>
            </div>

            {provider?.schedule_autonomy === 'approval_required' && (
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
                        />
                    </section>
                </div>

                <div className="space-y-8">
                    <section className="bg-white p-6 rounded-lg border shadow-sm">
                        <DateOverrideManager
                            overrides={schedule.overrides}
                            onOverrideChange={refetch}
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
