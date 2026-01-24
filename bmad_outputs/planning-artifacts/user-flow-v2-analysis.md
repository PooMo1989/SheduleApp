# User Flow v2 - Notes Analysis

## Analysis Legend
- **Code Status**: Built / Partial / Planned (in story) / Not Covered
- **Decision**: Keep / Adjust / Remove / Defer
- **Story**: Where this should live (existing or new)

---

## Notes Analysis Table

| # | Note Summary | Code Status | Existing Story | Keep/Adjust/Remove/Defer | Recommendation | Proposed Story |
|---|---|---|---|---|---|---|
| 1 | **Add currency to company setup** | **Built** - `tenants` table has `settings` JSONB; services have `currency` column | Story 2.0 (Company Profile) ✅ Done | **Keep** | Already supported. Currency is in the services table per-service. Add a default currency field to company settings JSONB for convenience. | Minor enhancement to Story 2.0 - no new story needed |
| 2 | **Payment setup: Company > Payment sub-tab (not Settings > Payments)** | **Not Built** - No payment config UI exists | Not covered in any story | **Keep** | Correct. `Settings > Payments` should be reserved for the SaaS subscription/billing relationship (owner paying for the platform). Company > Payments is where the tenant configures how THEIR clients pay. Two distinct concerns. | New Story (see below) |
| 3 | **Sri Lanka payment limitations - can't use Stripe/PayPal, use centralized PayHere, escrow-style model** | **Planned** - Epic 10 uses PayHere SDK; Phase 4 discusses centralized vs per-tenant models | Epic 10 (PayHere), Phase 4 (SaaS Payment Architecture) | **Adjust** | The PRD already acknowledges PayHere (Sri Lankan gateway). The escrow/centralized model is already discussed in Phase 4. However, the user-flow doc needs to reflect this reality: the SAAS owner collects all payments, tracks per-tenant, and reimburses. The "pay later" + admin approval flow is already in Epic 4. Bank details collection for tenant reimbursement is new. | Adjust Epic 10 + New Story for tenant bank details |
| 4 | **Pay Later: two options at service level - (a) direct booking or (b) pending + approval** | **Planned** - Epic 4 covers Pay Later approval workflow. FR23-FR24 define Pay Later as PENDING | Epic 4 (Stories 4.1-4.5) | **Keep** | Already covered. The service-level toggle ("does pay later auto-confirm or require approval") is a minor addition to the service settings schema. Add `pay_later_mode: 'auto_confirm' | 'pending_approval'` to services table. | Add to Story 2.3 (Service CRUD) as a field, or new Story 2.3.1 |
| 5 | **Team form: remove "Role", keep only "Position"** | **Built** - Current invite form has role checkboxes (Admin, Provider) + optional position field | Story 2.4.1 (Enhanced Team Invitation Fields) | **Adjust** | Agree with the intent but need to clarify: "Role" in the current code means system permission (admin/provider). "Position" is display-only (e.g., Receptionist). The user is saying: don't show system roles on the invite form, just Position. System roles should be assigned separately after invite acceptance. This is a UX simplification. | Adjust Story 2.4.1 - Remove role selection from invite form. Add separate role assignment flow post-acceptance. |
| 6 | **Team member profile: more info (profile pic), management sub-tab (assigned services/providers/clients)** | **Partial** - Users table has `avatar_url`. No management assignment UI exists. | Story 2.5 (Role Assignment) - partial. No story for management tab. | **Keep** | Profile pic upload is already supported via Story 2.5.1 (File Upload Infrastructure). The "Management" sub-tab (assigned services/providers/clients) is new functionality. This is essentially the team member's "scope of responsibility." | New Story: Team Member Detail View with tabs (Details + Management) |
| 7 | **Database: additional columns needed for assigning services/providers/clients to team members** | **Not Built** - No assignment table for team member ↔ service/provider/client relationships | Not covered | **Defer** | This requires a new junction table (e.g., `team_member_assignments`). However, this is complex and not MVP-critical. For MVP, all admins see everything. Assignment-based scoping is an HR/management feature. The current DB architecture allows adding this later without restructuring. | Defer to Phase 3 (HR Module). No DB changes needed now. |
| 8 | **Team list: add avatar, remove date joined, add active/inactive toggle, separate pending from active list** | **Built** - TeamList.tsx shows name, roles, status badges. No avatar. No toggle. | Story 2.4 (Team Management) ✅ Done | **Adjust** | Good UX improvements. Avatar is available (`users.avatar_url`). Active/inactive toggle makes operational sense. Separating pending invites from active members reduces clutter. Remove date joined (low value). | Adjust existing TeamList component - enhancement story |
| 9 | **Team list: add search bar and/or filter** | **Not Built** - Current TeamList has no search/filter | Not covered | **Keep** | Standard UX pattern. Useful once team grows beyond 5-10 members. Low priority for MVP but easy to add. Calendly has search in team views. | Add to responsive UI story (2.9) or new minor story |
| 10 | **Management assignment: is it necessary now? Over-complicated? Requires DB restructure?** | **Not Built** | Not covered | **Defer** | Not necessary for MVP. Current architecture allows all admins to see all data. Assignment-based scoping is a Phase 3/4 feature. The current DB structure (RLS on tenant_id) doesn't need restructuring to add this later - you'd add a junction table and optional RLS policy extension. SimplyBook.me doesn't have this either. | Defer to Phase 3. Document as future requirement. |
| 11 | **Admin managing other members → HR module, too complicated now** | **Not Covered** | Not covered | **Defer** | Agree. Team hierarchy (team leads, departments) is HR territory. MVP only needs: Owner sees all, Admins see all, Providers see own. | Defer. Note in Phase 3 planning. |
| 12 | **Team member assigned as provider: gets Appointments tab, not Dashboard. Admin+Provider dual role = both tabs** | **Partial** - Role system supports multi-role (`roles: ['admin', 'provider']`). No Appointments tab exists. | Story 2.5 (Role Assignment) handles multi-role. No UI for dual-dashboard. | **Keep** | This is an important architectural decision. The solution: "Dashboard" = admin overview (stats, pending items). "Appointments" = provider's bookings view. If user has both roles, they see both sidebar items. This is cleaner than duplicating dashboard logic. | New Story: Dual-Role Navigation Logic |
| 13 | **Provider dashboard = Appointments tab in sidebar** | **Partial** - Provider dashboard exists as stub at `/provider/dashboard` | Story 6.1 (Provider Dashboard Overview) - planned | **Adjust** | Rename the provider's main view from "Dashboard" to "Appointments" in the sidebar. The provider doesn't need a stats-heavy dashboard - they need to see their bookings. Stats can be a sub-section within Appointments. | Adjust Story 6.1 - rename and restructure |
| 14 | **Provider Tab 1 renamed to "Dashboard" (content = appointments)** | **Not Built** | Story 6.1 planned | **Adjust** | Contradicts note #13. User initially said "Appointments" in sidebar then called Tab 1 "Dashboard." Resolution: Sidebar item = "Appointments". Within that view, the content shows upcoming/past appointments with filters. No separate "Dashboard" concept for providers. | Clarify: Provider sidebar item = "Appointments", content = booking list with filters |
| 15 | **Provider Tab 2 renamed: Schedule → Schedule/Availability** | **Not Built** - Availability schema exists, no UI | Story 2.7.1 (Provider Availability Editor UI) - planned | **Keep** | Clear naming. "Schedule/Availability" communicates both the recurring schedule and exception management. | Update Story 2.7.1 naming |
| 16 | **Two calendars question: Calendly has events + conflicts calendar. Do we need two?** | **Not Built** | Story 2.7.1 + Story 6.2 (Calendar View) | **Defer (one is enough for MVP)** | Calendly's "event types" calendar is different from their availability calendar. For MVP, one calendar view is sufficient: show availability blocks + overlay with booked appointments + Google Calendar conflicts. A second dedicated "events/bookings" calendar view can be Phase 2. Adding it later doesn't require architectural changes. | MVP: Single combined calendar. Phase 2: Separate bookings calendar. |
| 17 | **Provider clients list: filter by service** | **Not Built** | Not specifically covered | **Keep** | Standard feature. If a provider offers multiple services, filtering clients by service is essential. Easy to implement with existing `service_assignments` junction table. | Add to Story 6.3 (Provider Client Details) |
| 18 | **Remove QR code. Use direct links + embed codes. Shared interface for both.** | **Partial** - Widget configurator exists (Story 3.2). No QR code implemented. | Story 3.2 (Widget Configurator) | **Adjust** | QR was my suggestion, user doesn't want it. The widget configurator already generates embed code. Add a "Direct Link" tab alongside "Embed Code" tab. Same configuration interface (select service, provider, or both) → outputs either embed snippet or shareable URL. | Adjust Story 3.2 - add Direct Link generation tab |
| 19 | **Booking page: service vs provider priority. Company decides. Storefront/template for companies without websites. Phase 2?** | **Not Built** - Current approach is embed-only (no standalone booking page) | PRD says "Template-based booking pages" = Phase 2 | **Defer** | The user correctly identifies this as Phase 2. MVP uses embed widgets on company's existing website. A standalone "storefront" (hosted booking page at `company.scheduleapp.com`) is Phase 2. The widget already supports service-first or provider-first configuration. | Confirm as Phase 2. No MVP change needed. |
| 20 | **Availability: Google Calendar conflicts = existing bookings check. Also check custom date overrides (4-layer engine already handles this)** | **Planned** - Story 2.7 (4-Layer Availability Engine) covers all 4 layers | Story 2.7 | **Keep** | User is correct - the 4-layer engine already handles this. Layer 3 = date overrides, Layer 4 = Google Calendar (which includes platform bookings synced to GCal). The user-flow doc should reference the 4-layer engine rather than listing separate checks. | No new story. Update user-flow doc wording. |
| 21 | **Payment: SAAS owner collects via their PayHere gateway, tracks per-tenant, reimburses. Not per-tenant gateway.** | **Planned** - Phase 4 discusses this exact question (centralized vs per-tenant) | Phase 4 (SaaS Payment Architecture) | **Keep** | This confirms the "Centralized Model" from Phase 4. SAAS owner's PayHere account collects all payments. Internal ledger tracks per-tenant amounts. Manual/system reimbursement to tenants. Tenants provide bank details for payouts. | Confirm Phase 4 direction. Add tenant bank details to company setup (future). |
| 22 | **Pay Later at service level: needs pending bookings table + approval tracking** | **Planned** - Story 4.1 creates booking status schema (PENDING, APPROVED, REJECTED) | Epic 4 (Stories 4.1-4.5) | **Keep** | Already fully covered. The `bookings` table with status column handles pending/approved states. Service-level toggle for pay-later behavior is a minor schema addition (`pay_later_auto_approve` boolean on services table). | Add boolean field to services schema in Story 4.1 or 2.3 |
| 23 | **Client registration during booking: if required, prompt sign-up mid-flow then return to booking** | **Planned** - Story 3.6 (Guest Booking Flow) covers inline registration | Story 3.6 (Lazy Registration) + Story 3.8 (Strict Auth) | **Keep** | Already covered. Story 3.6 handles the seamless flow: enter details → if account required, prompt registration → return to booking. The slot hold (10-min timer) prevents loss during registration. | No new story needed. Already in Story 3.6. |
| 24 | **Guest post-booking: prompt to create profile (password or SSO) after payment** | **Planned** - Story 3.5 (Booking Confirmation UI) has "Create Account" section | Story 3.5 | **Keep** | Already covered. Story 3.5 explicitly includes: password fields on confirmation page + "Create Account" button + "Skip for now" link. | No new story. Already in Story 3.5. |
| 25 | **Magic page: temporary page for client to view appointment details, cancel, reschedule** | **Planned** - Story 3.7 (Guest Magic Link & Account Claim) | Story 3.7 | **Keep** | Already covered. Story 3.7 defines the magic link page with booking management, reschedule/cancel, and account claim. Calendly does this same pattern. | No new story. Already in Story 3.7. |
| 26 | **Reschedule from magic page** | **Planned** - Story 3.7 includes reschedule capability | Story 3.7 + Story 5.2 | **Keep** | Covered. Magic page (3.7) provides reschedule action, which uses the same reschedule flow (5.2). | No new story. |
| 27 | **Refund complexity: escrow model, need transaction ledger, daily/monthly tracking for owner** | **Not Covered** - No refund/ledger stories exist | Phase 4 mentions this concern but no concrete stories | **Defer** | Complex. Since payments go through SAAS owner's gateway, refunds must also go through the SAAS owner. Need: (a) Transaction ledger table, (b) Tenant balance tracking, (c) Admin view for daily transactions + due balances. This is Phase 4 scope - after basic PayHere integration. | New stories in Phase 4: Transaction Ledger, Tenant Balance Dashboard, Refund Processing |
| 28 | **Sidebar restructure: Dashboard (admin only), Appointments (providers), Company inside Settings, Reports inside Dashboard, Notifications inside Company** | **Built** - Current sidebar has: Dashboard, Bookings, Services, Team, Company, Widget, Settings | Story 2.8 (Admin Dashboard & Navigation Shell) ✅ Done | **Adjust** | This is a significant UX restructure. Analysis: (a) Moving Company into Settings makes sense - reduces top-level items. (b) Removing Reports as standalone and embedding in Dashboard is fine for MVP. (c) Moving Notifications into Company Settings is debatable - templates are configured per-company but accessed frequently during setup. (d) "Appointments" for providers is correct. (e) "Booking Pages" rename to match embed/link generation. | Adjust Story 2.8 - Update sidebar structure. See proposed sidebar below. |
| 29 | **Adjust visibility table based on sidebar changes** | N/A - depends on #28 | Story 2.8 | **Adjust** | Will be updated once sidebar structure is finalized. | Update after #28 decision |
| 30 | **Role hierarchy: No separate "team member" and "admin" - they're the same. Team member = admin minus delete company/members/providers/services** | **Partial** - Current system has `roles: ['owner', 'admin', 'provider']`. No "team_member" role exists separately. | Story 1.8 (RBAC), Story 2.5.2 (Permissions Schema) | **Adjust** | Current implementation already aligns: there's no "team_member" role in the DB. There's only `admin` with granular permissions via JSONB. The user-flow doc should reflect: Owner = full access. Admin/Team Member = same role with permissions controlling what they can delete. This is already how permissions work in Story 2.5.2. | Update user-flow doc terminology. No code change needed. |
| 31 | **Private notes: visible ONLY to the provider who created them. Future: optionally share with client** | **Planned** - Story 11.1 (Client Notes Schema) with Author-Only RLS | Epic 11 (Stories 11.1-11.2) | **Adjust** | Story 11.1 currently allows Owner to see notes too. User now says: ONLY the author. Adjust RLS to remove owner access. Future: add `shared_with_client` boolean for optional client visibility. | Adjust Story 11.1 RLS policy. Add future story for client-visible notes. |
| 32 | **Time intervals: should be 15 min or configurable? Calendly uses configurable.** | **Not Built** - No interval setting exists in schema | Not covered | **Keep** | Calendly allows: 5, 10, 15, 20, 30, 45, 60 min intervals. Default is 15 min. For MVP, default to 15-minute intervals with a company-level setting to change it. Add `slot_interval_minutes` to tenant settings JSONB (default: 15). This affects how the availability engine slices available time into bookable slots. | Add to Story 2.7 (Availability Engine) as a configuration parameter |

