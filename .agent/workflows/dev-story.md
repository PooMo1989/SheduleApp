---
description: 'Implement a story from epics.md with balanced testing - efficient and practical'
---

# Story Development Workflow

## 1. Load Context
Before implementing, read these files:
- `bmad_outputs/project-context.md` - Critical rules and patterns
- `bmad_outputs/planning-artifacts/epics.md` - Find the story to implement
- `bmad_outputs/planning-artifacts/architecture.md` - Tech stack decisions
- `bmad_outputs/planning-artifacts/prd.md` - Requirements reference (if needed)

## 2. Testing Framework (One-Time Setup)

If this is the **first story** (Story 1.1) or testing is not yet configured:

```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# For E2E (can defer to later epic)
npm install -D playwright @playwright/test
```

**Config files to create:**
- `vitest.config.ts` - Unit test runner config
- `vitest.setup.ts` - Testing library setup
- Update `package.json` scripts: `"test": "vitest", "test:e2e": "playwright test"`

After this, testing is ready. **Skip this section on subsequent stories.**

---

## 3. Implementation Approach
- Work through story tasks/subtasks **in order**
- Follow the architecture and patterns from project-context.md
- Use existing code patterns when extending functionality
- Mark tasks complete as you finish them

## 4. Testing Strategy (Balanced)

| Code Type | Testing Approach |
|-----------|------------------|
| **Setup/Config** | Smoke test only (verify it runs) |
| **Core Logic/Utils** | Unit tests immediately |
| **API Routes** | 1-2 integration tests per route |
| **UI Components** | Visual verification via browser |
| **Hooks/State** | Unit test if complex logic |

**Key Rules:**
- Skip trivial tests (config files, simple wrappers)
- Run full test suite at story completion
- Never leave tests failing

## 5. Story Completion Checklist
Before marking story done:
- [ ] All tasks/subtasks completed
- [ ] Tests pass (`npm test`)
- [ ] App runs without errors (`npm run dev`)
- [ ] Acceptance criteria verified
- [ ] Update story status in epics.md

## 6. Output
At end of story, provide:
1. Summary of what was implemented
2. Files created/modified
3. Any issues or notes for next story
