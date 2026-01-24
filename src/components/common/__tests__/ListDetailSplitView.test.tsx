import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ListDetailSplitView } from '../ListDetailSplitView';

describe('ListDetailSplitView', () => {
    it('renders list at full width when no detail is provided', () => {
        const { container } = render(
            <ListDetailSplitView
                list={<div data-testid="list">List Content</div>}
                detail={null}
                onClose={vi.fn()}
            />
        );
        expect(screen.getByTestId('list')).toBeInTheDocument();
        // List parent should have w-full class
        const listParent = container.querySelector('[class*="w-full"]');
        expect(listParent).toBeInTheDocument();
    });

    it('renders detail panel when detail is provided', () => {
        render(
            <ListDetailSplitView
                list={<div data-testid="list">List</div>}
                detail={<div data-testid="detail">Detail Content</div>}
                onClose={vi.fn()}
            />
        );
        // Component renders both desktop and mobile detail views
        const details = screen.getAllByTestId('detail');
        expect(details.length).toBeGreaterThanOrEqual(1);
    });

    it('calls onClose when X button is clicked', () => {
        const onClose = vi.fn();
        render(
            <ListDetailSplitView
                list={<div>List</div>}
                detail={<div>Detail</div>}
                onClose={onClose}
            />
        );
        const closeButtons = screen.getAllByLabelText('Close detail view');
        fireEvent.click(closeButtons[0]);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('renders both mobile and desktop detail views', () => {
        render(
            <ListDetailSplitView
                list={<div>List</div>}
                detail={<div data-testid="detail">Detail</div>}
                onClose={vi.fn()}
            />
        );
        // Should have 2 close buttons (desktop + mobile)
        const closeButtons = screen.getAllByLabelText('Close detail view');
        expect(closeButtons).toHaveLength(2);
    });
});
