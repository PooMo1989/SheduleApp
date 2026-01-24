# Development Workflow - Story Implementation Guide

**Purpose:** Standard process for AI agents implementing stories in sheduleApp.
**Last Updated:** 2026-01-24

> **AGENT INSTRUCTION:** You MUST read this entire file before implementing any story.
> Follow every step in order. Do not skip steps. Do not deviate from boundaries.
> If you are unsure about anything, ask the user — do not assume.

---

## Implementation Boundaries (STRICT)

These rules override any instinct to "improve" or "help beyond scope":

### 1. Scope Lock
- ONLY implement what is written in the story's acceptance criteria
- If a feature isn't in the acceptance criteria, do NOT add it
- If you think something is missing from the story, tell the user — don't fill the gap yourself

### 2. No Freelance Decisions
- If there are 2+ valid implementation approaches, ASK the user which one
- Do not pick an approach and move forward silently
- Examples: component library choice, state management pattern, file structure

### 3. No Drive-By Refactoring
- Do NOT refactor, rename, or "clean up" code you are not changing for the current story
- Do NOT add comments, docstrings, or type annotations to existing code you didn't modify
- Do NOT reorganize imports or file structure beyond what the story requires

### 4. No Speculative Abstractions
- Do NOT create helper functions, utilities, or shared modules "for future use"
- Do NOT add configuration options, feature flags, or extensibility points unless the story asks for them
- Three similar lines of code is better than a premature abstraction