---

## Proposed Sidebar Structure (Based on Note #28)

Based on the user's feedback, here's the proposed restructured sidebar:

### Owner/Admin View:
```
[Company Logo]
─────────────────
Dashboard          (Stats, Activity, Quick Actions, Reports)
Appointments       (Only if user is also a provider)
Services           (Service CRUD, Categories)
Team               (Members + Invitations)
Providers          (Provider profiles, schedules)
Clients            (Global client list)
Booking Pages      (Widget config + Direct link generation)
Settings           (Company Info, Payments, Notifications, Branding)
```

### Provider-Only View:
```
[Company Logo]
─────────────────
Appointments       (Upcoming, Past, Filters)
Schedule           (Availability, Overrides, Google Cal)
Clients            (Own clients + Notes)
Profile            (Personal info, Photo)
```

### Dual-Role (Admin + Provider):
```
[Company Logo]
─────────────────
Dashboard          (Admin overview)
Appointments       (Own provider appointments)
Services
Team
Providers
Clients
Booking Pages
Settings
Schedule           (Own availability)
Profile
```

**Settings Sub-tabs:**
- General (Company name, timezone, currency, slot intervals)
- Branding (Logo, colours)
- Payments (Bank details, pay later config)
- Notifications (Email templates)
- Permissions (Default role permissions)

