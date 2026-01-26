# Implementation Order - Story Execution Plan

**Date:** 2026-01-24
**Total New Stories:** 28 (from gap analysis)
**Already Done:** Stories marked ✅ DONE in epics.md are excluded

---

## Ordering Criteria

1. **Dependencies** — A story cannot start if it depends on unfinished work
2. **Foundation first** — Schema before API before UI
3. **Unblock factor** — Stories that unblock the most other stories go first
4. **Logical grouping** — Related stories executed together reduce context switching
5. **MVP critical path** — Features needed for the booking flow get priority

---

## Execution Order

### TIER 1: Schema Migrations (No dependencies, unblock everything)

These are pure database changes. They can ALL run in a single migration batch. No API or UI work needed yet.

| Order | Story | Title | Unblocks |
|-------|-------|-------|----------|
| 1 | **1.8.1** | Owner Role Schema Update | 2.5.3, sidebar role logic |
| 2 | **2.0.3** | Tenant Payment & Config Fields | 2.8.7 (Settings), 3.4.1 (Pay Later) |
| 3 | **2.1.1** | Service Extended Fields (16 columns) | 2.3.1 (Service Portal), 3.4.1 |
| 4 | **2.1.2** | Service Schedule Tables | 2.3.1 (Tab 2), 2.7 (Availability Engine) |
| 5 | **2.4.4b** | Team & Provider Extended Fields | 2.4.6, 2.4.7, 2.8.5, 6.5 |

**Why first:** Every UI and API story below needs these columns/tables to exist. Running all 5 migrations together means zero blocking for everything after.

---

### TIER 2: Reusable UI Components (No data dependencies)

These are generic components used across 10+ pages. Building them once prevents duplication.

| Order | Story | Title | Used By |
|-------|-------|-------|---------|
| 6 | **2.9.2** | List-Detail Split View Component | Team, Providers, Clients, Services |
| 7 | **2.9.3** | Horizontal Tab Component | Team detail, Provider detail, Settings, Service portal, Provider appointments |
| 8 | **2.9.4** | Search & Filter Bar Component | Team list, Providers list, Clients list, Provider clients |

**Why second:** These are pure UI components with no backend dependency. Once built, every page that uses them can be developed in parallel.

---

### TIER 3: Navigation Shells (Defines the app structure)

| Order | Story | Title | Depends On | Unblocks |
|-------|-------|-------|------------|----------|
| 9 | **6.0** | Provider Layout Shell | — | 6.1.1, 6.5, 6.6, 6.7, dual-role sidebar |
| 10 | **2.8.4** | Admin Sidebar Restructure | 6.0 (for dual-role logic) | All admin pages |
| 11 | **2.8.8** | Profile Page (All Roles) | 2.9.3 | Dual-role "My Schedule" |

**Why third:** The sidebar and layout shells define where everything lives. You can't build pages if you don't know where they go.

**Story 6.0 before 2.8.4:** The admin sidebar needs to know about the provider layout to handle dual-role users correctly. Provider layout must exist first.

---

### TIER 4: Team Management Rework (Fix existing code)

| Order | Story | Title | Depends On |
|-------|-------|-------|------------|
| 12 | **2.4.6** | Enhanced Invite Form (remove roles, add name/phone/position) | 2.4.4b |
| 13 | **2.4.7** | Team List Enhancements (avatars, toggle, search) | 2.4.4b, 2.9.4 |
| 14 | **2.4.5** | Team Member Detail View (tabbed slide-in) | 2.9.2, 2.9.3, 2.4.4b |

**Why fourth:** The Team page already exists and works. These stories enhance it to match v3. Low risk since the foundation (team.invite, team.getMembers) is solid.

---

### TIER 5: Settings Consolidation

| Order | Story | Title | Depends On |
|-------|-------|-------|------------|
| 15 | **2.8.7** | Settings Page (Tabbed: Company, Branding, Payments, Notifications, Permissions) | 2.0.3, 2.9.3 |

**Why fifth:** Moves existing forms (CompanyProfileForm, BrandingForm, BusinessHoursForm) into a tabbed layout and adds the new Payments tab. Low risk — mostly reorganization + one new form.

---

### TIER 6: Service Management Rework (Major change)

| Order | Story | Title | Depends On |
|-------|-------|-------|------------|
| 16 | **2.3.1** | Service Setup Tabbed Portal (replace modal with 3-tab page) | 2.1.1, 2.1.2, 2.9.3 |
| 17 | **3.4.1** | Pay Later Mode Configuration (per-service) | 2.1.1, 2.0.3 |

