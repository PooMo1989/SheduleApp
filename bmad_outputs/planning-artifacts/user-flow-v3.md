# User Flow v3 - Complete Platform Specification

## 1. Owner Onboarding

### 1.1 Sign Up & Sign In
- Owner signs up via **email** or **SSO (Google)**
- Owner is signed in and lands on the Dashboard
- *(Future: Onboarding wizard to guide first-time setup)*

### 1.2 Company Setup
- Owner navigates to **Company > General Info** in the sidebar
- Fills in basic company information:
  - Company name
  - Logo upload
  - Branding colours (primary, secondary)
  - Business category/industry
  - Contact information (phone, email, address)
  - Timezone
  - Default currency
  - Business hours (default operating hours)
  - Slot interval (default: 15 minutes; options: 5, 10, 15, 20, 30, 45, 60)
- Owner understands these can be refined later and proceeds with minimal setup

### 1.3 Payment Configuration
- Accessible from **Company > Payments**
- Configuration:
  | Field | Required | Notes |
  |-------|----------|-------|
  | Bank name | Yes | For SAAS reimbursement |
  | Account number | Yes | Tenant's bank account |
  | Account holder name | Yes | Name on bank account |
  | Branch / Branch code | No | Bank branch identifier |
  | Pay Later enabled | No | Toggle (default: Yes) |
  | Pay Later mode | Conditional | Auto-confirm / Pending approval (per-company default) |
- Payment status indicator shows "Bank Details Saved" / "Not configured"
- Paid services cannot accept bookings until bank details are provided

**Payment Model:**
> **Context:** Due to payment gateway limitations in Sri Lanka (lack of Stripe Connect/PayPal), we use a centralized PayHere model where the SAAS owner collects payments and reimburses tenants.
- The SAAS platform operates a centralized payment gateway (PayHere)
- All client payments are collected through the platform's gateway
- Transactions are tracked per-tenant in an internal ledger
- The SAAS owner reimburses tenants based on their transaction records
- Tenants provide bank details so the SAAS owner can process payouts

### 1.4 Next Steps - Two Paths
After company setup, the owner has two options:
1. **Add a team member first** (delegate service/provider setup to a tech-savvy admin)
2. **Add a service directly** (then assign or invite a provider)

**Provider Lifecycle:** A provider is created in **"Pending"** state when invited. They become **"Active"** only after accepting the invitation AND being assigned to at least one service.

---

## 2. Dashboard (Owner/Admin)

### 2.1 Dashboard Content
The dashboard is the landing page after sign-in and provides an at-a-glance overview:

- **Today's Schedule** - Timeline view of today's appointments across all providers
- **Quick Stats Cards:**
  - Bookings this week (with trend vs. last week)
  - Pending confirmations (action required)
  - Cancellations this week
  - Revenue this week (if payments configured)
- **Recent Activity Feed** - Latest bookings, cancellations, new client sign-ups
- **Upcoming Appointments** - Next 5 appointments with client name, service, provider, time
- **Action Items** - Pending invitations, unconfirmed bookings, schedule conflicts
- **Reports Summary** - Booking statistics, cancellation rate, popular services, popular providers (with date range filter)

---

## 3. Team Member Management (Owner Flow)

### 3.1 Teams Tab
- Owner navigates to the **Team** tab in the sidebar
- Default view: list of active team members
- Pending invitations shown in a separate "Pending" section above the active list

### 3.2 Add Team Member
- Clicks **"Add Team Member"** button
- A form renders inline on the page (not a popup/modal)
- Form fields:
  | Field | Required | Notes |
  |-------|----------|-------|
  | Name | Yes | Full name of the team member |
  | Email | Yes | Used for invitation delivery |
  | Mobile Number | No | Optional contact number |
  | Position | No | Display-only label (e.g., Receptionist, Manager) |
- Clicks **"Send Email Invitation"** button
- Invitation is sent in the background
- Team member appears in the **Pending** section until accepted
- System roles (admin permissions) are assigned separately after the member accepts the invitation
> **UX Decision:** Role selection is intentionally deferred to the post-acceptance phase to keep the invitation form simple and strictly focused on "inviting a person" rather than "configuring a user".

