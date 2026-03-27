# CLAUDE.md — AI Assistant Guide for data-structure-visualizer

## Project Overview

An interactive data structure and algorithm visualizer built with TypeScript, Vite, and HTML5 Canvas. The app runs entirely client-side, demonstrates 21 algorithms/data structures with step-by-step animations, pseudocode highlighting, and operation counters.

**Live deployment:** GitHub Pages at `/data-structure-visualizer/`

---

## Development Commands

```bash
npm run dev            # Start dev server (Vite HMR)
npm run build          # Type-check + production build
npm run test           # Run unit tests (Vitest)
npm run test:watch     # Watch mode
npm run test:ui        # Interactive Vitest UI
npm run test:coverage  # Coverage report
npm run lint           # ESLint (zero warnings policy)
npm run lint:fix       # Auto-fix ESLint issues
npm run format         # Prettier format all files
npm run typecheck      # TypeScript type checking only
npm run check          # Full CI: typecheck + lint + test + build
npm run check:fast     # Quick: lint + test only
```

**Before committing:** Run `npm run check:fast` at minimum. The Husky pre-commit hook runs `lint-staged` (ESLint + Prettier on staged files).

---

## Repository Structure

```
src/
├── __tests__/              # 27 test files (step generation + algorithm correctness)
├── app/
│   └── index.ts            # App controller — owns app state, orchestrates all components
├── core/
│   ├── types.ts            # All TypeScript interfaces and types (single source of truth)
│   ├── registry.ts         # Singleton visualizer registry (factory pattern)
│   ├── constants.ts        # Named constants (no magic numbers)
│   ├── events.ts           # Event-driven visualization architecture
│   └── events/             # Event type definitions (array, stack, generic, experimental)
├── engine/
│   ├── step-engine.ts      # Animation playback (play/pause/step/speed via rAF)
│   └── event-engine.ts     # Alternative event-reduction engine (future use)
├── render/
│   ├── canvas.ts           # CanvasManager: HiDPI-aware, ResizeObserver
│   ├── loop.ts             # RenderLoop: requestAnimationFrame abstraction
│   └── animation.ts        # Animation playback utilities
├── ui/
│   ├── layout.ts           # Mounts and manages DOM structure
│   ├── controls.ts         # Playback controls (play/pause/step/reset/speed)
│   ├── selector.ts         # Visualizer dropdown selector
│   ├── info-panel.ts       # Pseudocode, operation counters, step description
│   ├── input-controls.ts   # Dynamic input fields per visualizer
│   ├── icons.ts            # SVG icon library
│   ├── landing.ts          # Entry landing page
│   ├── showcase-directory.ts
│   ├── style.css           # Main CSS (dark theme, CSS variables for theming)
│   └── landing-pages/      # 3 landing page design variants
├── visualizers/            # 21 algorithm implementations (see list below)
│   └── index.ts            # Imports all visualizers to trigger self-registration
└── main.ts                 # Entry point — hash-based routing
```

---

## How Routing Works

Client-side routing via `window.location.hash`:

| Hash | Page |
|------|------|
| `#` or empty | Entry/showcase page |
| `#home` | Home category picker |
| `#showcase` | Showcase directory |
| `#viz=<id>` | Load specific visualizer by ID |
| `#landing-v1/v2/v3` | Landing page design previews |

---

## Adding a New Visualizer

Every visualizer must implement the `Visualizer<T>` interface from `src/core/types.ts`:

```typescript
interface Visualizer<T> {
  readonly config: VisualizerConfig         // id, name, category, description
  getInitialState(): Snapshot<T>             // Initial data snapshot
  getSteps(action: ActionPayload<T>): Step<T>[]  // Generate all animation steps
  draw(snapshot: Snapshot<T>, ctx: CanvasRenderingContext2D): void  // Render to canvas
  getPseudocode(): string[]                  // Lines highlighted during playback
  getCode?(): CodeSnippets                   // Optional: multi-language code snippets
  getComplexity(): ComplexityInfo            // Best/average/worst/space complexity
  getInputs(): InputField[]                  // Dynamic input field definitions
  getActions(): ActionButton[]               // Action button definitions
  dispose?(): void                           // Optional cleanup
}
```

**Step to add a visualizer:**
1. Create `src/visualizers/<name>.ts`
2. Export a pure `generate<Name>Steps(...)` function (this is what tests call)
3. Implement the `Visualizer<T>` class
4. Self-register at module level: `visualizerRegistry.register('id', () => new MyVisualizer())`
5. Add the import to `src/visualizers/index.ts`
6. Add tests in `src/__tests__/<name>.test.ts`

**Step generation must be pure** — no side effects, deterministic output for same input.

---

## Available Visualizers (21)