**Why sixth:** This is a significant rework — the current ServiceForm modal becomes a full-page 3-tab experience. Depends on the extended service schema (Tier 1) and tab component (Tier 2).

---

### TIER 6.1: Navigation & Settings Restructure (v3 Alignment)

This tier addresses gaps between user-flow-v2.md notes and v3 implementation.

| Order | Story | Title | Depends On |
|-------|-------|-------|------------|
| 17.1 | **2.8.9** | Separate Company Sidebar Item | 2.8.4 |
| 17.2 | **2.8.10** | Company Sub-Tabs (General Info, Branding, Payments, Notifications) | 2.8.9, 2.8.7 |
| 17.3 | **2.8.11** | Settings Restructure (Account tab for SAAS relationship) | 2.8.9 |
| 17.4 | **2.4.8** | Team Member Management Tab (assigned providers/services/clients) | 2.4.5 |

**Story Details:**

**2.8.9 - Separate Company Sidebar Item:**
- Add "Company" as a new sidebar item between "Booking Pages" and "Settings"
- Company contains tenant-specific business configuration
- Visible to Owner and Admin (with permissions)

**2.8.10 - Company Sub-Tabs:**
- Move Company Info, Branding, Payments (bank details), Notifications from Settings to Company
- Tab 1: General Info (name, timezone, currency, slot intervals, business hours)
- Tab 2: Branding (logo, colours)
- Tab 3: Payments (bank details for SAAS reimbursement, pay later defaults)
- Tab 4: Notifications (email templates)

**2.8.11 - Settings Restructure:**
- Settings becomes the SAAS relationship hub (owner-only)
- Tab 1: Account (subscription status, usage, billing with SAAS platform)
- Tab 2: Permissions (default role permissions for new team members)
- Note: Account tab content is placeholder until SAAS billing is implemented

**2.4.8 - Team Member Management Tab:**
- Add "Management" tab to TeamMemberDetail between Details and Permissions
- Shows: Assigned Providers, Assigned Services, Assigned Clients
- For MVP: Display "No assignments - feature coming soon" placeholder
- Prepares UI structure for future HR module (Phase 3)

**Why 6.1:** These changes align the implementation with the user's original v2 notes that were missed in v3. The Company vs Settings separation is critical for distinguishing tenant configuration from SAAS platform relationship.

---

### TIER 7: Provider Admin Management (New page)

| Order | Story | Title | Depends On |
|-------|-------|-------|------------|
| 18 | **2.8.5** | Admin Providers Page (list + detail tabs) | 2.9.2, 2.9.3, 2.9.4, 2.4.4b |

**Why seventh:** This is a brand new page. It uses the reusable components from Tier 2 and the extended provider fields from Tier 1. The page can show tabs 1-3 (Details, Services, Schedule) immediately; tabs 4-5 (Appointments, Clients) remain placeholders until bookings exist.

---

### TIER 8: Provider Self-Service Portal (New pages)

| Order | Story | Title | Depends On |
|-------|-------|-------|------------|
| 19 | **6.1.1** | Provider Profile Page | 6.0 |
| 20 | **6.5** | Provider Schedule Self-Service | 6.0, 2.7.1 (availability editor) |

**Why eighth:** Now that the provider layout shell exists (Tier 3), build the actual provider pages. These are provider-facing features that don't depend on bookings.

**Note:** Story 2.7.1 (Availability Editor UI) was written before the gap analysis and is a prerequisite for 6.5. It should be implemented alongside or just before 6.5.

---

### TIER 9: Booking Pages & Links (Admin tooling)

| Order | Story | Title | Depends On |
|-------|-------|-------|------------|
| 21 | **9.2.1** | Booking Pages Configuration (embed + direct link) | 3.2 (Widget Configurator) |
| 22 | **3.2.1** | Direct Link Generation Tab | 9.2.1 |

**Why ninth:** These rename "Widget" to "Booking Pages" and add the direct link tab. They depend on the Widget Configurator (Story 3.2) from Epic 3 existing at least in skeleton form.

---

### TIER 10: Post-Booking Features (Blocked by Epic 3)

These stories CANNOT be implemented until the bookings table and booking flow exist (Epic 3: Stories 3.1-3.8). They should be scheduled AFTER Epic 3 is complete.

