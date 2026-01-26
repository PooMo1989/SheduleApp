'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/trpc/client';
// import { toast } from 'sonner';

const inviteSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email is required'),
    specialization: z.string().optional(),
    schedule_autonomy: z.enum(['self_managed', 'approval_required']),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface ProviderInviteFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ProviderInviteForm({ isOpen, onClose, onSuccess }: ProviderInviteFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<InviteFormData>({
        resolver: zodResolver(inviteSchema),
        defaultValues: {
            schedule_autonomy: 'self_managed',
        },
    });

    const inviteMutation = trpc.team.invite.useMutation({
        onSuccess: () => {
            alert('Provider invited successfully');
            reset();
            onSuccess();
        },
        onError: (error) => {
            alert(error.message);
            setIsSubmitting(false);
        },
    });

    const onSubmit = (data: InviteFormData) => {
        setIsSubmitting(true);
        inviteMutation.mutate({
            ...data,
            roles: ['provider'], // Use roles array as per updated schema
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Invite New Provider</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" {...register('name')} placeholder="e.g. Dr. Sarah Smith" />
                        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" {...register('email')} placeholder="sarah@example.com" />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization (Optional)</Label>
                        <Input id="specialization" {...register('specialization')} placeholder="e.g. Cardiologist, Yoga Instructor" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="autonomy">Schedule Autonomy</Label>
                        <Select
                            onValueChange={(val) => setValue('schedule_autonomy', val as any)}
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
                            Determines if the provider can modify their own availability without approval.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Sending Invite...' : 'Send Invitation'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
