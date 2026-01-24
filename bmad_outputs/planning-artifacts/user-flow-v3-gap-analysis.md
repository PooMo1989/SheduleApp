# User Flow v3 - Comprehensive Gap Analysis

## Analysis Methodology
Each feature in v3 is checked against:
1. **Code** - Is it built in the codebase?
2. **Story** - Is there an existing story covering it?
3. **Schema** - Does the database support it?
4. **API** - Does a tRPC router/procedure exist?
5. **UI** - Do pages/components exist?

## Status Legend
| Symbol | Meaning |
|--------|---------|
| ✅ | Fully built and aligned with v3 |
| 🟡 | Partially built or story exists but needs adjustment |
| ❌ | Gap - not built, no story, needs new work |

---

## Section 1: Owner Onboarding

| # | Feature | Code | Story | Schema | API | UI | Action |
|---|---------|------|-------|--------|-----|-----|--------|
| 1.1a | Email sign-up | ✅ | 1.4 ✅ | ✅ users table | ✅ auth.register | ✅ RegisterForm | None |
| 1.1b | Google SSO sign-up | ✅ | 1.5 ✅ | ✅ | ✅ OAuth callback | ✅ GoogleSignInButton | None |
| 1.1c | Land on Dashboard after sign-in | ✅ | 1.6 ✅ | N/A | N/A | ✅ redirect to /admin/dashboard | None |
| 1.1d | Onboarding wizard | ❌ | None | N/A | N/A | ❌ | Defer (noted as future in v3) |
| 1.2a | Company name | ✅ | 2.0 ✅ | ✅ tenants.name | ✅ admin.updateSettings | ✅ CompanyProfileForm | None |
| 1.2b | Logo upload | ✅ | 2.5.1 ✅ | ✅ tenants.logo_url | ✅ | ✅ FileUpload | None |
| 1.2c | Branding colours | ✅ | 2.0 ✅ | ✅ tenants.branding JSONB | ✅ | ✅ BrandingForm | None |
| 1.2d | Business category/industry | ❌ | None | ❌ No column | ❌ | ❌ | New: add column to tenants |
| 1.2e | Contact info | ✅ | 2.0 ✅ | ✅ contact_email, contact_phone | ✅ | ✅ | None |
| 1.2f | Timezone | ✅ | 2.0 ✅ | ✅ tenants.timezone | ✅ | ✅ | None |
| 1.2g | Default currency | ✅ | 2.0 ✅ | ✅ tenants.currency | ✅ | ✅ | None |
| 1.2h | Business hours | ✅ | 2.0 ✅ | ✅ tenants.business_hours JSONB | ✅ | ✅ BusinessHoursForm | None |
| 1.2i | Slot interval setting | ❌ | None | ❌ No column | ❌ | ❌ | New: add to tenants.settings or new column |
| 1.3a | Bank details for payout | ❌ | None | ❌ No columns | ❌ | ❌ | New story + schema |
| 1.3b | Pay Later enabled (company default) | ❌ | None | ❌ No column | ❌ | ❌ | New: add to tenants |
| 1.3c | Pay Later mode (company default) | ❌ | None | ❌ No column | ❌ | ❌ | New: add to tenants |
| 1.3d | Payment status indicator UI | ❌ | None | N/A | N/A | ❌ | New UI component |
| 1.4a | Provider lifecycle (Pending→Active) | 🟡 | 2.5 partial | 🟡 providers.is_active exists but no "pending" status column | 🟡 | ❌ | Adjust: add status column or use is_active + user acceptance |

---

## Section 2: Dashboard

| # | Feature | Code | Story | Schema | API | UI | Action |
|---|---------|------|-------|--------|-----|-----|--------|
| 2.1a | Today's Schedule timeline | ❌ | None | ❌ No bookings table | ❌ | ❌ | Depends on bookings (Epic 3) |
| 2.1b | Quick Stats cards | ❌ | None | ❌ No bookings table | ❌ | ❌ | New story after bookings |
| 2.1c | Recent Activity feed | ❌ | None | ❌ No activity_log table | ❌ | ❌ | New story |
| 2.1d | Upcoming Appointments list | ❌ | None | ❌ No bookings table | ❌ | ❌ | Depends on bookings |
| 2.1e | Action Items (pending invitations, conflicts) | 🟡 | None | 🟡 Invitations exist | 🟡 team.getMembers shows pending | ❌ No aggregated view | New story |
| 2.1f | Reports Summary | ❌ | 8.3 planned | ❌ No bookings | ❌ | ❌ | Adjust Story 8.3 → embed in dashboard |

---

## Section 3: Team Member Management