| Order | Story | Title | Depends On |
|-------|-------|-------|------------|
| 23 | **8.5** | Dashboard Stats & Activity Feed | Epic 3 (bookings data) |
| 24 | **11.3** | Client Management Admin API | Epic 3 (client relationships) |
| 25 | **2.8.6** | Admin Clients Page | 11.3, 2.9.2, 2.9.3, 2.9.4 |
| 26 | **6.6** | Provider Appointments View | 6.0, Epic 3 |
| 27 | **6.7** | Provider Client List & Notes | 6.0, Epic 3, notes schema |
| 28 | **5.5** | Provider-Initiated Reschedule | Epic 3, Epic 5, 6.6 |
| 29 | **5.6** | Provider-Initiated Cancellation | Epic 3, Epic 5, 6.6 |

---

## Visual Dependency Flow

```
TIER 1 (Schema) ─────────────────────────────────────────────────────
  1.8.1  2.0.3  2.1.1  2.1.2  2.4.4b
    │      │      │      │      │
    │      │      └──────┤      │
    │      │             │      │
TIER 2 (UI Components) ──│──────│─────────────────────────────────────
  2.9.2  2.9.3  2.9.4   │      │
    │      │      │      │      │
TIER 3 (Shells) ─────────│──────│─────────────────────────────────────
  6.0 ──→ 2.8.4          │      │
           │    2.8.8     │      │
           │      │       │      │
TIER 4 (Team) ───────────│──────│─────────────────────────────────────
  2.4.6  2.4.7  2.4.5    │      │
                          │      │
TIER 5 (Settings) ────────│──────│────────────────────────────────────
  2.8.7 ←─────────────────┘      │
                                  │
TIER 6 (Services) ────────────────│────────────────────────────────────
  2.3.1 ←─────────────────────────┘
  3.4.1

TIER 6.1 (Nav Restructure) ──────────────────────────────────────────
  2.8.9 → 2.8.10
          2.8.11
  2.4.8 (depends on 2.4.5)

TIER 7 (Providers Page) ──────────────────────────────────────────────
  2.8.5

TIER 8 (Provider Portal) ────────────────────────────────────────────
  6.1.1  6.5

TIER 9 (Booking Pages) ──────────────────────────────────────────────
  9.2.1 → 3.2.1

═══════════════════════ EPIC 3 WALL ══════════════════════════════════

TIER 10 (Post-Booking) ──────────────────────────────────────────────
  8.5  11.3 → 2.8.6  6.6 → 5.5, 5.6  6.7
```

---

## Parallel Execution Opportunities

If you have multiple developers, these groups can run simultaneously:

| Developer A | Developer B | Developer C |
|-------------|-------------|-------------|
| **Tier 1:** All 5 schema migrations | — | — |
| **Tier 2:** 2.9.2 (Split View) | **Tier 2:** 2.9.3 (Tabs) | **Tier 2:** 2.9.4 (Search) |
| **Tier 3:** 6.0 (Provider Shell) | **Tier 3:** 2.8.8 (Profile) | — |
| **Tier 3:** 2.8.4 (Sidebar) | **Tier 4:** 2.4.6 + 2.4.7 | **Tier 5:** 2.8.7 (Settings) |
| **Tier 6:** 2.3.1 (Service Portal) | **Tier 4:** 2.4.5 (Team Detail) | **Tier 7:** 2.8.5 (Providers) |
| **Tier 8:** 6.5 (Schedule) | **Tier 8:** 6.1.1 (Provider Profile) | **Tier 9:** 9.2.1 + 3.2.1 |

---

## Summary

| Tier | Stories | Theme | Blocked By |
|------|---------|-------|------------|
| 1 | 5 | Schema migrations | Nothing (start here) |
| 2 | 3 | Reusable components | Nothing (can parallel with Tier 1) |
| 3 | 3 | Navigation shells | Tier 1 (for role logic) |
| 4 | 3 | Team rework | Tier 1 + Tier 2 |
| 5 | 1 | Settings consolidation | Tier 1 + Tier 2 |
| 6 | 2 | Service portal | Tier 1 + Tier 2 |
| 6.1 | 4 | Company/Settings restructure | Tier 5 + Tier 6 |
| 7 | 1 | Providers page | Tier 1 + Tier 2 |
| 8 | 2 | Provider self-service | Tier 3 |
| 9 | 2 | Booking pages | Epic 3 skeleton |
| 10 | 7 | Post-booking features | Epic 3 complete |
| **Total** | **33** | | |

**Critical Path (longest chain):** Tier 1 → Tier 2 → Tier 3 → Tier 6 → Tier 6.1 → Tier 9 → Epic 3 → Tier 10

**Quick Wins (no dependencies, can start today):**
- All 5 Tier 1 schema migrations
- All 3 Tier 2 UI components