### 5. Noticed Issues Protocol
- If you notice a bug or issue unrelated to the current story:
  - **Blocker** (code won't compile/run without fixing): Fix it, note it in the commit message
  - **Non-blocker** (everything else): Tell the user in chat, do NOT fix it
  - Never silently fix unrelated issues

### 6. File Discipline
- Only create files the story explicitly requires
- Prefer editing existing files over creating new ones
- Never create README, docs, or markdown files unless the story says to

### 7. Story Completion Definition
- A story is DONE when:
  - All acceptance criteria are met (verified by user on production)
  - `tsc --noEmit` passes
  - `npm run lint` passes
  - `npm run build` passes
- A story is NOT DONE if you added extra features beyond acceptance criteria

---

## References

Before starting any work, read these files for context:

| File | Purpose |
|------|---------|
| `bmad_outputs/planning-artifacts/epics.md` | All stories with acceptance criteria |
| `bmad_outputs/planning-artifacts/user-flow-v3.md` | Feature specification |
| `bmad_outputs/planning-artifacts/implementation-order.md` | Story execution order & dependencies |
| `bmad_outputs/planning-artifacts/three-way-verification.md` | Coverage matrix |

---

## Per-Story Process

### Step 1: Read the Story

- Open `epics.md` and find the story by ID
- Read acceptance criteria fully
- Cross-reference with `user-flow-v3.md` section if unclear
- Check `implementation-order.md` for dependencies — confirm all blocking stories are DONE

### Step 2: Schema Migration (if applicable)

1. Create migration file: `supabase/migrations/YYYYMMDDHHMMSS_story_id_description.sql`
2. Write the SQL (CREATE TABLE, ALTER TABLE, RLS policies, indexes)
3. Show the SQL content to the user in chat
4. **STOP and wait** — user must paste SQL into Supabase SQL Editor and confirm "done"
5. Only proceed to Step 3 after user confirms

**SQL Conventions:**
- Always use `IF NOT EXISTS` / `IF EXISTS` for safety
- Always add RLS policies for new tables
- Always add `tenant_id` FK + index on new tables
- Always add `created_at TIMESTAMPTZ DEFAULT now()` and `updated_at TIMESTAMPTZ DEFAULT now()`
- Use CHECK constraints for enum-like columns

### Step 3: Write Code

Order: **API (tRPC router) → UI (components/pages)**

**API Changes:**
- Add/modify procedures in `src/server/routers/`
- Add Zod input schemas matching new DB columns
- Use existing procedure types: `publicProcedure`, `protectedProcedure`, `adminProcedure`, `providerProcedure`
- Ensure tenant_id filtering in all queries

**UI Changes:**
- Prefer editing existing components over creating new ones
- Follow existing patterns (check similar pages for structure)
- Use TailwindCSS for styling (no CSS modules, no styled-components)
- Use `'use client'` only when needed (forms, interactivity)
- Server Components by default

**Code Conventions:**
- TypeScript strict mode (no `any`)
- tRPC for all client-server communication
- No direct Supabase calls from client components
- Import types from `@/types/database.types`

### Step 4: Verify Code Quality

Run these checks before committing:

```bash
npx tsc --noEmit          # Type checking
npm run lint              # ESLint
npm run build             # Full build check (catches SSR issues)
```

Fix any errors before proceeding. Do NOT commit code that fails these checks.

### Step 5: Commit & Push

```bash
git add <specific files>
git commit -m "feat(<story-id>): <short description>"
git push origin main
```

**Commit Message Format:**
- `feat(2.0.3): add tenant payment config fields`
- `fix(2.4.6): remove role checkboxes from invite form`
- `refactor(2.8.4): restructure admin sidebar navigation`

**Rules:**
- Add specific files only (never `git add -A` or `git add .`)
- Never commit `.env`, credentials, or secrets
- One commit per story (unless story is large, then logical sub-commits)
- Push to `main` — Vercel auto-deploys

### Step 6: Notify User for Testing

After push, provide the user with:

```
## Testing: Story X.X.X — [Title]

**Deployed:** Pushing to main now, Vercel will deploy.

**What to test:**
1. [Specific action to take]
2. [Expected result]
3. [Another action]
4. [Expected result]

**Where:** [URL path, e.g., /admin/settings]

**Let me know:** Pass ✓ or issues found.
```

### Step 7: Handle Feedback

- If user reports issues → fix immediately → commit → push → re-test
- If user confirms "pass" → mark story as DONE → proceed to next story

---

## Per-Epic Process (End of Story Group)

When all stories in a Tier/Epic are complete and user-verified:

### Step 8: Write Tests

**What to test:**
- tRPC procedures: input validation, authorization, correct DB operations
- Critical UI flows: form submission, navigation, error states
- Schema integrity: constraints, RLS policies

**Test location:** `src/__tests__/` or co-located `*.test.ts` files

**Test framework:** Vitest (or Jest if already configured)

**Minimum test coverage for an epic:**
- Every new tRPC procedure has at least 1 happy-path test
- Every new tRPC procedure has at least 1 auth/permission test
- Every form component has at least 1 submission test

### Step 9: Run Tests

```bash
npm test                  # Run all tests
npm test -- --coverage    # With coverage report (optional)
```

Fix failures, commit test files, push.

### Step 10: Epic Completion Check

Run this checklist:

- [ ] All stories in the tier/epic are committed and pushed
- [ ] User has verified all stories on production
- [ ] `tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Epic-level tests pass
- [ ] No console errors on deployed app (user confirms)

---

## Quick Reference: What NOT to Do

- Do NOT run Supabase CLI for migrations (user pastes SQL manually)
- Do NOT write tests per-story (only per-epic/tier)
- Do NOT create new files when editing existing ones suffices
- Do NOT add features beyond the story's acceptance criteria
- Do NOT commit without running type check + lint
- Do NOT push to branches other than `main` (no PR workflow for now)
- Do NOT add comments/docstrings to code you didn't change
- Do NOT over-engineer (no abstractions for one-time operations)

---

## Dependency Check Template

Before starting a story, verify:

```
Story: [ID]
Dependencies: [list from implementation-order.md]
  - [dep 1]: ✅ DONE / ❌ NOT DONE
  - [dep 2]: ✅ DONE / ❌ NOT DONE
All clear: YES / NO (if NO, do not proceed)
```
