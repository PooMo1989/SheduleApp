'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';
import { LogoutButton } from '@/components/common/LogoutButton';
import { useUserProfile } from '@/features/auth/hooks/useUserProfile';

interface AdminLayoutShellProps {
    children: React.ReactNode;
}

/**
 * Admin Layout Shell Component (Story 2.8.4)
 *
 * Main layout wrapper for the admin portal with:
 * - Responsive sidebar navigation
 * - Role-aware navigation (passes roles to sidebar for dual-role support)
 * - Mobile hamburger menu
 * - Top header with user actions
 */
export function AdminLayoutShell({ children }: AdminLayoutShellProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { profile, isLoading } = useUserProfile();

    // Get roles from profile, default to empty array while loading
    const roles = profile?.roles || [];
    const userName = profile?.name || profile?.email || '';

    return (
        <div className="h-screen bg-neutral-50 flex overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex">
                <AdminSidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                    roles={roles}
                />
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setMobileMenuOpen(false)}
                        aria-hidden="true"
                    />
                    {/* Sidebar */}
                    <div className="fixed inset-y-0 left-0 w-64 z-50">
                        <AdminSidebar roles={roles} />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 h-full">
                {/* Top Header */}
                <header className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-neutral-100"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6 text-neutral-700" />
                        ) : (
                            <Menu className="w-6 h-6 text-neutral-700" />
                        )}
                    </button>

                    {/* Mobile Brand */}
                    <span className="md:hidden text-lg font-bold text-primary-600">
                        sheduleApp
                    </span>

                    {/* User info (Desktop) */}
                    <div className="hidden md:flex items-center gap-2">
                        {!isLoading && userName && (
                            <span className="text-sm text-neutral-600">
                                Welcome, <span className="font-medium text-neutral-900">{userName}</span>
                            </span>
                        )}
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-4">
                        <LogoutButton />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-6 overflow-y-auto min-h-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
