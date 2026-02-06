# Benchmark Run Checklist

Copy this checklist for each benchmark run. Fill in as you go.

---

## Run Information

- **Date**: YYYY-MM-DD
- **Task**: [ ] A (Feature) / [ ] B (Refactor) / [ ] C (Tests) / [ ] D (Debug)
- **Operator**: [human / agent / hybrid]
- **Branch**: `benchmark/YYYY-MM-DD-task-X`

---

## Pre-Run

- [ ] Capture environment info: `npm run benchmark:env`
- [ ] Ensure clean working directory: `git status`
- [ ] Run baseline check: `npm run check`
- [ ] Create benchmark branch
- [ ] Note start time: __:__

---

## During Run

### Iteration Tracking

| # | Action Taken | Outcome | Notes |
|---|--------------|---------|-------|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

(Add rows as needed)

### Rework Events

Record any time you had to undo/redo work:

| # | Reason | Time Lost (min) |
|---|--------|-----------------|
| 1 | | |
| 2 | | |

---

## Post-Run

- [ ] Note end time: __:__
- [ ] Run final check: `npm run check`
- [ ] All tests passing: [ ] Yes / [ ] No
- [ ] Commit changes
- [ ] Open PR (if applicable)

---

## Metrics Summary

Fill these in after completing the run:

| Metric | Value |
|--------|-------|
| Total Duration | __ min |
| Agent Iterations | |
| Rework Loops | |
| Defects Found (self) | |
| Defects Found (review) | |
| Guardrails Added | |

---

## Notes

_Any observations, blockers, or lessons learned:_




---

## Next Steps

- [ ] Copy metrics to `/docs/benchmarks/runs/YYYY-MM-benchmark.md`
- [ ] Archive this checklist with the run log
- [ ] Clean up benchmark branch
