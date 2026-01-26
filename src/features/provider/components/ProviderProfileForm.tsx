'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { FileUpload } from '@/components/common/FileUpload';
import type { Database } from '@/types/database.types';

type Provider = Database['public']['Tables']['providers']['Row'];

const profileSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    bio: z.string().max(1000).optional(),
    phone: z.string().optional(),
    photo_url: z.string().url().nullable().optional(),
});

type FormData = z.infer<typeof profileSchema>;

interface ProviderProfileFormProps {
    provider: Provider;
}

export function ProviderProfileForm({ provider }: ProviderProfileFormProps) {
    const utils = trpc.useContext();
    const updateMutation = trpc.provider.updateOwn.useMutation({
        onSuccess: () => {
            toast.success('Profile updated');
            utils.provider.getMine.invalidate();
        },
        onError: (err) => toast.error(err.message),
    });

    const { register, handleSubmit, formState: { errors, isDirty }, setValue, watch } = useForm<FormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: provider.name,
            bio: provider.bio || '',
            phone: provider.phone || '',
            photo_url: provider.photo_url,
        },
    });

    const onSubmit = (data: FormData) => {
        updateMutation.mutate(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Photo Upload */}
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                <div className="w-32 h-32 rounded-full overflow-hidden shrink-0 border-2 border-slate-100">
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
                    <div className="space-y-1">
                        <Label>Email</Label>
                        <div className="text-sm font-medium text-slate-900">{provider.email || 'Not set'}</div>
                        <p className="text-xs text-neutral-500">Contact admin to update email address.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" {...register('name')} />
                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" {...register('phone')} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="bio">Bio / About Me</Label>
                <Textarea
                    id="bio"
                    rows={4}
                    {...register('bio')}
                    placeholder="Tell clients a bit about yourself..."
                />
                {errors.bio && <p className="text-sm text-red-500">{errors.bio.message}</p>}
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
}
