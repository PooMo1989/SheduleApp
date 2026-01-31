'use client';

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { trpc } from '@/lib/trpc/client';
import { TimeIntervalPicker } from '@/components/ui/TimeIntervalPicker';
import { Plus, Trash2 } from 'lucide-react';

interface TimeSlot {
    start_time: string;
    end_time: string;
}

export interface ServiceScheduleTabRef {
    save: () => Promise<void>;
    hasErrors: () => boolean;
}

interface ServiceScheduleTabProps {
    serviceId: string | null;
    onDirtyChange?: (isDirty: boolean) => void;
}

const DAYS = [
    { key: 0, label: 'Sun', fullLabel: 'Sunday' },
    { key: 1, label: 'Mon', fullLabel: 'Monday' },
    { key: 2, label: 'Tue', fullLabel: 'Tuesday' },
    { key: 3, label: 'Wed', fullLabel: 'Wednesday' },
    { key: 4, label: 'Thu', fullLabel: 'Thursday' },
    { key: 5, label: 'Fri', fullLabel: 'Friday' },
    { key: 6, label: 'Sat', fullLabel: 'Saturday' },
];

const DEFAULT_SLOT: TimeSlot = { start_time: '09:00', end_time: '17:00' };

const DEFAULT_SCHEDULE: Record<number, TimeSlot[]> = {
    0: [], // Sunday - not available by default
    1: [{ ...DEFAULT_SLOT }],
    2: [{ ...DEFAULT_SLOT }],
    3: [{ ...DEFAULT_SLOT }],
    4: [{ ...DEFAULT_SLOT }],
    5: [{ ...DEFAULT_SLOT }],
    6: [{ start_time: '09:00', end_time: '13:00' }], // Saturday - half day
};

/**
 * Parse server schedule data into local format
 */
function parseServerSchedule(serverData: unknown[]): Record<number, TimeSlot[]> {
    if (!serverData || serverData.length === 0) {
        return DEFAULT_SCHEDULE;
    }

    const scheduleMap: Record<number, TimeSlot[]> = {};
    DAYS.forEach(day => {
        scheduleMap[day.key] = [];
    });

    type ScheduleRow = {
        day_of_week: number;
        is_available: boolean | null;
        start_time: string;
        end_time: string;
    };

    (serverData as ScheduleRow[]).forEach(s => {
        if (s.is_available !== false) {
            scheduleMap[s.day_of_week].push({
                start_time: s.start_time?.slice(0, 5) || '09:00',
                end_time: s.end_time?.slice(0, 5) || '17:00',
            });
        }
    });

    return scheduleMap;
}

/**
 * Service Schedule Tab
 * Story 2.3.1: Tab 2 - Schedule & Provider Assignment
 *
 * Exposes save() via ref for parent to trigger unified save.
 * Reports dirty state via onDirtyChange callback.
 */