| # | Feature | Code | Story | Schema | API | UI | Action |
|---|---------|------|-------|--------|-----|-----|--------|
| 3.1a | Team tab in sidebar | ✅ | 2.8 ✅ | N/A | N/A | ✅ AdminSidebar | None |
| 3.2a | Inline add form (not popup) | 🟡 | 2.4.1 | N/A | N/A | 🟡 InviteForm exists but only has email + roles | Adjust UI |
| 3.2b | Name field in invite | ❌ | 2.4.1 mentions it | ❌ No name stored on invitation | 🟡 team.invite only takes email | ❌ Not in form | Adjust: add name to invitation schema + API + UI |
| 3.2c | Mobile number in invite | ❌ | 2.4.1 mentions it | ❌ No phone on invitation | ❌ | ❌ | Adjust: add phone to invitation |
| 3.2d | Position field in invite | ❌ | 2.4.1 mentions Role/Position | ❌ No position column on users/invitations | ❌ | ❌ | New: add position column to users table |
| 3.2e | Send Email Invitation button | ✅ | 2.4.3 ✅ | ✅ | ✅ team.invite + Resend | ✅ | None |
| 3.2f | Pending section separate from active | 🟡 | 2.4 ✅ | ✅ | ✅ team.getMembers returns both | 🟡 TeamList has sections but mixed | Adjust UI |
| 3.3a | Profile pic/avatar in list | 🟡 | None | ✅ users.avatar_url | ✅ | 🟡 Initials avatar only, no photo | Adjust UI to show photo |
| 3.3b | Active/Inactive toggle | ❌ | None | ❌ No is_active on users | ❌ | ❌ | New: add is_active to users + toggle UI |
| 3.3c | Search bar for team list | ❌ | None | N/A | N/A | ❌ | New UI component |
| 3.3d | Remove date joined from list | 🟡 | None | N/A | N/A | 🟡 Currently shows date | Adjust UI |
| 3.4a | Slide-left detail panel | ❌ | 2.9 planned | N/A | N/A | ❌ | New story (UI pattern) |
| 3.4b | Sidebar collapse to icons on detail open | ❌ | 2.9 planned | N/A | N/A | 🟡 Collapse exists but not triggered by detail | Adjust |
| 3.4c | Tab: Details | ❌ | None | 🟡 Data exists in users table | ✅ team.getMembers | ❌ | New UI |
| 3.4d | Tab: Permissions | ❌ | 2.5.2 planned | ✅ users.permissions JSONB | ❌ No permission edit procedure | ❌ | New story |
| 3.4e | Tab: Activity | ❌ | None | ❌ No activity_log table | ❌ | ❌ | New story (Phase 2+) |
| 3.4f | X button to return to list | ❌ | 2.9 planned | N/A | N/A | ❌ | Part of slide pattern story |

---

## Section 4: Responsive View Logic

| # | Feature | Code | Story | Schema | API | UI | Action |
|---|---------|------|-------|--------|-----|-----|--------|
| 4.1a | Desktop list + detail split view | ❌ | 2.9 planned | N/A | N/A | ❌ No split view component | New UI pattern component |
| 4.1b | Sidebar icons-only mode on detail | 🟡 | 2.8.2 planned | N/A | N/A | 🟡 Collapse exists, not context-triggered | Adjust |
| 4.2a | Hamburger menu on mobile | ✅ | 2.8 ✅ | N/A | N/A | ✅ AdminLayoutShell | None |
| 4.2b | Full-screen detail on mobile | ❌ | 2.9 planned | N/A | N/A | ❌ | New UI pattern |
| 4.2c | X button dismiss on mobile | ❌ | 2.9 planned | N/A | N/A | ❌ | Part of pattern story |
| 4.3a | Tab component with scroll | ❌ | None | N/A | N/A | ❌ No tab component | New shared UI component |

---

## Section 5: Admin/Team Member Flow

| # | Feature | Code | Story | Schema | API | UI | Action |
|---|---------|------|-------|--------|-----|-----|--------|
| 5.1a | Accept invitation page | ✅ | 2.4 ✅ | ✅ | ✅ team.validateInvite, acceptInvite | ✅ AcceptInvitePage | None |
| 5.1b | SSO on accept | ✅ | 2.4 ✅ | ✅ | ✅ | ✅ GoogleSignInButton on accept page | None |
| 5.2a | Same permissions as owner (minus delete) | 🟡 | 2.5.2/2.5.3 | ✅ permissions JSONB | 🟡 hasPermission utility exists | ❌ No UI enforcement | Adjust: implement permission checks in UI |
| 5.2b | Owner role distinct from admin | 🟡 | 2.5.3 planned | 🟡 roles array exists but no 'owner' value in CHECK constraint | ❌ | ❌ | Adjust: add 'owner' to roles CHECK, update handle_new_user |

---

## Section 6: Service Management