### 3.3 Team Member List View (Active Members)
- List displays:
  - Profile picture or avatar (initials-based if no photo)
  - Member name
  - Position
  - Active/Inactive toggle (for quick status changes, e.g., temporarily unavailable)
- Search bar at the top for filtering by name or position
- Pending invitations shown separately above with resend/cancel actions

### 3.4 Individual Team Member View
- Clicking a member name triggers:
  - The list pane slides to the left (compressed)
  - The sidebar collapses to icon-only mode
  - The member detail panel expands on the right
- **X button** to return to the list view
- **Tabs within individual member view:**
  1. **Details** - Personal info, contact details, position, status, profile photo
  2. **Management** - Overview of assigned responsibilities:
     - Providers they manage
     - Services they oversee
     - Clients they handle
  3. **Permissions** - Granular access level configuration
  4. **Activity** - Recent actions/changes made by this member

> **Note:** The Management tab enables future HR module features where team leads can have scoped visibility. For MVP, this tab can show "No assignments" with a note that assignment features are coming in a future release.

---

## 4. Responsive View Logic (Calendly-Style)

### 4.1 Desktop View
- Persistent sidebar with full labels
- Main content area with list + detail split view
- Clicking an item: list compresses left, detail expands right
- Sidebar collapses to icons when detail view is active

### 4.2 Mobile View
- Sidebar becomes a **hamburger menu**
- Selected main menu item displays in the main viewport
- **Navigation pattern:**
  1. Open hamburger → Select "Team"
  2. See list of team members with **filter tabs on top**
  3. Tap a member → Full-screen member detail view with **tabs above**
  4. **X button** at top-right to dismiss individual view and return to the list
- This is the **default navigation pattern** applied consistently across all sections

### 4.3 Mobile Tab Limit Guideline
- Maximum **3 tabs** visible on mobile without scrolling
- If a section has 4+ tabs, use a horizontally scrollable tab bar with subtle overflow indicator
- Primary/most-used tabs appear first

---

## 5. Admin/Team Member Flow (Invited)

### 5.1 Accepting Invitation
- Team member receives email invitation from the owner
- Clicks the invitation link → redirected to sign-up page
- Signs up via **SSO (Google)** or email
- Signs in and sees the Dashboard with sidebar

### 5.2 Admin Capabilities
- Admin/Team member has the same permissions as the owner except:
  - Cannot delete company
  - Cannot delete other team members
  - Cannot delete providers or services (configurable via permissions)
- Admin can create services (same flow as owner)
- Admin can create/manage providers
- Specific permissions are configurable per-member by the owner

---

## 6. Service Management

### 6.1 Services Tab
- Navigate to **Services** in the sidebar
- View services organized by **category**
- **Category filter** at the top to narrow the list
- Each category expands to show its services

### 6.2 Add New Service
- Click **"Add Service"** button
- Enters the **Service Setup Portal** with tabbed navigation:

#### Tab 1: Basics & Settings
| Field | Required | Notes |
|-------|----------|-------|
| Service name | Yes | Display name for the service |
| Category | Yes | Select or create a category |
| Description | No | Rich text description |
| Duration | Yes | Length of the appointment |
| Buffer time (before) | No | Prep time between appointments |
| Buffer time (after) | No | Wrap-up time between appointments |
| Pricing type | Yes | Free / Fixed / Variable / Starting from |
| Price | Conditional | Required if pricing type is not Free |
| Currency | Yes | Default from company settings |
| Location type | Yes | In-person / Virtual / Both |
| Virtual meeting link | Conditional | If virtual, auto-generate or custom URL |
| Max attendees | No | For group services (default: 1) |
| Booking window | No | How far in advance can clients book |
| Cancellation policy | No | Hours before appointment |
| Auto-confirm bookings | No | Toggle (default: Yes) |
| Visibility | No | Public / Private (invite-only) |
| Pay Later enabled | No | Toggle: allow pay later for this service |
| Pay Later mode | Conditional | Auto-confirm booking / Require admin approval |

