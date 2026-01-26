'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
// import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ProviderServicesTabProps {
    providerId: string;
}

export function ProviderServicesTab({ providerId }: ProviderServicesTabProps) {
    // Ideally we fetch all services AND the ones assigned to this provider
    // For now assuming we can fetch all services and check 'assignments'

    // Fetch all services
    const { data: services, isLoading: isLoadingServices } = trpc.service.getAll.useQuery();

    // Fetch assigned services for this provider
    const { data: assignedServices, isLoading: isLoadingAssigned, refetch } = trpc.provider.getAssignedServices.useQuery({ providerId });

    const utils = trpc.useContext();
    const updateAssignmentMutation = trpc.provider.updateServiceAssignment.useMutation({
        onSuccess: () => {
            // alert('Service assignment updated'); // Too noisy
            refetch();
            utils.provider.getAll.invalidate(); // Update count in list
        },
        onError: (err) => alert(err.message),
    });

    const isLoading = isLoadingServices || isLoadingAssigned;

    if (isLoading) {
        return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
    }

    const assignedIds = new Set(assignedServices?.map(s => s.id));

    const handleToggle = (serviceId: string, isChecked: boolean) => {
        updateAssignmentMutation.mutate({
            providerId,
            serviceId,
            assigned: isChecked,
        });
    };

    return (
        <div className="p-6 max-w-3xl">
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900">Assigned Services</h3>
                <p className="text-sm text-gray-500">Select the services this provider operates.</p>
            </div>

            <div className="bg-white border rounded-lg divide-y">
                {services?.map((service) => {
                    const isAssigned = assignedIds.has(service.id);
                    return (
                        <div key={service.id} className="p-4 flex items-start space-x-4 hover:bg-gray-50 transition-colors">
                            <Checkbox
                                id={service.id}
                                checked={isAssigned}
                                onChange={(e) => handleToggle(service.id, e.target.checked)}
                                disabled={updateAssignmentMutation.isPending}
                            />
                            <div className="flex-1 space-y-1">
                                <Label htmlFor={service.id} className="font-medium cursor-pointer">
                                    {service.name}
                                </Label>
                                <p className="text-sm text-gray-500 line-clamp-1">{service.description}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                    <span>{service.duration_minutes} mins</span>
                                    <span>•</span>
                                    <span>${service.price}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {services?.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No services found. create services first.
                    </div>
                )}
            </div>
        </div>
    );
}
