# Story 2.8: Admin Dashboard & Navigation Shell

**Status:** Planned

## Story

As an **admin**,
I want **a persistent navigation sidebar**,
So that **I can easily switch between managing Services, Team, and Settings**.

## Acceptance Criteria

1.  **Sidebar Navigation:**
    -   Persistent on all `/admin/*` pages
    -   Links to: Dashboard, Bookings, Services, Team, Widget, Company, Settings
    -   Active state highlighting
2.  **Layout Structure:**
    -   Sidebar on left (desktop)
    -   Main content area on right
    -   Responsive header/hamburger for mobile
3.  **Dependency:** Requires `lucide-react` for icons.

## Proposed Changes

### 1. Install Dependencies
-   Add `lucide-react` for navigation icons.

### 2. Create Sidebar Component `src/features/admin/components/AdminSidebar.tsx`
-   List of navigation items with: label, href, icon.
-   Use `usePathname` to detect active route.
-   Styling: TailwindCSS, fixed width on desktop, hidden on mobile (default).

### 3. Create Admin Layout `src/app/admin/layout.tsx`
-   Wraps all children.
-   Renders `AdminSidebar`.
-   Includes a Mobile Header with Toggle (Sheet/Menu).
-   Main content container with proper padding/margins.

### 4. Create Mobile Navigation
-   Simple hamburger menu that toggles the Sidebar visibility on small screens.

### 5. Update Admin Dashboard `src/app/admin/dashboard/page.tsx`
-   Replace generic "Welcome" with a clean dashboard "Home" view.
-   Add quick link cards to common actions (Add Service, Add Provider).

## Verification Plan

### Automated Tests
-   Run `npm run lint` to ensure no errors.
-   (Optional) Component test for Sidebar rendering links.

### Manual Verification
1.  **Desktop:**
    -   Login as Admin.
    -   Navigate to `/admin/dashboard`.
    -   Verify Sidebar is visible.
    -   Click "Services" -> Verify URL changes to `/admin/services` and Sidebar highlights "Services".
    -   Click "Team" -> Verify URL changes and highlight.
2.  **Mobile (Responsive):**
    -   Resize window to mobile width.
    -   Verify Sidebar disappears.
    -   Verify Hamburger menu appears.
    -   Click Hamburger -> Sidebar opens (drawer/overlay).
