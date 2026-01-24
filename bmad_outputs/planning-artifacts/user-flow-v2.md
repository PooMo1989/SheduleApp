# User Flow v2 - Complete Platform Perspective

## 1. Owner Onboarding

### 1.1 Sign Up & Sign In
- Owner signs up via **email** or **SSO (Google)**
- Owner is signed in and lands on the dashboard
- *(Future: Onboarding wizard to guide first-time setup)*

### 1.2 Company Setup
- Owner navigates to the **Company** tab in the sidebar
- Fills in basic company information:
  - Company name
  - Logo upload
  - Branding colours (primary, secondary)
  - Business category/industry
  - Contact information (phone, email, address)
  - Timezone
  - Business hours (default operating hours)
- Owner understands these can be refined later and proceeds with minimal setup

### 1.3 Payment Integration Setup
- Accessible from **Company > Payments** sub-tab or **Settings > Payments**
- Configuration:
  | Field | Required | Notes |
  |-------|----------|-------|
  | Payment gateway | Yes | Stripe (default) / PayPal / Manual |
  | Currency | Yes | Default currency for all services |
  | Tax settings | No | Tax rate, tax ID display |
  | Payout schedule | No | Daily / Weekly / Monthly |
  | Refund policy | No | Auto-refund window in hours |
- Owner connects their Stripe/PayPal account via OAuth flow
- Payment status indicator shows "Connected" / "Not configured"
- Services cannot collect payments until a gateway is connected

### 1.4 Next Steps - Two Paths
After company setup, the owner has two options:
1. **Add a team member first** (delegate service/provider setup to a tech-savvy admin)
2. **Add a service directly** (then assign or invite a provider)

> **Business Rule:** A provider is created in **"Pending"** state when invited. They become **"Active"** only after accepting the invitation AND being assigned to at least one service. This avoids the chicken-and-egg problem while maintaining the rule that active providers must have a service.

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

---

## 3. Team Member Management (Owner Flow)

### 3.1 Teams Tab
- Owner navigates to the **Team** tab in the sidebar
- Sees a list of team members (empty on first visit)

### 3.2 Add Team Member
- Clicks **"Add Team Member"** button
- A form renders inline on the page (not a popup/modal)
- Form fields:
  | Field | Required | Notes |
  |-------|----------|-------|
  | Name | Yes | Full name of the team member |
  | Email | Yes | Used for invitation delivery |
  | Mobile Number | No | Optional contact number |
  | Role/Position | No | e.g., Admin, Receptionist, Manager |
- Clicks **"Send Email Invitation"** button
- Invitation is sent in the background
- Team member status shows as **"Pending"** in the list

### 3.3 Team Member List View
Once invitations are accepted, the list populates with:
- Member name
- Role/Position
- Status (Pending / Active)
- Date joined

### 3.4 Individual Team Member View
- Clicking a member name triggers:
  - The list pane slides to the left (compressed)
  - The sidebar collapses to icon-only mode
  - The member detail panel expands on the right
- **Tabs within individual member view:**
  1. **Details** - Personal info, contact details, role, status
  2. **Management** - Overview of:
     - Providers they manage
     - Services they oversee
     - Clients they handle
  3. **Activity** - Recent actions/changes made by this member
  4. **Permissions** - Access level configuration

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
- Alternatively, group less-critical tabs under a "More" option on mobile

---

## 5. Admin/Team Member Flow (Invited)

### 5.1 Accepting Invitation
- Team member receives email invitation from the owner
- Clicks the invitation link → redirected to sign-up page
- Signs up via **SSO (Google)** or email
- Signs in and sees the dashboard with sidebar

### 5.2 Admin Capabilities
- Admin can create services (same flow as owner)
- Admin can create/manage providers
- Admin can view team members (based on permissions)

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

#### Tab 2: Schedule & Provider Assignment
| Field | Required | Notes |
|-------|----------|-------|
| Available days | Yes | Select days of the week |
| Available hours | Yes | Per-day time slots |
| Break times | No | Recurring breaks within available hours |
| Special dates (blocked) | No | Holidays, days off |
| Provider assignment | Yes | Select from existing or invite new |

- **Provider Assignment Options:**
  - Select from dropdown of existing providers
  - Send invitation to a new provider via email link

- **Conflict Detection:**
  - If assigning an existing provider, the system checks for schedule conflicts
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
| Embed options | No | iframe code / JS widget snippet for external sites |

### 6.3 Notification Templates
- Accessible from a **dedicated sidebar menu item** ("Notifications")
- Not embedded within the service setup flow
- Templates can be linked to services from this central location

