"use client";

import { useState, useEffect } from "react";
import { format, addDays, startOfToday } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface BookingDateSelectorProps {
    serviceId: string;
    tenantId: string;
    slug: string;
    durationMinutes: number;
    price: number;
    currency: string;
}

export function BookingDateSelector({
    serviceId,
    tenantId,
    slug,
    durationMinutes,
    price,
    currency
}: BookingDateSelectorProps) {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(startOfToday());
    const [timezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

    // Fetch Availability when date changes
    const { data: availability, isLoading, isError } = trpc.bookingPage.getAvailability.useQuery(
        {
            serviceId,
            tenantId,
            startDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
            endDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "", // Single day view for now
            timezone,
        },
        {
            enabled: !!selectedDate,
            retry: false,
        }
    );

    interface DateSlot {
        startTime: string;
        providerId?: string;
        availableProviderIds?: string[];
    }

    const handleTimeSelect = (slot: DateSlot) => {
        // Navigate to confirmation page
        const params = new URLSearchParams();
        params.set("time", slot.startTime);

        // Handle provider ID assignment
        let assignedProviderId = slot.providerId;
        if (!assignedProviderId && slot.availableProviderIds && slot.availableProviderIds.length > 0) {
            // Simple strategy: Pick first available provider
            // In a real app, we might use round-robin or least-booked logic here or on backend
            assignedProviderId = slot.availableProviderIds[0];
        }

        if (assignedProviderId) {
            params.set("providerId", assignedProviderId);
        }

        router.push(`/book/${slug}/${serviceId}/confirm?${params.toString()}`);
    };

    // Extract slots for the selected date
    const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
    const dayAvailability = availability?.days.find(d => d.date === selectedDateStr);
    const slots = dayAvailability?.slots || [];

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Left: Calendar */}
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Select a Date</h3>
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disablePast={true}
                    className="w-full max-w-[350px] mx-auto md:mx-0"
                />
                <p className="mt-4 text-sm text-slate-500 text-center md:text-left">
                    Timezone: <span className="font-medium text-slate-700">{timezone}</span>
                </p>
            </div>

            {/* Right: Time Slots */}
            <div className="flex-1 md:border-l md:border-slate-100 md:pl-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    {selectedDate ? format(selectedDate, "EEEE, MMMM d") : "Select a date"}
                </h3>

                <div className="min-h-[300px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <p>Checking availability...</p>
                        </div>
                    ) : isError ? (
                        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                            Failed to load slots. Please try again.
                        </div>
                    ) : !selectedDate ? (
                        <div className="text-center py-10 text-slate-400">
                            Please select a date to view times.
                        </div>
                    ) : slots.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-lg">
                            <p className="font-medium">No available times</p>
                            <p className="text-sm mt-1">Try selecting another date.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {slots.map((slot) => (
                                <button
                                    key={slot.startTime}
                                    onClick={() => handleTimeSelect(slot)}
                                    className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white border border-indigo-100 rounded-lg transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                                >
                                    {format(new Date(slot.startTime), "h:mm a")}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