---

## Key Decisions Needed

1. **Sidebar Structure** - Accept the restructure above? The main change is consolidating Company + Notifications + Reports into Settings/Dashboard.

2. **Team Member Assignments** - Confirm deferral to Phase 3? MVP = all admins see everything.

3. **Private Notes** - Remove owner access? Current Story 11.1 gives owner visibility. User wants author-only.

4. **Payment Model** - Confirm centralized SAAS collection + tenant reimbursement for MVP?

5. **Dual-Role UI** - Accept the "Dashboard for admins, Appointments for providers" split?

---

## Stories Impact Summary

| Action | Count | Details |
|--------|-------|---------|
| **No change needed** | 10 | Notes 1, 20, 22, 23, 24, 25, 26, 4 (minor), 17 (add to existing), 32 (add to existing) |
| **Adjust existing story** | 8 | Notes 5, 8, 13, 14, 18, 28, 30, 31 |
| **New story needed** | 3 | Notes 2, 6, 12 |
| **Defer to Phase 3+** | 5 | Notes 7, 10, 11, 19, 27 |
| **Needs user decision** | 2 | Notes 16, 28 |

---

## New Stories Proposed

### Story 2.0.2: Company Payments Configuration Tab
**Epic:** 2
**Goal:** Company owner can configure payment-related settings under Company > Payments sub-tab.
**Fields:** Bank name, Account number, Account holder name, Branch, Pay Later enabled (toggle), Pay Later mode (auto-confirm / pending approval).
**Depends on:** Story 2.0 (Company Profile)
**Note:** This is NOT the PayHere SDK integration (Epic 10). This is the tenant's bank details for SAAS reimbursement.

### Story 2.9.1: Dual-Role Navigation Logic
**Epic:** 2
**Goal:** Users with multiple roles (admin + provider) see appropriate sidebar items for each role.
**Acceptance:** Admin role = Dashboard, Services, Team, Providers, Clients, Booking Pages, Settings. Provider role = Appointments, Schedule, Clients (own), Profile. Dual role = merged sidebar with both sections.
**Depends on:** Story 2.8 (Admin Shell)

### Story 2.4.2: Team Member Detail View (Tabbed)
**Epic:** 2
**Goal:** Clicking a team member shows detail panel with tabs: Details, Management (assigned scope - future), Activity.
**Acceptance:** Slide-left pattern on desktop, full-screen on mobile. X to close. Tabs show relevant info.
**Depends on:** Story 2.4 (Team Management), Story 2.9 (Responsive UI)
