/**
 * Binary Search Tree Visualizer
 * Demonstrates BST operations with tree node visualization
 */

import type {
  Visualizer,
  VisualizerConfig,
  Snapshot,
  Step,
  ActionPayload,
  ComplexityInfo,
  InputField,
  ActionButton,
} from '../core/types';
import { createStepMeta } from '../core/types';
import { registry } from '../core/registry';
import { CANVAS_PADDING } from '../core/constants';

// =============================================================================
// Types
// =============================================================================

export interface BSTNode {
  value: number;
  left: BSTNode | null;
  right: BSTNode | null;
}

type NodeState = 'default' | 'current' | 'found' | 'visited' | 'inserting' | 'path';

interface RenderNode {
  value: number;
  x: number;
  y: number;
  state: NodeState;
  left: RenderNode | null;
  right: RenderNode | null;
}

interface BSTData {
  root: RenderNode | null;
  message?: string;
}

// =============================================================================
// Constants
// =============================================================================

const NODE_RADIUS = 22;
const LEVEL_HEIGHT = 60;
const MIN_NODE_SPACING = 50;

const STATE_COLORS: Record<NodeState, string> = {
  default: '#60a5fa',
  current: '#fbbf24',
  found: '#4ade80',
  visited: '#a78bfa',
  inserting: '#22d3ee',
  path: '#f97316',
};

// =============================================================================
// Tree Utilities
// =============================================================================

function cloneBST(node: BSTNode | null): BSTNode | null {
  if (!node) {
    return null;
  }
  return {
    value: node.value,
    left: cloneBST(node.left),
    right: cloneBST(node.right),
  };
}

function insertIntoBST(root: BSTNode | null, value: number): BSTNode {
  if (!root) {
    return { value, left: null, right: null };
  }
  if (value < root.value) {
    root.left = insertIntoBST(root.left, value);
  } else if (value > root.value) {
    root.right = insertIntoBST(root.right, value);
  }
  // Duplicate values are ignored
  return root;
}

function getTreeDepth(node: BSTNode | null): number {
  if (!node) {
    return 0;
  }
  return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right));
}

// =============================================================================
// Layout Calculation
// =============================================================================

function calculatePositions(
  node: BSTNode | null,
  x: number,
  y: number,
  horizontalSpread: number,
  stateMap: Map<number, NodeState>
): RenderNode | null {
  if (!node) {
    return null;
  }

  const state = stateMap.get(node.value) ?? 'default';

  return {
    value: node.value,
    x,
    y,
    state,
    left: calculatePositions(
      node.left,
      x - horizontalSpread,
      y + LEVEL_HEIGHT,
      horizontalSpread / 2,
      stateMap
    ),
    right: calculatePositions(
      node.right,
      x + horizontalSpread,
      y + LEVEL_HEIGHT,
      horizontalSpread / 2,
      stateMap
    ),
  };
}

function bstToRenderTree(
  root: BSTNode | null,
  canvasWidth: number,
  stateMap: Map<number, NodeState> = new Map()
): RenderNode | null {
  if (!root) {
    return null;
  }

  const depth = getTreeDepth(root);
  const initialSpread = Math.min(
    (canvasWidth - CANVAS_PADDING * 2) / 4,
    MIN_NODE_SPACING * Math.pow(2, depth - 1)
  );

  return calculatePositions(
    root,
    canvasWidth / 2,
    CANVAS_PADDING + NODE_RADIUS + 20,
    initialSpread,
    stateMap
  );
}

// =============================================================================
// Step Generation
// =============================================================================