| # | Feature | Code | Story | Schema | API | UI | Action |
|---|---------|------|-------|--------|-----|-----|--------|
| 6.1a | Services tab in sidebar | ✅ | 2.8 ✅ | N/A | N/A | ✅ | None |
| 6.1b | Category filter | ❌ | None | ✅ categories table exists | ✅ category.getAll | ❌ No filter UI | Adjust ServiceList |
| 6.1c | Category expansion (grouped view) | ❌ | None | ✅ | ✅ | ❌ Flat list currently | Adjust ServiceList |
| 6.2-T1a | Service name | ✅ | 2.3 ✅ | ✅ | ✅ service.create | ✅ ServiceForm | None |
| 6.2-T1b | Category selection | ✅ | 2.3 ✅ | ✅ category_id FK | ✅ | ✅ | None |
| 6.2-T1c | Description | ✅ | 2.3 ✅ | ✅ | ✅ | ✅ | None |
| 6.2-T1d | Duration | ✅ | 2.3 ✅ | ✅ duration_minutes | ✅ | ✅ | None |
| 6.2-T1e | Buffer before/after | 🟡 | None specific | ✅ buffer_before_minutes, buffer_after_minutes columns exist | ❌ Not in service.create input | ❌ Not in ServiceForm | Adjust API + UI |
| 6.2-T1f | Pricing type (Free/Fixed/Variable) | ❌ | None | ❌ No pricing_type column | ❌ | ❌ | New: add column + logic |
| 6.2-T1g | Price | ✅ | 2.3 ✅ | ✅ price DECIMAL | ✅ | ✅ | None |
| 6.2-T1h | Currency per service | 🟡 | None | ✅ currency column exists | ❌ Not in create input | ❌ Not in form | Adjust API + UI |
| 6.2-T1i | Location type | ❌ | None | ❌ No column | ❌ | ❌ | New: add column |
| 6.2-T1j | Virtual meeting link | ❌ | None | ❌ No column | ❌ | ❌ | New: add column |
| 6.2-T1k | Max attendees | 🟡 | 9.1 planned | ✅ max_capacity column exists | ❌ Not in create input | ❌ Not in form | Adjust API + UI |
| 6.2-T1l | Booking window | ❌ | 2.7 mentions adding columns | ❌ No min_notice/max_future columns | ❌ | ❌ | New: schema + API + UI |
| 6.2-T1m | Cancellation policy | ❌ | None | ❌ No column | ❌ | ❌ | New: add column |
| 6.2-T1n | Auto-confirm bookings | ❌ | None | ❌ No column | ❌ | ❌ | New: add column |
| 6.2-T1o | Visibility (Public/Private) | ❌ | None | ❌ No column | ❌ | ❌ | New: add column |
| 6.2-T1p | Pay Later enabled per service | ❌ | None | ❌ No column | ❌ | ❌ | New: add column |
| 6.2-T1q | Pay Later mode per service | ❌ | None | ❌ No column | ❌ | ❌ | New: add column |
| 6.2-T2a | Service-level available days/hours | ❌ | None | ❌ No service_schedules table | ❌ | ❌ | **New table needed** |
| 6.2-T2b | Break times | ❌ | None | ❌ | ❌ | ❌ | Part of service_schedules |
| 6.2-T2c | Special dates blocked (service level) | ❌ | None | ❌ No service_overrides table | ❌ | ❌ | **New table needed** |
| 6.2-T2d | Provider assignment dropdown | 🟡 | 2.5 ✅ | ✅ service_assignments table | ✅ provider.assignServices | ❌ Not in service form | Adjust: add to service setup UI |
| 6.2-T2e | Team member as provider assignment | 🟡 | 2.5 | ✅ Multi-role support | ✅ team.addRole | ❌ No UI in service form | Adjust UI |
| 6.2-T2f | Invite new provider from service form | ❌ | None | ✅ team_invitations | 🟡 team.invite exists | ❌ Not in service form | Adjust UI |
| 6.2-T2g | Conflict detection | ❌ | None | ❌ No bookings table | ❌ | ❌ | New story (after bookings) |
| 6.2-T3a | Custom URL slug per service | ❌ | None | ❌ No column | ❌ | ❌ | New: add column |
| 6.2-T3b | Public description | ❌ | None | 🟡 description exists but no public/internal split | N/A | ❌ | Reuse description field |
| 6.2-T3c | Show price/duration toggles | ❌ | None | ❌ No columns | ❌ | ❌ | New: add columns or JSONB settings |
| 6.2-T3d | Require client account toggle | 🟡 | None | 🟡 allow_guest_checkout at tenant level only | ❌ | ❌ | New: per-service override |
| 6.2-T3e | Confirmation message | ❌ | None | ❌ No column | ❌ | ❌ | New: add column |
| 6.2-T3f | Redirect after booking | ❌ | None | ❌ No column | ❌ | ❌ | New: add column |
| 6.3a | Edit service (tabbed portal) | 🟡 | 2.3 | ✅ | ✅ service.update | 🟡 Modal form exists, not tabbed | Adjust to tabbed layout |

---

## Section 7: Provider Management (Owner/Admin)