| Category | IDs |
|----------|-----|
| Sorting | `bubble-sort`, `selection-sort`, `insertion-sort`, `merge-sort`, `quick-sort`, `heap-sort` |
| Data Structures | `stack`, `queue`, `linked-list`, `bst`, `avl-tree`, `heap`, `hash-table`, `trie`, `union-find` |
| Graph Algorithms | `dijkstra`, `a-star`, `bellman-ford`, `prim`, `kruskal`, `topological-sort` |

---

## Core Architecture Concepts

### Step-Based Animation
- Each algorithm generates an array of `Step<T>` objects upfront
- Each step holds a complete immutable `Snapshot<T>` of the data state
- The `StepEngine` plays through steps using `requestAnimationFrame`
- Steps can be seeked to directly (no event replay needed)
- `StepMeta` on each step tracks: comparison/swap/read/write counts, highlighted pseudocode line, element color

### Element Color States
```typescript
default:   '#60a5fa'  // Blue
comparing: '#fbbf24'  // Amber
swapping:  '#f87171'  // Red
sorted:    '#4ade80'  // Green
pivot:     '#a78bfa'  // Purple
active:    '#22d3ee'  // Cyan
```

### Data Flow
```
User Action → App Controller → Step Engine → emit event →
  UI components update → Canvas re-renders current step
```

### Canvas Rendering
- `CanvasManager` handles HiDPI/Retina scaling via `devicePixelRatio`
- Always account for canvas padding (`CANVAS_PADDING = 20`)
- `draw()` receives a `CanvasRenderingContext2D` already scaled for HiDPI
- Background color: `#0a0a0a`

---

## Code Conventions

### TypeScript
- **Strict mode** — no `any`, no implicit nulls, no unused variables
- Use `??` (nullish coalescing) over `||`
- Use optional chaining `?.` where applicable
- Unused function parameters may be prefixed with `_` to satisfy the linter
- No CommonJS — pure ES modules only (`verbatimModuleSyntax: true`)

### Naming
- Classes, interfaces, types: `PascalCase`
- Functions, variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Test files: `<subject>.test.ts`

### Formatting (enforced by Prettier)
- 2-space indentation
- 100-character line width
- Single quotes
- Trailing commas (ES5)
- LF line endings
- Semicolons required

### ESLint Rules (notable)
- No `console.log` (use `console.warn`/`console.error` only)
- Strict equality (`===`) always
- Curly braces mandatory on all blocks
- Zero warnings allowed (`--max-warnings 0`)

### File Organization
- One visualizer class per file
- Types centralized in `src/core/types.ts`
- Constants centralized in `src/core/constants.ts` — no magic numbers in source
- Barrel `index.ts` files for module exports

---

## Testing

**Framework:** Vitest (Jest-compatible, Vite-native, ESM-first)

**What is tested:**
- Pure step generation functions (not rendering or DOM)
- Algorithm correctness (final sorted/processed state)
- Operation counter accuracy
- Edge cases (empty input, single element, duplicates)

**What is NOT tested:**
- Canvas drawing (`draw()` methods)
- DOM interactions
- UI components

**Coverage thresholds:** 15% (MVP — focused on step generators)

**Test location:** `src/__tests__/*.test.ts`

**Pattern to follow:**
```typescript
import { generateBubbleSortSteps } from '../visualizers/bubble-sort';

describe('BubbleSort', () => {
  it('produces a sorted result', () => {
    const steps = generateBubbleSortSteps([5, 3, 1]);
    const last = steps[steps.length - 1];
    const values = last.snapshot.data.elements.map((e) => e.value);
    expect(values).toEqual([1, 3, 5]);
  });
});
```

---

## State Management

No external state management library. State lives in:
- **App controller** (`src/app/index.ts`): application-level state (current visualizer, animation state, counters, theme)
- **StepEngine**: playback state (playing, step index, speed)
- **Registry**: singleton for visualizer factory access
- **localStorage**: theme preference (`theme: 'light' | 'dark'`)
- **URL hash**: navigation state

---

## CI/CD

GitHub Actions runs on every push and PR:
1. `npm run typecheck`
2. `npm run lint` (max 0 warnings)
3. `npm run test`
4. `npm run build`

Deployment to GitHub Pages is automatic on merge to `main`.

---

## Things to Avoid

- Do not add `console.log` — use `console.warn` or `console.error`
- Do not use `any` type — use proper interfaces or generics
- Do not add magic numbers — add named constants to `src/core/constants.ts`
- Do not mutate snapshots — each step must contain an independent copy of state
- Do not make step generators stateful — they must be pure functions
- Do not add backend or network calls — fully client-side app
- Do not bypass the pre-commit hook (`--no-verify`) without fixing the underlying lint/format issue
- Do not create new abstractions/utilities unless used in at least two places
