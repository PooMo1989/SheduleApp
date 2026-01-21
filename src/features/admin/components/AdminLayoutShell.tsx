'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';
import { LogoutButton } from '@/components/common/LogoutButton';

interface AdminLayoutShellProps {
    children: React.ReactNode;
}

export function AdminLayoutShell({ children }: AdminLayoutShellProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-neutral-50 flex">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex">
                <AdminSidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    {/* Sidebar */}
                    <div className="fixed inset-y-0 left-0 w-64 z-50">
                        <AdminSidebar />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-neutral-100"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
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

                    {/* Spacer for desktop */}
                    <div className="hidden md:block" />

                    {/* Right side actions */}
                    <div className="flex items-center gap-4">
                        <LogoutButton />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