| # | Feature | Code | Story | Schema | API | UI | Action |
|---|---------|------|-------|--------|-----|-----|--------|
| 7.1a | Providers as separate sidebar item | ❌ | 2.8.2 planned | N/A | N/A | ❌ No /admin/providers route | New page |
| 7.1b | Provider list page | ❌ | None specific | ✅ providers table | ✅ provider.getAll | ❌ No dedicated page | New page |
| 7.2a | Slide-left detail for provider | ❌ | 2.8.3 planned | N/A | N/A | ❌ | Part of UI pattern |
| 7.2b | Tab: Details | ❌ | 2.8.3 planned | ✅ providers table | ✅ provider.getById | ❌ | New UI |
| 7.2c | Tab: Services | ❌ | 2.8.3 | ✅ service_assignments | ✅ provider.getById returns services | ❌ | New UI |
| 7.2d | Tab: Schedule/Availability | ❌ | 2.7.1 planned | ✅ provider_schedules + overrides | ❌ No schedule query procedures | ❌ | New API + UI |
| 7.2e | Tab: Appointments | ❌ | 2.8.3 planned | ❌ No bookings table | ❌ | ❌ | After bookings |
| 7.2f | Tab: Clients | ❌ | 2.8.3 planned | ❌ No client tracking | ❌ | ❌ | After bookings |
| 7.2g | Tab: Performance | ❌ | 2.8.3 planned | ❌ No metrics | ❌ | ❌ | After bookings |
| 7.3a | Schedule change notifications | ❌ | None | ❌ No notification system | ❌ | ❌ | New story |
| 7.3b | Schedule autonomy (self-managed/approval) | ❌ | None | ❌ No column on providers | ❌ | ❌ | New: add column + logic |
| 7.4a | Add New Provider form | 🟡 | 2.4 partial | ✅ team_invitations | ✅ team.invite | ❌ No provider-specific invite form | Adjust: create provider invite form |
| 7.4b | Specialization field | ❌ | None | ❌ No column | ❌ | ❌ | New: add to providers table |
| 7.4c | Pre-assign services on invite | ❌ | None | 🟡 placeholder_provider_id exists | ❌ | ❌ | Adjust: extend invite flow |

---

## Section 8: Service Provider Portal

| # | Feature | Code | Story | Schema | API | UI | Action |
|---|---------|------|-------|--------|-----|-----|--------|
| 8.2a | Provider sidebar (Appointments, Schedule, Clients, Profile) | ❌ | None | N/A | N/A | ❌ Only stub page exists | **New: Provider layout shell** |
| 8.3a | Appointments main view | ❌ | 6.1 planned | ❌ No bookings table | ❌ | ❌ | After Epic 3 |
| 8.3b | Service filter dropdown | ❌ | None | ✅ service_assignments | ❌ | ❌ | Part of appointments UI |
| 8.3c | Calendar/List view toggle | ❌ | 6.2 planned | ❌ | ❌ | ❌ | After bookings |
| 8.3d | Upcoming/Past/Date Range tabs | ❌ | 6.1 planned | ❌ | ❌ | ❌ | After bookings |
| 8.3e | Actions (complete, no-show, reschedule, cancel) | ❌ | 5.2, 5.3 planned | ❌ | ❌ | ❌ | After bookings |
| 8.4a | Set personal availability | ❌ | 2.7.1 planned | ✅ provider_schedules | ❌ No provider-facing procedure | ❌ | **New: provider schedule API + UI** |
| 8.4b | Special days/overrides | ❌ | 2.7.1 planned | ✅ schedule_overrides | ❌ | ❌ | Part of schedule UI |
| 8.4c | Combined calendar view | ❌ | 6.2 planned | ✅ Schema supports | ❌ | ❌ | New UI component |
| 8.4d | Google Calendar integration | ❌ | 2.6 planned | ✅ provider_calendars | ❌ | ❌ | Epic 2.6 (not built) |
| 8.5a | Client list for provider | ❌ | 6.3 planned | ❌ No client tracking table | ❌ | ❌ | After bookings |
| 8.5b | Filter clients by service | ❌ | None | ❌ | ❌ | ❌ | After bookings |
| 8.5c | Client search | ❌ | None | ❌ | ❌ | ❌ | After bookings |
| 8.5d | Personal notes (author-only) | ❌ | 11.1 planned | ❌ No client_notes table | ❌ | ❌ | Epic 11 |
| 8.6a | Provider profile edit | ❌ | None | ✅ providers table | ✅ provider.updateProfile | ❌ No provider-facing page | New UI page |
| 8.6b | Profile photo upload | ❌ | 2.5.1 | ✅ photo_url column | ✅ | ❌ No provider-facing upload | Adjust: add to provider profile |

---

## Section 9: Client Booking Flow

