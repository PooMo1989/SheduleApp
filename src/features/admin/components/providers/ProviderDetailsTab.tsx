'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { FileUpload } from '@/components/common/FileUpload';
import type { Database } from '@/types/database.types';

type Provider = Database['public']['Tables']['providers']['Row'];

const detailsSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    bio: z.string().max(1000, 'Bio must be less than 1000 characters').optional(),
    phone: z.string().optional(),
    photo_url: z.string().url().nullable().optional(),
    specialization: z.string().optional(),
    schedule_autonomy: z.enum(['self_managed', 'approval_required']).optional(),
});

type TransactionFormData = z.infer<typeof detailsSchema>;

interface ProviderDetailsTabProps {
    provider: Provider;
}

export function ProviderDetailsTab({ provider }: ProviderDetailsTabProps) {
    const utils = trpc.useContext();
    const updateMutation = trpc.provider.update.useMutation({
        onSuccess: () => {
            toast.success('Provider details updated');
            utils.provider.getById.invalidate({ id: provider.id });
            utils.provider.getAll.invalidate();
        },
        onError: (error) => toast.error(error.message),
    });

    const { register, handleSubmit, formState: { errors, isDirty }, setValue, watch } = useForm<TransactionFormData>({
        resolver: zodResolver(detailsSchema),
        defaultValues: {
            name: provider.name,
            bio: provider.bio || '',
            phone: provider.phone || '',
            photo_url: provider.photo_url,
            specialization: provider.specialization || '',
            schedule_autonomy: (provider.schedule_autonomy as 'self_managed' | 'approval_required') || 'self_managed',
        },
    });

    const onSubmit = (data: TransactionFormData) => {
        updateMutation.mutate({
            id: provider.id,
            ...data,
        });
    };

    return (
        <div className="max-w-2xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Photo Upload */}
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                    <div className="w-32 h-32 rounded-full mb-4 sm:mb-0 overflow-hidden shrink-0">
                        <FileUpload
                            bucket="tenant-assets"
                            path={`providers/${provider.id}/photo`}
                            accept="image/*"
                            maxSize={5 * 1024 * 1024} // 5MB
                            currentUrl={watch('photo_url')}
                            onUpload={(url) => setValue('photo_url', url, { shouldDirty: true })}
                        />
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                        <div className="space-y-2">
                            <Label>Email Address (Read-only)</Label>
                            <Input
                                value={provider.email || 'No email linked'}
                                disabled
                                className="bg-neutral-50 text-neutral-500"
                            />
                            <p className="text-xs text-neutral-500">
                                Managed via Team Settings
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input id="name" {...register('name')} />
                        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization / Title</Label>
                        <Input
                            id="specialization"
                            placeholder="e.g. Senior Stylist, Yoga Instructor"
                            {...register('specialization')}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" {...register('phone')} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                        id="bio"
                        rows={4}
                        placeholder="Tell clients about this provider..."
                        {...register('bio')}
                    />
                    {errors.bio && <p className="text-sm text-red-500">{errors.bio.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="schedule_autonomy">Schedule Management</Label>
                    <Select
                        onValueChange={(val) => setValue('schedule_autonomy', val as 'self_managed' | 'approval_required', { shouldDirty: true })}
                        defaultValue={watch('schedule_autonomy')}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select autonomy level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="self_managed">Self-Managed (Provider updates own schedule)</SelectItem>
                            <SelectItem value="approval_required">Approval Required (Admin approves changes)</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-neutral-500">
                        Determines if this provider can change their availability without admin approval.
                    </p>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
