import { api } from "@/lib/trpc/api";
import Link from "next/link";
import Image from "next/image";

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function BookingPage({ params }: PageProps) {
    const { slug } = await params;
    const trpc = await api();

    // 1. Fetch Tenant (Company) Info
    // Removed try/catch to expose real errors (Env/Auth/DB) instead of 404
    const tenant = await trpc.bookingPage.getTenantBySlug({ slug });

    // 2. Fetch Services
    const services = await trpc.bookingPage.getServices({ tenantId: tenant.id });

    // Safe logo handling
    // Note: Assuming settings structure matches Story 2.0.3
    const settings = tenant.settings as { logo_url?: string; brand_color?: string } | null;
    const brandColor = settings?.brand_color || "#0D9488"; // Default Teal

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <header className="p-6 border-b border-slate-100 flex flex-col items-center space-y-3">
                {settings?.logo_url ? (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border border-slate-100">
                        <Image
                            src={settings.logo_url}
                            alt={tenant.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                ) : (
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                        style={{ backgroundColor: brandColor }}
                    >
                        {tenant.name.substring(0, 2).toUpperCase()}
                    </div>
                )}
                <h1 className="text-xl font-semibold text-slate-900">{tenant.name}</h1>
                <p className="text-sm text-slate-500">Select a service to book</p>
            </header>

            {/* Service List */}
            <main className="flex-1 overflow-y-auto p-4 space-y-3">
                {services.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        <p>No public services available.</p>
                    </div>
                ) : (
                    services.map((service) => (
                        <Link
                            key={service.id}
                            href={`/book/${slug}/${service.id}`}
                            className="group border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer flex justify-between items-center block"
                        >
                            <div>
                                <h3 className="font-medium text-slate-900 group-hover:text-slate-700">
                                    {service.name}
                                </h3>
                                <div className="mt-1 flex items-center text-sm text-slate-500 space-x-3">
                                    <span>{service.duration_minutes} min</span>
                                    <span>•</span>
                                    <span className="font-medium text-slate-900">
                                        {service.pricing_type === 'free'
                                            ? 'Free'
                                            : `${service.currency || 'LKR'} ${service.price}`}
                                    </span>
                                </div>
                            </div>
                            <div className="text-slate-400 group-hover:text-slate-600">
                                →
                            </div>
                        </Link>
                    ))
                )}
            </main>

            {/* Footer */}
            <footer className="p-4 border-t border-slate-50 text-center">
                <p className="text-xs text-slate-400">Powered by sheduleApp</p>
            </footer>
        </div>
    );
}
