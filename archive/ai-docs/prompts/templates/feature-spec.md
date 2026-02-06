# Feature Specification: [Feature Name]

> Brief one-line description of the feature.

## Overview

**Goal**: What this feature accomplishes in 2-3 sentences.

**Motivation**: Why we need this feature.

---

## Acceptance Criteria

### Must Have

- [ ] **AC1**: Specific, testable requirement
- [ ] **AC2**: Specific, testable requirement
- [ ] **AC3**: Specific, testable requirement

### Should Have

- [ ] **AC4**: Nice-to-have requirement
- [ ] **AC5**: Nice-to-have requirement

### Verification

- [ ] All tests pass (`npm run check`)
- [ ] Manual testing completed
- [ ] No console errors in browser

---

## Non-Goals (Explicit)

What this feature will NOT do:

1. **[Non-goal 1]** — Why it's out of scope
2. **[Non-goal 2]** — Why it's out of scope
3. **[Non-goal 3]** — Why it's out of scope

---

## Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `src/visualizers/xxx.ts` | Create | New visualizer implementation |
| `src/__tests__/xxx.test.ts` | Create | Unit tests |
| `src/core/types.ts` | Modify | Add new types (if needed) |
| `src/visualizers/index.ts` | Modify | Export new visualizer |

---

## Technical Approach

### Step 1: [Title]

Description of implementation step.

### Step 2: [Title]

Description of implementation step.

### Step 3: [Title]

Description of implementation step.

---

## Risks

### Top 3 Plausible Regressions

1. **[Risk Area]** — Description and mitigation
2. **[Risk Area]** — Description and mitigation
3. **[Risk Area]** — Description and mitigation

---

## Testing Strategy

### Unit Tests

```typescript
describe('featureName', () => {
  it('should handle normal case', () => {});
  it('should handle edge case', () => {});
});
```

### Manual Testing

1. Step-by-step manual test procedure
2. Expected visual outcome
3. Edge cases to verify

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Tests written and passing
- [ ] `npm run check` passes
- [ ] Engineering log updated
- [ ] Code reviewed (if applicable)
