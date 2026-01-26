'use client';

import { useState } from 'react';
import { Menu, X, ArrowLeft, Eye } from 'lucide-react';
import { ProviderSidebar } from '@/features/provider/components/ProviderSidebar';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';

interface ImpersonationLayoutProps {
    children: React.ReactNode;
    providerId: string;
}

/**
 * Impersonation Layout (Story 2.8.3)
 *
 * Wraps the Provider Portal views with an Admin overlay.
 */
export function ImpersonationLayout({
    children,
    providerId
}: ImpersonationLayoutProps) {
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Fetch provider details to show name
    const { data: provider } = trpc.provider.getById.useQuery({ id: providerId });

    const exitImpersonation = () => {
        // Return to the admin detail view for this provider
        router.push(`/admin/providers?open=${providerId}`);
        // Alternatively: router.push(`/admin/providers`);
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col">
            {/* Impersonation Banner */}
            <div className="bg-orange-600 text-white px-4 py-2 flex items-center justify-between shadow-sm z-50">
                <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">
                        Viewing as: <strong>{provider?.name || 'Loading...'}</strong>
                    </span>
                </div>
                <button
                    onClick={exitImpersonation}
                    className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors flex items-center gap-1"
                >
                    <ArrowLeft className="w-3 h-3" />
                    Exit Impersonation
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Desktop Sidebar */}
                <div className="hidden md:flex">
                    <ProviderSidebar
                        collapsed={sidebarCollapsed}
                        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                        companyName="Admin View"
                        basePath={`/admin/impersonate/${providerId}`}
                    />
                </div>

                {/* Mobile Sidebar Overlay */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-50 md:hidden">
                        <div
                            className="fixed inset-0 bg-black/50"
                            onClick={() => setMobileMenuOpen(false)}
                            aria-hidden="true"
                        />
                        <div className="fixed inset-y-0 left-0 w-64 z-50 pt-10"> {/* pt-10 to account for banner if needed, though fixed usually covers */}
                            <ProviderSidebar
                                companyName="Admin View"
                                basePath={`/admin/impersonate/${providerId}`}
                            />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Top Header */}
                    <header className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-neutral-100"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        <span className="md:hidden text-lg font-bold text-primary-600">
                            Provider View
                        </span>

                        <div className="hidden md:flex items-center gap-2">
                            <span className="text-sm text-neutral-500 italic">
                                Read-only mode for private notes enabled
                            </span>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 p-4 md:p-6 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