#### Tab 2: Schedule & Provider Assignment
| Field | Required | Notes |
|-------|----------|-------|
| Available days | Yes | Select days of the week |
| Available hours | Yes | Per-day time slots |
| Break times | No | Recurring breaks within available hours |
| Special dates (blocked) | No | Holidays, days off |
| Provider assignment | Yes | Select from existing or invite new |

- **Provider Assignment:**
  - Dropdown list of existing providers
  - Team members (admin/owner) can also be assigned as providers — doing so grants them the Appointments tab in their sidebar and a provider profile
  - Send invitation to a new external provider via email link
  - When a team member is assigned as a provider, their role is extended (they retain admin access AND gain provider capabilities)

- **Conflict Detection:**
  - If assigning an existing provider, the system checks for schedule conflicts with their other services
  - If conflicts exist, the owner is informed with:
    - A list of conflicting time slots
    - Options: Adjust this service's schedule / Adjust the other service / Override

#### Tab 3: Booking Page Configuration
| Field | Required | Notes |
|-------|----------|-------|
| Custom URL slug | No | e.g., `/haircut` → `yourcompany.app/haircut` |
| Booking page title | No | Defaults to service name |
| Description (public) | No | What clients see before booking |
| Show price | No | Toggle to display pricing on booking page |
| Show duration | No | Toggle to display duration |
| Require client account | No | Toggle: guest booking vs. registered only |
| Booking confirmation message | No | Custom thank-you text |
| Redirect after booking | No | Custom URL to redirect client post-booking |

### 6.3 Editing Services
- Owner/Admin can revisit any service from the services list
- Click on a service → opens the same tabbed portal in edit mode
- All fields are editable with inline save
- Change history/audit log available

---

## 7. Provider Management (Owner/Admin View)

### 7.1 Providers Tab
- **Separate sidebar item** from Team
- Shows a list of all service providers (both external providers and team members with provider role)
- Each entry shows: Profile photo, Name, services assigned, status (Active/Pending/Inactive)

### 7.2 Individual Provider View
- Click a provider → same slide-left pattern as team members
- **Tabs within provider view:**
  1. **Details** - Personal info, contact, specializations
  2. **Services** - List of services this provider offers
  3. **Schedule/Availability** - Their availability and calendar view (single combined calendar showing availability blocks + booked appointments + Google Calendar conflicts)
  4. **Appointments** - Upcoming and past bookings with filters
  5. **Clients** - Clients they serve (without private notes)
  6. **Performance** - Completion rate, no-shows, booking count
- **X button** to return to the providers list
- Owner/Admin can edit basic information about the provider
- Owner/Admin can see everything the provider sees on their own portal **EXCEPT** the provider's personal/private client notes

### 7.3 Provider Schedule Change Notifications
- When a provider modifies their own availability, the system:
  - Notifies the owner/admin of the change
  - Highlights any appointments affected by the new availability
  - Optionally requires admin approval before changes take effect (configurable per provider)
- Owner/Admin can configure per-provider:
  - **Self-managed** - Provider changes take effect immediately, admin is notified
  - **Approval required** - Provider submits change request, admin approves/rejects

### 7.4 Add New Provider
- Click **"Add New Provider"** button
- Form fields:
  | Field | Required | Notes |
  |-------|----------|-------|
  | Name | Yes | Provider's full name |
  | Email | Yes | For invitation |
  | Mobile Number | No | Contact number |
  | Specialization | No | Area of expertise |
  | Services | No | Pre-assign to existing services |
  | Schedule autonomy | No | Self-managed / Approval required |
- Click **"Send Invitation"**
- Provider appears in list as **"Pending"** until they accept and are assigned a service

---

## 8. Service Provider Portal (Invited Provider)

### 8.1 Accepting Invitation
- Provider receives invitation email from owner/admin
- Clicks the link → redirected to sign-up page
- Signs up via **Google SSO** or email
- Signs in and sees their provider portal

