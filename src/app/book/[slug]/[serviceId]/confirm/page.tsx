import { api } from "@/lib/trpc/api";
import { notFound, redirect } from "next/navigation";
import { BookingForm } from "@/components/booking/BookingForm";
import { ChevronLeft, Calendar as CalendarIcon, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface PageProps {
    params: Promise<{
        slug: string;
        serviceId: string;
    }>;
    searchParams: Promise<{
        time?: string;
        providerId?: string;
    }>;
}

export default async function BookingConfirmPage({ params, searchParams }: PageProps) {
    const { slug, serviceId } = await params;
    const { time, providerId } = await searchParams;
    const trpc = await api();

    // Validate parameters
    if (!time) {
        redirect(`/ book / ${slug}/${serviceId}`);
    }

    // 1. Fetch Service
    let service;
    try {
        service = await trpc.bookingPage.getServiceById({ serviceId });
    } catch {
        notFound();
    }

    // 2. Fetch Tenant (for ID)
    let tenant;
    try {
        tenant = await trpc.bookingPage.getTenantBySlug({ slug });
    } catch {
        notFound();
    }

    // 3. Optional: Fetch Provider Name if providerId is present
    // We don't strictly need to fail if we can't fetch it, but it's nice for UI.
    // Since we don't have a specific public 'getProviderById', we'll skip displaying the name 
    // or rely on a future optimization. For now, "Any Provider" or specific doesn't matter much for functionality.

    const date = new Date(time);

    return (
        <div className="flex flex-col h-full bg-slate-50 min-h-screen">
            <div className="max-w-2xl mx-auto w-full p-4 md:p-8">
                {/* Back Link */}
                <Link
                    href={`/book/${slug}/${serviceId}`}
                    className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Date Selection
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                        <h1 className="text-xl font-bold text-slate-900 mb-4">Confirm your booking</h1>

                        {/* Booking Summary Card */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
                            <h2 className="font-semibold text-slate-900">{service.name}</h2>

                            <div className="flex items-center text-sm text-slate-600">
                                <CalendarIcon className="w-4 h-4 mr-2 text-indigo-500" />
                                <span>{format(date, "EEEE, MMMM d, yyyy")}</span>
                            </div>

                            <div className="flex items-center text-sm text-slate-600">
                                <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                                <span>{format(date, "h:mm a")} ({service.duration_minutes} mins)</span>
                            </div>

                            {/* Price */}
                            <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-sm text-slate-500">Price</span>
                                <span className="font-medium text-slate-900">
                                    {service.pricing_type === 'free'
                                        ? 'Free'
                                        : `${service.currency || 'USD'} ${service.price}`}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Details</h3>
                        <BookingForm
                            serviceId={serviceId}
                            tenantId={tenant.id}
                            providerId={providerId}
                            startTime={time}
                            slug={slug}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