export const ServiceScheduleTab = forwardRef<ServiceScheduleTabRef, ServiceScheduleTabProps>(
    function ServiceScheduleTab({ serviceId, onDirtyChange }, ref) {
        // Local state - this is the source of truth while editing
        const [schedule, setSchedule] = useState<Record<number, TimeSlot[]> | null>(null);
        const [selectedProviders, setSelectedProviders] = useState<string[] | null>(null);
        const [isInitialized, setIsInitialized] = useState(false);

        // Track saved state to compare for dirty detection
        const [savedSchedule, setSavedSchedule] = useState<Record<number, TimeSlot[]> | null>(null);
        const [savedProviders, setSavedProviders] = useState<string[] | null>(null);

        // For cache invalidation after save
        const utils = trpc.useUtils();

        // Fetch server data (only used for initial load)
        const { data: serverSchedules, isLoading: loadingSchedules } = trpc.service.getSchedules.useQuery(
            { serviceId: serviceId! },
            { enabled: !!serviceId }
        );

        const { data: serverProviders, isLoading: loadingProviders } = trpc.service.getProviders.useQuery(
            { serviceId: serviceId! },
            { enabled: !!serviceId }
        );

        const { data: allProviders } = trpc.provider.getAll.useQuery();

        // Initialize local state from server data ONCE
        useEffect(() => {
            if (!isInitialized && !loadingSchedules && !loadingProviders) {
                // Initialize schedule
                const initialSchedule = serverSchedules
                    ? parseServerSchedule(serverSchedules)
                    : DEFAULT_SCHEDULE;
                setSchedule(initialSchedule);
                setSavedSchedule(initialSchedule);

                // Initialize providers
                const initialProviders = serverProviders
                    ? serverProviders.map(p => p?.id).filter(Boolean) as string[]
                    : [];
                setSelectedProviders(initialProviders);
                setSavedProviders(initialProviders);

                setIsInitialized(true);
            }
        }, [serverSchedules, serverProviders, loadingSchedules, loadingProviders, isInitialized]);

        // Track previous serviceId to detect actual changes vs remounts
        const prevServiceIdRef = useRef<string | null>(null);

        // Reset only when serviceId actually changes to a different value (not on remount)
        useEffect(() => {
            if (prevServiceIdRef.current !== null && prevServiceIdRef.current !== serviceId) {
                // serviceId changed to a different service - reset state
                setIsInitialized(false);
                setSchedule(null);
                setSelectedProviders(null);
                setSavedSchedule(null);
                setSavedProviders(null);
            }
            prevServiceIdRef.current = serviceId;
        }, [serviceId]);

        // Dirty state detection
        const isDirty = (): boolean => {
            if (!schedule || !selectedProviders || !savedSchedule || !savedProviders) {
                return false;
            }
            const scheduleChanged = JSON.stringify(schedule) !== JSON.stringify(savedSchedule);
            const providersChanged = JSON.stringify(selectedProviders) !== JSON.stringify(savedProviders);
            return scheduleChanged || providersChanged;
        };

        // Notify parent of dirty state changes
        useEffect(() => {
            onDirtyChange?.(isDirty());
        }, [schedule, selectedProviders, savedSchedule, savedProviders, onDirtyChange]);

        const updateSchedules = trpc.service.updateSchedules.useMutation({
            onSuccess: () => {
                // Invalidate cache so remount gets fresh data
                if (serviceId) {
                    utils.service.getSchedules.invalidate({ serviceId });
                }
                // Update saved state
                setSavedSchedule(schedule);
            },
        });

        const updateProviders = trpc.service.updateProviders.useMutation({
            onSuccess: () => {
                // Invalidate cache so remount gets fresh data
                if (serviceId) {
                    utils.service.getProviders.invalidate({ serviceId });
                }
                // Update saved state
                setSavedProviders(selectedProviders);
            },
        });

        // Helper: Convert "HH:MM" to minutes since midnight
        const timeToMinutes = (time: string): number => {
            const [hours, mins] = time.split(':').map(Number);
            return hours * 60 + mins;
        };

        // Helper: Convert minutes to "HH:MM"
        const minutesToTime = (minutes: number): string => {
            const h = Math.floor(minutes / 60) % 24;
            const m = minutes % 60;
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        };

        /**
         * Validate a single slot and return specific error message
         */
        const validateSlot = (dayKey: number, slotIndex: number, slot: TimeSlot): string | null => {
            if (!schedule) return null;

            const startMinutes = timeToMinutes(slot.start_time);
            const endMinutes = timeToMinutes(slot.end_time);

            if (startMinutes === endMinutes) {
                return 'Start and end time cannot be the same';
            }

            if (endMinutes < startMinutes) {
                return 'End time must be after start time';
            }

            const daySlots = schedule[dayKey] || [];

            for (let i = 0; i < daySlots.length; i++) {
                if (i === slotIndex) continue;

                const otherSlot = daySlots[i];
                const otherStart = timeToMinutes(otherSlot.start_time);
                const otherEnd = timeToMinutes(otherSlot.end_time);

                if (startMinutes < otherEnd && endMinutes > otherStart) {
                    if (startMinutes >= otherStart && endMinutes <= otherEnd) {
                        return `This slot is contained within slot ${i + 1}`;
                    } else if (startMinutes <= otherStart && endMinutes >= otherEnd) {
                        return `This slot contains slot ${i + 1}`;
                    } else if (startMinutes < otherEnd && startMinutes >= otherStart) {
                        return `Start time overlaps with slot ${i + 1}`;
                    } else if (endMinutes > otherStart && endMinutes <= otherEnd) {
                        return `End time overlaps with slot ${i + 1}`;
                    }
                    return `Overlaps with slot ${i + 1}`;
                }
            }

            return null;
        };

        // Check if entire schedule has any validation errors
        const hasScheduleErrors = (): boolean => {
            if (!schedule) return false;
            for (const [dayKey, slots] of Object.entries(schedule)) {
                for (let i = 0; i < slots.length; i++) {
                    if (validateSlot(Number(dayKey), i, slots[i])) {
                        return true;
                    }
                }
            }
            return false;
        };

        // Expose save function and error check to parent via ref
        useImperativeHandle(ref, () => ({
            save: async () => {
                if (!serviceId || !schedule || !selectedProviders) return;

                const promises: Promise<unknown>[] = [];

                // Save schedule if changed
                if (JSON.stringify(schedule) !== JSON.stringify(savedSchedule)) {
                    const schedules: Array<{
                        day_of_week: number;
                        start_time: string;
                        end_time: string;
                        is_available: boolean;
                    }> = [];

                    Object.entries(schedule).forEach(([day, slots]) => {
                        slots.forEach(slot => {
                            schedules.push({
                                day_of_week: Number(day),
                                start_time: slot.start_time,
                                end_time: slot.end_time,
                                is_available: true,
                            });
                        });
                    });

                    promises.push(updateSchedules.mutateAsync({ service_id: serviceId, schedules }));
                }

                // Save providers if changed
                if (JSON.stringify(selectedProviders) !== JSON.stringify(savedProviders)) {
                    promises.push(updateProviders.mutateAsync({ serviceId, providerIds: selectedProviders }));
                }

                await Promise.all(promises);
            },
            hasErrors: hasScheduleErrors,
        }), [serviceId, schedule, selectedProviders, savedSchedule, savedProviders, updateSchedules, updateProviders]);

        const handleToggleDay = (day: number, enabled: boolean) => {
            if (!schedule) return;
            if (enabled) {
                setSchedule({ ...schedule, [day]: [{ ...DEFAULT_SLOT }] });
            } else {
                setSchedule({ ...schedule, [day]: [] });
            }
        };

        const handleAddSlot = (day: number) => {
            if (!schedule) return;
            const existingSlots = schedule[day] || [];
            const lastSlot = existingSlots[existingSlots.length - 1];

            let newSlot: TimeSlot;
            if (lastSlot) {
                const startMinutes = timeToMinutes(lastSlot.end_time);
                const endMinutes = Math.min(startMinutes + 60, 23 * 60 + 45);

                if (startMinutes >= 23 * 60 + 45) {
                    return;
                }

                newSlot = {
                    start_time: lastSlot.end_time,
                    end_time: minutesToTime(endMinutes),
                };
            } else {
                newSlot = { ...DEFAULT_SLOT };
            }

            setSchedule({ ...schedule, [day]: [...existingSlots, newSlot] });
        };

        const handleRemoveSlot = (day: number, index: number) => {
            if (!schedule) return;
            const newSlots = [...(schedule[day] || [])];
            newSlots.splice(index, 1);
            setSchedule({ ...schedule, [day]: newSlots });
        };

        const handleSlotChange = (day: number, index: number, field: keyof TimeSlot, value: string) => {
            if (!schedule) return;
            const newSlots = [...(schedule[day] || [])];
            newSlots[index] = { ...newSlots[index], [field]: value };
            setSchedule({ ...schedule, [day]: newSlots });
        };

        const handleProviderToggle = (providerId: string) => {
            if (!selectedProviders) return;
            setSelectedProviders(
                selectedProviders.includes(providerId)
                    ? selectedProviders.filter(id => id !== providerId)
                    : [...selectedProviders, providerId]
            );
        };

        if (!serviceId) {
            return (
                <div className="p-8">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-sm">
                        <p className="text-amber-900 text-sm font-medium">
                            Please save the service first to configure schedule and providers.
                        </p>
                    </div>
                </div>
            );
        }

        // Show loading while fetching or initializing
        if (loadingSchedules || loadingProviders || !isInitialized || !schedule || !selectedProviders) {
            return (
                <div className="p-8 space-y-8">
                    <div className="animate-pulse bg-gray-100 h-64 rounded-lg" />
                    <div className="animate-pulse bg-gray-100 h-48 rounded-lg" />
                </div>
            );
        }

        return (
            <div className="p-8 space-y-8 max-w-3xl">
                {/* Schedule Configuration */}
                <section className="border-t border-gray-100 pt-8 pb-8 first:border-t-0 first:pt-0">
                    <div className="mb-6">
                        <h3 className="text-base font-semibold text-gray-900 tracking-tight">Service Availability</h3>
                        <p className="text-sm text-gray-600 mt-1">Set when this service can be booked. Add multiple time windows per day.</p>
                    </div>

                    <div className="space-y-6">
                        {DAYS.map(day => {
                            const slots = schedule[day.key] || [];
                            const isEnabled = slots.length > 0;
                            const slotOffset = 'ml-[80px]';

                            return (
                                <div key={day.key} className="pb-2">
                                    {/* First row: Day + Toggle + First Slot + Add Button */}
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={isEnabled}
                                            onChange={e => handleToggleDay(day.key, e.target.checked)}
                                            className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500 focus:ring-offset-0 border-gray-300"
                                        />
                                        <span className={`w-10 text-sm font-medium ${isEnabled ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {day.label}
                                        </span>

                                        {isEnabled && slots[0] ? (
                                            <>
                                                <TimeIntervalPicker
                                                    value={slots[0].start_time}
                                                    onChange={value => handleSlotChange(day.key, 0, 'start_time', value)}
                                                />
                                                <span className="text-xs text-gray-400">–</span>
                                                <TimeIntervalPicker
                                                    value={slots[0].end_time}
                                                    onChange={value => handleSlotChange(day.key, 0, 'end_time', value)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSlot(day.key, 0)}
                                                    className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                                                    title="Remove"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddSlot(day.key)}
                                                    className="p-1 text-gray-400 hover:text-teal-600 transition-colors"
                                                    title="Add time slot"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                                {(() => {
                                                    const error = validateSlot(day.key, 0, slots[0]);
                                                    return error ? <span className="text-xs text-red-500">{error}</span> : null;
                                                })()}
                                            </>
                                        ) : (
                                            <span className="text-sm text-gray-400">Unavailable</span>
                                        )}
                                    </div>

                                    {/* Additional slots - aligned with first slot */}
                                    {isEnabled && slots.length > 1 && (
                                        <div className={`mt-1.5 space-y-1.5 ${slotOffset}`}>
                                            {slots.slice(1).map((slot, idx) => {
                                                const index = idx + 1;
                                                const error = validateSlot(day.key, index, slot);
                                                return (
                                                    <div key={index} className="flex items-center gap-3">
                                                        <TimeIntervalPicker
                                                            value={slot.start_time}
                                                            onChange={value => handleSlotChange(day.key, index, 'start_time', value)}
                                                        />
                                                        <span className="text-xs text-gray-400">–</span>
                                                        <TimeIntervalPicker
                                                            value={slot.end_time}
                                                            onChange={value => handleSlotChange(day.key, index, 'end_time', value)}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveSlot(day.key, index)}
                                                            className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                                                            title="Remove"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                        {error && <span className="text-xs text-red-500">{error}</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Provider Assignment */}
                <section className="border-t border-gray-100 pt-8 pb-8">
                    <div className="mb-6">
                        <h3 className="text-base font-semibold text-gray-900 tracking-tight">Provider Assignment</h3>
                        <p className="text-sm text-gray-600 mt-1">Select providers who can offer this service</p>
                    </div>

                    {!allProviders || allProviders.length === 0 ? (
                        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-6 text-center">
                            <p className="text-gray-600 mb-1 font-medium">No providers available</p>
                            <p className="text-sm text-gray-500">
                                Add providers from the Providers page to assign them to services
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {allProviders.map(provider => (
                                <label
                                    key={provider.id}
                                    className={`
                                        flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all duration-150
                                        ${selectedProviders.includes(provider.id)
                                            ? 'border-teal-500 bg-teal-50 shadow-sm'
                                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                        }
                                    `}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedProviders.includes(provider.id)}
                                        onChange={() => handleProviderToggle(provider.id)}
                                        className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500 focus:ring-offset-0 border-gray-300 transition-colors"
                                    />
                                    {provider.photo_url ? (
                                        <img
                                            src={provider.photo_url}
                                            alt={provider.name || ''}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                            <span className="text-teal-700 font-medium text-sm">
                                                {provider.name?.charAt(0).toUpperCase() || '?'}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 text-sm">{provider.name}</p>
                                        {provider.email && (
                                            <p className="text-sm text-gray-500 truncate">{provider.email}</p>
                                        )}
                                    </div>
                                    {!provider.is_active && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                                            Inactive
                                        </span>
                                    )}
                                </label>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        );
    }
);
