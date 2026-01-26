# Component Audit & Remediation Report

## Executive Summary
The identified files (`ServiceDetail.tsx`, `TeamList.tsx`, `ProviderList.tsx`) are **incomplete implementations of Epic 2, specifically Story 2.11 (UI Consistency Refinements)**.

These components are not "orphaned" but are in a broken state where the code implemented for the new UI design (Split Views, Tabs) does not match the actual backend schema (`trpc` types). They are **High Criticality** issues because they block the proper functioning of the Admin Dashboard as defined in the already "DONE" stories.

| File | Associated Story | Criticality | Issue Type |
|------|------------------|-------------|------------|
| `ServiceDetail.tsx` | Story 2.11 / 2.3 | **High** | Schema Mismatch / Broken Fields |
| `TeamList.tsx` | Story 2.11 / 2.4 | **Medium** | Missing Import |
| `ProviderList.tsx` | Story 2.11 / 2.8 | **Medium** | Type Safety / API Response Handling |

---

## Detailed Analysis

### 1. `ServiceDetail.tsx`
**Status:** 🔴 **Broken** - Will fail to render data or crash.
**Problem:** The component attempts to read properties that do not exist on the `Service` object returned by the API. It seems to have been written against an older or theoretical version of the schema.

*   **`service.type`**: Does not exist. Schema uses `service_type` (Enum: 'consultation' | 'class').
*   **`service.duration`**: Does not exist. Schema uses `duration_minutes`.
*   **`service.is_hidden`**: Does not exist. Schema uses `visibility` (Enum: 'public' | 'private').
*   **`service.multi_provider`**: Does not exist. This appears to be a check for whether multiple providers are assigned.

**Recommendation:**
Refactor the component to map to the actual schema found in `src/server/routers/service.ts`.
*   Replace `type` → `service_type`.
*   Replace `duration` → `duration_minutes`.
*   Replace `is_hidden` → check `visibilty === 'private'`.
*   Replace `multi_provider` → check `service.providers.length > 1`.

### 2. `TeamList.tsx`
**Status:** 🟡 **Incomplete** - Fails to compile.
**Problem:** The component is missing the import for `HorizontalTabs`.
**Context:** Story 2.11 required a "Filter Tab" design (All | Active | Pending), necessitating this component.

**Recommendation:**
Add the missing import:
```typescript
import { HorizontalTabs } from '@/components/common';
```

### 3. `ProviderList.tsx`
**Status:** 🟡 **Fragile** - Uses `any` casting.
**Problem:** The component uses `(p as any).services?.length` to show the count of services. While the API *does* return the `services` relation, the strict Type definition for `Provider` might not be inferring this relation automatically, leading to the use of `any` which suppresses type-checking.

**Recommendation:**
Remove the `any` cast and fix the type inference. Ensure the component uses the specific return type from the `getAll` query, which includes the joined `services` array.

---

## Implementation Plan

Do **NOT** create a new Epic. These tasks belong to **Epic 2: Admin Service & Provider Management**. Since the relevant stories (2.3, 2.8, 2.11) are marked "DONE", these should be treated as **Bug Fixes / Debt Paydown** required to truly complete Epic 2.

### Step 1: Fix Component Logic (Immediate)
Assign to a **"Fix Admin UI Regressions"** task.
1.  **Modify `ServiceDetail.tsx`**: Rename variables to match schema.
2.  **Modify `TeamList.tsx`**: Add imports.
3.  **Modify `ProviderList.tsx`**: Clean up types.

### Step 2: Verification
1.  Navigate to `/admin/services`, `/admin/team`, and `/admin/providers`.
2.  Verify the "Split View" works and clicking an item opens the correctly populated details pane without errors.