#### Available Template Types
| Template | Trigger | Recipient | Default |
|----------|---------|-----------|---------|
| Booking confirmation | New booking created | Client | Enabled |
| Booking confirmation (internal) | New booking created | Provider/Admin | Enabled |
| Reminder | Configurable (24h, 1h before) | Client | Enabled (24h) |
| Reminder (internal) | Configurable (24h, 1h before) | Provider | Enabled (1h) |
| Cancellation notice | Booking cancelled | Client | Enabled |
| Cancellation notice (internal) | Booking cancelled | Provider/Admin | Enabled |
| Reschedule notice | Booking rescheduled | Client | Enabled |
| Reschedule notice (internal) | Booking rescheduled | Provider | Enabled |
| Follow-up / Thank you | Configurable (1h, 24h after) | Client | Disabled |
| No-show notice | Marked as no-show | Client | Disabled |
| Invitation | Team/Provider invited | Invitee | Enabled |

#### Template Configuration
- Each template supports:
  - Email subject line
  - Email body (rich text with merge fields: `{{client_name}}`, `{{service_name}}`, `{{date}}`, `{{time}}`, `{{provider_name}}`, `{{location}}`)
  - SMS body (if SMS enabled)
  - Enable/Disable toggle per service
  - Timing configuration (for reminders and follow-ups)

### 6.4 Editing Services
- Owner/Admin can revisit any service from the services list
- Click on a service → opens the same tabbed portal in edit mode
- All fields are editable with inline save
- Change history/audit log available

---

## 7. Provider Management (Owner/Admin View)

### 7.1 Providers Tab
- **Separate sidebar item** from Team (not a sub-tab)
- Shows a list of all service providers
- Each entry shows: Name, services assigned, status

### 7.2 Individual Provider View
- Click a provider → same slide-left pattern as team members
- **Tabs within provider view:**
  1. **Details** - Personal info, contact, specializations
  2. **Services** - List of services this provider offers
  3. **Schedule** - Their availability and calendar view
  4. **Appointments** - Upcoming and past bookings
  5. **Clients** - Clients they serve (without private notes)
  6. **Performance** - Ratings, completion rate, no-shows
- **X button** to return to the providers list
- Owner/Admin can edit basic information about the provider

> **Note:** Owner/Admin can see everything the provider sees on their own dashboard **EXCEPT** the provider's personal/private client notes.

### 7.3 Provider Schedule Change Notifications
- When a provider modifies their own availability, the system:
  - Notifies the owner/admin of the change
  - Highlights any appointments affected by the new availability
  - Optionally requires admin approval before changes take effect (configurable in Settings)
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

## 8. Service Provider Flow (Invited Provider)

### 8.1 Accepting Invitation
- Provider receives invitation email from owner/admin
- Clicks the link → redirected to sign-up page
- Signs up via **Google SSO** or email
- Signs in and sees their provider dashboard

### 8.2 Provider Dashboard
The provider's personal portal with tabbed navigation:

#### Tab 1: Appointments
- **Upcoming appointments** - Chronological list with client name, service, time
- **Past appointments** - Historical record
- **Filters:**
  - Time frame (Today / This week / This month / Custom range)
  - Service type (if provider offers multiple services)
  - Status (Confirmed / Pending / Cancelled / Completed / No-show)
- **Actions per appointment:**
  - Mark as completed
  - Mark as no-show
  - Reschedule (see Section 10)
  - Cancel (see Section 10)

#### Tab 2: Schedule
- Set personal availability (days and hours)
- Mark special days (vacations, holidays, blocked times)
- View service-level schedule overlaid on personal availability
- **Google Calendar integration:**
  - Link Google Calendar account
  - Sync to prevent double-booking
  - Choose conflict resolution preference (auto-block / notify)
- Changes may require admin approval depending on provider's schedule autonomy setting

#### Tab 3: Clients
- List of all clients who have booked with this provider
- Click a client name → view:
  - Client contact information
  - Booking history with this provider
  - **Personal notes** (private to this provider only)
    - Free-text notes per session
    - Only visible to the provider themselves
    - Owner/Admin **cannot** access these notes

> **Privacy Rule:** Personal notes are strictly private to the provider. No other role (owner, admin, team member) can view these notes.

#### Tab 4: Profile
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
  - Direct booking link (e.g., `yourcompany.scheduleapp.com/haircut`)
  - Embedded widget on external website
  - QR code (generated in booking page settings)
  - Shared link from owner/provider

### 9.2 Booking Process
1. **Select Service** - If booking page is company-level, client chooses a service category and service
2. **Select Provider** (if multiple) - Client sees available providers with name, photo, bio
3. **Select Date & Time** - Calendar view showing available slots based on:
   - Service schedule
   - Provider availability
   - Existing bookings
   - Google Calendar conflicts (if integrated)
