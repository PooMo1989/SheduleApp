'use client';

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';

interface DaySchedule {
    enabled: boolean;
    start_time: string;
    end_time: string;
}

interface ServiceScheduleTabProps {
    serviceId: string | null;
}

const DAYS = [
    { key: 0, label: 'Sunday' },
    { key: 1, label: 'Monday' },
    { key: 2, label: 'Tuesday' },
    { key: 3, label: 'Wednesday' },
    { key: 4, label: 'Thursday' },
    { key: 5, label: 'Friday' },
    { key: 6, label: 'Saturday' },
];

const DEFAULT_SCHEDULE: Record<number, DaySchedule> = {
    0: { enabled: false, start_time: '09:00', end_time: '17:00' },
    1: { enabled: true, start_time: '09:00', end_time: '17:00' },
    2: { enabled: true, start_time: '09:00', end_time: '17:00' },
    3: { enabled: true, start_time: '09:00', end_time: '17:00' },
    4: { enabled: true, start_time: '09:00', end_time: '17:00' },
    5: { enabled: true, start_time: '09:00', end_time: '17:00' },
    6: { enabled: true, start_time: '09:00', end_time: '13:00' },
};

/**
 * Service Schedule Tab
 * Story 2.3.1: Tab 2 - Schedule & Provider Assignment
 */