| # | Feature | Code | Story | Schema | API | UI | Action |
|---|---------|------|-------|--------|-----|-----|--------|
| 9.1a | Direct booking link access | ❌ | 3.1 planned | ❌ No bookings infra | ❌ | ❌ | Epic 3 |
| 9.1b | Embedded widget (iframe) | ❌ | 3.1 planned | ❌ | ❌ | ❌ | Epic 3 |
| 9.2a | Booking Pages sidebar item | ❌ | 2.8 has "Widget" | N/A | N/A | 🟡 Widget page exists (mock) | Adjust: rename + enhance |
| 9.2b | Embed Code tab | ❌ | 3.2 planned | N/A | N/A | 🟡 Widget configurator exists (basic) | Adjust Story 3.2 |
| 9.2c | Direct Link tab | ❌ | None | N/A | N/A | ❌ | Adjust Story 3.2: add link tab |
| 9.2d | Configuration (service + provider selection) | ❌ | 3.2 planned | ✅ services + providers exist | ✅ getAll procedures | ❌ No functional configurator | Story 3.2 |
| 9.3a | 4-layer availability display | ❌ | 2.7 planned | ✅ Schema supports all 4 layers | ❌ No availability API | ❌ | Story 2.7 (critical) |
| 9.3b | Date/time slot selection UI | ❌ | 3.1 planned | ❌ | ❌ | ❌ | Epic 3 |
| 9.3c | Client details form | ❌ | 3.6 planned | ❌ No client-specific columns | ❌ | ❌ | Epic 3 |
| 9.3d | Payment via PayHere gateway | ❌ | 10.1 planned | ❌ No payments table | ❌ | ❌ | Epic 10 |
| 9.3e | Pay Later option (auto-confirm) | ❌ | 3.4, 4.1 planned | ❌ No bookings table | ❌ | ❌ | Epic 3 + 4 |
| 9.3f | Pay Later option (pending approval) | ❌ | 4.1-4.5 planned | ❌ | ❌ | ❌ | Epic 4 |
| 9.4a | Client registration mid-booking | ❌ | 3.6 planned | ✅ users table | ✅ auth.register | ❌ No inline flow | Story 3.6 |
| 9.4b | Guest booking + post-booking registration prompt | ❌ | 3.5 planned | ❌ No booking_token column | ❌ | ❌ | Story 3.5 |
| 9.5a | Magic page (booking management) | ❌ | 3.7 planned | ❌ No booking_tokens table | ❌ | ❌ | Story 3.7 |
| 9.5b | Reschedule from magic page | ❌ | 3.7 + 5.2 planned | ❌ | ❌ | ❌ | Story 3.7 + 5.2 |

---

## Section 10: Reschedule & Cancellation

| # | Feature | Code | Story | Schema | API | UI | Action |
|---|---------|------|-------|--------|-----|-----|--------|
| 10.1a | Client reschedule flow | ❌ | 5.2 planned | ❌ No bookings table | ❌ | ❌ | Epic 5 |
| 10.2a | Client cancellation with policy enforcement | ❌ | 5.3 planned | ❌ | ❌ | ❌ | Epic 5 |
| 10.2b | Refund logic (centralized model) | ❌ | None | ❌ No payments/refunds table | ❌ | ❌ | Phase 4 |
| 10.3a | Provider-initiated reschedule | ❌ | None | ❌ | ❌ | ❌ | New story |
| 10.4a | Provider-initiated cancellation | ❌ | None | ❌ | ❌ | ❌ | New story |
| 10.5a | Admin cancellation | ❌ | 8.2 planned | ❌ | ❌ | ❌ | Story 8.2 |

---

## Section 11: Client Management (Owner/Admin)

| # | Feature | Code | Story | Schema | API | UI | Action |
|---|---------|------|-------|--------|-----|-----|--------|
| 11.1a | Clients sidebar item | ❌ | None | N/A | N/A | ❌ | New page |
| 11.1b | Global client list | ❌ | None | 🟡 users with role='client' exists | ❌ No client query | ❌ | New story |
| 11.2a | Client detail view (tabbed) | ❌ | None | 🟡 | ❌ | ❌ | New story |
| 11.2b | Booking history per client | ❌ | None | ❌ No bookings | ❌ | ❌ | After bookings |
| 11.2c | Payment history per client | ❌ | None | ❌ No payments | ❌ | ❌ | After payments |
| 11.3a | Client search & filters | ❌ | None | N/A | ❌ | ❌ | New story |

---

## Section 12: Notification Templates

| # | Feature | Code | Story | Schema | API | UI | Action |
|---|---------|------|-------|--------|-----|-----|--------|
| 12.1a | Notifications in Settings sub-tab | ❌ | 8.4 planned | ❌ No templates table | ❌ | ❌ | Adjust Story 8.4 |
| 12.2a | Template types (14 types defined) | ❌ | 8.4 planned | ❌ | ❌ | ❌ | Story 8.4 |
| 12.3a | Template configuration (subject, body, merge fields) | ❌ | 8.4 planned | ❌ | ❌ | ❌ | Story 8.4 |
| 12.3b | Enable/disable per service | ❌ | None | ❌ | ❌ | ❌ | Extend Story 8.4 |
| 12.3c | Timing configuration | ❌ | None | ❌ | ❌ | ❌ | Extend Story 8.4 |

---

## Section 13: Sidebar Navigation

