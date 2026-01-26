'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Calendar,
    Clock,
    Users,
    User,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

/**
 * Provider sidebar navigation items
 * Based on user-flow-v3.md Section 8.2
 */
const navItems = [
    { href: '/provider/appointments', label: 'Appointments', icon: Calendar },
    { href: '/provider/schedule', label: 'Schedule', icon: Clock },
    { href: '/provider/clients', label: 'Clients', icon: Users },
    { href: '/provider/profile', label: 'Profile', icon: User },
];

interface ProviderSidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
    companyName?: string;
}

/**
 * Provider Sidebar Component (Story 6.0)
 *
 * Navigation sidebar for provider portal with responsive collapse support.
 * Follows the same design patterns as AdminSidebar for consistency.
 */
export function ProviderSidebar({ collapsed = false, onToggle, companyName }: ProviderSidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={`
                bg-neutral-900 text-white h-full flex flex-col transition-all duration-300
                ${collapsed ? 'w-16' : 'w-64'}
            `}
            aria-label="Provider sidebar"
        >
            {/* Logo/Brand */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                {!collapsed && (
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-primary-400">
                            {companyName || 'sheduleApp'}
                        </span>
                        <span className="text-xs text-neutral-400">Provider Portal</span>
                    </div>
                )}
                {collapsed && (
                    <span className="text-lg font-bold text-primary-400 mx-auto">S</span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4" aria-label="Provider navigation">
                <ul className="space-y-1 px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                        const Icon = item.icon;

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                                        ${isActive
                                            ? 'bg-primary-600 text-white'
                                            : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                                        }
                                    `}
                                    title={collapsed ? item.label : undefined}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {!collapsed && <span>{item.label}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Collapse Toggle */}
            {onToggle && (
                <button
                    onClick={onToggle}
                    className="p-4 border-t border-neutral-800 flex items-center justify-center hover:bg-neutral-800 transition-colors"
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? (
                        <ChevronRight className="w-5 h-5" />
                    ) : (
                        <ChevronLeft className="w-5 h-5" />
                    )}
                </button>
            )}
        </aside>
    );
}
