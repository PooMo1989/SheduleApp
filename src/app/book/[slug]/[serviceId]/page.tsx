import { api } from "@/lib/trpc/api";
import { notFound } from "next/navigation";
import Image from "next/image";
import { BookingDateSelector } from "@/components/booking/BookingDateSelector";
import { ChevronLeft, Clock, Banknote } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{
        slug: string;
        serviceId: string;
    }>;
}

export default async function BookingServicePage({ params }: PageProps) {
    const { slug, serviceId } = await params;
    const trpc = await api();

    // 1. Fetch Tenant
    let tenant;
    try {
        tenant = await trpc.bookingPage.getTenantBySlug({ slug });
    } catch {
        notFound();
    }

    // 2. Fetch Service
    let service;
    try {
        service = await trpc.bookingPage.getServiceById({ serviceId });
    } catch {
        notFound();
    }

    // Helper to format currency
    const formatPrice = (price: number, currency = "USD") => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
        }).format(price);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto w-full p-4 md:p-8">
                {/* Back Link */}
                <Link
                    href={`/book/${slug}`}
                    className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Services
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header: Service Details */}
                    <div className="p-6 md:p-8 border-b border-slate-100">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 mb-2">{service.name}</h1>
                                {service.description && (
                                    <p className="text-slate-600 mb-4 text-sm max-w-xl">{service.description}</p>
                                )}

                                <div className="flex items-center gap-6 text-sm text-slate-500">
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1.5" />
                                        <span>{service.duration_minutes} mins</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Banknote className="w-4 h-4 mr-1.5" />
                                        <span>
                                            {service.pricing_type === 'free'
                                                ? 'Free'
                                                : formatPrice(service.price, service.currency || "USD")}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Optional: Service Image */}
                            {service.image_url && (
                                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                                    <Image
                                        src={service.image_url}
                                        alt={service.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Body: Date & Time Selection */}
                    <div className="p-6 md:p-8">
                        <BookingDateSelector
                            serviceId={service.id}
                            tenantId={tenant.id}
                            slug={slug}
                            durationMinutes={service.duration_minutes}
                            price={service.price}
                            currency={service.currency || "USD"}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
