'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { CalendarIcon, Plus, Trash2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Database } from '@/types/database.types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ScheduleOverride = Database['public']['Tables']['schedule_overrides']['Row'];

interface DateOverrideManagerProps {
    overrides: ScheduleOverride[];
    onOverrideChange: () => void;
    providerId?: string; // Optional: Admin mode
}

export function DateOverrideManager({ overrides, onOverrideChange, providerId }: DateOverrideManagerProps) {
    const utils = trpc.useContext();
    const [isAdding, setIsAdding] = useState(false);

    // New Override State
    const [newDate, setNewDate] = useState('');
    const [newType, setNewType] = useState<'unavailable' | 'custom'>('unavailable');
    const [newStartTime, setNewStartTime] = useState('09:00');
    const [newEndTime, setNewEndTime] = useState('17:00');
    const [newReason, setNewReason] = useState('');

    const upsertMutation = trpc.schedule.upsertOverride.useMutation({
        onSuccess: () => {
            toast.success('Exception saved');
            setIsAdding(false);
            resetForm();
            onOverrideChange();
            if (providerId) {
                utils.schedule.getSchedule.invalidate({ providerId });
            } else {
                utils.schedule.getSchedule.invalidate();
                utils.schedule.getMine.invalidate();
            }
        },
        onError: (err) => toast.error(err.message),
    });

    const deleteMutation = trpc.schedule.deleteOverride.useMutation({
        onSuccess: () => {
            toast.success('Exception removed');
            onOverrideChange();
            if (providerId) {
                utils.schedule.getSchedule.invalidate({ providerId });
            } else {
                utils.schedule.getSchedule.invalidate();
                utils.schedule.getMine.invalidate();
            }
        },
        onError: (err) => toast.error(err.message),
    });

    const resetForm = () => {
        setNewDate('');
        setNewType('unavailable');
        setNewReason('');
        setNewStartTime('09:00');
        setNewEndTime('17:00');
    };

    const handleAdd = () => {
        if (!newDate) return toast.error('Please select a date');

        upsertMutation.mutate({
            providerId,
            date: newDate,
            isAvailable: newType === 'custom',
            startTime: newType === 'custom' ? newStartTime : null,
            endTime: newType === 'custom' ? newEndTime : null,
            reason: newReason || (newType === 'unavailable' ? 'Unavailable' : 'Custom Hours'),
        });
    };

    const handleDelete = (date: string) => {
        if (confirm('Remove this exception?')) {
            deleteMutation.mutate({
                date,
                providerId
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Date-Specific Overrides</h3>
                <Button variant="outline" size="sm" onClick={() => setIsAdding(!isAdding)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Exception
                </Button>
            </div>

            {isAdding && (
                <div className="bg-slate-50 p-4 rounded-lg border space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Availability</Label>
                            <Select
                                value={newType}
                                onValueChange={(val: any) => setNewType(val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unavailable">Unavailable (Off)</SelectItem>
                                    <SelectItem value="custom">Custom Hours</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {newType === 'custom' && (
                        <div className="flex items-center gap-4">
                            <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Input type="time" value={newStartTime} onChange={e => setNewStartTime(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <Input type="time" value={newEndTime} onChange={e => setNewEndTime(e.target.value)} />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Reason (Optional)</Label>
                        <Input
                            placeholder="e.g. Public Holiday, Doctor Appt"
                            value={newReason}
                            onChange={e => setNewReason(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                        <Button onClick={handleAdd} disabled={upsertMutation.isPending}>
                            {upsertMutation.isPending ? 'Saving...' : 'Add Override'}
                        </Button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {overrides.length === 0 && !isAdding && (
                    <div className="text-center py-8 text-neutral-500 border-2 border-dashed rounded-lg">
                        <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No date-specific exceptions set.</p>
                    </div>
                )}

                {overrides.map((override) => (
                    <div key={override.id} className="flex items-center justify-between p-3 border rounded-md bg-white hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-100 rounded-md border text-xs font-medium">
                                <span className="uppercase text-slate-500">{format(new Date(override.override_date), 'MMM')}</span>
                                <span className="text-lg text-slate-900">{format(new Date(override.override_date), 'dd')}</span>
                            </div>
                            <div>
                                <div className="font-medium">
                                    {override.is_available ? (
                                        <span className="text-green-600 flex items-center gap-1">
                                            {override.start_time?.slice(0, 5)} - {override.end_time?.slice(0, 5)}
                                        </span>
                                    ) : (
                                        <span className="text-red-500 flex items-center gap-1">
                                            Unavailable
                                        </span>
                                    )}
                                </div>
                                {override.reason && (
                                    <p className="text-sm text-neutral-500">{override.reason}</p>
                                )}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-neutral-400 hover:text-red-500"
                            onClick={() => handleDelete(override.override_date)}
                            disabled={deleteMutation.isPending}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
