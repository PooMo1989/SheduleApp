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
    const { data: schedule, isLoading, refetch } = trpc.schedule.getSchedule.useQuery({ providerId });
    const { data: calendarStatus, refetch: refetchCalendar } = trpc.provider.getCalendarStatus.useQuery({ providerId });
    const { data: authUrlData } = trpc.provider.getGoogleAuthUrl.useQuery({ providerId }, { enabled: !calendarStatus?.isConnected });
    const disconnectMutation = trpc.provider.disconnectCalendar.useMutation({
        onSuccess: () => {
            refetchCalendar();
        }
    });

    const handleConnect = () => {
        if (authUrlData?.url) {
            window.location.href = authUrlData.url;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!schedule) return null;

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Working Hours</h3>
                    <p className="text-sm text-gray-500">Configure when this provider is available for bookings.</p>
                </div>

                {/* Google Calendar Action */}
                {!isLoading && calendarStatus && (
                    <div className="flex items-center gap-3">
                        {calendarStatus.isConnected ? (
                            <div className="flex items-center gap-3 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-medium text-green-700">
                                    Synced with {calendarStatus.calendarEmail}
                                </span>
                                <button
                                    onClick={() => {
                                        if (confirm('Are you sure you want to disconnect Google Calendar?')) {
                                            disconnectMutation.mutate({ providerId });
                                        }
                                    }}
                                    disabled={disconnectMutation.isPending}
                                    className="text-xs text-red-600 hover:text-red-800 underline disabled:opacity-50"
                                >
                                    Disconnect
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleConnect}
                                disabled={!authUrlData?.url}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Connect Google Calendar
                            </button>
                        )}
                    </div>
                )}
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
