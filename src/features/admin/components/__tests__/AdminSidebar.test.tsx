import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdminSidebar } from '../AdminSidebar';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    usePathname: () => '/admin/dashboard',
}));

// Mock tRPC client
vi.mock('@/lib/trpc/client', () => ({
    trpc: {
        dashboard: {
            getStats: {
                useQuery: () => ({
                    data: {
                        pendingApprovals: 0,
                        upcomingAppointments: 0,
                        monthBookings: 0,
                    },
                }),
            },
        },
    },
}));

describe('AdminSidebar', () => {
    describe('Navigation Items', () => {
        it('renders core navigation items for admin role', () => {
            render(<AdminSidebar roles={['admin']} />);

            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(screen.getByText('Services')).toBeInTheDocument();
            expect(screen.getByText('Team')).toBeInTheDocument();
            expect(screen.getByText('Providers')).toBeInTheDocument();
            expect(screen.getByText('Clients')).toBeInTheDocument();
            expect(screen.getByText('Booking Pages')).toBeInTheDocument();
            expect(screen.getByText('Settings')).toBeInTheDocument();
            expect(screen.getByText('Profile')).toBeInTheDocument();
        });

        it('renders same items for owner role', () => {
            render(<AdminSidebar roles={['owner']} />);

            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(screen.getByText('Services')).toBeInTheDocument();
            expect(screen.getByText('Team')).toBeInTheDocument();
        });

        it('does NOT show Appointments for non-provider admin', () => {
            render(<AdminSidebar roles={['admin']} />);
            expect(screen.queryByText('Appointments')).not.toBeInTheDocument();
        });

        it('shows Appointments for dual-role users (admin + provider)', () => {
            render(<AdminSidebar roles={['admin', 'provider']} />);
            expect(screen.getByText('Appointments')).toBeInTheDocument();
        });

        it('shows Appointments for dual-role users (owner + provider)', () => {
            render(<AdminSidebar roles={['owner', 'provider']} />);
            expect(screen.getByText('Appointments')).toBeInTheDocument();
        });
    });

    describe('Brand Display', () => {
        it('renders company name when provided', () => {
            render(<AdminSidebar roles={['admin']} companyName="Test Company" />);
            expect(screen.getByText('Test Company')).toBeInTheDocument();
        });

        it('renders default brand name when no company name', () => {
            render(<AdminSidebar roles={['admin']} />);
            expect(screen.getByText('sheduleApp')).toBeInTheDocument();
        });

        it('shows S in collapsed state', () => {
            render(<AdminSidebar roles={['admin']} collapsed />);
            expect(screen.getByText('S')).toBeInTheDocument();
        });
    });

    describe('Collapsed State', () => {
        it('hides labels when collapsed', () => {
            render(<AdminSidebar roles={['admin']} collapsed />);
            expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
            expect(screen.queryByText('Services')).not.toBeInTheDocument();
        });

        it('shows title tooltip when collapsed', () => {
            render(<AdminSidebar roles={['admin']} collapsed />);
            const dashboardLink = screen.getAllByRole('link')[0];
            expect(dashboardLink).toHaveAttribute('title', 'Dashboard');
        });
    });

    describe('Toggle Button', () => {
        it('calls onToggle when clicked', () => {
            const onToggle = vi.fn();
            render(<AdminSidebar roles={['admin']} onToggle={onToggle} />);

            const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
            fireEvent.click(toggleButton);

            expect(onToggle).toHaveBeenCalled();
        });

        it('shows expand label when collapsed', () => {
            const onToggle = vi.fn();
            render(<AdminSidebar roles={['admin']} collapsed onToggle={onToggle} />);
            expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument();
        });
    });

    describe('Active State', () => {
        it('highlights active route', () => {
            render(<AdminSidebar roles={['admin']} />);
            const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
            expect(dashboardLink).toHaveClass('bg-primary-600');
        });

        it('marks active link with aria-current', () => {
            render(<AdminSidebar roles={['admin']} />);
            const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
            expect(dashboardLink).toHaveAttribute('aria-current', 'page');
        });
    });

    describe('Navigation Links', () => {
        it('has correct href for all navigation items', () => {
            render(<AdminSidebar roles={['admin']} />);

            expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute(
                'href',
                '/admin/dashboard'
            );
            expect(screen.getByRole('link', { name: /services/i })).toHaveAttribute(
                'href',
                '/admin/services'
            );
            expect(screen.getByRole('link', { name: /team/i })).toHaveAttribute(
                'href',
                '/admin/team'
            );
            expect(screen.getByRole('link', { name: /providers/i })).toHaveAttribute(
                'href',
                '/admin/providers'
            );
            expect(screen.getByRole('link', { name: /clients/i })).toHaveAttribute(
                'href',
                '/admin/clients'
            );
            expect(screen.getByRole('link', { name: /booking pages/i })).toHaveAttribute(
                'href',
                '/admin/booking-pages'
            );
            expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute(
                'href',
                '/admin/settings'
            );
            expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute(
                'href',
                '/admin/profile'
            );
        });
    });

    describe('Accessibility', () => {
        it('has proper navigation role and label', () => {
            render(<AdminSidebar roles={['admin']} />);
            const nav = screen.getByRole('navigation', { name: 'Admin navigation' });
            expect(nav).toBeInTheDocument();
        });

        it('has proper sidebar label on aside element', () => {
            render(<AdminSidebar roles={['admin']} />);
            const aside = screen.getByLabelText('Admin sidebar');
            expect(aside).toBeInTheDocument();
        });
    });

    describe('Default Props', () => {
        it('handles empty roles array', () => {
            render(<AdminSidebar roles={[]} />);
            // Should still render basic items
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
        });

        it('handles undefined roles', () => {
            render(<AdminSidebar />);
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
        });
    });
});