### 8.2 Provider Sidebar
The provider's sidebar contains:
```
Appointments
Schedule
Clients
Profile
```

### 8.3 Appointments (Main View)
- This is the provider's primary view upon login
- **Service filter dropdown** at the top (if provider offers multiple services, "All Services" selected by default)
- **View toggle:** Calendar view / List view
- **Tabs below filter:**
  - **Upcoming** - Chronological list with client name, service, time
  - **Past** - Historical record
  - **Date Range** - Custom date picker for specific period
- **Filters:**
  - Status (Confirmed / Pending / Cancelled / Completed / No-show)
- **Actions per appointment:**
  - Mark as completed
  - Mark as no-show
  - Reschedule (see Section 10)
  - Cancel (see Section 10)

### 8.4 Schedule/Availability
- Set personal availability (days and hours)
- Mark special days (vacations, holidays, blocked times)
- **Single combined calendar view** showing:
  - Availability blocks (recurring schedule)
  - Booked appointments overlaid
  - Google Calendar events overlaid (conflicts)
  - Date-specific overrides highlighted
- **Google Calendar integration:**
  - Link Google Calendar account
  - Sync to prevent double-booking
  - Choose conflict resolution preference (auto-block / notify)
- Changes may require admin approval depending on provider's schedule autonomy setting

### 8.5 Clients
- List of all clients who have booked with this provider
- **Filter by service** (if provider offers multiple services)
- **Search** by client name or email
- Click a client name → view:
  - Client contact information
  - Booking history with this provider
  - **Personal notes** (private to this provider only)
    - Free-text notes per session
    - Only visible to the provider who authored them
    - No other role (owner, admin, team member) can view these notes

### 8.6 Profile
- Edit personal information:
  - Display name
  - Bio/About
  - Profile photo upload
  - Contact preferences
  - Notification settings

---

## 9. Client Booking Flow (Public-Facing)

### 9.1 Accessing the Booking Page
- Client arrives via:
  - **Direct booking link** (generated by owner/admin for a specific service, provider, or both)
  - **Embedded widget** on external website (iframe)
  - **Shared link** from owner/provider (same as direct link, shared via any channel)

### 9.2 Link & Widget Generation (Admin Side)
- Accessible from **Booking Pages** in the sidebar
- Two sub-tabs with the same configuration interface:
  1. **Generate Embed Code** → outputs iframe snippet
  2. **Generate Direct Link** → outputs shareable URL
- Configuration options (same for both tabs):
  - Select a service (optional - shows all if not selected)
  - Select a provider (optional - shows all if not selected)
  - Select service + provider together (most specific)
- Preview panel shows the resulting booking page appearance

### 9.3 Booking Process
1. **Select Date & Time** - Calendar view showing available slots based on the 4-layer availability engine:
   - Layer 1: Service availability window (days/hours the service operates)
   - Layer 2: Provider recurring schedule (weekly availability blocks)
   - Layer 3: Provider date overrides (custom blocked/available dates)
   - Layer 4: Google Calendar conflicts (synced external events)
   - Only slots passing ALL 4 layers are displayed
2. **Enter Details** - Client fills in:
   | Field | Required | Notes |
   |-------|----------|-------|
   | Name | Yes | Full name |
   | Email | Yes | For confirmation and reminders |
   | Phone | Configurable | Owner decides if required per service |
   | Notes/Reason | No | Free text for context |
   | Custom fields | Configurable | Owner-defined per service |
3. **Payment** (if applicable):
   - **Pay via gateway** - Client pays through the platform's PayHere gateway
   - **Pay Later** (if enabled for this service) - Client selects this option and continues
     - If service Pay Later mode = "Auto-confirm": booking is created immediately as CONFIRMED
     - If service Pay Later mode = "Pending approval": booking is created as PENDING; client receives "booking received, awaiting confirmation" email; owner/admin approves from their dashboard; confirmation email sent only after approval