export function generateInsertSteps(
  root: BSTNode | null,
  value: number,
  canvasWidth: number
): Step<BSTData>[] {
  const steps: Step<BSTData>[] = [];
  let stepId = 0;
  let comparisons = 0;

  // Initial state
  const stateMap = new Map<number, NodeState>();
  steps.push({
    id: stepId++,
    description: `Inserting value ${value} into BST`,
    snapshot: { data: { root: bstToRenderTree(root, canvasWidth, stateMap) } },
    meta: createStepMeta({ comparisons, highlightedLine: 1 }),
  });

  if (!root) {
    // Empty tree
    const newRoot: BSTNode = { value, left: null, right: null };
    const insertMap = new Map<number, NodeState>([[value, 'inserting']]);
    steps.push({
      id: stepId++,
      description: `Tree is empty. Creating root node with value ${value}`,
      snapshot: { data: { root: bstToRenderTree(newRoot, canvasWidth, insertMap) } },
      meta: createStepMeta({ comparisons, highlightedLine: 2 }),
    });

    const finalMap = new Map<number, NodeState>([[value, 'found']]);
    steps.push({
      id: stepId++,
      description: `Successfully inserted ${value} as root`,
      snapshot: { data: { root: bstToRenderTree(newRoot, canvasWidth, finalMap) } },
      meta: createStepMeta({ comparisons, highlightedLine: 3 }),
    });

    return steps;
  }

  // Traverse to find insertion point
  let current: BSTNode | null = root;
  const path: number[] = [];

  while (current) {
    comparisons++;
    path.push(current.value);

    const pathMap = new Map<number, NodeState>();
    path.forEach((v, i) => pathMap.set(v, i === path.length - 1 ? 'current' : 'path'));

    if (value === current.value) {
      // Duplicate found
      pathMap.set(current.value, 'found');
      steps.push({
        id: stepId++,
        description: `Value ${value} already exists in tree. Skipping insertion.`,
        snapshot: { data: { root: bstToRenderTree(root, canvasWidth, pathMap) } },
        meta: createStepMeta({ comparisons, highlightedLine: 4 }),
      });
      return steps;
    }

    if (value < current.value) {
      steps.push({
        id: stepId++,
        description: `${value} < ${current.value}, go left`,
        snapshot: { data: { root: bstToRenderTree(root, canvasWidth, pathMap) } },
        meta: createStepMeta({ comparisons, highlightedLine: 5 }),
      });

      if (!current.left) {
        // Insert here
        const newRoot = cloneBST(root)!;
        insertIntoBST(newRoot, value);

        const insertMap = new Map<number, NodeState>();
        path.forEach((v) => insertMap.set(v, 'path'));
        insertMap.set(value, 'inserting');

        steps.push({
          id: stepId++,
          description: `Found empty left slot. Inserting ${value}`,
          snapshot: { data: { root: bstToRenderTree(newRoot, canvasWidth, insertMap) } },
          meta: createStepMeta({ comparisons, highlightedLine: 6 }),
        });

        const finalMap = new Map<number, NodeState>([[value, 'found']]);
        steps.push({
          id: stepId++,
          description: `Successfully inserted ${value}`,
          snapshot: { data: { root: bstToRenderTree(newRoot, canvasWidth, finalMap) } },
          meta: createStepMeta({ comparisons, highlightedLine: 7 }),
        });

        return steps;
      }
      current = current.left;
    } else {
      steps.push({
        id: stepId++,
        description: `${value} > ${current.value}, go right`,
        snapshot: { data: { root: bstToRenderTree(root, canvasWidth, pathMap) } },
        meta: createStepMeta({ comparisons, highlightedLine: 5 }),
      });

      if (!current.right) {
        // Insert here
        const newRoot = cloneBST(root)!;
        insertIntoBST(newRoot, value);

        const insertMap = new Map<number, NodeState>();
        path.forEach((v) => insertMap.set(v, 'path'));
        insertMap.set(value, 'inserting');

        steps.push({
          id: stepId++,
          description: `Found empty right slot. Inserting ${value}`,
          snapshot: { data: { root: bstToRenderTree(newRoot, canvasWidth, insertMap) } },
          meta: createStepMeta({ comparisons, highlightedLine: 6 }),
        });

        const finalMap = new Map<number, NodeState>([[value, 'found']]);
        steps.push({
          id: stepId++,
          description: `Successfully inserted ${value}`,
          snapshot: { data: { root: bstToRenderTree(newRoot, canvasWidth, finalMap) } },
          meta: createStepMeta({ comparisons, highlightedLine: 7 }),
        });

        return steps;
      }
      current = current.right;
    }
  }

  return steps;
}

