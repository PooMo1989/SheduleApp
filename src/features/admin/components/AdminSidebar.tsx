'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    Briefcase,
    Users,
    UserCog,
    UsersRound,
    Link2,
    Settings,
    User,
    ChevronLeft,
    ChevronRight,
    Building2,
    ClipboardList,
} from 'lucide-react';
import type { UserRole } from '@/types';
import { trpc } from '@/lib/trpc/client';

/**
 * Navigation item definition
 */
interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    /** Roles that can see this item. Empty means all roles with sidebar access can see it. */
    visibleToRoles?: UserRole[];
    /** Whether this item requires the user to also have provider role */
    requiresProviderRole?: boolean;
    /** Optional badge count to display */
    badge?: number;
}

/**
 * Admin sidebar navigation items (Story 2.8.4)
 *
 * Based on user-flow-v3.md Section 13 - Sidebar Navigation Structure:
 * - Dashboard: All admin/owner
 * - Appointments: Only if user is also a provider (dual-role)
 * - Services: All admin/owner
 * - Team: All admin/owner
 * - Providers: All admin/owner (separate from Team)
 * - Clients: All admin/owner
 * - Bookings: All admin/owner (Epic 4, Story 4.2)
 * - Booking Pages: All admin/owner (renamed from Widget)
 * - Settings: All admin/owner
 */
const getMainNavItems = (pendingCount?: number): NavItem[] => [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/appointments', label: 'Appointments', icon: Calendar, requiresProviderRole: true },
    { href: '/admin/services', label: 'Services', icon: Briefcase },
    { href: '/admin/team', label: 'Team', icon: Users },
    { href: '/admin/providers', label: 'Providers', icon: UserCog },
    { href: '/admin/clients', label: 'Clients', icon: UsersRound },
    { href: '/admin/bookings', label: 'Bookings', icon: ClipboardList, badge: pendingCount },
    { href: '/admin/booking-pages', label: 'Booking Pages', icon: Link2 },
    { href: '/admin/company', label: 'Company', icon: Building2 }, // Story 2.8.9: Separate Company sidebar item
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

/**
 * Bottom navigation items (Profile)
 */
const bottomNavItems: NavItem[] = [
    { href: '/admin/profile', label: 'Profile', icon: User },
];

interface AdminSidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
    /** User's roles for conditional navigation visibility */
    roles?: UserRole[];
    /** Company name to display in header */
    companyName?: string;
}

/**
 * Admin Sidebar Component (Story 2.8.4)
 *
 * Restructured navigation sidebar for admin portal with:
 * - Dual-role support (shows Appointments if user is also a provider)
 * - Separate Team and Providers sections
 * - Renamed "Widget" to "Booking Pages"
 * - Profile section at bottom
 */
export function AdminSidebar({
    collapsed = false,
    onToggle,
    roles = [],
    companyName,
}: AdminSidebarProps) {
    const pathname = usePathname();

    // Fetch pending bookings count (Epic 4, Story 4.2)
    const { data: stats } = trpc.dashboard.getStats.useQuery();
    const pendingCount = stats?.pendingApprovals || 0;

    // Check if user has dual-role (admin/owner + provider)
    const isAdminOrOwner = roles.includes('admin') || roles.includes('owner');
    const isAlsoProvider = roles.includes('provider');
    const isDualRole = isAdminOrOwner && isAlsoProvider;

    /**
     * Filter navigation items based on user roles
     */
    const filterNavItems = (items: NavItem[]): NavItem[] => {
        return items.filter((item) => {
            // Check if item requires provider role
            if (item.requiresProviderRole && !isDualRole) {
                return false;
            }

            // Check role visibility
            if (item.visibleToRoles && item.visibleToRoles.length > 0) {
                return item.visibleToRoles.some((role) => roles.includes(role));
            }

            return true;
        });
    };

    const mainNavItems = getMainNavItems(pendingCount);
    const visibleMainNav = filterNavItems(mainNavItems);
    const visibleBottomNav = filterNavItems(bottomNavItems);

    const renderNavItem = (item: NavItem) => {
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
                    {!collapsed && (
                        <>
                            <span className="flex-1">{item.label}</span>
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {item.badge}
                                </span>
                            )}
                        </>
                    )}
                </Link>
            </li>
        );
    };

    return (
        <aside
            className={`
                bg-neutral-900 text-white h-screen flex flex-col transition-all duration-300
                ${collapsed ? 'w-16' : 'w-64'}
            `}
            aria-label="Admin sidebar"
        >
            {/* Logo/Brand */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between flex-shrink-0">
                {!collapsed && (
                    <span className="text-lg font-bold text-primary-400">
                        {companyName || 'sheduleApp'}
                    </span>
                )}
                {collapsed && (
                    <span className="text-lg font-bold text-primary-400">S</span>
                )}
                {/* Collapse Toggle Button */}
                {onToggle && (
                    <button
                        onClick={onToggle}
                        className="p-1.5 hover:bg-neutral-800 rounded transition-colors"
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? (
                            <ChevronRight className="w-4 h-4" />
                        ) : (
                            <ChevronLeft className="w-4 h-4" />
                        )}
                    </button>
                )}
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto min-h-0" aria-label="Admin navigation">
                <ul className="space-y-1 px-2">
                    {visibleMainNav.map(renderNavItem)}
                </ul>
            </nav>

            {/* Bottom Navigation (Profile) - Sticky to viewport bottom */}
            <div className="border-t border-neutral-800 py-2 flex-shrink-0">
                <ul className="space-y-1 px-2">
                    {visibleBottomNav.map(renderNavItem)}
                </ul>
            </div>
        </aside>
    );
}