4. **Confirmation** - Client sees:
   - Booking summary (service, provider, date, time, location)
   - Calendar invite download (.ics)
   - "Add to Google Calendar" button
   - Confirmation number
   - Reschedule/Cancel links (if booking is confirmed)
   - "Awaiting approval" message (if pending)

### 9.4 Client Registration Scenarios

**If "Require client account" is enabled on the service:**
- After selecting date/time, client is prompted to sign up or sign in before entering booking details
- Sign up options: email + password, or Google SSO
- After sign-up completes, client is returned seamlessly to the booking flow to continue with payment
- Client gets a personal portal showing upcoming/past bookings with reschedule/cancel options

**If guest booking is allowed:**
- No account needed to complete the booking
- Reschedule/cancel available via secure links in confirmation email (magic link)
- After booking confirmation (post-payment or pay later selection), client is prompted:
  - "Create a profile to easily manage your bookings"
  - Fields: Password (name and email already captured)
  - Or: "Sign up with Google"
  - Or: "Skip for now"
- If client registers, they are taken directly to their new client portal

### 9.5 Magic Page (Guest Booking Management)
- Guest clients receive a secure "Manage Booking" link in their confirmation email
- Link opens a page showing:
  - Booking details (service, provider, date, time, status)
  - Reschedule button (opens date/time picker)
  - Cancel button (with policy enforcement)
  - Provider notes shared with client (if any, future feature)
  - "Create Account" prompt
- Magic link token expires after 30 days (refreshed with each new booking)
- If expired, client can request a new link by entering their email

---

## 10. Reschedule & Cancellation Flow

### 10.1 Client-Initiated Reschedule
- Client clicks "Reschedule" from:
  - Confirmation email link
  - Client portal (if logged in)
  - Magic page (if guest)
- Client sees the same date/time picker with available slots (4-layer filtered)
- Selects new time → confirmation
- **Notifications triggered:**
  - Client: Reschedule confirmation email
  - Provider: Reschedule notice
  - Admin (optional): Reschedule alert

### 10.2 Client-Initiated Cancellation
- Client clicks "Cancel" from:
  - Confirmation email link
  - Client portal (if logged in)
  - Magic page (if guest)
- If within cancellation policy window → cancellation blocked with message
- If outside policy window → cancellation proceeds
- Client confirms cancellation → slot freed
- **Notifications triggered:**
  - Client: Cancellation confirmation
  - Provider: Cancellation notice (slot freed)
  - Admin (optional): Cancellation alert

### 10.3 Provider-Initiated Reschedule
- Provider selects appointment → "Reschedule"
- Provider picks a new time from their own availability
- Client is notified with the new proposed time
- Options:
  - Client accepts → booking updated
  - Client rejects → original time stands or client can pick alternative

### 10.4 Provider-Initiated Cancellation
- Provider selects appointment → "Cancel"
- Provider gives reason (required)
- Client is notified immediately
- System suggests rebooking with:
  - Same provider at different time
  - Different provider at same time (if available)

### 10.5 Admin/Owner Cancellation
- Admin can cancel any appointment
- Same notification flow as provider-initiated
- Reason is logged for audit

### 10.6 Payment & Refund Handling
- Since payments are collected centrally by the SAAS platform, refunds are processed by the SAAS owner
- Transaction records are maintained per-tenant in an internal ledger
- Owner/Admin can view daily/monthly transaction summaries and outstanding balances in **Settings > Payments**
- Detailed refund processing, automated payout schedules, and dispute resolution are Phase 4 features

---

## 11. Client Management (Owner/Admin View)

### 11.1 Clients Tab
- **Dedicated sidebar item** - Global view of all clients across all providers
- List shows:
  - Client name
  - Email
  - Phone (if provided)
  - Total bookings
  - Last booking date
  - Primary provider
  - Status (Active / Inactive based on recent activity)

### 11.2 Individual Client View
- Click a client → same slide-left detail pattern
- **Tabs:**
  1. **Details** - Contact info, account status, custom fields
  2. **Bookings** - Full history across all providers and services
  3. **Payments** - Payment history, transaction records

