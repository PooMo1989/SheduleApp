# Issue: Team Invitation Foreign Keys Blocking User Deletion

**Date:** 2026-01-25
**Severity:** High (UX Blocker)
**Status:** Pending Implementation

## The Issue
When attempting to delete a User from the Supabase Dashboard (or via API), the database throws an error:
`Database error deleting user: update or delete on table "users" violates foreign key constraint "team_invitations_invited_by_fkey" on table "team_invitations"`

## Root Cause
The `team_invitations` table (Migration 010) references `users` in two columns:
1. `invited_by`
2. `accepted_by_user_id`

By default, Postgres applies `ON DELETE NO ACTION` (Restrict). This means if a User has ever sent or accepted an invitation, they **cannot be deleted** because the invitation record would point to a non-existent user.

## The Fix Plan
The "Real Fix" is to modify the Foreign Key constraints to use `ON DELETE SET NULL`. This ensures that when a user is deleted, the invitation record remains (for audit history) but the reference to the deleted user is set to `NULL`.

### Why SET NULL?
- **invited_by**: If the sender deletes their account, the invitation should still exist, but the sender is now "Unknown".
- **accepted_by**: If the acceptor deletes their account, the invitation record (which is historic) remains.

## SQL Query to Rectify
This script can be run as a new migration (e.g., `026_fix_invitation_constraints.sql`) to permanently solve the issue.

```sql
-- 1. Drop the strict constraints
ALTER TABLE public.team_invitations
  DROP CONSTRAINT IF EXISTS team_invitations_invited_by_fkey,
  DROP CONSTRAINT IF EXISTS team_invitations_accepted_by_user_id_fkey;

-- 2. Re-add constraints with ON DELETE SET NULL
ALTER TABLE public.team_invitations
  ADD CONSTRAINT team_invitations_invited_by_fkey
  FOREIGN KEY (invited_by)
  REFERENCES public.users(id)
  ON DELETE SET NULL;

ALTER TABLE public.team_invitations
  ADD CONSTRAINT team_invitations_accepted_by_user_id_fkey
  FOREIGN KEY (accepted_by_user_id)
  REFERENCES public.users(id)
  ON DELETE SET NULL;
```