export function ServiceScheduleTab({ serviceId }: ServiceScheduleTabProps) {
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    const { data: existingSchedules, isLoading: loadingSchedules } = trpc.service.getSchedules.useQuery(
        { serviceId: serviceId! },
        { enabled: !!serviceId }
    );

    const { data: assignedProviders, isLoading: loadingProviders } = trpc.service.getProviders.useQuery(
        { serviceId: serviceId! },
        { enabled: !!serviceId }
    );

    const { data: allProviders } = trpc.provider.getAll.useQuery();

    // Compute initial schedule from server data
    const initialSchedule = useMemo(() => {
        if (!existingSchedules || existingSchedules.length === 0) {
            return DEFAULT_SCHEDULE;
        }
        const scheduleMap: Record<number, DaySchedule> = {};
        // First set all days to disabled with defaults
        Object.keys(DEFAULT_SCHEDULE).forEach(day => {
            scheduleMap[Number(day)] = { ...DEFAULT_SCHEDULE[Number(day)], enabled: false };
        });
        // Then enable days from database
        type ScheduleRow = {
            day_of_week: number;
            is_available: boolean | null;
            start_time: string;
            end_time: string;
        };
        (existingSchedules as ScheduleRow[]).forEach(s => {
            scheduleMap[s.day_of_week] = {
                enabled: s.is_available ?? true,
                start_time: s.start_time?.slice(0, 5) || '09:00',
                end_time: s.end_time?.slice(0, 5) || '17:00',
            };
        });
        return scheduleMap;
    }, [existingSchedules]);

    // Compute initial providers from server data
    const initialProviders = useMemo(() => {
        if (!assignedProviders) return [];
        return assignedProviders.map(p => p?.id).filter(Boolean) as string[];
    }, [assignedProviders]);

    // Track local edits (null = use initial value)
    const [scheduleEdits, setScheduleEdits] = useState<Record<number, DaySchedule> | null>(null);
    const [providerEdits, setProviderEdits] = useState<string[] | null>(null);

    // Current values: use edits if present, otherwise initial
    const schedule = scheduleEdits ?? initialSchedule;
    const selectedProviders = providerEdits ?? initialProviders;

    const updateSchedules = trpc.service.updateSchedules.useMutation({
        onSuccess: () => {
            setSaveStatus('saved');
            setScheduleEdits(null); // Reset to use server data after save
            setTimeout(() => setSaveStatus('idle'), 2000);
        },
        onError: () => setSaveStatus('error'),
    });

    const updateProviders = trpc.service.updateProviders.useMutation({
        onSuccess: () => {
            setSaveStatus('saved');
            setProviderEdits(null); // Reset to use server data after save
            setTimeout(() => setSaveStatus('idle'), 2000);
        },
        onError: () => setSaveStatus('error'),
    });

    const handleScheduleChange = (day: number, field: keyof DaySchedule, value: string | boolean) => {
        const currentSchedule = scheduleEdits ?? initialSchedule;
        setScheduleEdits({
            ...currentSchedule,
            [day]: { ...currentSchedule[day], [field]: value },
        });
    };

    const handleProviderToggle = (providerId: string) => {
        const currentProviders = providerEdits ?? initialProviders;
        setProviderEdits(
            currentProviders.includes(providerId)
                ? currentProviders.filter(id => id !== providerId)
                : [...currentProviders, providerId]
        );
    };

    const handleSaveSchedule = () => {
        if (!serviceId) return;

        setSaveStatus('saving');
        const schedules = Object.entries(schedule)
            .filter(([, s]) => s.enabled)
            .map(([day, s]) => ({
                day_of_week: Number(day),
                start_time: s.start_time,
                end_time: s.end_time,
                is_available: true,
            }));

        updateSchedules.mutate({ service_id: serviceId, schedules });
    };

    const handleSaveProviders = () => {
        if (!serviceId) return;

        setSaveStatus('saving');
        updateProviders.mutate({ serviceId, providerIds: selectedProviders });
    };

    if (!serviceId) {
        return (
            <div className="p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                        Please save the service first to configure schedule and providers.
                    </p>
                </div>
            </div>
        );
    }

    if (loadingSchedules || loadingProviders) {
        return (
            <div className="p-6 space-y-6">
                <div className="animate-pulse bg-gray-100 h-64 rounded-lg" />
                <div className="animate-pulse bg-gray-100 h-48 rounded-lg" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-3xl">
            {/* Schedule Configuration */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Service Availability</h3>
                        <p className="text-sm text-gray-500">Set when this service can be booked</p>
                    </div>
                    <button
                        onClick={handleSaveSchedule}
                        disabled={updateSchedules.isPending}
                        className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50"
                    >
                        {updateSchedules.isPending ? 'Saving...' : 'Save Schedule'}
                    </button>
                </div>

                <div className="space-y-3">
                    {DAYS.map(day => (
                        <div key={day.key} className="flex items-center gap-4">
                            <div className="w-28 flex items-center">
                                <input
                                    type="checkbox"
                                    checked={schedule[day.key].enabled}
                                    onChange={e => handleScheduleChange(day.key, 'enabled', e.target.checked)}
                                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                                />
                                <span className="ml-2 text-sm font-medium text-gray-700">
                                    {day.label}
                                </span>
                            </div>

                            {schedule[day.key].enabled ? (
                                <>
                                    <input
                                        type="time"
                                        value={schedule[day.key].start_time}
                                        onChange={e => handleScheduleChange(day.key, 'start_time', e.target.value)}
                                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500"
                                    />
                                    <span className="text-gray-400">to</span>
                                    <input
                                        type="time"
                                        value={schedule[day.key].end_time}
                                        onChange={e => handleScheduleChange(day.key, 'end_time', e.target.value)}
                                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500"
                                    />
                                </>
                            ) : (
                                <span className="text-sm text-gray-400 italic">Not available</span>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Provider Assignment */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Provider Assignment</h3>
                        <p className="text-sm text-gray-500">Select providers who can offer this service</p>
                    </div>
                    <button
                        onClick={handleSaveProviders}
                        disabled={updateProviders.isPending}
                        className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50"
                    >
                        {updateProviders.isPending ? 'Saving...' : 'Save Providers'}
                    </button>
                </div>

                {!allProviders || allProviders.length === 0 ? (
                    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <p className="text-gray-500 mb-2">No providers available</p>
                        <p className="text-sm text-gray-400">
                            Add providers from the Providers page to assign them to services
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {allProviders.map(provider => (
                            <label
                                key={provider.id}
                                className={`
                                    flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                                    ${selectedProviders.includes(provider.id)
                                        ? 'border-teal-500 bg-teal-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }
                                `}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedProviders.includes(provider.id)}
                                    onChange={() => handleProviderToggle(provider.id)}
                                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                                />
                                {provider.photo_url ? (
                                    <img
                                        src={provider.photo_url}
                                        alt={provider.name || ''}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                        <span className="text-teal-700 font-medium">
                                            {provider.name?.charAt(0).toUpperCase() || '?'}
                                        </span>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{provider.name}</p>
                                    {provider.email && (
                                        <p className="text-sm text-gray-500">{provider.email}</p>
                                    )}
                                </div>
                                {!provider.is_active && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                                        Inactive
                                    </span>
                                )}
                            </label>
                        ))}
                    </div>
                )}
            </section>

            {/* Status Messages */}
            {saveStatus === 'saved' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-green-700">Changes saved successfully</span>
                </div>
            )}

            {saveStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <span className="text-sm text-red-700">Failed to save changes. Please try again.</span>
                </div>
            )}
        </div>
    );
}
