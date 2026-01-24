import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HorizontalTabs } from '../HorizontalTabs';

const mockTabs = [
    { id: 'tab1', label: 'First', content: <div data-testid="content-1">Content 1</div> },
    { id: 'tab2', label: 'Second', content: <div data-testid="content-2">Content 2</div> },
    { id: 'tab3', label: 'Third', content: <div data-testid="content-3">Content 3</div> },
];

describe('HorizontalTabs', () => {
    it('renders all tab labels', () => {
        render(<HorizontalTabs tabs={mockTabs} />);
        expect(screen.getByText('First')).toBeInTheDocument();
        expect(screen.getByText('Second')).toBeInTheDocument();
        expect(screen.getByText('Third')).toBeInTheDocument();
    });

    it('shows first tab content by default', () => {
        render(<HorizontalTabs tabs={mockTabs} />);
        expect(screen.getByTestId('content-1')).toBeInTheDocument();
    });

    it('shows specified default tab content', () => {
        render(<HorizontalTabs tabs={mockTabs} defaultTab="tab2" />);
        expect(screen.getByTestId('content-2')).toBeInTheDocument();
    });

    it('switches content on tab click', () => {
        render(<HorizontalTabs tabs={mockTabs} />);
        fireEvent.click(screen.getByText('Second'));
        expect(screen.getByTestId('content-2')).toBeInTheDocument();
    });

    it('calls onChange callback on tab click', () => {
        const onChange = vi.fn();
        render(<HorizontalTabs tabs={mockTabs} onChange={onChange} />);
        fireEvent.click(screen.getByText('Third'));
        expect(onChange).toHaveBeenCalledWith('tab3');
    });

    it('marks active tab with aria-selected', () => {
        render(<HorizontalTabs tabs={mockTabs} defaultTab="tab2" />);
        const tab2 = screen.getByText('Second');
        expect(tab2).toHaveAttribute('aria-selected', 'true');
    });
});
