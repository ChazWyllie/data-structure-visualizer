# Benchmark Tasks

This document defines four repeatable benchmark tasks for measuring agentic workflow performance. Each task represents a common development scenario.

---

## Task A: Implement a Small Feature

**Scenario**: Add a new visualizer or extend an existing one with a minor capability.

**Example Task**: Add a "peek" operation to the Stack visualizer that highlights the top element without popping it.

**Target Files**:
- `src/visualizers/stack.ts`
- `src/__tests__/stack.test.ts`

**Acceptance Criteria**:
- [ ] Feature works as specified
- [ ] Unit tests added and passing
- [ ] No regressions in existing tests
- [ ] `npm run check` passes

**Complexity**: Low-Medium

---

## Task B: Refactor a Module

**Scenario**: Improve code structure without changing external behavior.

**Example Task**: Refactor `src/visualizers/queue.ts` to extract common array manipulation logic into a shared utility module.

**Target Files**:
- `src/visualizers/queue.ts`
- `src/core/utils.ts` (new)
- `src/__tests__/queue.test.ts` (verify no regressions)

**Acceptance Criteria**:
- [ ] All existing tests pass unchanged
- [ ] Code is more modular/reusable
- [ ] No new linting warnings
- [ ] `npm run check` passes

**Complexity**: Medium

---

## Task C: Add Tests to an Untested Area

**Scenario**: Improve test coverage for a module with gaps.

**Example Task**: Add comprehensive tests for `src/engine/event-engine.ts` covering edge cases like empty event arrays, cache boundary conditions, and rapid seek operations.

**Target Files**:
- `src/__tests__/event-engine.test.ts` (new)
- `src/engine/event-engine.ts` (reference only)

**Acceptance Criteria**:
- [ ] New test file created with meaningful tests
- [ ] Edge cases covered (empty state, boundaries, error conditions)
- [ ] Coverage increases for target module
- [ ] `npm run check` passes

**Complexity**: Medium

---

## Task D: Debug a Failing Test

**Scenario**: Diagnose and fix a test that was intentionally broken or discovered failing.

**Example Task**: A test in `src/__tests__/bubble-sort.test.ts` is failing due to an off-by-one error in step counting. Find and fix the root cause.

**Setup**: Before running this benchmark, introduce a deliberate bug:
```typescript
// In bubble-sort.ts, change a loop boundary or comparison
```

**Target Files**:
- `src/__tests__/bubble-sort.test.ts`
- `src/visualizers/bubble-sort.ts`

**Acceptance Criteria**:
- [ ] Root cause identified and documented
- [ ] Fix applied with minimal code change
- [ ] All tests pass
- [ ] `npm run check` passes

**Complexity**: Low-Medium

---

## Usage

1. Select a task (A, B, C, or D) for the benchmark run
2. Copy the run checklist from `run-checklist.md`
3. Start timer when beginning the task
4. Record metrics during and after the run
5. Log results in `/docs/benchmarks/runs/`

See `/docs/benchmarks/README.md` for full metrics collection process.
