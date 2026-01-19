# Story 1.3: Multi-Tenant Database Schema

Status: complete

## Story

As a **system administrator**,
I want **multi-tenant data isolation enforced at the database level**,
so that **each tenant's data is completely isolated from other tenants** (FR57).

## Acceptance Criteria

**Given** Supabase is connected (Story 1.2 complete)
**When** the tenant schema is created
**Then:**
1. A `tenants` table exists with columns: `id`, `name`, `slug`, `created_at`
2. A `users` table exists with `tenant_id` foreign key
3. Row-Level Security (RLS) is enabled on both tables
4. RLS policy `tenant_isolation` filters all queries by `tenant_id` from JWT
5. A test confirms users cannot access data from other tenants
6. Database types are generated via Supabase CLI to `types/database.types.ts`

## Tasks / Subtasks

- [ ] **Task 1: Install Supabase CLI** (AC: 6)
  - [ ] 1.1: Install Supabase CLI globally or as dev dependency
  - [ ] 1.2: Initialize Supabase local development
  - [ ] 1.3: Link to remote project

- [ ] **Task 2: Create Tenants Table** (AC: 1, 3)
  - [ ] 2.1: Create migration for `tenants` table
  - [ ] 2.2: Add columns: id (uuid), name, slug (unique), settings (jsonb), created_at
  - [ ] 2.3: Enable RLS on tenants table
  - [ ] 2.4: Create RLS policies for tenant access

- [ ] **Task 3: Create Users Table Extension** (AC: 2, 3, 4)
  - [ ] 3.1: Create migration for `users` table (extends auth.users)
  - [ ] 3.2: Add columns: id, tenant_id (FK), role, full_name, phone, created_at
  - [ ] 3.3: Enable RLS on users table
  - [ ] 3.4: Create tenant_isolation policy

- [ ] **Task 4: Create JWT Claims Function** (AC: 4)
  - [ ] 4.1: Create function to extract tenant_id from JWT
  - [ ] 4.2: Create function to add tenant_id to new user JWTs
  - [ ] 4.3: Configure auth hooks for JWT claims

- [ ] **Task 5: Generate TypeScript Types** (AC: 6)
  - [ ] 5.1: Run `supabase gen types typescript`
  - [ ] 5.2: Save to `src/types/database.types.ts`
  - [ ] 5.3: Add npm script for type generation

- [ ] **Task 6: Test Tenant Isolation** (AC: 5)
  - [ ] 6.1: Create test users in different tenants
  - [ ] 6.2: Verify cross-tenant access is blocked
  - [ ] 6.3: Document test results

## Dev Notes

### Supabase CLI Installation

```bash
npm install -D supabase

# Initialize local Supabase (optional for local dev)
npx supabase init

# Link to remote project
npx supabase link --project-ref your-project-ref

# Generate types
npx supabase gen types typescript --project-id your-project-ref > src/types/database.types.ts
```

### Migration: Tenants Table

Create file: `supabase/migrations/001_create_tenants.sql`

```sql
-- Create tenants table
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on slug for fast lookups
CREATE INDEX idx_tenants_slug ON public.tenants(slug);

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Policy: Tenants can only view their own tenant
CREATE POLICY "Users can view own tenant"
  ON public.tenants FOR SELECT
  USING (id = (auth.jwt() ->> 'tenant_id')::UUID);

-- Policy: Only super admins can create tenants (for now, disable)
-- In production, this would be done via admin API
```

### Migration: Users Table

Create file: `supabase/migrations/002_create_users.sql`

```sql
-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'provider', 'client')),
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on tenant_id for RLS performance
CREATE INDEX idx_users_tenant_id ON public.users(tenant_id);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view users in their tenant
CREATE POLICY "tenant_isolation"
  ON public.users FOR ALL
  USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (id = auth.uid());
```

### JWT Claims Hook

Create file: `supabase/migrations/003_jwt_claims.sql`

```sql
-- Function to get tenant_id from users table
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(user_id UUID)
RETURNS UUID AS $$
  SELECT tenant_id FROM public.users WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function for custom JWT claims
-- This will be called by Supabase Auth to add claims to JWT
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB AS $$
DECLARE
  claims JSONB;
  user_tenant_id UUID;
  user_role TEXT;
BEGIN
  -- Get user's tenant_id and role
  SELECT tenant_id, role INTO user_tenant_id, user_role
  FROM public.users
  WHERE id = (event->>'user_id')::UUID;

  -- Build custom claims
  claims := event->'claims';
  
  IF user_tenant_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(user_tenant_id::TEXT));
    claims := jsonb_set(claims, '{role}', to_jsonb(user_role));
  END IF;

  -- Return modified event
  RETURN jsonb_set(event, '{claims}', claims);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
```

> ⚠️ **Note:** Configure the JWT hook in Supabase Dashboard: Authentication > Hooks > Custom Access Token

### Trigger for Updated_at

Create file: `supabase/migrations/004_updated_at_trigger.sql`

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tenants
CREATE TRIGGER handle_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Apply to users
CREATE TRIGGER handle_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

### TypeScript Types Usage

After generating types, use them in your code:

```typescript
import { Database } from '@/types/database.types';

type Tenant = Database['public']['Tables']['tenants']['Row'];
type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
```

### Add NPM Script

Add to `package.json`:

```json
{
  "scripts": {
    "db:types": "supabase gen types typescript --project-id your-project-ref > src/types/database.types.ts"
  }
}
```

### Project Structure

```
supabase/
├── migrations/
│   ├── 001_create_tenants.sql
│   ├── 002_create_users.sql
│   ├── 003_jwt_claims.sql
│   └── 004_updated_at_trigger.sql
└── config.toml

src/types/
└── database.types.ts    # Auto-generated
```

### Critical Implementation Rules

- **ALL tables** must have `tenant_id` column (except `tenants` itself)
- **ALL tables** must have RLS enabled
- **ALL RLS policies** must filter by `tenant_id` from JWT claims
- Store `tenant_id` in JWT claims via custom hook
- Never use service role key in client-facing code

### References

- [Source: bmad_outputs/planning-artifacts/architecture.md#Data-Architecture]
- [Source: bmad_outputs/planning-artifacts/architecture.md#Multi-Tenant-Model]
- [Source: bmad_outputs/project-context.md#Database-Auth-Rules]

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes List

_(To be filled during development)_

### File List

_(To be filled during development)_

---

## Verification Checklist

- [ ] Supabase CLI installed and linked
- [ ] All migrations applied successfully
- [ ] RLS enabled on all tables
- [ ] JWT claims hook configured
- [ ] TypeScript types generated
- [ ] Test: User A cannot see User B's data (different tenant)
- [ ] Test: User A can see User C's data (same tenant)
- [ ] No RLS bypass warnings in Supabase dashboard
