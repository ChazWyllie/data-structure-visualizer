/**
 * AVL Tree Visualizer
 * Self-balancing Binary Search Tree with guaranteed O(log n) operations
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

type NodeState =
  | 'default'
  | 'current'
  | 'comparing'
  | 'rotatingLeft'
  | 'rotatingRight'
  | 'balanced'
  | 'inserted'
  | 'found'
  | 'notFound';

interface AVLNodeData {
  id: string;
  value: number;
  height: number;
  balanceFactor: number;
  left: AVLNodeData | null;
  right: AVLNodeData | null;
  state: NodeState;
  // Layout positions (computed during draw)
  x?: number;
  y?: number;
}

interface AVLData {
  root: AVLNodeData | null;
  values: number[]; // All values in the tree (in-order)
  lastRotation?: string;
}

// =============================================================================
// Node State Colors
// =============================================================================

const NODE_STATE_COLORS: Record<NodeState, string> = {
  default: '#374151',
  current: '#f59e0b',
  comparing: '#8b5cf6',
  rotatingLeft: '#ef4444',
  rotatingRight: '#3b82f6',
  balanced: '#10b981',
  inserted: '#22c55e',
  found: '#10b981',
  notFound: '#ef4444',
};

// =============================================================================
// AVL Tree Operations
// =============================================================================

let nodeIdCounter = 0;

function createNode(value: number): AVLNodeData {
  return {
    id: `node-${nodeIdCounter++}`,
    value,
    height: 1,
    balanceFactor: 0,
    left: null,
    right: null,
    state: 'default',
  };
}

function getHeight(node: AVLNodeData | null): number {
  return node ? node.height : 0;
}

function updateHeight(node: AVLNodeData): void {
  node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
}

function getBalanceFactor(node: AVLNodeData | null): number {
  return node ? getHeight(node.left) - getHeight(node.right) : 0;
}

function updateBalanceFactor(node: AVLNodeData): void {
  node.balanceFactor = getBalanceFactor(node);
}

function cloneNode(node: AVLNodeData | null): AVLNodeData | null {
  if (!node) {
    return null;
  }
  return {
    ...node,
    left: cloneNode(node.left),
    right: cloneNode(node.right),
  };
}

function cloneAVL(avl: AVLData): AVLData {
  return {
    root: cloneNode(avl.root),
    values: [...avl.values],
    lastRotation: avl.lastRotation,
  };
}

function resetState(node: AVLNodeData | null): void {
  if (!node) {
    return;
  }
  node.state = 'default';
  resetState(node.left);
  resetState(node.right);
}

function collectInOrder(node: AVLNodeData | null, result: number[]): void {
  if (!node) {
    return;
  }
  collectInOrder(node.left, result);
  result.push(node.value);
  collectInOrder(node.right, result);
}

// =============================================================================
// Rotations
// =============================================================================

function rotateRight(y: AVLNodeData): AVLNodeData {
  const x = y.left!;
  const T2 = x.right;

  x.right = y;
  y.left = T2;

  updateHeight(y);
  updateHeight(x);
  updateBalanceFactor(y);
  updateBalanceFactor(x);

  return x;
}

function rotateLeft(x: AVLNodeData): AVLNodeData {
  const y = x.right!;
  const T2 = y.left;

  y.left = x;
  x.right = T2;

  updateHeight(x);
  updateHeight(y);
  updateBalanceFactor(x);
  updateBalanceFactor(y);

  return y;
}

// =============================================================================
// Step Generators
// =============================================================================

export function generateInsertSteps(avl: AVLData, value: number): Step<AVLData>[] {
  const steps: Step<AVLData>[] = [];
  let stepId = 0;
  let comparisons = 0;

  const workingAVL = cloneAVL(avl);
  if (workingAVL.root) {
    resetState(workingAVL.root);
  }

  // Initial state
  steps.push({
    id: stepId++,
    description: `Inserting value: ${value}`,
    snapshot: { data: cloneAVL(workingAVL) },
    meta: createStepMeta({ highlightedLine: 0 }),
  });

  function insertHelper(node: AVLNodeData | null, val: number): AVLNodeData {
    // BST insertion
    if (!node) {
      const newNode = createNode(val);
      newNode.state = 'inserted';

      steps.push({
        id: stepId++,
        description: `Created new node with value ${val}`,
        snapshot: {
          data: {
            root: cloneNode(workingAVL.root),
            values: workingAVL.values,
          },
        },
        meta: createStepMeta({ highlightedLine: 1, comparisons }),
      });

      return newNode;
    }

    node.state = 'comparing';
    comparisons++;

    steps.push({
      id: stepId++,
      description: `Comparing ${val} with ${node.value}`,
      snapshot: { data: cloneAVL(workingAVL) },
      meta: createStepMeta({ highlightedLine: 2, comparisons }),
    });

    if (val < node.value) {
      node.state = 'current';
      node.left = insertHelper(node.left, val);
    } else if (val > node.value) {
      node.state = 'current';
      node.right = insertHelper(node.right, val);
    } else {
      // Duplicate value - just return
      node.state = 'found';
      steps.push({
        id: stepId++,
        description: `Value ${val} already exists in tree`,
        snapshot: { data: cloneAVL(workingAVL) },
        meta: createStepMeta({ highlightedLine: 3, comparisons }),
      });
      return node;
    }

    // Update height and balance factor
    updateHeight(node);
    updateBalanceFactor(node);

    const balance = getBalanceFactor(node);

    // Check for imbalance and perform rotations
    // Left Left Case
    if (balance > 1 && node.left && val < node.left.value) {
      node.state = 'rotatingRight';
      workingAVL.lastRotation = 'Right (LL case)';

      steps.push({
        id: stepId++,
        description: `Left-Left case at ${node.value}. Performing right rotation.`,
        snapshot: { data: cloneAVL(workingAVL) },
        meta: createStepMeta({ highlightedLine: 4, comparisons }),
      });

      const newRoot = rotateRight(node);
      newRoot.state = 'balanced';

      steps.push({
        id: stepId++,
        description: `Right rotation complete. New subtree root: ${newRoot.value}`,
        snapshot: {
          data: {
            root: cloneNode(newRoot),
            values: workingAVL.values,
            lastRotation: 'Right rotation',
          },
        },
        meta: createStepMeta({ highlightedLine: 5, comparisons }),
      });

      return newRoot;
    }

    // Right Right Case
    if (balance < -1 && node.right && val > node.right.value) {
      node.state = 'rotatingLeft';
      workingAVL.lastRotation = 'Left (RR case)';

      steps.push({
        id: stepId++,
        description: `Right-Right case at ${node.value}. Performing left rotation.`,
        snapshot: { data: cloneAVL(workingAVL) },
        meta: createStepMeta({ highlightedLine: 4, comparisons }),
      });

      const newRoot = rotateLeft(node);
      newRoot.state = 'balanced';

      steps.push({
        id: stepId++,
        description: `Left rotation complete. New subtree root: ${newRoot.value}`,
        snapshot: {
          data: {
            root: cloneNode(newRoot),
            values: workingAVL.values,
            lastRotation: 'Left rotation',
          },
        },
        meta: createStepMeta({ highlightedLine: 5, comparisons }),
      });

      return newRoot;
    }

    // Left Right Case
    if (balance > 1 && node.left && val > node.left.value) {
      workingAVL.lastRotation = 'Left-Right (LR case)';

      node.left.state = 'rotatingLeft';
      steps.push({
        id: stepId++,
        description: `Left-Right case at ${node.value}. First: left rotate at ${node.left.value}`,
        snapshot: { data: cloneAVL(workingAVL) },
        meta: createStepMeta({ highlightedLine: 4, comparisons }),
      });

      node.left = rotateLeft(node.left);

      node.state = 'rotatingRight';
      steps.push({
        id: stepId++,
        description: `Now: right rotate at ${node.value}`,
        snapshot: { data: cloneAVL(workingAVL) },
        meta: createStepMeta({ highlightedLine: 5, comparisons }),
      });

      const newRoot = rotateRight(node);
      newRoot.state = 'balanced';

      steps.push({
        id: stepId++,
        description: `LR rotation complete. New subtree root: ${newRoot.value}`,
        snapshot: {
          data: {
            root: cloneNode(newRoot),
            values: workingAVL.values,
            lastRotation: 'Left-Right rotation',
          },
        },
        meta: createStepMeta({ highlightedLine: 6, comparisons }),
      });

      return newRoot;
    }

    // Right Left Case
    if (balance < -1 && node.right && val < node.right.value) {
      workingAVL.lastRotation = 'Right-Left (RL case)';

      node.right.state = 'rotatingRight';
      steps.push({
        id: stepId++,
        description: `Right-Left case at ${node.value}. First: right rotate at ${node.right.value}`,
        snapshot: { data: cloneAVL(workingAVL) },
        meta: createStepMeta({ highlightedLine: 4, comparisons }),
      });

      node.right = rotateRight(node.right);

      node.state = 'rotatingLeft';
      steps.push({
        id: stepId++,
        description: `Now: left rotate at ${node.value}`,
        snapshot: { data: cloneAVL(workingAVL) },
        meta: createStepMeta({ highlightedLine: 5, comparisons }),
      });

      const newRoot = rotateLeft(node);
      newRoot.state = 'balanced';

      steps.push({
        id: stepId++,
        description: `RL rotation complete. New subtree root: ${newRoot.value}`,
        snapshot: {
          data: {
            root: cloneNode(newRoot),
            values: workingAVL.values,
            lastRotation: 'Right-Left rotation',
          },
        },
        meta: createStepMeta({ highlightedLine: 6, comparisons }),
      });

      return newRoot;
    }

    // Node is balanced
    node.state = 'balanced';
    return node;
  }

  workingAVL.root = insertHelper(workingAVL.root, value);

  // Update values list
  const newValues: number[] = [];
  collectInOrder(workingAVL.root, newValues);
  workingAVL.values = newValues;

  // Final state
  if (workingAVL.root) {
    resetState(workingAVL.root);
  }

  steps.push({
    id: stepId++,
    description: `Insertion complete. Tree is balanced.`,
    snapshot: { data: cloneAVL(workingAVL) },
    meta: createStepMeta({ highlightedLine: 7, comparisons }),
  });

  return steps;
}

export function generateSearchSteps(avl: AVLData, value: number): Step<AVLData>[] {
  const steps: Step<AVLData>[] = [];
  let stepId = 0;
  let comparisons = 0;

  const workingAVL = cloneAVL(avl);
  if (workingAVL.root) {
    resetState(workingAVL.root);
  }

  steps.push({
    id: stepId++,
    description: `Searching for value: ${value}`,
    snapshot: { data: cloneAVL(workingAVL) },
    meta: createStepMeta({ highlightedLine: 0 }),
  });

  let current = workingAVL.root;

  while (current) {
    current.state = 'comparing';
    comparisons++;

    steps.push({
      id: stepId++,
      description: `Comparing ${value} with ${current.value}`,
      snapshot: { data: cloneAVL(workingAVL) },
      meta: createStepMeta({ highlightedLine: 1, comparisons }),
    });

    if (value === current.value) {
      current.state = 'found';

      steps.push({
        id: stepId++,
        description: `Found ${value}!`,
        snapshot: { data: cloneAVL(workingAVL) },
        meta: createStepMeta({ highlightedLine: 2, comparisons }),
      });

      return steps;
    }

    current.state = 'current';

    if (value < current.value) {
      steps.push({
        id: stepId++,
        description: `${value} < ${current.value}, going left`,
        snapshot: { data: cloneAVL(workingAVL) },
        meta: createStepMeta({ highlightedLine: 3, comparisons }),
      });
      current = current.left;
    } else {
      steps.push({
        id: stepId++,
        description: `${value} > ${current.value}, going right`,
        snapshot: { data: cloneAVL(workingAVL) },
        meta: createStepMeta({ highlightedLine: 4, comparisons }),
      });
      current = current.right;
    }
  }

  steps.push({
    id: stepId++,
    description: `Value ${value} not found in tree`,
    snapshot: { data: cloneAVL(workingAVL) },
    meta: createStepMeta({ highlightedLine: 5, comparisons }),
  });

  return steps;
}

// =============================================================================
// Drawing
// =============================================================================

function calculateLayout(
  node: AVLNodeData | null,
  x: number,
  y: number,
  horizontalGap: number,
  verticalGap: number
): void {
  if (!node) {
    return;
  }

  node.x = x;
  node.y = y;

  const childGap = horizontalGap / 2;
  calculateLayout(node.left, x - horizontalGap, y + verticalGap, childGap, verticalGap);
  calculateLayout(node.right, x + horizontalGap, y + verticalGap, childGap, verticalGap);
}

function drawNode(
  ctx: CanvasRenderingContext2D,
  node: AVLNodeData | null,
  parentX?: number,
  parentY?: number
): void {
  if (!node?.x || node.y === undefined) {
    return;
  }

  const radius = 22;

  // Draw edge to parent
  if (parentX !== undefined && parentY !== undefined) {
    ctx.beginPath();
    ctx.moveTo(parentX, parentY + radius);
    ctx.lineTo(node.x, node.y - radius);
    ctx.strokeStyle = node.state !== 'default' ? NODE_STATE_COLORS[node.state] : '#4b5563';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Draw node circle
  ctx.beginPath();
  ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = NODE_STATE_COLORS[node.state];
  ctx.fill();

  // Draw value
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(node.value), node.x, node.y);

  // Draw balance factor
  ctx.fillStyle = '#9ca3af';
  ctx.font = '10px Inter, system-ui, sans-serif';
  ctx.fillText(`bf:${node.balanceFactor}`, node.x, node.y + radius + 10);

  // Draw children
  drawNode(ctx, node.left, node.x, node.y);
  drawNode(ctx, node.right, node.x, node.y);
}

function drawAVL(
  data: AVLData,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#9ca3af';
  ctx.font = '14px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('AVL Tree (Self-Balancing BST)', CANVAS_PADDING, 20);

  // Last rotation info
  if (data.lastRotation) {
    ctx.textAlign = 'right';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`Last: ${data.lastRotation}`, width - CANVAS_PADDING, 20);
  }

  if (data.root) {
    // Calculate and draw tree
    const startX = width / 2;
    const startY = CANVAS_PADDING + 50;
    const horizontalGap = Math.min(width / 4, 120);
    const verticalGap = 60;

    calculateLayout(data.root, startX, startY, horizontalGap, verticalGap);
    drawNode(ctx, data.root);
  } else {
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Empty Tree', width / 2, height / 2);
  }

  // Legend
  const legendY = height - 25;
  ctx.font = '11px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';

  const legendItems = [
    { color: NODE_STATE_COLORS.current, label: 'Current' },
    { color: NODE_STATE_COLORS.rotatingLeft, label: 'Rotate L' },
    { color: NODE_STATE_COLORS.rotatingRight, label: 'Rotate R' },
    { color: NODE_STATE_COLORS.balanced, label: 'Balanced' },
  ];

  let legendX = CANVAS_PADDING;
  for (const item of legendItems) {
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(legendX + 6, legendY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#9ca3af';
    ctx.fillText(item.label, legendX + 16, legendY + 4);
    legendX += 85;
  }
}

// =============================================================================
// Sample Data
// =============================================================================

function createSampleAVL(): AVLData {
  const avl: AVLData = {
    root: null,
    values: [],
  };

  // Insert values to create a balanced tree
  const values = [50, 30, 70, 20, 40, 60, 80];
  for (const val of values) {
    avl.root = insertValue(avl.root, val);
  }

  const inOrderValues: number[] = [];
  collectInOrder(avl.root, inOrderValues);
  avl.values = inOrderValues;

  return avl;
}

function insertValue(node: AVLNodeData | null, value: number): AVLNodeData {
  if (!node) {
    return createNode(value);
  }

  if (value < node.value) {
    node.left = insertValue(node.left, value);
  } else if (value > node.value) {
    node.right = insertValue(node.right, value);
  } else {
    return node;
  }

  updateHeight(node);
  updateBalanceFactor(node);

  const balance = getBalanceFactor(node);

  if (balance > 1 && node.left && value < node.left.value) {
    return rotateRight(node);
  }
  if (balance < -1 && node.right && value > node.right.value) {
    return rotateLeft(node);
  }
  if (balance > 1 && node.left && value > node.left.value) {
    node.left = rotateLeft(node.left);
    return rotateRight(node);
  }
  if (balance < -1 && node.right && value < node.right.value) {
    node.right = rotateRight(node.right);
    return rotateLeft(node);
  }

  return node;
}

// =============================================================================
// Visualizer Class
// =============================================================================

class AVLVisualizer implements Visualizer<AVLData> {
  readonly config: VisualizerConfig = {
    id: 'avl-tree',
    name: 'AVL Tree',
    category: 'data-structure',
    description:
      'A self-balancing Binary Search Tree where the heights of two child subtrees differ by at most one.',
    defaultSpeed: 700,
  };

  getInitialState(): Snapshot<AVLData> {
    return { data: createSampleAVL() };
  }

  getSteps(action: ActionPayload<AVLData>): Step<AVLData>[] {
    const data = action.data ?? this.getInitialState().data;
    const value = (action.params?.value as number) ?? 25;

    switch (action.type) {
      case 'insert':
        return generateInsertSteps(data, value);
      case 'search':
        return generateSearchSteps(data, value);
      case 'reset':
        return [
          {
            id: 0,
            description: 'Reset to sample AVL tree',
            snapshot: { data: createSampleAVL() },
            meta: createStepMeta({}),
          },
        ];
      default:
        return generateInsertSteps(data, value);
    }
  }

  draw(snapshot: Snapshot<AVLData>, ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    drawAVL(snapshot.data, ctx, width, height);
  }

  getPseudocode(): string[] {
    return [
      'AVL Insert:',
      '1. BST insert the new node',
      '2. Update height and balance factor',
      '3. Check balance: |bf| > 1 means unbalanced',
      '4. Apply rotations:',
      '   LL -> Right rotate',
      '   RR -> Left rotate',
      '   LR -> Left then Right',
      '   RL -> Right then Left',
    ];
  }

  getComplexity(): ComplexityInfo {
    return {
      time: {
        best: 'O(log n)',
        average: 'O(log n)',
        worst: 'O(log n)',
      },
      space: 'O(n)',
    };
  }

  getInputs(): InputField[] {
    return [
      {
        id: 'value',
        label: 'Value',
        type: 'number',
        defaultValue: 25,
        min: 1,
        max: 99,
      },
    ];
  }

  getActions(): ActionButton[] {
    return [
      { id: 'insert', label: 'Insert', primary: true },
      { id: 'search', label: 'Search' },
      { id: 'reset', label: 'Reset' },
    ];
  }
}

// =============================================================================
// Registration
// =============================================================================

registry.register<AVLData>(
  {
    id: 'avl-tree',
    name: 'AVL Tree',
    category: 'data-structure',
    description:
      'A self-balancing Binary Search Tree where the heights of two child subtrees differ by at most one.',
    defaultSpeed: 700,
  },
  () => new AVLVisualizer()
);

export { AVLVisualizer };
