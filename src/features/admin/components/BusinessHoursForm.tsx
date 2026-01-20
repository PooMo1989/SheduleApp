'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface DayHours {
    open: string | null;
    close: string | null;
    enabled: boolean;
}

type BusinessHours = Record<DayOfWeek, DayHours>;

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DEFAULT_HOURS: BusinessHours = {
    monday: { open: '09:00', close: '17:00', enabled: true },
    tuesday: { open: '09:00', close: '17:00', enabled: true },
    wednesday: { open: '09:00', close: '17:00', enabled: true },
    thursday: { open: '09:00', close: '17:00', enabled: true },
    friday: { open: '09:00', close: '17:00', enabled: true },
    saturday: { open: '09:00', close: '13:00', enabled: true },
    sunday: { open: null, close: null, enabled: false },
};

/**
 * Business Hours Settings Form
 * Story 2.0: Default business hours for new providers
 */
export function BusinessHoursForm() {
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    const { data: settings, isLoading } = trpc.admin.getSettings.useQuery();
    const utils = trpc.useUtils();

    const updateSettings = trpc.admin.updateSettings.useMutation({
        onMutate: () => setSaveStatus('saving'),
        onSuccess: () => {
            setSaveStatus('saved');
            utils.admin.getSettings.invalidate();
            setTimeout(() => setSaveStatus('idle'), 2000);
        },
        onError: () => setSaveStatus('error'),
    });

    const [hours, setHours] = useState<BusinessHours>(() => {
        if (settings?.business_hours) {
            return settings.business_hours as BusinessHours;
        }
        return DEFAULT_HOURS;
    });

    // Update local state when data loads
    if (settings?.business_hours && JSON.stringify(hours) === JSON.stringify(DEFAULT_HOURS)) {
        setHours(settings.business_hours as BusinessHours);
    }

    const updateDay = (day: DayOfWeek, field: keyof DayHours, value: string | boolean) => {
        setHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value,
            },
        }));
    };

    const handleSave = () => {
        updateSettings.mutate({
            business_hours: hours,
        });
    };

    if (isLoading) {
        return <div className="animate-pulse bg-gray-100 h-64 rounded-lg" />;
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Default Business Hours</h3>
                    <p className="text-sm text-gray-500">
                        Default hours for new providers. Each provider can customize their own schedule.
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {DAYS.map(day => (
                    <div key={day} className="flex items-center gap-4">
                        {/* Day checkbox & name */}
                        <div className="w-28 flex items-center">
                            <input
                                type="checkbox"
                                checked={hours[day].enabled}
                                onChange={e => updateDay(day, 'enabled', e.target.checked)}
                                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
                                {day}
                            </span>
                        </div>

                        {/* Time inputs */}
                        {hours[day].enabled ? (
                            <>
                                <input
                                    type="time"
                                    value={hours[day].open || '09:00'}
                                    onChange={e => updateDay(day, 'open', e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500"
                                />
                                <span className="text-gray-400">to</span>
                                <input
                                    type="time"
                                    value={hours[day].close || '17:00'}
                                    onChange={e => updateDay(day, 'close', e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500"
                                />
                            </>
                        ) : (
                            <span className="text-sm text-gray-400 italic">Closed</span>
                        )}
                    </div>
                ))}
            </div>

            {/* Save Button */}
            <div className="mt-6 flex items-center justify-between">
                <div>
                    {saveStatus === 'saved' && (
                        <span className="text-green-600 text-sm">✓ Hours saved</span>
                    )}
                    {saveStatus === 'error' && (
                        <span className="text-red-600 text-sm">✗ Failed to save</span>
                    )}
                </div>
                <button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                >
                    {saveStatus === 'saving' ? 'Saving...' : 'Save Hours'}
                </button>
            </div>
        </div>
    );
}
