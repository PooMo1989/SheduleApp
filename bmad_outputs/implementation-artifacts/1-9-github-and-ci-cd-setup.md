# Story 1.9: GitHub & CI/CD Setup

Status: complete

## Story

As a **developer**,
I want **version control and automated CI/CD**,
so that **code changes are tested and deployed automatically**.

## Acceptance Criteria

**Given** the project code exists
**When** it is pushed to GitHub
**Then:**
1. A repository exists with proper `.gitignore`
2. `main` branch has protection rules (require PR, no force push)
3. A `develop` branch exists for integration

**Given** a pull request is opened
**When** GitHub Actions runs
**Then:**
1. ESLint checks pass
2. TypeScript compilation succeeds
3. Any existing tests pass
4. A Vercel preview deployment is created

**Given** a PR is merged to `main`
**When** the merge completes
**Then:**
- Production deployment is triggered automatically

## Tasks / Subtasks

- [ ] **Task 1: Initialize Git Repository** (AC: 1, 3)
  - [ ] 1.1: Initialize git if not already done
  - [ ] 1.2: Create comprehensive `.gitignore`
  - [ ] 1.3: Create initial commit
  - [ ] 1.4: Create `develop` branch

- [ ] **Task 2: Create GitHub Repository** (AC: 1)
  - [ ] 2.1: Create new repository on GitHub
  - [ ] 2.2: Push local repository to GitHub
  - [ ] 2.3: Set default branch to `main`

- [ ] **Task 3: Configure Branch Protection** (AC: 2)
  - [ ] 3.1: Enable branch protection for `main`
  - [ ] 3.2: Require PR reviews before merging
  - [ ] 3.3: Require status checks to pass
  - [ ] 3.4: Disable force push and branch deletion

- [ ] **Task 4: Create GitHub Actions Workflow** (AC: PR checks)
  - [ ] 4.1: Create CI workflow file
  - [ ] 4.2: Add ESLint check step
  - [ ] 4.3: Add TypeScript build step
  - [ ] 4.4: Add test step (placeholder for now)

- [ ] **Task 5: Connect Vercel** (AC: preview deployments)
  - [ ] 5.1: Import project to Vercel
  - [ ] 5.2: Configure auto-deploy for main
  - [ ] 5.3: Enable preview deployments for PRs

## Dev Notes

### Comprehensive `.gitignore`

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output

# Next.js
.next/
out/
build/
dist/

# Misc
.DS_Store
*.pem
Thumbs.db

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.idea/
.vscode/
*.swp
*.swo

# Supabase
supabase/.branches
supabase/.temp

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db

# Logs
logs
*.log

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache
```

### GitHub Actions CI Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-build:
    name: Lint and Build
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

  test:
    name: Test
    runs-on: ubuntu-latest
    needs: lint-and-build
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --passWithNoTests
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

### Add NPM Scripts

Update `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "db:types": "supabase gen types typescript --project-id your-project-ref > src/types/database.types.ts"
  }
}
```

### Branch Protection Rules Setup

In GitHub Repository Settings > Branches > Add rule for `main`:

1. **Branch name pattern:** `main`
2. **Require a pull request before merging:** ✅
   - Require approvals: 1 (or as needed)
3. **Require status checks to pass before merging:** ✅
   - Status checks: `lint-and-build`, `test`
4. **Require conversation resolution before merging:** ✅
5. **Do not allow bypassing the above settings:** ✅
6. **Restrict who can push to matching branches:** Optional

### Git Workflow

```bash
# Initialize and create branches
git init
git add .
git commit -m "Initial commit: Next.js project setup"

# Create develop branch
git checkout -b develop
git checkout main

# Add remote and push
git remote add origin https://github.com/your-username/sheduleapp.git
git push -u origin main
git push -u origin develop
```

### PR Template

Create `.github/pull_request_template.md`:

```markdown
## Description
<!-- Describe your changes -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
- [ ] I have updated the documentation accordingly

## Related Issues
<!-- Link any related issues: Fixes #123 -->
```

### Issue Templates

Create `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug Report
about: Report a bug to help us improve
title: '[BUG] '
labels: bug
---

## Description
<!-- A clear description of the bug -->

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
<!-- What should happen -->

## Actual Behavior
<!-- What actually happens -->

## Screenshots
<!-- If applicable -->

## Environment
- Browser:
- OS:
```

### Vercel Configuration

Create `vercel.json` (optional, for custom configuration):

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["iad1"]
}
```

### GitHub Secrets Required

Add these secrets in GitHub Repository Settings > Secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> Note: These are needed during build for type checking. The production values are set in Vercel.

### Project Structure

```
.github/
├── workflows/
│   └── ci.yml
├── ISSUE_TEMPLATE/
│   └── bug_report.md
└── pull_request_template.md

.gitignore
vercel.json (optional)
```

### Critical Rules

- Never commit `.env.local` or other secret files
- Always require PR for changes to `main`
- CI must pass before merge
- Use `develop` for integration, `main` for production

### References

- [Source: bmad_outputs/planning-artifacts/epics.md#Story-1.9]
- [Source: bmad_outputs/planning-artifacts/architecture.md#Infrastructure-Deployment]
- [GitHub Actions Docs](https://docs.github.com/en/actions)

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

- [ ] Git repository initialized
- [ ] `.gitignore` includes all necessary patterns
- [ ] Repository pushed to GitHub
- [ ] `main` branch exists
- [ ] `develop` branch exists
- [ ] Branch protection enabled for `main`
- [ ] GitHub Actions workflow created
- [ ] CI runs on push to main/develop
- [ ] CI runs on pull requests
- [ ] ESLint check passes in CI
- [ ] TypeScript build passes in CI
- [ ] Vercel connected to repository
- [ ] Preview deployments work for PRs
