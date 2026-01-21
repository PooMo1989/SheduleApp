'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    Briefcase,
    Users,
    Building2,
    Code2,
    Settings,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
    { href: '/admin/services', label: 'Services', icon: Briefcase },
    { href: '/admin/team', label: 'Team', icon: Users },
    { href: '/admin/company', label: 'Company', icon: Building2 },
    { href: '/admin/widget', label: 'Widget', icon: Code2 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

interface AdminSidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
}

export function AdminSidebar({ collapsed = false, onToggle }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={`
                bg-neutral-900 text-white h-full flex flex-col transition-all duration-300
                ${collapsed ? 'w-16' : 'w-64'}
            `}
        >
            {/* Logo/Brand */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                {!collapsed && (
                    <span className="text-lg font-bold text-primary-400">sheduleApp</span>
                )}
                {collapsed && (
                    <span className="text-lg font-bold text-primary-400 mx-auto">S</span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4">
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
