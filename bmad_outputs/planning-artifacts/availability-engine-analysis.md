# Availability Engine Analysis & Implementation Plan

## Implementation Status: ✅ COMPLETE

**Completed Date:** January 2025
**Migration:** 027_bookings_schema.sql
**Core Files:** `src/lib/availability/`, `src/server/routers/availability.ts`, `src/server/routers/booking.ts`

---

## 1. Executive Summary

The 5-Layer Availability Engine has been implemented. It computes available booking slots by filtering through multiple layers of schedule and conflict data.

### Implementation Summary
| Component | Status | Details |
|-----------|--------|---------|
| `bookings` table | ✅ Complete | Migration 027 with exclusion constraint |
| Availability Engine | ✅ Complete | `src/lib/availability/engine.ts` |
| tRPC Routers | ✅ Complete | `availability.ts`, `booking.ts` |
| Google Calendar | ⚠️ Placeholder | Schema exists, API integration pending |

---

## 2. The 5-Layer Architecture

| Layer | Component | DB Table | Status |
|-------|-----------|----------|--------|
| **L1** | Service Schedule | `service_schedules` | ✅ Implemented |
| **L1.5** | Service Override | `service_schedule_overrides` | ✅ Implemented |
| **L2** | Provider Schedule | `provider_schedules` | ✅ Implemented |
| **L3** | Provider Override | `schedule_overrides` | ✅ Implemented |
| **L4** | Internal Bookings | `bookings` | ✅ Implemented |
| **L5** | External Calendar | `provider_calendars` + API | ⚠️ Schema only |

---

## 3. Data Model

### 3.1 Bookings Table (Migration 027)

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  service_id UUID NOT NULL REFERENCES services(id),
  provider_id UUID NOT NULL REFERENCES providers(id),
  client_user_id UUID REFERENCES users(id),

  -- Time (UTC)
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,

  -- Snapshot fields
  duration_minutes INTEGER NOT NULL,
  buffer_before_minutes INTEGER NOT NULL DEFAULT 0,
  buffer_after_minutes INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',

  -- Status
  status booking_status NOT NULL DEFAULT 'pending',
  -- Enum: pending, confirmed, cancelled, rejected, completed, no_show

  -- Client info
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  client_notes TEXT,

  -- Exclusion constraint (prevents double-booking)
  CONSTRAINT no_overlapping_bookings EXCLUDE USING gist (
    provider_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  ) WHERE (status NOT IN ('cancelled', 'rejected'))
);
```

### 3.2 Timezone Strategy
- **Database:** All times stored as `TIMESTAMPTZ` (UTC)
- **Processing:** Tenant timezone from `tenants.timezone`
- **Client:** Display in client's timezone (passed via API)

---

## 4. Algorithm Design: `getAvailability`

**Location:** `src/lib/availability/engine.ts`

### Phase 1: Resolve Context
- Fetch service config (duration, buffers, type)
- Fetch tenant config (timezone, slot interval, min notice, max future days)
- Fetch linked providers

### Phase 2: Date Boundary
- Apply `min_notice_hours` filter
- Apply `max_future_days` filter
- Early exit if no valid date range

### Phase 3: Batch Fetch
Single database round-trip for all layer data:
- Service schedules (L1)
- Service overrides (L1.5)
- Provider schedules (L2)
- Provider overrides (L3)
- Existing bookings (L4)
- Calendar events (L5 - placeholder)

### Phase 4: Per-Date Processing
For each date in range:
1. Get service windows for day of week (L1)
2. Apply service override if exists (L1.5)
3. For each provider:
   - Get provider windows (L2)
   - Intersect with service windows
   - Apply provider override (L3)
   - Generate time slots
   - Filter by booking conflicts (L4)
   - Filter by calendar conflicts (L5)

### Phase 5: Aggregation
- "Any Provider" mode: Combine slots from all providers
- Apply min notice filter
- Return grouped by date

---

## 5. API Endpoints

### Availability Router (`src/server/routers/availability.ts`)

| Endpoint | Type | Description |
|----------|------|-------------|
| `getSlots` | Query | Get available slots for date range |
| `checkSlot` | Query | Real-time check for specific slot |
| `getProvidersForSlot` | Query | Get available providers for a time |
| `getSummary` | Query | Condensed calendar view |

### Booking Router (`src/server/routers/booking.ts`)

| Endpoint | Type | Description |
|----------|------|-------------|
| `create` | Mutation | Create new booking (public) |
| `getMyBookings` | Query | Client's bookings |
| `getAll` | Query | Admin view (all bookings) |
| `getProviderBookings` | Query | Provider's bookings |
| `updateStatus` | Mutation | Admin/provider status change |
| `cancel` | Mutation | Client cancellation |
| `getById` | Query | Single booking details |

---

## 6. File Structure

```
src/lib/availability/
├── index.ts              # Public exports
├── engine.ts             # Main getAvailability()
├── types.ts              # TypeScript interfaces
├── layers/
│   ├── index.ts
│   ├── serviceSchedule.ts    # L1
│   ├── serviceOverride.ts    # L1.5
│   ├── providerSchedule.ts   # L2
│   ├── providerOverride.ts   # L3
│   ├── bookingConflict.ts    # L4
│   └── googleCalendar.ts     # L5 (placeholder)
└── utils/
    ├── index.ts
    ├── slotGrid.ts           # Slot generation
    ├── timeRange.ts          # Time operations
    ├── timezone.ts           # TZ helpers
    └── providerAssignment.ts # Round-robin/least-booked
```

---

## 7. Edge Case Handling

### Race Conditions
- **Solution:** PostgreSQL `EXCLUDE` constraint throws error on concurrent insert
- **API Response:** Returns 409 Conflict with message "Time slot was just booked"

### Buffer Times
- Stored in `buffer_before_minutes` and `buffer_after_minutes`
- Enforced at application layer during availability check
- DB constraint prevents core time overlap

### "Any Provider" Mode
- Default strategy: Round-robin
- Alternative: Least-booked provider
- Slot aggregation combines availability from all providers

---

## 8. Performance

**Target:** < 500ms response time for 7-day range

**Optimizations:**
1. Single DB round-trip for all layer data
2. Indexed data structures (Maps) for O(1) lookups
3. Early exit on date boundary violations
4. Optional Redis caching (future enhancement)

---

## 9. Future Enhancements

1. **Google Calendar Integration (L5)**
   - Complete OAuth flow (Story 2.6)
   - Batch free/busy queries
   - Two-way sync

2. **Class/Group Bookings**
   - Capacity tracking in slots
   - Multiple clients per slot

3. **Recurring Bookings**
   - Series creation
   - Bulk cancellation

4. **Notifications**
   - Booking confirmation emails
   - Reminder system
