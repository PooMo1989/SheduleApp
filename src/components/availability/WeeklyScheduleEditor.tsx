'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Database } from '@/types/database.types';

type ProviderSchedule = Database['public']['Tables']['provider_schedules']['Row'];

const DAYS_OF_WEEK = [
    { id: 0, name: 'Sunday' },
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' },
];

interface TimeSlot {
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}

interface WeeklyScheduleEditorProps {
    baseSchedule: ProviderSchedule[];
    onScheduleChange: () => void;
    providerId?: string; // Optional: If provided, edits that provider (Requires Admin)
}

export function WeeklyScheduleEditor({ baseSchedule, onScheduleChange, providerId }: WeeklyScheduleEditorProps) {
    const utils = trpc.useContext();
    const updateMutation = trpc.schedule.updateBaseSchedule.useMutation({
        onSuccess: () => {
            toast.success('Schedule updated');
            onScheduleChange();
            // Invalidate based on context
            if (providerId) {
                utils.schedule.getSchedule.invalidate({ providerId });
            } else {
                utils.schedule.getSchedule.invalidate();
                utils.schedule.getMine.invalidate();
            }
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });

    // Group schedule by day
    const [scheduleMap, setScheduleMap] = useState<Record<number, TimeSlot[]>>({});

    useEffect(() => {
        const map: Record<number, TimeSlot[]> = {};
        DAYS_OF_WEEK.forEach(day => map[day.id] = []);

        baseSchedule.forEach(slot => {
            if (map[slot.day_of_week]) {
                map[slot.day_of_week].push({
                    startTime: slot.start_time.slice(0, 5), // HH:MM:SS -> HH:MM
                    endTime: slot.end_time.slice(0, 5),
                    isAvailable: slot.is_available ?? true,
                });
            }
        });
        setScheduleMap(map);
    }, [baseSchedule]);

    const handleSaveDay = (dayOfWeek: number, slots: TimeSlot[]) => {
        updateMutation.mutate({
            providerId,
            dayOfWeek,
            slots: slots.filter(s => s.isAvailable),
        });
    };

    const addSlot = (dayOfWeek: number) => {
        const newSlots = [...(scheduleMap[dayOfWeek] || [])];
        newSlots.push({ startTime: '09:00', endTime: '17:00', isAvailable: true });

        const newMap = { ...scheduleMap, [dayOfWeek]: newSlots };
        setScheduleMap(newMap);
        handleSaveDay(dayOfWeek, newSlots);
    };

    const removeSlot = (dayOfWeek: number, index: number) => {
        const newSlots = [...(scheduleMap[dayOfWeek] || [])];
        newSlots.splice(index, 1);

        const newMap = { ...scheduleMap, [dayOfWeek]: newSlots };
        setScheduleMap(newMap);
        handleSaveDay(dayOfWeek, newSlots);
    };

    const updateSlot = (dayOfWeek: number, index: number, field: keyof TimeSlot, value: any) => {
        const newSlots = [...(scheduleMap[dayOfWeek] || [])];
        newSlots[index] = { ...newSlots[index], [field]: value };

        const newMap = { ...scheduleMap, [dayOfWeek]: newSlots };
        setScheduleMap(newMap);
    };

    const handleToggleDay = (dayOfWeek: number, isChecked: boolean) => {
        if (!isChecked) {
            // Clear all slots for this day
            setScheduleMap(prev => ({ ...prev, [dayOfWeek]: [] }));
            handleSaveDay(dayOfWeek, []);
        } else {
            // Add default slot
            addSlot(dayOfWeek);
        }
    };

    const copyToAll = (sourceDay: number) => {
        const slotsToCopy = scheduleMap[sourceDay] || [];

        if (confirm(`Copy ${DAYS_OF_WEEK.find(d => d.id === sourceDay)?.name}'s schedule to all other days? This will overwrite existing times.`)) {
            DAYS_OF_WEEK.filter(d => d.id !== sourceDay).forEach(day => {
                // Optimistically update
                setScheduleMap(prev => ({ ...prev, [day.id]: [...slotsToCopy] }));
                handleSaveDay(day.id, slotsToCopy);
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Weekly Recurring Schedule</h3>
                <p className="text-sm text-neutral-500">Set standard weekly availability.</p>
            </div>

            <div className="border rounded-lg divide-y bg-white">
                {DAYS_OF_WEEK.map((day) => {
                    const slots = scheduleMap[day.id] || [];
                    const isDayActive = slots.length > 0;

                    return (
                        <div key={day.id} className="p-4 flex flex-col sm:flex-row sm:items-start gap-4">
                            <div className="w-32 pt-2 flex items-center gap-2">
                                <Checkbox
                                    checked={isDayActive}
                                    onChange={(e) => handleToggleDay(day.id, e.target.checked)}
                                />
                                <span className={cn("font-medium", !isDayActive && "text-neutral-400")}>
                                    {day.name}
                                </span>
                            </div>

                            <div className="flex-1 space-y-3">
                                {!isDayActive ? (
                                    <div className="pt-2 text-neutral-400 text-sm italic">Unavailable</div>
                                ) : (
                                    slots.map((slot, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                type="time"
                                                className="w-32"
                                                value={slot.startTime}
                                                onChange={(e) => updateSlot(day.id, index, 'startTime', e.target.value)}
                                                onBlur={() => handleSaveDay(day.id, slots)}
                                            />
                                            <span className="text-neutral-400">-</span>
                                            <Input
                                                type="time"
                                                className="w-32"
                                                value={slot.endTime}
                                                onChange={(e) => updateSlot(day.id, index, 'endTime', e.target.value)}
                                                onBlur={() => handleSaveDay(day.id, slots)}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-neutral-400 hover:text-red-500"
                                                onClick={() => removeSlot(day.id, index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="flex items-center pt-1 gap-2 opacity-0 hover:opacity-100 transition-opacity">
                                {isDayActive && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => addSlot(day.id)}
                                            className="text-xs"
                                        >
                                            <Plus className="h-3 w-3 mr-1" /> Split
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Copy to all days"
                                            onClick={() => copyToAll(day.id)}
                                        >
                                            <Copy className="h-4 w-4 text-neutral-400" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {updateMutation.isPending && (
                <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-bottom-5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving schedule...
                </div>
            )}
        </div>
    );
}
