# Copilot Instructions

AI coding instructions for the Data Structure Visualizer project.

---

## Operating Model (Mandatory)

Follow this loop for every task:

```
1) SPEC → 2) DIFF PLAN → 3) IMPLEMENT → 4) TEST → 5) REVIEW PACKAGE
```

Never skip steps. If information is missing, draft a spec and ask for approval before implementing.

### 1) Spec (User Approves)

For every task, produce a short spec:
- **Goal**: What outcome must be true
- **Non-goals**: Explicitly out of scope
- **Constraints**: Performance, security, style, compatibility
- **Acceptance criteria**: Verifiable conditions
- **Risks / edge cases**: Top 3
- **Test plan**: Commands and expected behaviors

### 2) Diff Plan (Before Editing)

Before making changes:
- List exact files to read
- List exact files to create/modify
- Estimate change size (target <400 LOC)
- Define blast radius and rollback plan

Wait for "proceed" if scope is large or touches core systems.

### 3) Implementation Rules

- Keep modules small and composable
- Use strict typing, clear naming, no magic constants
- Avoid unrelated refactors unless required by spec
- Prefer deterministic, testable logic (pure functions)
- Separate concerns: logic/state generation vs rendering/UI
- Justify any new dependencies; keep them minimal

### 4) Test (Proof, Not Vibes)

After changes, run and report:
- Unit tests (add if missing)
- Lint/format/typecheck
- Build

If commands cannot be run, provide exact commands with expected outputs.

### 5) Review Package

Final response must include:
- **Summary**: What changed and why
- **File-by-file change list**
- **What you did NOT change**
- **Manual validation steps**
- **Risks list**: Top 3 regressions + detection method
- **Follow-ups**: Next small PR suggestions

---

## Growth While Shipping Contract

Every change is both a deliverable and a learning opportunity. Optimize for correctness, maintainability, and understanding.

### Non-Negotiables

1. **Diff-first workflow**: List files to read, then files to modify, before editing
2. **Teach-back after changes**:
   - Control flow: entry point → key functions → outputs
   - Data flow: what state changes, where stored, who consumes
   - Invariants: 3-7 statements that must always be true
   - Risk list: top 3 regressions + manual validation
3. **Verification is mandatory**: Run `npm run check`, report pass/fail
4. **Learning artifact per feature**: Add test, refactor, invariant, lint fix, or doc snippet
5. **Review support**: Provide what changed, what didn't, where to focus review

### Output Checklist (Required)

```
[ ] Files read:
[ ] Files changed/created:
[ ] Feature summary:
[ ] Teach Back (control flow / data flow / invariants):
[ ] Risks + manual validation steps:
[ ] Commands run + results:
[ ] Tests added/updated:
[ ] What to review first:
[ ] Follow-ups / tech debt notes:
```

---

## Quality Guardrails

- Favor small, reviewable batches
- Constrain blast radius; use feature flags or isolated modules
- Preserve existing behavior unless spec says otherwise
- Never commit secrets/tokens/keys
- Treat repo as CI-quality (formatting, linting, tests required)

---

## Architecture Overview

```
App Controller → StepEngine → Visualizers → Canvas Renderer
                     ↓
              EventEngine (v2 event-driven alternative)
```

- **StepEngine** (`src/engine/step-engine.ts`): Controls playback with `play()`, `pause()`, `stepForward()`, `stepBack()`. Uses `requestAnimationFrame` loop.
- **EventEngine** (`src/engine/event-engine.ts`): Alternative reducer-based engine. Stores events instead of full snapshots.
- **Registry** (`src/core/registry.ts`): Singleton that holds all visualizers. Visualizers self-register on import.
- **Visualizers** (`src/visualizers/*.ts`): Each implements `Visualizer<T>` interface with `getSteps()`, `draw()`, `getPseudocode()`.

## Key Patterns

### Adding a New Visualizer

1. Create `src/visualizers/my-algo.ts` following this structure:
```typescript
// Types → Constants → Step Generator (pure function) → Draw function → Visualizer class → Registration
export function generateMyAlgoSteps(input: T[]): Step<MyData>[] { ... }
registry.register(config, () => new MyAlgoVisualizer());
```

2. Export the step generator function for testability
3. Add tests in `src/__tests__/my-algo.test.ts`
4. Import in `src/visualizers/index.ts` (triggers self-registration)

### Step Generator Pattern

Step generators are pure functions that take input and return `Step<T>[]`:
```typescript
// See: src/visualizers/bubble-sort.ts → generateBubbleSortSteps()
// See: src/visualizers/stack.ts → generatePushSteps(), generatePopSteps()
```

Each step includes: `id`, `description`, `snapshot`, `meta` (counters), `activeIndices`, `modifiedIndices`.

### Event-Driven Model (v2)

For memory-efficient visualizers, use the event pattern:
```typescript
// See: src/visualizers/bubble-sort.events.ts
// See: src/visualizers/stack.events.ts
generateEvents(input) → events[]
reducer(state, event) → newState
deriveSnapshot(state) → renderable
```

## Verification Commands

```bash
npm run check        # Full suite: typecheck + lint + test + build (required before PR)
npm run check:fast   # Quick: lint + test only
npm run typecheck    # TypeScript only
npm run test:coverage # Tests with coverage report
```

## File Locations

| Purpose | Location |
|---------|----------|
| Type definitions | `src/core/types.ts` |
| Shared constants | `src/core/constants.ts` |
| Event types | `src/core/events.ts` |
| Visualizer implementations | `src/visualizers/*.ts` |
| Tests | `src/__tests__/*.test.ts` |
| Feature specs | `prompts/specs/active/*.md` |

## Testing Conventions

- Test step generators, not UI/canvas code
- Import from source: `import { generateBubbleSortSteps } from '../visualizers/bubble-sort'`
- Check final state correctness, counter accuracy, edge cases (empty, single element, already sorted)
- See `src/__tests__/bubble-sort.test.ts` for canonical example

## Project Conventions

- **No emojis** in code or documentation
- **Strict TypeScript** with `verbatimModuleSyntax`
- **Pure functions** for step generation (deterministic, testable)
- **Self-registration** pattern for visualizers via `registry.register()`
- Pre-commit hooks run ESLint + Prettier automatically

## Workflow Reference

See `prompts/PLAYBOOK.md` for full agentic workflow rules including:
- Change-scope guidelines (diff size limits)
- Context-first reading requirements
- Risk identification checklist