| # | Feature | Code | Story | Schema | API | UI | Action |
|---|---------|------|-------|--------|-----|-----|--------|
| 13a | Owner/Admin sidebar structure (v3) | 🟡 | 2.8 | N/A | N/A | 🟡 Current has 7 items, v3 has 8 + Profile | **Adjust AdminSidebar** |
| 13b | Provider sidebar (Appointments, Schedule, Clients, Profile) | ❌ | None | N/A | N/A | ❌ | **New: ProviderLayoutShell** |
| 13c | Dual-role sidebar (merged) | ❌ | None | ✅ Multi-role in users.roles | N/A | ❌ | **New: Conditional sidebar logic** |
| 13d | Settings sub-tabs (Company, Branding, Payments, Notifications, Permissions) | ❌ | None | N/A | N/A | ❌ Settings is flat page | **New: Settings page with tabs** |
| 13e | Profile page (all roles) | ❌ | None | ✅ users table | 🟡 No profile update procedure | ❌ | **New: Profile page + API** |
| 13f | Profile > My Schedule sub-tab (dual-role) | ❌ | None | ✅ provider_schedules | ❌ | ❌ | **New: conditional sub-tab** |

---

## Schema Gap Summary

### New Tables Needed

| Table | Purpose | Required By | Priority |
|-------|---------|-------------|----------|
| **bookings** | Core booking records | Epic 3, 4, 5 | Critical (MVP) |
| **service_schedules** | Service-level day/hour availability (Layer 1 of 4-layer engine) | Section 6.2 Tab 2, Story 2.7 | Critical (MVP) |
| **service_schedule_overrides** | Service-level date exceptions | Section 6.2 Tab 2 | High |
| **payments** | Transaction records (centralized ledger) | Epic 10, Section 9.3 | High (MVP) |
| **booking_tokens** | Magic link tokens for guest management | Story 3.7, Section 9.5 | Medium |
| **client_notes** | Provider private notes per client | Epic 11, Section 8.5 | Medium |
| **notification_templates** | Customizable email templates | Epic 7, Section 12 | Medium |
| **activity_log** | Audit trail for team actions | Section 3.4e | Low (Phase 2) |

### New Columns on Existing Tables

| Table | Column | Type | Purpose |
|-------|--------|------|---------|
| **tenants** | business_category | TEXT | Company industry/category |
| **tenants** | slot_interval_minutes | INTEGER DEFAULT 15 | Time slot granularity |
| **tenants** | bank_name | TEXT | Payout bank name |
| **tenants** | bank_account_number | TEXT | Payout account |
| **tenants** | bank_account_holder | TEXT | Account holder name |
| **tenants** | bank_branch | TEXT | Branch identifier |
| **tenants** | pay_later_enabled | BOOLEAN DEFAULT true | Company-level pay later toggle |
| **tenants** | pay_later_mode | TEXT DEFAULT 'pending_approval' | auto_confirm / pending_approval |
| **services** | pricing_type | TEXT DEFAULT 'fixed' | free/fixed/variable/starting_from |
| **services** | location_type | TEXT DEFAULT 'in_person' | in_person/virtual/both |
| **services** | virtual_meeting_url | TEXT | Meeting link for virtual services |
| **services** | min_notice_hours | INTEGER DEFAULT 24 | Minimum booking notice |
| **services** | max_future_days | INTEGER DEFAULT 60 | Maximum advance booking |
| **services** | cancellation_hours | INTEGER DEFAULT 24 | Cancellation policy window |
| **services** | auto_confirm | BOOLEAN DEFAULT true | Auto vs manual confirmation |
| **services** | visibility | TEXT DEFAULT 'public' | public/private |
| **services** | pay_later_enabled | BOOLEAN | Per-service pay later override |
| **services** | pay_later_mode | TEXT | Per-service pay later mode override |
| **services** | custom_url_slug | TEXT | Booking page URL slug |
| **services** | show_price | BOOLEAN DEFAULT true | Show price on booking page |
| **services** | show_duration | BOOLEAN DEFAULT true | Show duration on booking page |
| **services** | require_account | BOOLEAN | Per-service guest override |
| **services** | confirmation_message | TEXT | Custom post-booking message |
| **services** | redirect_url | TEXT | Post-booking redirect |
| **users** | position | TEXT | Display-only title/position |
| **users** | is_active | BOOLEAN DEFAULT true | Active/inactive toggle |
| **providers** | specialization | TEXT | Area of expertise |
| **providers** | schedule_autonomy | TEXT DEFAULT 'self_managed' | self_managed/approval_required |
| **team_invitations** | name | TEXT | Invitee name (pre-fill) |
| **team_invitations** | phone | TEXT | Invitee phone |
| **team_invitations** | position | TEXT | Invited position |

### Roles CHECK Constraint Update
```sql
-- Current: roles <@ ARRAY['admin','provider','client']
-- Needed: roles <@ ARRAY['owner','admin','provider','client']
```

---

## API Gap Summary

### New Routers Needed

