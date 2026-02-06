# Agentic Workflow Playbook

> A structured workflow for AI-assisted development on this project.

## Core Principles

1. **Small, Focused Changes** — One logical change per PR/session
2. **Context First** — Read before writing; understand before modifying
3. **Test Everything** — No change ships without verification
4. **Document Decisions** — Record what and why in engineering logs

---

## Change-Scope Rules

### Before Any Edit

1. **State the goal** in 1-2 sentences
2. **List files to be modified** (max 5-7 per change)
3. **Identify dependencies** — what must not break

### Diff Size Guidelines

| Change Type | Target Lines | Max Files |
|-------------|--------------|-----------|
| Bug fix | < 50 | 1-3 |
| Small feature | < 200 | 3-5 |
| Refactor | < 300 | 5-7 |
| New visualizer | < 400 | 2-4 |

### File Edit Checklist

- [ ] Read the file (or relevant section) before editing
- [ ] Understand existing patterns and conventions
- [ ] Make minimal, surgical changes
- [ ] Preserve existing formatting and style

---

## Context Rules

### What to Read First

1. **Types** — `src/core/types.ts` for interfaces
2. **Constants** — `src/core/constants.ts` for magic values
3. **Related files** — Similar implementations (e.g., existing visualizers)
4. **Tests** — Understand expected behavior

### Avoiding Context Drift

- Re-read modified sections after 3+ edits in the same file
- If unsure about current state, use `grep_search` or `read_file`
- Never assume file contents match conversation history
- After tool errors, verify file state before retrying

### Semantic Search Priority

1. Function/class names → `grep_search`
2. Concepts/patterns → `semantic_search`
3. File contents → `read_file` (prefer large chunks)

---

## Test + Report Requirements

### Required Commands

```bash
# Full confidence suite (before any PR)
npm run check

# Fast feedback loop (during development)
npm run check:fast

# Type checking only
npm run typecheck

# Tests with coverage
npm run test:coverage
```

### Output Summary Format

After running checks, summarize:

```markdown
### Verification Results
- **Typecheck**: ✅ Pass | ❌ N errors
- **Lint**: ✅ Pass | ❌ N errors, M warnings
- **Tests**: ✅ N passed | ❌ N failed of M
- **Build**: ✅ Success (Xms) | ❌ Failed
```

### Test Requirements for New Code

| Code Type | Required Tests |
|-----------|----------------|
| Step generator function | Input/output correctness, edge cases |
| New visualizer | Step generation, initial state |
| UI component | Not required (manual testing) |
| Utility function | Unit tests with edge cases |

---

## Risk List Requirement

Before completing any significant change, identify:

### Top 3 Plausible Regressions

1. **[Area]** — What could break and why
2. **[Area]** — What could break and why
3. **[Area]** — What could break and why

### Risk Categories to Consider

- Type errors in dependent files
- Broken imports/exports
- Changed function signatures
- CSS layout shifts
- Test failures from changed behavior
- Build/bundle issues

---

## Workflow Summary

```
┌─────────────────────────────────────────────────────────────┐
│  1. SPEC                                                    │
│     Create/review feature spec with acceptance criteria     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. CONTEXT                                                 │
│     Read relevant files, understand existing patterns       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. IMPLEMENT                                               │
│     Small diffs, follow conventions, add tests              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4. VERIFY                                                  │
│     npm run check, document risks, summarize results        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  5. DOCUMENT                                                │
│     Update engineering log, commit with clear message       │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Reference

### Common Patterns

```typescript
// New visualizer structure
src/visualizers/my-algo.ts
├── Types (interface MyAlgoData)
├── Constants (colors, dimensions)
├── Step generators (export function generateXSteps)
├── Rendering (function drawX)
├── Visualizer class (implements Visualizer<T>)
└── Registration (registry.register)

// New test structure
src/__tests__/my-algo.test.ts
├── describe('generateXSteps')
│   ├── it('should handle normal case')
│   ├── it('should handle edge case')
│   └── it('should track counters')
```

### File Locations

| Purpose | Location |
|---------|----------|
| Types | `src/core/types.ts` |
| Constants | `src/core/constants.ts` |
| Visualizers | `src/visualizers/*.ts` |
| Tests | `src/__tests__/*.test.ts` |
| UI Components | `src/ui/*.ts` |
| Feature Specs | `prompts/specs/*.md` |
| Engineering Logs | `docs/engineering-log/*.md` |