export function generateSearchSteps(
  root: BSTNode | null,
  value: number,
  canvasWidth: number
): Step<BSTData>[] {
  const steps: Step<BSTData>[] = [];
  let stepId = 0;
  let comparisons = 0;

  const stateMap = new Map<number, NodeState>();
  steps.push({
    id: stepId++,
    description: `Searching for value ${value}`,
    snapshot: { data: { root: bstToRenderTree(root, canvasWidth, stateMap) } },
    meta: createStepMeta({ comparisons, highlightedLine: 1 }),
  });

  if (!root) {
    steps.push({
      id: stepId++,
      description: `Tree is empty. Value ${value} not found.`,
      snapshot: { data: { root: null, message: 'Not found' } },
      meta: createStepMeta({ comparisons, highlightedLine: 2 }),
    });
    return steps;
  }

  let current: BSTNode | null = root;
  const path: number[] = [];

  while (current) {
    comparisons++;
    path.push(current.value);

    const pathMap = new Map<number, NodeState>();
    path.forEach((v, i) => pathMap.set(v, i === path.length - 1 ? 'current' : 'path'));

    if (value === current.value) {
      pathMap.set(current.value, 'found');
      steps.push({
        id: stepId++,
        description: `Found ${value}!`,
        snapshot: {
          data: { root: bstToRenderTree(root, canvasWidth, pathMap), message: 'Found!' },
        },
        meta: createStepMeta({ comparisons, highlightedLine: 3 }),
      });
      return steps;
    }

    if (value < current.value) {
      steps.push({
        id: stepId++,
        description: `${value} < ${current.value}, go left`,
        snapshot: { data: { root: bstToRenderTree(root, canvasWidth, pathMap) } },
        meta: createStepMeta({ comparisons, highlightedLine: 4 }),
      });

      if (!current.left) {
        const notFoundMap = new Map<number, NodeState>();
        path.forEach((v) => notFoundMap.set(v, 'path'));
        steps.push({
          id: stepId++,
          description: `No left child. Value ${value} not found.`,
          snapshot: {
            data: { root: bstToRenderTree(root, canvasWidth, notFoundMap), message: 'Not found' },
          },
          meta: createStepMeta({ comparisons, highlightedLine: 5 }),
        });
        return steps;
      }
      current = current.left;
    } else {
      steps.push({
        id: stepId++,
        description: `${value} > ${current.value}, go right`,
        snapshot: { data: { root: bstToRenderTree(root, canvasWidth, pathMap) } },
        meta: createStepMeta({ comparisons, highlightedLine: 4 }),
      });

      if (!current.right) {
        const notFoundMap = new Map<number, NodeState>();
        path.forEach((v) => notFoundMap.set(v, 'path'));
        steps.push({
          id: stepId++,
          description: `No right child. Value ${value} not found.`,
          snapshot: {
            data: { root: bstToRenderTree(root, canvasWidth, notFoundMap), message: 'Not found' },
          },
          meta: createStepMeta({ comparisons, highlightedLine: 5 }),
        });
        return steps;
      }
      current = current.right;
    }
  }

  return steps;
}

export function generateInorderSteps(root: BSTNode | null, canvasWidth: number): Step<BSTData>[] {
  const steps: Step<BSTData>[] = [];
  let stepId = 0;
  const visited: number[] = [];

  steps.push({
    id: stepId++,
    description: 'Starting inorder traversal (Left → Root → Right)',
    snapshot: { data: { root: bstToRenderTree(root, canvasWidth) } },
    meta: createStepMeta({ highlightedLine: 1 }),
  });

  if (!root) {
    steps.push({
      id: stepId++,
      description: 'Tree is empty. Nothing to traverse.',
      snapshot: { data: { root: null } },
      meta: createStepMeta({ highlightedLine: 2 }),
    });
    return steps;
  }

  function inorder(node: BSTNode | null): void {
    if (!node) {
      return;
    }

    // Visit left
    inorder(node.left);

    // Process current node
    visited.push(node.value);
    const stateMap = new Map<number, NodeState>();
    visited.forEach((v, i) => stateMap.set(v, i === visited.length - 1 ? 'current' : 'visited'));

    steps.push({
      id: stepId++,
      description: `Visit node ${node.value}. Inorder so far: [${visited.join(', ')}]`,
      snapshot: { data: { root: bstToRenderTree(root, canvasWidth, stateMap) } },
      meta: createStepMeta({ reads: visited.length, highlightedLine: 3 }),
    });

    // Visit right
    inorder(node.right);
  }

  inorder(root);

  // Final state
  const finalMap = new Map<number, NodeState>();
  visited.forEach((v) => finalMap.set(v, 'visited'));
  steps.push({
    id: stepId++,
    description: `Inorder traversal complete: [${visited.join(', ')}]`,
    snapshot: { data: { root: bstToRenderTree(root, canvasWidth, finalMap) } },
    meta: createStepMeta({ reads: visited.length, highlightedLine: 4 }),
  });

  return steps;
}

// =============================================================================
// Rendering
// =============================================================================

function drawNode(ctx: CanvasRenderingContext2D, node: RenderNode): void {
  const { x, y, value, state } = node;

  // Draw node circle
  ctx.beginPath();
  ctx.arc(x, y, NODE_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = STATE_COLORS[state];
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw value text
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 14px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(value), x, y);
}

