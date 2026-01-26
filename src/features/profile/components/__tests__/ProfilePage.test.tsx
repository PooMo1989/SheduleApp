import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfilePage } from '../ProfilePage';

// Mock the useUserProfile hook
const mockUseUserProfile = vi.fn();
vi.mock('@/features/auth/hooks/useUserProfile', () => ({
    useUserProfile: () => mockUseUserProfile(),
}));

// Mock the tab components to simplify testing
vi.mock('../PersonalInfoTab', () => ({
    PersonalInfoTab: () => <div data-testid="personal-info-tab">Personal Info Content</div>,
}));

vi.mock('../MyScheduleTab', () => ({
    MyScheduleTab: () => <div data-testid="my-schedule-tab">My Schedule Content</div>,
}));

describe('ProfilePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Loading State', () => {
        it('shows loading skeleton when profile is loading', () => {
            mockUseUserProfile.mockReturnValue({
                profile: null,
                isLoading: true,
                error: null,
            });

            render(<ProfilePage />);

            expect(screen.getByText('Profile')).toBeInTheDocument();
            expect(screen.getByText('Manage your personal information')).toBeInTheDocument();
        });
    });

    describe('Admin/Owner Role (Non-Provider)', () => {
        it('shows only Personal Info tab for admin role', () => {
            mockUseUserProfile.mockReturnValue({
                profile: {
                    id: '1',
                    tenantId: 'tenant-1',
                    roles: ['admin'],
                    name: 'Test User',
                    email: 'test@example.com',
                    avatarUrl: null,
                },
                isLoading: false,
                error: null,
            });

            render(<ProfilePage />);

            expect(screen.getByText('Personal Info')).toBeInTheDocument();
            expect(screen.queryByText('My Schedule')).not.toBeInTheDocument();
        });

        it('shows only Personal Info tab for owner role', () => {
            mockUseUserProfile.mockReturnValue({
                profile: {
                    id: '1',
                    tenantId: 'tenant-1',
                    roles: ['owner'],
                    name: 'Test User',
                    email: 'test@example.com',
                    avatarUrl: null,
                },
                isLoading: false,
                error: null,
            });

            render(<ProfilePage />);

            expect(screen.getByText('Personal Info')).toBeInTheDocument();
            expect(screen.queryByText('My Schedule')).not.toBeInTheDocument();
        });
    });

    describe('Dual-Role User (Admin + Provider)', () => {
        it('shows both tabs for admin + provider role', () => {
            mockUseUserProfile.mockReturnValue({
                profile: {
                    id: '1',
                    tenantId: 'tenant-1',
                    roles: ['admin', 'provider'],
                    name: 'Test User',
                    email: 'test@example.com',
                    avatarUrl: null,
                },
                isLoading: false,
                error: null,
            });

            render(<ProfilePage />);

            expect(screen.getByText('Personal Info')).toBeInTheDocument();
            expect(screen.getByText('My Schedule')).toBeInTheDocument();
        });

        it('shows both tabs for owner + provider role', () => {
            mockUseUserProfile.mockReturnValue({
                profile: {
                    id: '1',
                    tenantId: 'tenant-1',
                    roles: ['owner', 'provider'],
                    name: 'Test User',
                    email: 'test@example.com',
                    avatarUrl: null,
                },
                isLoading: false,
                error: null,
            });

            render(<ProfilePage />);

            expect(screen.getByText('Personal Info')).toBeInTheDocument();
            expect(screen.getByText('My Schedule')).toBeInTheDocument();
        });

        it('shows updated description for dual-role users', () => {
            mockUseUserProfile.mockReturnValue({
                profile: {
                    id: '1',
                    tenantId: 'tenant-1',
                    roles: ['admin', 'provider'],
                    name: 'Test User',
                    email: 'test@example.com',
                    avatarUrl: null,
                },
                isLoading: false,
                error: null,
            });

            render(<ProfilePage />);

            expect(
                screen.getByText('Manage your personal information and provider schedule')
            ).toBeInTheDocument();
        });
    });

    describe('Provider-Only Role', () => {
        it('shows only Personal Info tab for provider role', () => {
            mockUseUserProfile.mockReturnValue({
                profile: {
                    id: '1',
                    tenantId: 'tenant-1',
                    roles: ['provider'],
                    name: 'Test User',
                    email: 'test@example.com',
                    avatarUrl: null,
                },
                isLoading: false,
                error: null,
            });

            render(<ProfilePage />);

            expect(screen.getByText('Personal Info')).toBeInTheDocument();
            // Provider-only doesn't get My Schedule tab via ProfilePage
            // (they access it via Provider Portal's Schedule page instead)
            expect(screen.queryByText('My Schedule')).not.toBeInTheDocument();
        });
    });

    describe('Content Display', () => {
        it('renders Personal Info tab content by default', () => {
            mockUseUserProfile.mockReturnValue({
                profile: {
                    id: '1',
                    tenantId: 'tenant-1',
                    roles: ['admin'],
                    name: 'Test User',
                    email: 'test@example.com',
                    avatarUrl: null,
                },
                isLoading: false,
                error: null,
            });

            render(<ProfilePage />);

            expect(screen.getByTestId('personal-info-tab')).toBeInTheDocument();
        });
    });

    describe('Page Header', () => {
        it('shows Profile title', () => {
            mockUseUserProfile.mockReturnValue({
                profile: {
                    id: '1',
                    tenantId: 'tenant-1',
                    roles: ['admin'],
                    name: 'Test User',
                    email: 'test@example.com',
                    avatarUrl: null,
                },
                isLoading: false,
                error: null,
            });

            render(<ProfilePage />);

            expect(screen.getByRole('heading', { level: 1, name: 'Profile' })).toBeInTheDocument();
        });
    });
});
