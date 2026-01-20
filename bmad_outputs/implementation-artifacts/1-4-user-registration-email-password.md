# Story 1.4: Admin Registration & Tenant Creation

Status: complete

## Story

As an **admin (first user)**,
I want **to register and create my company account**,
so that **I can set up my business and invite team members** (FR11, FR57).

> **UPDATED (2026-01-21):** Registration now creates a new tenant per signup. The first user becomes the admin. Clients register via invitation or lazy signup during booking.

## Acceptance Criteria

**Given** I am on the registration page
**When** I enter valid email, mobile number, and password
**Then:**
1. A new tenant is created with an email-based slug (e.g., `john-example-com`)
2. My account is created as role `admin` of that tenant
3. I am redirected to `/admin/settings` to complete company setup
4. I can then invite team members via `/admin/team`

**Given** I enter an email that already exists
**When** I submit the registration form
**Then:**
- I see an error message "Email already registered"
- No duplicate account is created

**Given** I enter a password less than 8 characters
**When** I submit the form
**Then:**
- I see a validation error "Password must be at least 8 characters"

## Tasks / Subtasks

- [x] **Task 1: Create Registration UI** (AC: 1-5)
  - [x] 1.1: Create registration page at `src/app/(public)/register/page.tsx`
  - [x] 1.2: Create RegisterForm component with fields: email, mobile, password
  - [x] 1.3: Apply design tokens (Teal primary, Inter font)
  - [x] 1.4: Add form validation with Zod

- [x] **Task 2: Implement Admin-First Registration Logic** (AC: 1, 2, 3)
  - [x] 2.1: Generate tenant slug from email
  - [x] 2.2: Create new tenant record
  - [x] 2.3: Handle slug collisions (retry with suffix)
  - [x] 2.4: Create user profile with `role: 'admin'` and new `tenant_id`

- [x] **Task 3: Post-Registration Flow** (AC: 4)
  - [x] 3.1: Auto-login user after registration
  - [x] 3.2: Redirect to `/admin/settings` (not dashboard)

## Dev Notes

### Registration Form Component (`src/features/auth/components/RegisterForm.tsx`)

```typescript
// Implemented Flow:
// 1. SignUp with Supabase Auth
// 2. Insert new Tenant (slug = email-based)
// 3. Insert User Profile (role = 'admin', tenant_id = new_tenant.id)
// 4. Redirect to /admin/settings
```

### Critical Rules

- **First User is Admin:** Every self-registration creates a new tenant and assigns the user as Admin.
- **Tenant Isolation:** New tenant is created to ensure data isolation from the start.
- **Slug Uniqueness:** Slugs are generated from email and must be unique (fallback to timestamp suffix).
