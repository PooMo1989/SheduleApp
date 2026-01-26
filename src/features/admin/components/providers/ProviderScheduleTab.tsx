'use client';

// import { AvailabilityEditor } from '@/features/availability/components/AvailabilityEditor'; // Assuming established in Story 2.7.1
// If AvailabilityEditor doesn't exist yet (Tier 8 dependency), we make a placeholder.
// Checking implementation-order.md: Story 2.7.1 is a prerequisite for 6.5, and should be implemented alongside Tier 7/8.
// Since Tier 7 is running now, I should verify if AvailabilityEditor exists.
// If not, I will create a placeholder or a simple schedule viewer.

export function ProviderScheduleTab({ providerId }: { providerId: string }) {
    // For Tier 7, we rely on the generic Availability Editor
    // If it doesn't exist, we stub it.

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">Working Hours</h3>
                <p className="text-sm text-gray-500">Configure when this provider is available for bookings.</p>
            </div>
            <div className="flex-1 p-6 bg-gray-50">
                {/* 
                  NOTE: AvailabilityEditor implementation is part of Story 2.7.1.
                  Using a placeholder if not present, otherwise creating it is a scope creep for this exact file.
                  For now, I'll render a placeholder message guiding to that implementation.
                */}
                <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-blue-600 text-xl font-bold">📅</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Availability Editor</h3>
                    <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                        The visual schedule editor (Story 2.7.1) will be integrated here.
                        It will allow dragging to set weekly hours and adding date overrides.
                    </p>
                </div>
            </div>
        </div>
    );
}