function drawEdge(
  ctx: CanvasRenderingContext2D,
  parentX: number,
  parentY: number,
  childX: number,
  childY: number
): void {
  ctx.beginPath();
  ctx.moveTo(parentX, parentY + NODE_RADIUS);
  ctx.lineTo(childX, childY - NODE_RADIUS);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawTree(ctx: CanvasRenderingContext2D, node: RenderNode | null): void {
  if (!node) {
    return;
  }

  // Draw edges first (so they're behind nodes)
  if (node.left) {
    drawEdge(ctx, node.x, node.y, node.left.x, node.left.y);
    drawTree(ctx, node.left);
  }
  if (node.right) {
    drawEdge(ctx, node.x, node.y, node.right.x, node.right.y);
    drawTree(ctx, node.right);
  }

  // Draw node
  drawNode(ctx, node);
}

function drawBST(
  data: BSTData,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  if (!data.root) {
    // Draw empty tree message
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Empty tree. Insert a value to begin.', width / 2, height / 2);
    return;
  }

  drawTree(ctx, data.root);

  // Draw message if present
  if (data.message) {
    ctx.fillStyle = data.message === 'Found!' ? '#4ade80' : '#f87171';
    ctx.font = 'bold 18px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(data.message, width / 2, height - CANVAS_PADDING);
  }
}

// =============================================================================
// Visualizer Class
// =============================================================================

class BinarySearchTreeVisualizer implements Visualizer<BSTData> {
  readonly config: VisualizerConfig = {
    id: 'binary-search-tree',
    name: 'Binary Search Tree',
    category: 'tree',
    description: 'A tree data structure with left < parent < right property',
    defaultSpeed: 600,
  };

  private currentTree: BSTNode | null = null;
  private canvasWidth = 800;

  getInitialState(): Snapshot<BSTData> {
    // Start with a sample tree
    const values = [50, 30, 70, 20, 40, 60, 80];
    this.currentTree = null;
    for (const v of values) {
      this.currentTree = insertIntoBST(this.currentTree, v);
    }

    return {
      data: {
        root: bstToRenderTree(this.currentTree, this.canvasWidth),
      },
    };
  }

  getSteps(actionPayload: ActionPayload<BSTData>): Step<BSTData>[] {
    const { type, params } = actionPayload;
    const value = params?.value as number | undefined;

    switch (type) {
      case 'insert':
        if (value !== undefined) {
          const steps = generateInsertSteps(this.currentTree, value, this.canvasWidth);
          // Update current tree after insert
          this.currentTree = insertIntoBST(cloneBST(this.currentTree), value);
          return steps;
        }
        break;

      case 'search':
        if (value !== undefined) {
          return generateSearchSteps(this.currentTree, value, this.canvasWidth);
        }
        break;

      case 'inorder':
        return generateInorderSteps(this.currentTree, this.canvasWidth);

      case 'clear':
        this.currentTree = null;
        return [
          {
            id: 0,
            description: 'Tree cleared',
            snapshot: { data: { root: null } },
            meta: createStepMeta({ highlightedLine: 1 }),
          },
        ];
    }

    return [
      {
        id: 0,
        description: 'Binary Search Tree ready',
        snapshot: { data: { root: bstToRenderTree(this.currentTree, this.canvasWidth) } },
        meta: createStepMeta(),
      },
    ];
  }

  draw(snapshot: Snapshot<BSTData>, ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    this.canvasWidth = width;
    drawBST(snapshot.data, ctx, width, height);
  }

  getPseudocode(): string[] {
    return [
      'function insert(value):',
      '  if root == null: root = new Node(value)',
      '  current = root',
      '  if value == current: return (duplicate)',
      '  if value < current: go left',
      '  else: go right',
      '  insert node at empty slot',
    ];
  }

  getComplexity(): ComplexityInfo {
    return {
      time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' },
      space: 'O(n)',
    };
  }

  getInputs(): InputField[] {
    return [
      {
        id: 'value',
        label: 'Value',
        type: 'number',
        defaultValue: '',
        min: 1,
        max: 999,
        placeholder: 'Enter value',
      },
    ];
  }

  getActions(): ActionButton[] {
    return [
      { id: 'insert', label: 'Insert', primary: true },
      { id: 'search', label: 'Search', primary: false },
      { id: 'inorder', label: 'Inorder', primary: false },
      { id: 'clear', label: 'Clear', primary: false },
    ];
  }
}

// =============================================================================
// Registration
// =============================================================================

registry.register<BSTData>(
  {
    id: 'binary-search-tree',
    name: 'Binary Search Tree',
    category: 'tree',
    description: 'A tree data structure with left < parent < right property',
    defaultSpeed: 600,
  },
  () => new BinarySearchTreeVisualizer()
);

export { BinarySearchTreeVisualizer };