### 11.3 Client Filters & Search
- Search by name, email, or phone
- Filter by:
  - Service type
  - Provider
  - Booking recency (Active / Lapsed)
  - Booking count (New / Returning / Frequent)

---

## 12. Notification Templates

### 12.1 Access
- Configured from **Settings > Notifications**
- Not embedded within the service setup flow
- Templates are linked to services from this central location

### 12.2 Available Template Types
| Template | Trigger | Recipient | Default |
|----------|---------|-----------|---------|
| Booking confirmation | New booking confirmed | Client | Enabled |
| Booking confirmation (internal) | New booking confirmed | Provider/Admin | Enabled |
| Booking received (pay later pending) | Pay Later booking created | Client | Enabled |
| Reminder | Configurable (24h, 1h before) | Client | Enabled (24h) |
| Reminder (internal) | Configurable (24h, 1h before) | Provider | Enabled (1h) |
| Cancellation notice | Booking cancelled | Client | Enabled |
| Cancellation notice (internal) | Booking cancelled | Provider/Admin | Enabled |
| Reschedule notice | Booking rescheduled | Client | Enabled |
| Reschedule notice (internal) | Booking rescheduled | Provider | Enabled |
| Follow-up / Thank you | Configurable (1h, 24h after) | Client | Disabled |
| No-show notice | Marked as no-show | Client | Disabled |
| Invitation | Team/Provider invited | Invitee | Enabled |
| Pay Later approval | Booking approved by admin | Client | Enabled |
| Pay Later rejection | Booking rejected by admin | Client | Enabled |

### 12.3 Template Configuration
- Each template supports:
  - Email subject line
  - Email body (rich text with merge fields: `{{client_name}}`, `{{service_name}}`, `{{date}}`, `{{time}}`, `{{provider_name}}`, `{{location}}`)
  - Enable/Disable toggle per service
  - Timing configuration (for reminders and follow-ups)

---

## 13. Sidebar Navigation Structure

### Owner/Admin View
```
[Company Logo]
─────────────────
Dashboard
Services
Team
Providers
Clients
Booking Pages
Company
Settings
─────────────────
Profile
```

### Provider-Only View
```
[Company Logo]
─────────────────
Appointments
Schedule
Clients
─────────────────
Profile
```

### Dual-Role View (Admin + Provider)
```
[Company Logo]
─────────────────
Dashboard
Appointments
Services
Team
Providers
Clients
Booking Pages
Company
Settings
─────────────────
Profile
  ├─ Personal Info
  └─ My Schedule/Availability
```

### Company Sub-Tabs
```
Company
  ├─ General Info (name, timezone, currency, slot intervals, business hours)
  ├─ Branding (logo, colours)
  ├─ Payments (bank details for SAAS reimbursement, pay later defaults)
  └─ Notifications (email templates)
```

> **Note:** Company settings are tenant-specific configurations. This is where the business owner configures their company profile, branding, payment receiving details, and notification templates.

### Settings Sub-Tabs
```
Settings
  ├─ Account (SAAS subscription, billing relationship with platform owner)
  └─ Permissions (default role permissions for team members)
```

> **Note:** Settings contains the relationship between the tenant (company owner) and the SAAS platform. Account sub-tab shows subscription status, usage, and billing. Permissions defines default access levels for new team members.

### Profile Sub-Tabs
**For Owner/Admin:**
```
Profile
  └─ Personal Info (name, photo, contact, password)
```

**For Dual-Role (Admin + Provider):**
```
Profile
  ├─ Personal Info (name, photo, contact, password)
  └─ My Schedule/Availability (own provider availability, Google Calendar link)
```

**For Provider-Only:**
```
Profile
  └─ Personal Info (name, bio, photo, contact preferences, notifications)
```

### Mobile (Hamburger Menu)
Same items as desktop, rendered as a full-screen overlay menu when hamburger icon is tapped.

