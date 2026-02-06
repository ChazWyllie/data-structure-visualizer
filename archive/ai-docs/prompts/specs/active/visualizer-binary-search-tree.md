# Feature Specification: Binary Search Tree Visualizer

> Interactive BST visualization with insert, search, and traversal operations.

## Overview

**Goal**: Add a Binary Search Tree visualizer that shows node insertion, searching, and tree traversals with step-by-step animation highlighting the current node and path taken.

**Motivation**: BST is a fundamental data structure commonly asked in interviews. Tree rendering also establishes patterns for future visualizers (heaps, graphs).

---

## Acceptance Criteria

### Must Have

- [ ] **AC1**: Insert operation — animates path from root to insertion point, highlights comparisons
- [ ] **AC2**: Search operation — animates traversal path, shows found/not-found result
- [ ] **AC3**: Inorder traversal — visits nodes in sorted order with step highlighting
- [ ] **AC4**: Tree rendering — nodes positioned with proper parent-child layout, edges visible
- [ ] **AC5**: Pseudocode highlighting — shows current line for each operation
- [ ] **AC6**: Counter tracking — comparisons count for insert/search operations

### Should Have

- [ ] **AC7**: Preorder and Postorder traversals
- [ ] **AC8**: Input control for custom value insertion
- [ ] **AC9**: Visual indication of BST property (left < parent < right)

### Verification

- [ ] All tests pass (`npm run check`)
- [ ] Manual testing completed
- [ ] No console errors in browser

---

## Non-Goals (Explicit)

What this feature will NOT do:

1. **Delete operation** — Complex (3 cases), defer to V2.1
2. **Self-balancing (AVL/Red-Black)** — Out of scope, standard BST only
3. **Multiple trees / comparison view** — Single tree only
4. **Persistence / save tree state** — Reset on visualizer switch

---

## Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `src/visualizers/binary-search-tree.ts` | Create | BST visualizer implementation |
| `src/__tests__/binary-search-tree.test.ts` | Create | Unit tests for step generation |
| `src/visualizers/index.ts` | Modify | Export BST visualizer |
| `src/core/types.ts` | Modify | Add BST-specific types (if needed) |

---

## Technical Approach

### Step 1: Define BST Data Types

```typescript
interface BSTNode {
  value: number;
  left: BSTNode | null;
  right: BSTNode | null;
  x?: number;  // computed position
  y?: number;
}

interface BSTData {
  root: BSTNode | null;
  highlightPath: number[];  // values of nodes in current path
  currentNode: number | null;
  foundNode: number | null;
  visitedNodes: number[];   // for traversals
}
```

### Step 2: Tree Layout Algorithm

Use a simple recursive layout:
- Root at top center
- Each level spaced vertically by fixed amount
- Horizontal spread decreases by half at each level
- Track positions during tree construction

### Step 3: Step Generators

- `generateInsertSteps(root, value)` — steps for insertion
- `generateSearchSteps(root, value)` — steps for searching
- `generateTraversalSteps(root, type)` — inorder/preorder/postorder

### Step 4: Rendering

- Draw edges first (lines from parent to child)
- Draw nodes as circles with values
- Highlight current node, path, and visited nodes with colors

---

## Risks

### Top 3 Plausible Regressions

1. **Canvas rendering performance** — Deep trees with many nodes could slow rendering
   - Mitigation: Limit tree depth to ~6 levels (63 nodes max)
   
2. **Layout overlap** — Wide trees may have overlapping nodes
   - Mitigation: Dynamic horizontal spacing based on subtree width
   
3. **Type conflicts** — New BSTData type might conflict with generic Step<T>
   - Mitigation: Follow existing patterns from linked-list visualizer

---

## Testing Strategy

### Unit Tests

```typescript
describe('generateInsertSteps', () => {
  it('should insert into empty tree', () => {});
  it('should insert left when value is smaller', () => {});
  it('should insert right when value is larger', () => {});
  it('should track comparison count', () => {});
});

describe('generateSearchSteps', () => {
  it('should find existing value', () => {});
  it('should handle value not found', () => {});
});

describe('generateInorderSteps', () => {
  it('should visit nodes in sorted order', () => {});
});
```

### Manual Testing

1. Insert values 50, 30, 70, 20, 40, 60, 80 — verify balanced tree
2. Search for existing value — verify path highlighting
3. Search for non-existent value — verify "not found" indication
4. Run inorder traversal — verify sorted order visit

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Tests written and passing
- [ ] `npm run check` passes
- [ ] Tree renders correctly with proper layout
- [ ] All three operations (insert, search, inorder) working
