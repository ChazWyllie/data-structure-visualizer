# PR Contract: [Feature Name]

> One-line summary of what this PR accomplishes.

## Changes Summary

### Files Modified

| File | Lines Changed | Change Type |
|------|---------------|-------------|
| `src/xxx.ts` | +50, -10 | Create/Modify |
| `src/__tests__/xxx.test.ts` | +100, -0 | Create |

**Total Diff Size**: ~X lines added, ~Y lines removed

---

## Verification Checklist

### Pre-Commit

- [ ] `npm run lint` — No errors
- [ ] `npm run typecheck` — No type errors
- [ ] `npm run test` — All tests pass
- [ ] `npm run build` — Build succeeds

### Full Check

- [ ] `npm run check` — All quality gates pass

### Manual Testing

- [ ] Tested in browser locally
- [ ] Tested on mobile viewport
- [ ] No console errors

---

## Spec Compliance

**Spec Reference**: `prompts/specs/[spec-name].md`

### Acceptance Criteria Status

| AC | Description | Status |
|----|-------------|--------|
| AC1 | [Description] | ✅ |
| AC2 | [Description] | ✅ |
| AC3 | [Description] | ✅ |

### Non-Goals Honored

- [x] Did NOT implement [Non-goal 1]
- [x] Did NOT implement [Non-goal 2]

---

## Risk Assessment

### Top 3 Regression Risks Considered

1. **[Risk Area]**
   - Mitigation: [What was done to prevent]
   - Verified: [How it was tested]

2. **[Risk Area]**
   - Mitigation: [What was done to prevent]
   - Verified: [How it was tested]

3. **[Risk Area]**
   - Mitigation: [What was done to prevent]
   - Verified: [How it was tested]

---

## Test Coverage

### New Tests Added

```
✓ describe('featureName')
  ✓ should handle normal case
  ✓ should handle edge case
```

### Coverage Impact

| Metric | Before | After |
|--------|--------|-------|
| Lines | X% | Y% |
| Branches | X% | Y% |

---

## Commit Log

| Commit | Description |
|--------|-------------|
| `abc1234` | feat: add initial implementation |
| `def5678` | test: add unit tests |
| `ghi9012` | fix: address edge case |

---

## Reviewer Notes

### Areas to Focus

1. [Specific area needing careful review]
2. [Design decision worth discussing]

### Known Limitations

- [Any known issues or TODOs left behind]

---

## Post-Merge Checklist

- [ ] Engineering log updated (`docs/engineering-log/`)
- [ ] README updated (if public-facing changes)
- [ ] Spec moved to `completed/` folder