4. **Enter Details** - Client fills in:
   | Field | Required | Notes |
   |-------|----------|-------|
   | Name | Yes | Full name |
   | Email | Yes | For confirmation and reminders |
   | Phone | Configurable | Owner decides if required |
   | Notes/Reason | No | Free text for context |
   | Custom fields | Configurable | Owner-defined per service |
5. **Payment** (if applicable) - Client pays via configured gateway (Stripe/PayPal)
6. **Confirmation** - Client sees:
   - Booking summary (service, provider, date, time, location)
   - Calendar invite download (.ics)
   - "Add to Google Calendar" button
   - Confirmation number
   - Reschedule/Cancel links

### 9.3 Client Account (Optional)
- If "Require client account" is enabled on the service:
  - Client must sign up / sign in before booking
  - Client gets a personal portal showing:
    - Upcoming bookings
    - Past bookings
    - Option to reschedule or cancel
- If guest booking is allowed:
  - No account needed
  - Reschedule/cancel via links in confirmation email

### 9.4 Booking Page Customization
- Booking pages inherit company branding (logo, colours)
- Each service can have its own booking page or share a company-wide page
- Company-wide page: `yourcompany.scheduleapp.com` (lists all public services)
- Service-specific page: `yourcompany.scheduleapp.com/service-slug`

---

## 10. Reschedule & Cancellation Flow

### 10.1 Client-Initiated Reschedule
- Client clicks "Reschedule" from:
  - Confirmation email link
  - Client portal (if logged in)
- Client sees the same date/time picker with available slots
- Selects new time → confirmation
- **Notifications triggered:**
  - Client: Reschedule confirmation email
  - Provider: Reschedule notice
  - Admin (optional): Reschedule alert

### 10.2 Client-Initiated Cancellation
- Client clicks "Cancel" from:
  - Confirmation email link
  - Client portal (if logged in)
- If within cancellation policy window → cancellation blocked with message
- If outside policy window → cancellation proceeds
- Client confirms cancellation → slot freed
- **Refund logic** (if payment was collected):
  - Within full-refund window: automatic refund
  - Within partial-refund window: partial refund per policy
  - Outside refund window: no refund (configurable)
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
  3. **Payments** - Payment history, outstanding balances, refunds
  4. **Communication** - Log of emails/SMS sent to this client

### 11.3 Client Filters & Search
- Search by name, email, or phone
- Filter by:
  - Service type
  - Provider
  - Booking recency (Active / Lapsed)
  - Booking count (New / Returning / Frequent)

---

## 12. Sidebar Navigation Structure

### Desktop Sidebar
```
[Company Logo]
─────────────────
Dashboard
Company
Team
Providers
Services
Clients
Notifications
Booking Pages
Reports
Settings
```

### Mobile (Hamburger Menu)
Same items as desktop, rendered as a full-screen overlay menu when hamburger icon is tapped.

### Sidebar Visibility by Role
| Menu Item | Owner | Admin | Team Member | Provider |
|-----------|-------|-------|-------------|----------|
| Dashboard | Yes | Yes | Yes | Yes (own) |
| Company | Yes | Yes | No | No |
| Team | Yes | Yes | View only | No |
| Providers | Yes | Yes | Yes | No |
| Services | Yes | Yes | Yes | View own |
| Clients | Yes | Yes | Yes | Own only |
| Notifications | Yes | Yes | No | No |
| Booking Pages | Yes | Yes | No | No |
| Reports | Yes | Yes | Limited | No |
| Settings | Yes | Yes | Own profile | Own profile |

---

## 13. Key Business Rules Summary

1. **Provider lifecycle** - Providers are created as "Pending" on invitation, become "Active" only after accepting AND being assigned to at least one service
2. **Invitation-based onboarding** - Team members and providers join via email invitation only
3. **Role hierarchy** - Owner > Admin > Team Member > Provider
4. **Private notes** - Provider's client notes are invisible to all other roles
5. **Schedule conflicts** - System must detect and surface conflicts when assigning providers to services
6. **Consistent UX pattern** - List → Detail with slide animation across all sections
7. **Mobile tab limit** - Maximum 3 primary tabs visible; additional tabs via horizontal scroll or "More"
8. **Payment gating** - Paid services cannot accept bookings until payment gateway is connected
9. **Cancellation policy enforcement** - System respects per-service cancellation windows for client-initiated cancellations
10. **Schedule autonomy** - Provider schedule changes can be self-managed or require admin approval (configurable per provider)
11. **Notification defaults** - All critical notifications (confirmation, cancellation, reschedule) are enabled by default; follow-ups are opt-in
