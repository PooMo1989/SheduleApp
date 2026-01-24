import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SearchFilterBar } from '../SearchFilterBar';

const mockFilters = [
    { id: 'status', label: 'Status', options: ['Active', 'Inactive'] },
    { id: 'role', label: 'Role', options: [{ label: 'Admin', value: 'admin' }, { label: 'Provider', value: 'provider' }] },
];

describe('SearchFilterBar', () => {
    it('renders search input with placeholder', () => {
        render(<SearchFilterBar searchPlaceholder="Search members..." />);
        expect(screen.getByPlaceholderText('Search members...')).toBeInTheDocument();
    });

    it('renders filter buttons', () => {
        render(<SearchFilterBar filters={mockFilters} />);
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Role')).toBeInTheDocument();
    });

    it('calls onSearch with debounce', async () => {
        const onSearch = vi.fn();
        render(<SearchFilterBar onSearch={onSearch} />);
        const input = screen.getByPlaceholderText('Search...');
        fireEvent.change(input, { target: { value: 'test' } });
        await waitFor(() => expect(onSearch).toHaveBeenCalledWith('test'), { timeout: 500 });
    });

    it('opens dropdown on filter click', () => {
        render(<SearchFilterBar filters={mockFilters} />);
        fireEvent.click(screen.getByText('Status'));
        expect(screen.getByText('Active')).toBeInTheDocument();
        expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('shows active filter chip after selection', () => {
        render(<SearchFilterBar filters={mockFilters} />);
        fireEvent.click(screen.getByText('Status'));
        fireEvent.click(screen.getByText('Active'));
        // Active may appear in both chip and filter button area
        const activeElements = screen.getAllByText('Active');
        expect(activeElements.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Clear all')).toBeInTheDocument();
    });

    it('calls onFilter when filter is selected', () => {
        const onFilter = vi.fn();
        render(<SearchFilterBar filters={mockFilters} onFilter={onFilter} />);
        fireEvent.click(screen.getByText('Status'));
        fireEvent.click(screen.getByText('Active'));
        expect(onFilter).toHaveBeenCalledWith({ status: 'Active' });
    });

    it('clears search on X click', () => {
        const onSearch = vi.fn();
        render(<SearchFilterBar onSearch={onSearch} />);
        const input = screen.getByPlaceholderText('Search...');
        fireEvent.change(input, { target: { value: 'test' } });
        const clearBtn = screen.getByLabelText('Clear search');
        fireEvent.click(clearBtn);
        expect(input).toHaveValue('');
    });
});
