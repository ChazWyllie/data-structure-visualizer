# Data Structure Visualizer

[![Deploy to GitHub Pages](https://github.com/ChazWyllie/data-structure-visualizer/actions/workflows/deploy.yml/badge.svg)](https://github.com/ChazWyllie/data-structure-visualizer/actions/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF.svg)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An interactive, portfolio-quality data structure and algorithm visualizer built with TypeScript, Vite, and HTML5 Canvas. Watch sorting algorithms work step-by-step, manipulate stacks and queues, and understand how linked lists operate—all with beautiful animations and detailed pseudocode highlighting.

**[Live Demo](https://chazwyllie.github.io/data-structure-visualizer/)**

![Data Structure Visualizer Screenshot](./docs/screenshot.png)
<!-- TODO: Add actual screenshot -->

---

## Features

- **Step-by-Step Visualization** — Watch algorithms execute one step at a time with play/pause controls
- **Pseudocode Highlighting** — See exactly which line of code is executing at each step
- **Operation Counters** — Track comparisons, swaps, reads, and writes in real-time
- **Complexity Display** — View Big-O time and space complexity for each algorithm
- **Input Controls** — Customize array sizes, values to push/pop, and more
- **Dark Theme** — Beautiful, portfolio-ready dark UI with smooth animations
- **Responsive Design** — Works on desktop and mobile with collapsible panels

### Available Visualizers

| Category | Visualizer | Description |
|----------|------------|-------------|
| Sorting | **Bubble Sort** | Classic O(n²) comparison sort with swap visualization |
| Data Structures | **Stack** | LIFO with push/pop operations and overflow detection |
| Data Structures | **Queue** | FIFO with enqueue/dequeue operations |
| Data Structures | **Linked List** | Singly linked list with insert/delete-by-value |
| Demo | **Array Demo** | Simple array traversal for testing |

---

## Architecture

The visualizer is built with a clean, modular architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                        App Controller                        │
│                   (Orchestrates everything)                  │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Step Engine   │  │   Visualizers   │  │    Renderers    │
│  (Playback)     │  │  (Step Logic)   │  │   (Canvas UI)   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Core Components

- **Step Engine** (`src/engine/step-engine.ts`)  
  Manages animation playback with `requestAnimationFrame`. Handles play, pause, step-forward, step-back, reset, and speed control. Emits events for state changes.

- **Visualizers** (`src/visualizers/`)  
  Each visualizer implements the `Visualizer<T>` interface:
  - `getInitialState()` — Returns starting data snapshot
  - `getSteps(action)` — Generates deterministic step array
  - `draw(snapshot, ctx)` — Renders current state to canvas
  - `getPseudocode()` — Returns algorithm pseudocode lines
  - `getComplexity()` — Returns Big-O complexity info

- **Renderers** (`src/render/`)  
  - `CanvasManager` — HiDPI-aware canvas with ResizeObserver
  - `RenderLoop` — requestAnimationFrame loop abstraction

- **UI Components** (`src/ui/`)  
  - `PlaybackControls` — Play/pause, step, reset buttons
  - `InfoPanel` — Pseudocode, counters, step description
  - `InputControls` — Dynamic inputs per visualizer
  - `VisualizerSelector` — Dropdown to switch visualizers

### Type System

All types are in `src/core/types.ts`:
- `Step<T>` — Single animation step with snapshot and metadata
- `StepMeta` — Counters, highlighted pseudocode line
- `Visualizer<T>` — Main visualizer interface
- `EngineState` / `EngineEvent` — Step engine types

---

## Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/ChazWyllie/data-structure-visualizer.git
cd data-structure-visualizer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000/data-structure-visualizer/](http://localhost:3000/data-structure-visualizer/) in your browser.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run unit tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Check for ESLint errors |
| `npm run lint:fix` | Auto-fix ESLint errors |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | TypeScript type checking |

---

## Testing

Tests are written with Vitest and focus on step generation logic:

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Interactive UI
npm run test:ui
```

Test files are in `src/__tests__/`:
- `bubble-sort.test.ts` — Sorting correctness, counter tracking
- `stack.test.ts` — Push/pop operations, overflow/underflow
- `linked-list.test.ts` — Insert/delete-by-value correctness

---

## Agent Workflow

This project supports AI-assisted development with structured workflows.

### Workflow Overview

```
Spec → Diff → Test → Review
```

1. **Spec** — Write a feature spec before implementation (`prompts/templates/feature-spec.md`)
2. **Diff** — Make small, focused changes (< 100 lines per file)
3. **Test** — Run `npm run check` after every change
4. **Review** — Fill out PR contract with verification checklist

### Key Files

| File | Purpose |
|------|---------|
| `prompts/PLAYBOOK.md` | Core rules for AI-assisted development |
| `prompts/templates/feature-spec.md` | Feature specification template |
| `prompts/templates/pr-contract.md` | PR description template |
| `prompts/specs/` | Active and completed specifications |
| `docs/engineering-log/` | Decision logs and session notes |

### Rules of Engagement

- **Small diffs**: Touch only files explicitly listed in the spec
- **List before edit**: Always read files before modifying
- **Test always**: Run `npm run check` before and after changes
- **Document risks**: Identify top 3 plausible regressions for each change

---

## Quality Gates

The project enforces code quality at multiple levels to prevent low-quality output.

### Pre-commit Hooks

Husky + lint-staged automatically run on every commit:

- ESLint `--fix` on staged `.ts`/`.tsx` files
- Prettier `--write` on staged files

**First-time setup** (runs automatically after `npm install`):

```bash
npm run prepare  # Sets up husky hooks
```

### CI Checks

GitHub Actions runs on every push to `main` and all pull requests:

| Step | What It Catches |
|------|-----------------|
| `typecheck` | Type errors, missing imports |
| `lint` | Code quality issues, unused vars |
| `test` | Broken functionality, regressions |
| `build` | Bundle errors, build-time issues |

PRs cannot be merged if CI fails.

### Local Verification

```bash
# Full check (same as CI)
npm run check

# Fast check (lint + test only)
npm run check:fast
```

### Bypassing Hooks (Emergency Only)

```bash
# Skip pre-commit hooks (use sparingly)
git commit --no-verify -m "emergency fix"

# Remember to run checks manually after:
npm run check
```

---

## Benchmarking

Track agentic workflow performance with repeatable benchmark tasks.

### Quick Start

```bash
# Capture environment info before a benchmark run
npm run benchmark:env

# Example output:
# Environment Snapshot
# --------------------
# Timestamp:  2025-01-15 10:30:00
# Node:       v20.10.0
# npm:        10.2.3
# Git Commit: a1b2c3d
# Git Branch: main
# Git Status: clean
```

### Benchmark Tasks

Four standardized tasks in `/tools/benchmarks/benchmark-tasks.md`:

| Task | Type | Description |
|------|------|-------------|
| A | Feature | Implement a small feature (e.g., stack peek) |
| B | Refactor | Refactor a module without changing behavior |
| C | Testing | Add tests to an untested area |
| D | Debug | Diagnose and fix a failing test |

### Monthly Usage

1. **Run 1-2 benchmarks per month** (alternate task types)
2. **Copy the checklist** from `/tools/benchmarks/run-checklist.md`
3. **Track metrics** during the run:
   - Time to first PR
   - Agent iterations
   - Rework loops
   - Defects found (self vs review)
   - Guardrails added
4. **Log results** in `/docs/benchmarks/runs/YYYY-MM-benchmark.md`
5. **Compare trends** month-over-month

### Key Files

| Path | Purpose |
|------|---------|
| `/tools/benchmarks/benchmark-tasks.md` | Task definitions |
| `/tools/benchmarks/run-checklist.md` | Per-run checklist |
| `/tools/capture-env.js` | Environment capture script |
| `/docs/benchmarks/README.md` | Metrics guide |
| `/docs/benchmarks/TEMPLATE.md` | Run log template |

See `/docs/benchmarks/README.md` for full details.

---

## Deployment

### GitHub Pages

The project is configured for GitHub Pages deployment:

1. The `base` path in `vite.config.ts` is set to `/data-structure-visualizer/`
2. GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys on push to `main`

To deploy to your own fork:
1. Enable GitHub Pages in repository settings (Source: GitHub Actions)
2. Push to `main` branch
3. Access at `https://<username>.github.io/data-structure-visualizer/`

### Custom Domain

To use a custom domain:
1. Update `base` in `vite.config.ts` to `'/'`
2. Add your domain to the `cname` option in the workflow or add a `CNAME` file to `public/`

---

## Roadmap (V2)

### Implemented Visualizers

- [x] **Binary Search Tree (BST)** — Insert, search, inorder traversal with tree visualization
- [x] **Bubble Sort** — Classic O(n²) comparison sort with swap visualization
- [x] **Selection Sort** — O(n²) find-minimum-and-swap algorithm
- [x] **Insertion Sort** — O(n²) build-sorted-portion algorithm
- [x] **Merge Sort** — O(n log n) divide and conquer with auxiliary array
- [x] **Quick Sort** — O(n log n) partition-based sorting with pivot selection
- [x] **Heap Sort** — O(n log n) heap-based extraction algorithm
- [x] **Stack** — LIFO with push/pop operations and overflow detection
- [x] **Queue** — FIFO with enqueue/dequeue operations
- [x] **Linked List** — Singly linked list with insert/delete-by-value

### Planned Visualizers

- [ ] **Graph BFS** — Breadth-first search with queue visualization
- [ ] **Graph DFS** — Depth-first search with stack/recursion visualization
- [ ] **Dijkstra's Algorithm** — Shortest path with priority queue

### Implemented Features

- [x] **Dark/Light Theme** — Toggle between modes with localStorage persistence

### Planned Features

- [ ] **Performance Comparisons** — Side-by-side algorithm comparison
- [ ] **Custom Input** — Enter your own arrays/values
- [ ] **Share Links** — URL-encoded state for sharing
- [ ] **Export Steps** — Download step-by-step walkthrough as PDF
- [ ] **Accessibility** — ARIA labels, keyboard navigation, screen reader support
- [ ] **Internationalization** — Multi-language support

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Adding a New Visualizer

1. Create `src/visualizers/my-algorithm.ts`
2. Implement the `Visualizer<T>` interface
3. Export step generation functions (pure functions for testability)
4. Register with `registry.register()` (self-registration pattern)
5. Add tests in `src/__tests__/my-algorithm.test.ts`
6. Import in `src/visualizers/index.ts`

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Acknowledgments

- Inspired by [VisuAlgo](https://visualgo.net/) and [Algorithm Visualizer](https://algorithm-visualizer.org/)
- Built with [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/), and [Vitest](https://vitest.dev/)

---

<p align="center">
  Made by <a href="https://github.com/ChazWyllie">ChazWyllie</a>
</p>