| Router | Procedures Needed | Priority |
|--------|-------------------|----------|
| **booking** | create, getAll, getById, getByProvider, getByClient, updateStatus, reschedule, cancel | Critical (MVP) |
| **availability** | getSlots (4-layer computation), checkConflicts | Critical (MVP) |
| **client** | getAll, getById, search, getByProvider | Medium |
| **notification** | getTemplates, updateTemplate, send, getHistory | Medium |
| **payment** | initiate, handleWebhook, getTransactions, getByTenant | High |
| **schedule** | getByProvider, updateSchedule, addOverride, removeOverride (provider-facing) | High |
| **profile** | getOwn, updateOwn, updatePhoto | Medium |

### Existing Routers Needing Updates

| Router | Changes Needed |
|--------|---------------|
| **service** | Add buffer fields, pricing_type, location, booking window, pay later, visibility, URL slug to create/update input schemas |
| **team** | Add name, phone, position to invite input. Add getById for detail view. |
| **provider** | Add schedule queries, specialization, schedule_autonomy to update |
| **admin** | Add slot_interval, bank details, pay later settings to updateSettings schema |

---

## UI Gap Summary

### New Pages Needed

| Page | Route | Role | Priority |
|------|-------|------|----------|
| /admin/providers | Admin provider list + detail | Owner/Admin | High |
| /admin/clients | Admin client list + detail | Owner/Admin | Medium |
| /admin/booking-pages | Widget + link generation | Owner/Admin | High |
| /admin/settings (tabbed) | Company, Branding, Payments, Notifications, Permissions | Owner/Admin | High |
| /provider/appointments | Provider bookings view | Provider | Critical (after bookings) |
| /provider/schedule | Provider availability editor | Provider | High |
| /provider/clients | Provider client list + notes | Provider | Medium |
| /profile | Personal info + optional schedule | All | Medium |
| /embed/book | Client booking widget | Public | Critical (MVP) |
| /booking/manage | Magic page for guests | Public | Medium |
| /client/dashboard | Client bookings portal | Client | Medium |

### New Shared Components Needed

| Component | Purpose | Priority |
|-----------|---------|----------|
| ListDetailSplitView | Reusable list → detail slide pattern | High |
| HorizontalTabs | Scrollable tab bar with mobile support | High |
| SearchFilter | Search + filter bar for lists | Medium |
| StatusToggle | Active/Inactive inline toggle | Medium |
| ProviderLayoutShell | Provider sidebar + header | High |
| SettingsTabLayout | Settings page with sub-tab navigation | High |
| AvailabilityEditor | Weekly schedule builder (drag-to-select) | High |
| CalendarView | Combined calendar (availability + bookings + GCal) | High |
| BookingWidget | Embeddable date/time picker + form | Critical |

### Existing Components Needing Updates

| Component | Changes |
|-----------|---------|
| AdminSidebar | Rename Widget→Booking Pages, remove Company (→Settings), remove Settings standalone, add Providers, add Clients, add Profile at bottom |
| ServiceForm | Convert from modal to tabbed page, add 15+ new fields |
| TeamList | Add avatar photo, remove date, add active toggle, add search, separate pending |
| InviteForm | Add name, phone, position fields. Remove role checkboxes (assign after). |

---

## Stories Impact Summary

| Category | Count |
|----------|-------|
| Features fully built (no action) | 18 |
| Covered by existing story (aligned) | 22 |
| Covered by existing story (needs adjustment) | 19 |
| **New stories needed** | **24** |
| Deferred to Phase 2+ | 8 |

---

## Proposed New Stories

### Schema Stories

| Story # | Title | Tables/Columns Affected |
|---------|-------|------------------------|
| **2.1.1** | Service Extended Fields Migration | services: pricing_type, location_type, virtual_meeting_url, min_notice_hours, max_future_days, cancellation_hours, auto_confirm, visibility, pay_later_enabled, pay_later_mode, custom_url_slug, show_price, show_duration, require_account, confirmation_message, redirect_url |
| **2.1.2** | Service Schedule Tables | New: service_schedules (service_id, day_of_week, start_time, end_time, is_available), service_schedule_overrides (service_id, override_date, start_time, end_time, is_available, reason) |
| **2.0.3** | Tenant Payment & Configuration Fields | tenants: business_category, slot_interval_minutes, bank_name, bank_account_number, bank_account_holder, bank_branch, pay_later_enabled, pay_later_mode |
| **2.4.4** | Team & Provider Extended Fields | users: position, is_active. team_invitations: name, phone, position. providers: specialization, schedule_autonomy |
| **1.8.1** | Owner Role Schema Update | ALTER roles CHECK constraint to include 'owner'. Update handle_new_user trigger. |

### UI Pattern Stories

| Story # | Title | Description |
|---------|-------|-------------|
| **2.9.2** | List-Detail Split View Component | Reusable component: list on left, detail panel slides in on right. Sidebar auto-collapses. X button returns. Mobile: full-screen push with back. |
| **2.9.3** | Horizontal Tab Component | Scrollable tab bar. Max 3 visible on mobile. Overflow indicator. Used across all detail views. |
| **2.9.4** | Search & Filter Bar Component | Reusable search input + filter dropdowns. Used in Team, Providers, Clients, Services lists. |

### Page & Feature Stories

