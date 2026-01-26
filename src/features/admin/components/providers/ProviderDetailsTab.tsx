'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/trpc/client';
// import { toast } from 'sonner';
import { FileUpload } from '@/components/common/FileUpload'; // Explicit path often safer if index is wonky, but let's trust file existence
import type { Database } from '@/types/database.types';
type Provider = Database['public']['Tables']['providers']['Row'];

const detailsSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    bio: z.string().optional(),
    phone: z.string().optional(),
    photo_url: z.string().optional(),
    specialization: z.string().optional(),
    schedule_autonomy: z.enum(['self_managed', 'approval_required']),
});

type DetailsFormData = z.infer<typeof detailsSchema>;

interface ProviderDetailsTabProps {
    provider: any; // Ideally strictly typed
}

export function ProviderDetailsTab({ provider }: ProviderDetailsTabProps) {
    const { register, handleSubmit, formState: { isDirty, isSubmitting }, setValue, watch } = useForm<DetailsFormData>({
        resolver: zodResolver(detailsSchema),
        defaultValues: {
            name: provider.name,
            bio: provider.bio || '',
            phone: provider.phone || '',
            photo_url: provider.photo_url || '',
            specialization: provider.specialization || '',
            schedule_autonomy: provider.schedule_autonomy || 'self_managed',
        },
    });

    const utils = trpc.useContext();
    const updateMutation = trpc.provider.update.useMutation({
        onSuccess: () => {
            alert('Provider details updated');
            utils.provider.getById.invalidate({ id: provider.id });
            utils.provider.getAll.invalidate();
        },
        onError: (error) => alert(error.message),
    });

    const onSubmit = (data: DetailsFormData) => {
        updateMutation.mutate({
            id: provider.id,
            ...data,
        });
    };

    return (
        <div className="p-6 max-w-2xl">
            <h3 className="text-lg font-medium mb-6">Provider Profile</h3>

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
                            <Label htmlFor="email">Email Address (Read-only)</Label>
                            <Input id="email" value={provider.email || ''} readOnly className="bg-gray-50" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Display Name</Label>
                            <Input id="name" {...register('name')} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input
                            id="specialization"
                            {...register('specialization')}
                            placeholder="e.g. Senior Instructor"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" {...register('phone')} placeholder="+1 (555) 000-0000" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="autonomy">Schedule Autonomy</Label>
                    <Select
                        onValueChange={(val) => setValue('schedule_autonomy', val as any, { shouldDirty: true })}
                        defaultValue={watch('schedule_autonomy')}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select autonomy level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="self_managed">Self Managed (Full Control)</SelectItem>
                            <SelectItem value="approval_required">Approval Required (Admin Controls)</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                        Controls whether this provider can change their own availability blocks.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bio">Biography</Label>
                    <Textarea
                        id="bio"
                        {...register('bio')}
                        placeholder="Tell clients about this provider..."
                        rows={4}
                    />
                </div>

                <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={!isDirty || isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