### Sidebar Visibility by Role
| Menu Item | Owner | Admin/Team Member | Provider |
|-----------|-------|-------------------|----------|
| Dashboard | Yes | Yes | No |
| Appointments | Only if also provider | Only if also provider | Yes |
| Services | Yes | Yes (based on permissions) | No |
| Team | Yes | Yes (based on permissions) | No |
| Providers | Yes | Yes | No |
| Clients | Yes | Yes | Own only |
| Booking Pages | Yes | Yes | No |
| Company | Yes | Yes (based on permissions) | No |
| Settings | Yes | No (owner only) | No |
| Schedule | No | No | Yes |
| Profile | Yes | Yes | Yes |

> **Note:** Settings (Account/SAAS relationship) is owner-only since it contains billing and subscription information. Company settings are accessible to admins with appropriate permissions.

---

## 14. Key Business Rules Summary

1. **Provider lifecycle** - Providers are created as "Pending" on invitation, become "Active" only after accepting AND being assigned to at least one service
2. **Invitation-based onboarding** - Team members and providers join via email invitation only
3. **Role hierarchy** - Owner > Admin/Team Member > Provider > Client. Admin and Team Member are the same role with configurable permissions. Admin has all owner permissions except: delete company, delete other members, delete providers/services (configurable)
4. **Private notes** - Provider's client notes are visible ONLY to the provider who authored them. No other role (owner, admin, team member) can access these notes. Future: optional sharing with the specific client
5. **Schedule conflicts** - System must detect and surface conflicts when assigning providers to services
6. **Consistent UX pattern** - List → Detail with slide animation across all sections
7. **Mobile tab limit** - Maximum 3 primary tabs visible; additional tabs via horizontal scroll
8. **Payment model** - SAAS platform collects all payments centrally via PayHere. Per-tenant transactions tracked in internal ledger. Tenants provide bank details for payout
9. **Pay Later modes** - Configurable per-service: (a) auto-confirm creates booking immediately, (b) pending approval requires admin action before confirmation
10. **Cancellation policy enforcement** - System respects per-service cancellation windows for client-initiated cancellations
11. **Schedule autonomy** - Provider schedule changes can be self-managed or require admin approval (configurable per provider)
12. **Notification defaults** - All critical notifications (confirmation, cancellation, reschedule) are enabled by default; follow-ups are opt-in
13. **Slot intervals** - Default 15-minute intervals for availability slots. Configurable at company level (5, 10, 15, 20, 30, 45, 60 minutes)
14. **Dual-role support** - A team member assigned as a provider gains the Appointments tab and a provider profile while retaining admin access
15. **4-layer availability** - Client-visible slots must pass: service window → provider schedule → date overrides → Google Calendar check. Single combined calendar view for MVP

---

## 15. Future Phases (Out of MVP Scope)

### Phase 2
- **Storefront/Template Booking Pages** - Standalone hosted booking portal for companies without websites (`company.scheduleapp.com`)
- **Separate Bookings Calendar** - Dedicated calendar view for booked appointments (in addition to availability calendar)
- **Client note sharing** - Provider can optionally make notes visible to the respective client
- **SMS notifications** - Twilio integration for text reminders
- **Recurring appointments** - Recurring booking and payment scheduling

### Phase 3
- **Team Member Assignments** - Assign specific services, providers, and clients to team members for scoped visibility
- **HR Module** - Team hierarchy, departments, team leads
- **Advanced Permissions** - Granular per-resource access control based on assignments

### Phase 4
- **Automated Payouts** - System-level payout scheduling to tenant bank accounts
- **Transaction Ledger Dashboard** - Detailed per-tenant transaction history, daily/monthly reports
- **Refund Processing** - Automated refund workflows with policy enforcement
- **Dispute Resolution** - Admin tools for payment disputes
- **Per-Tenant Payment Gateway** - Research: allow tenants to connect their own PayHere merchant accounts (if supported)

### Phase 5
- **Modular Feature Flags** - Enable/disable modules per tenant (solo consultant vs multi-provider vs studio)
- **Resource Booking** - Book things (rooms, courts, equipment) not just people
- **Custom Domains** - White-label with tenant's own domain
