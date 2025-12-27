# Benchmark Metrics

This directory tracks agentic workflow performance over time through repeatable benchmark runs.

---

## Purpose

Measure and improve the efficiency of AI-assisted development by tracking key metrics across standardized tasks.

## Metrics Captured

| Metric | Description |
|--------|-------------|
| **Time to First PR** | Duration from task start to opening a PR (manual entry) |
| **Agent Iterations** | Number of agent tool calls or conversation turns |
| **Rework Loops** | Times work was undone and redone |
| **Defects Found (Self)** | Bugs caught before PR submission |
| **Defects Found (Review)** | Bugs caught during code review |
| **Guardrails Added** | New checks, tests, or validations added |

---

## Benchmark Tasks

Four standardized tasks defined in `/tools/benchmarks/benchmark-tasks.md`:

| Task | Type | Complexity |
|------|------|------------|
| A | Implement a small feature | Low-Medium |
| B | Refactor a module | Medium |
| C | Add tests to untested area | Medium |
| D | Debug a failing test | Low-Medium |

---

## How to Run a Benchmark

### 1. Prepare

```bash
# Capture environment info
npm run benchmark:env

# Ensure clean state
git status
npm run check
```

### 2. Execute

1. Copy the checklist from `/tools/benchmarks/run-checklist.md`
2. Select a task (A, B, C, or D)
3. Create a branch: `git checkout -b benchmark/YYYY-MM-DD-task-X`
4. Start timer and begin work
5. Track iterations and rework as you go

### 3. Record

1. Create a new run log: `docs/benchmarks/runs/YYYY-MM-benchmark.md`
2. Copy metrics from your checklist
3. Commit the log

---

## Monthly Review Process

Run benchmarks monthly to track improvement:

1. **Week 1**: Run Task A or B (feature/refactor focus)
2. **Week 3**: Run Task C or D (testing/debugging focus)
3. **End of Month**: Review trends, identify bottlenecks

### Trend Analysis

Compare month-over-month:
- Are iterations decreasing?
- Is rework reducing?
- Are defects shifting left (caught earlier)?

---

## Directory Structure

```
docs/benchmarks/
  README.md          # This file
  TEMPLATE.md        # Run log template
  runs/              # Individual benchmark run logs
    2025-01-benchmark.md
    2025-02-benchmark.md
    ...
```

---

## Tips for Better Benchmarks

1. **Be consistent** - Use the same task definition each time
2. **Be honest** - Record actual iterations, not ideal
3. **Capture context** - Note any unusual conditions
4. **Review trends** - Single runs are noisy; patterns matter