| Story # | Title | Description |
|---------|-------|-------------|
| **2.8.4** | Admin Sidebar Restructure | Rename Widget→Booking Pages, remove standalone Company/Settings, add Providers/Clients/Profile items. Implement Settings with sub-tabs. |
| **2.8.5** | Admin Providers Page | New /admin/providers page with list view, search/filter, add provider button. Uses ListDetailSplitView with provider tabs. |
| **2.8.6** | Admin Clients Page | New /admin/clients page with global client list, search, filters (service, provider, recency). Uses ListDetailSplitView with client tabs. |
| **2.8.7** | Settings Page (Tabbed) | Replace flat Company/Settings pages with single tabbed Settings page: Company Info, Branding, Payments, Notifications, Permissions sub-tabs. |
| **2.8.8** | Profile Page (All Roles) | New /profile page. Shows Personal Info for all. Shows My Schedule/Availability sub-tab for dual-role users. |
| **2.3.1** | Service Setup Tabbed Portal | Replace modal ServiceForm with full-page tabbed portal (Basics & Settings, Schedule & Provider Assignment, Booking Page Config). Add all v3 fields. |
| **2.4.5** | Team Member Detail View | Clicking member opens detail panel with tabs: Details, Permissions, Activity. Permissions tab allows editing user.permissions JSONB. |
| **2.4.6** | Enhanced Invite Form (v3 aligned) | Add Name, Phone, Position to invite form. Remove role checkboxes. Roles assigned post-acceptance. |
| **2.4.7** | Team List Enhancements | Avatar photos, position display, active/inactive toggle, search bar, clean pending separation. |
| **6.0** | Provider Layout Shell | New layout for /provider/* routes. Provider sidebar (Appointments, Schedule, Clients, Profile). Responsive with hamburger menu. |
| **6.1.1** | Provider Profile Page | Provider-facing /provider/profile page. Edit name, bio, photo, contact prefs, notification settings. Uses FileUpload component. |
| **6.5** | Provider Schedule Self-Service | Provider can view/edit own availability at /provider/schedule. New providerProcedure APIs for schedule CRUD. Respects schedule_autonomy setting. |
| **9.2.1** | Booking Pages Configuration | Replace Widget page with Booking Pages. Two tabs: Embed Code + Direct Link. Same config interface (select service/provider). Generates working code/URLs. |
| **3.4.1** | Pay Later Mode Configuration | Service-level pay later toggle and mode (auto-confirm vs pending). Company-level default. Booking creation respects setting. |

### Provider/Booking Dependent Stories (After Epic 3)

| Story # | Title | Depends On |
|---------|-------|------------|
| **5.5** | Provider-Initiated Reschedule | Epic 3 (bookings), Epic 5 |
| **5.6** | Provider-Initiated Cancellation | Epic 3 (bookings), Epic 5 |
| **6.6** | Provider Appointments View | Epic 3 (bookings) |
| **6.7** | Provider Client List + Notes | Epic 3, Epic 11 |
| **8.5** | Dashboard Stats & Activity Feed | Epic 3 (bookings data needed) |
| **11.3** | Client Management Admin Page | Epic 3 (bookings data needed) |

---

## Execution Priority Recommendation

### Phase A: Schema & Foundation (Before any new features)
1. Story 1.8.1 - Owner role schema
2. Story 2.0.3 - Tenant payment & config fields
3. Story 2.1.1 - Service extended fields
4. Story 2.1.2 - Service schedule tables
5. Story 2.4.4 - Team & provider extended fields

### Phase B: UI Patterns & Navigation (Enables all feature pages)
6. Story 2.9.2 - List-Detail Split View component
7. Story 2.9.3 - Horizontal Tab component
8. Story 2.9.4 - Search & Filter component
9. Story 2.8.4 - Admin Sidebar restructure
10. Story 2.8.7 - Settings page (tabbed)
11. Story 2.8.8 - Profile page

### Phase C: Feature Pages (Uses new patterns)
12. Story 2.3.1 - Service setup tabbed portal
13. Story 2.4.5 - Team member detail view
14. Story 2.4.6 - Enhanced invite form
15. Story 2.4.7 - Team list enhancements
16. Story 2.8.5 - Admin providers page
17. Story 6.0 - Provider layout shell
18. Story 6.1.1 - Provider profile page
19. Story 6.5 - Provider schedule self-service
20. Story 9.2.1 - Booking pages configuration

### Phase D: Booking Infrastructure (Critical MVP path)
21. Epic 3 stories (bookings table, widget, booking flow)
22. Epic 4 stories (pay later approval)
23. Story 3.4.1 - Pay later mode configuration
24. Epic 5 stories (reschedule/cancel)
25. Stories 5.5, 5.6 - Provider-initiated reschedule/cancel

### Phase E: Post-Booking Features
26. Story 6.6 - Provider appointments view
27. Story 6.7 - Provider client list
28. Story 8.5 - Dashboard stats
29. Story 2.8.6 - Admin clients page
30. Epic 7 - Notifications
31. Epic 10 - Payments
32. Epic 11 - Client notes
