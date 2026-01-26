import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProviderSidebar } from '../ProviderSidebar';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    usePathname: () => '/provider/appointments',
}));

describe('ProviderSidebar', () => {
    it('renders all navigation items', () => {
        render(<ProviderSidebar />);

        expect(screen.getByText('Appointments')).toBeInTheDocument();
        expect(screen.getByText('Schedule')).toBeInTheDocument();
        expect(screen.getByText('Clients')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('renders company name when provided', () => {
        render(<ProviderSidebar companyName="Test Company" />);
        expect(screen.getByText('Test Company')).toBeInTheDocument();
    });

    it('renders default brand name when no company name', () => {
        render(<ProviderSidebar />);
        expect(screen.getByText('sheduleApp')).toBeInTheDocument();
    });

    it('renders Provider Portal label', () => {
        render(<ProviderSidebar />);
        expect(screen.getByText('Provider Portal')).toBeInTheDocument();
    });

    it('highlights active route', () => {
        render(<ProviderSidebar />);
        const appointmentsLink = screen.getByRole('link', { name: /appointments/i });
        expect(appointmentsLink).toHaveClass('bg-primary-600');
    });

    it('renders in collapsed state', () => {
        render(<ProviderSidebar collapsed />);
        // In collapsed state, labels should not be visible
        expect(screen.queryByText('Appointments')).not.toBeInTheDocument();
        expect(screen.queryByText('Schedule')).not.toBeInTheDocument();
    });

    it('shows collapsed brand as S', () => {
        render(<ProviderSidebar collapsed />);
        expect(screen.getByText('S')).toBeInTheDocument();
    });

    it('calls onToggle when toggle button is clicked', () => {
        const onToggle = vi.fn();
        render(<ProviderSidebar onToggle={onToggle} />);

        const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
        fireEvent.click(toggleButton);

        expect(onToggle).toHaveBeenCalled();
    });

    it('changes toggle button label based on collapsed state', () => {
        const onToggle = vi.fn();
        const { rerender } = render(<ProviderSidebar collapsed={false} onToggle={onToggle} />);
        expect(screen.getByRole('button', { name: /collapse sidebar/i })).toBeInTheDocument();

        rerender(<ProviderSidebar collapsed onToggle={onToggle} />);
        expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument();
    });

    it('has correct navigation links', () => {
        render(<ProviderSidebar />);

        expect(screen.getByRole('link', { name: /appointments/i })).toHaveAttribute(
            'href',
            '/provider/appointments'
        );
        expect(screen.getByRole('link', { name: /schedule/i })).toHaveAttribute(
            'href',
            '/provider/schedule'
        );
        expect(screen.getByRole('link', { name: /clients/i })).toHaveAttribute(
            'href',
            '/provider/clients'
        );
        expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute(
            'href',
            '/provider/profile'
        );
    });

    it('has proper accessibility attributes', () => {
        render(<ProviderSidebar />);
        const nav = screen.getByRole('navigation', { name: 'Provider navigation' });
        expect(nav).toBeInTheDocument();
    });

    it('has proper sidebar label on aside element', () => {
        render(<ProviderSidebar />);
        const aside = screen.getByLabelText('Provider sidebar');
        expect(aside).toBeInTheDocument();
    });
});
