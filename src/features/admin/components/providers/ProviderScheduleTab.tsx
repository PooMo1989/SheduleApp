'use client';

import { Suspense } from 'react';
import { trpc } from '@/lib/trpc/client';
import { WeeklyScheduleEditor } from '@/components/availability/WeeklyScheduleEditor';
import { DateOverrideManager } from '@/components/availability/DateOverrideManager';
import { Loader2 } from 'lucide-react';

interface ProviderScheduleTabProps {
    providerId: string;
}

export function ProviderScheduleTab({ providerId }: ProviderScheduleTabProps) {
    const { data: schedule, isLoading, error, refetch } = trpc.schedule.getSchedule.useQuery({ providerId });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (error || !schedule) {
        return (
            <div className="p-12 text-center text-red-500">
                Error loading schedule: {error?.message || 'Failed to load'}
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">Working Hours</h3>
                <p className="text-sm text-gray-500">Configure when this provider is available for bookings.</p>
            </div>
            <div className="flex-1 p-6 bg-gray-50 flex flex-col gap-6 overflow-y-auto">
                {/* Weekly Schedule */}
                <WeeklyScheduleEditor
                    baseSchedule={schedule.baseSchedule}
                    onScheduleChange={refetch}
                    providerId={providerId}
                />

                {/* Date Overrides */}
                <div className="bg-white rounded-lg border p-4">
                    <DateOverrideManager
                        overrides={schedule.overrides}
                        onOverrideChange={refetch}
                        providerId={providerId}
                    />
                </div>
            </div>
        </div>
    );
}
