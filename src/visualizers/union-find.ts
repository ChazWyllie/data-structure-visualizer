/**
 * Union-Find (Disjoint Set Union) Visualizer
 * Demonstrates union by rank and path compression
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
  CodeSnippets,
} from '../core/types';
import { createStepMeta } from '../core/types';
import { registry } from '../core/registry';
import { CANVAS_PADDING } from '../core/constants';

// =============================================================================
// Types
// =============================================================================

type NodeState = 'default' | 'current' | 'root' | 'path' | 'merged' | 'found';

interface DSUNode {
  id: number;
  parent: number;
  rank: number;
  state: NodeState;
}

interface UnionFindData {
  nodes: DSUNode[];
  message?: string;
}

// =============================================================================
// Constants
// =============================================================================

const NODE_RADIUS = 24;
const LEVEL_HEIGHT = 70;
const NODE_SPACING = 80;

const STATE_COLORS: Record<NodeState, string> = {
  default: '#60a5fa',
  current: '#fbbf24',
  root: '#4ade80',
  path: '#a78bfa',
  merged: '#f97316',
  found: '#22d3ee',
};

// =============================================================================
// DSU Operations (Pure Functions)
// =============================================================================

function cloneNodes(nodes: DSUNode[]): DSUNode[] {
  return nodes.map((n) => ({ ...n }));
}

// =============================================================================
// Step Generation
// =============================================================================

export function generateMakeSetSteps(nodes: DSUNode[], value: number): Step<UnionFindData>[] {
  const steps: Step<UnionFindData>[] = [];
  let stepId = 0;

  // Check if value already exists
  if (nodes.some((n) => n.id === value)) {
    steps.push({
      id: stepId++,
      description: `Element ${value} already exists in the set`,
      snapshot: { data: { nodes: cloneNodes(nodes) } },
      meta: createStepMeta({ highlightedLine: 1 }),
    });
    return steps;
  }

  steps.push({
    id: stepId++,
    description: `Creating new set with element ${value}`,
    snapshot: { data: { nodes: cloneNodes(nodes) } },
    meta: createStepMeta({ highlightedLine: 1, writes: 1 }),
  });

  // Create new node
  const newNodes = cloneNodes(nodes);
  const newNode: DSUNode = {
    id: value,
    parent: value, // Points to itself
    rank: 0,
    state: 'current',
  };
  newNodes.push(newNode);

  steps.push({
    id: stepId++,
    description: `Created set {${value}} - parent points to itself, rank = 0`,
    snapshot: { data: { nodes: cloneNodes(newNodes) } },
    meta: createStepMeta({ highlightedLine: 2, writes: 1 }),
  });

  // Final state
  newNode.state = 'root';
  steps.push({
    id: stepId++,
    description: `Set {${value}} created successfully`,
    snapshot: { data: { nodes: cloneNodes(newNodes) } },
    meta: createStepMeta({ highlightedLine: 3, writes: 1 }),
  });

  return steps;
}

export function generateFindSteps(nodes: DSUNode[], x: number): Step<UnionFindData>[] {
  const steps: Step<UnionFindData>[] = [];
  let stepId = 0;
  let reads = 0;

  const nodeIndex = nodes.findIndex((n) => n.id === x);
  if (nodeIndex === -1) {
    steps.push({
      id: stepId++,
      description: `Element ${x} not found in any set`,
      snapshot: { data: { nodes: cloneNodes(nodes) } },
      meta: createStepMeta({ highlightedLine: 1, reads }),
    });
    return steps;
  }

  const workingNodes = cloneNodes(nodes);
  workingNodes[nodeIndex].state = 'current';

  steps.push({
    id: stepId++,
    description: `Finding root of element ${x}`,
    snapshot: { data: { nodes: cloneNodes(workingNodes) } },
    meta: createStepMeta({ highlightedLine: 1, reads }),
  });

  // Find path to root
  const path: number[] = [];
  let current = nodeIndex;

  while (workingNodes[current].parent !== workingNodes[current].id) {
    reads++;
    path.push(current);

    const parentId = workingNodes[current].parent;
    const parentIndex = workingNodes.findIndex((n) => n.id === parentId);

    workingNodes[current].state = 'path';
    if (parentIndex !== -1) {
      workingNodes[parentIndex].state = 'current';
    }

    steps.push({
      id: stepId++,
      description: `${workingNodes[current].id} -> parent is ${parentId}, following...`,
      snapshot: { data: { nodes: cloneNodes(workingNodes) } },
      meta: createStepMeta({ highlightedLine: 2, reads }),
    });

    current = parentIndex;
  }

  // Found root
  reads++;
  workingNodes[current].state = 'root';

  steps.push({
    id: stepId++,
    description: `Found root: ${workingNodes[current].id}`,
    snapshot: { data: { nodes: cloneNodes(workingNodes) } },
    meta: createStepMeta({ highlightedLine: 3, reads }),
  });

  // Path compression
  if (path.length > 0) {
    steps.push({
      id: stepId++,
      description: 'Applying path compression - pointing all nodes directly to root',
      snapshot: { data: { nodes: cloneNodes(workingNodes) } },
      meta: createStepMeta({ highlightedLine: 4, reads }),
    });

    const rootId = workingNodes[current].id;
    for (const pathIndex of path) {
      workingNodes[pathIndex].parent = rootId;
      workingNodes[pathIndex].state = 'found';

      steps.push({
        id: stepId++,
        description: `${workingNodes[pathIndex].id}.parent = ${rootId} (path compression)`,
        snapshot: { data: { nodes: cloneNodes(workingNodes) } },
        meta: createStepMeta({ highlightedLine: 5, reads, writes: path.length }),
      });
    }
  }

  // Final state
  workingNodes.forEach((n) => {
    n.state = n.parent === n.id ? 'root' : 'default';
  });
  workingNodes[current].state = 'found';

  steps.push({
    id: stepId++,
    description: `Find(${x}) = ${workingNodes[current].id}`,
    snapshot: { data: { nodes: cloneNodes(workingNodes) } },
    meta: createStepMeta({ highlightedLine: 6, reads }),
  });

  return steps;
}

export function generateUnionSteps(nodes: DSUNode[], x: number, y: number): Step<UnionFindData>[] {
  const steps: Step<UnionFindData>[] = [];
  let stepId = 0;
  let reads = 0;
  let writes = 0;

  const xIndex = nodes.findIndex((n) => n.id === x);
  const yIndex = nodes.findIndex((n) => n.id === y);

  if (xIndex === -1 || yIndex === -1) {
    steps.push({
      id: stepId++,
      description: `Cannot union: element ${xIndex === -1 ? x : y} not found`,
      snapshot: { data: { nodes: cloneNodes(nodes) } },
      meta: createStepMeta({ highlightedLine: 1, reads }),
    });
    return steps;
  }

  const workingNodes = cloneNodes(nodes);
  workingNodes[xIndex].state = 'current';
  workingNodes[yIndex].state = 'current';

  steps.push({
    id: stepId++,
    description: `Union(${x}, ${y}) - finding roots of both elements`,
    snapshot: { data: { nodes: cloneNodes(workingNodes) } },
    meta: createStepMeta({ highlightedLine: 1, reads }),
  });

  // Find roots
  let xRoot = xIndex;
  while (workingNodes[xRoot].parent !== workingNodes[xRoot].id) {
    reads++;
    const parentId = workingNodes[xRoot].parent;
    xRoot = workingNodes.findIndex((n) => n.id === parentId);
  }

  let yRoot = yIndex;
  while (workingNodes[yRoot].parent !== workingNodes[yRoot].id) {
    reads++;
    const parentId = workingNodes[yRoot].parent;
    yRoot = workingNodes.findIndex((n) => n.id === parentId);
  }

  workingNodes[xRoot].state = 'root';
  workingNodes[yRoot].state = 'root';

  steps.push({
    id: stepId++,
    description: `Root of ${x} is ${workingNodes[xRoot].id}, root of ${y} is ${workingNodes[yRoot].id}`,
    snapshot: { data: { nodes: cloneNodes(workingNodes) } },
    meta: createStepMeta({ highlightedLine: 2, reads }),
  });

  // Check if already in same set
  if (xRoot === yRoot) {
    steps.push({
      id: stepId++,
      description: `${x} and ${y} are already in the same set (root: ${workingNodes[xRoot].id})`,
      snapshot: { data: { nodes: cloneNodes(workingNodes) } },
      meta: createStepMeta({ highlightedLine: 3, reads }),
    });
    return steps;
  }

  // Union by rank
  const xRank = workingNodes[xRoot].rank;
  const yRank = workingNodes[yRoot].rank;

  steps.push({
    id: stepId++,
    description: `Comparing ranks: rank(${workingNodes[xRoot].id}) = ${xRank}, rank(${workingNodes[yRoot].id}) = ${yRank}`,
    snapshot: { data: { nodes: cloneNodes(workingNodes) } },
    meta: createStepMeta({ highlightedLine: 4, reads }),
  });

  if (xRank < yRank) {
    // Attach x's tree under y
    workingNodes[xRoot].parent = workingNodes[yRoot].id;
    workingNodes[xRoot].state = 'merged';
    writes++;

    steps.push({
      id: stepId++,
      description: `${workingNodes[xRoot].id}.parent = ${workingNodes[yRoot].id} (lower rank attaches to higher)`,
      snapshot: { data: { nodes: cloneNodes(workingNodes) } },
      meta: createStepMeta({ highlightedLine: 5, reads, writes }),
    });
  } else if (xRank > yRank) {
    // Attach y's tree under x
    workingNodes[yRoot].parent = workingNodes[xRoot].id;
    workingNodes[yRoot].state = 'merged';
    writes++;

    steps.push({
      id: stepId++,
      description: `${workingNodes[yRoot].id}.parent = ${workingNodes[xRoot].id} (lower rank attaches to higher)`,
      snapshot: { data: { nodes: cloneNodes(workingNodes) } },
      meta: createStepMeta({ highlightedLine: 5, reads, writes }),
    });
  } else {
    // Same rank - attach y under x and increment x's rank
    workingNodes[yRoot].parent = workingNodes[xRoot].id;
    workingNodes[yRoot].state = 'merged';
    workingNodes[xRoot].rank++;
    writes += 2;

    steps.push({
      id: stepId++,
      description: `Same rank: ${workingNodes[yRoot].id}.parent = ${workingNodes[xRoot].id}, rank(${workingNodes[xRoot].id})++`,
      snapshot: { data: { nodes: cloneNodes(workingNodes) } },
      meta: createStepMeta({ highlightedLine: 6, reads, writes }),
    });
  }

  // Final state
  workingNodes.forEach((n) => {
    n.state = n.parent === n.id ? 'root' : 'default';
  });

  steps.push({
    id: stepId++,
    description: `Union complete. ${x} and ${y} are now in the same set.`,
    snapshot: { data: { nodes: cloneNodes(workingNodes) } },
    meta: createStepMeta({ highlightedLine: 7, reads, writes }),
  });

  return steps;
}

export function generateConnectedSteps(
  nodes: DSUNode[],
  x: number,
  y: number
): Step<UnionFindData>[] {
  const steps: Step<UnionFindData>[] = [];
  let stepId = 0;
  let reads = 0;

  const xIndex = nodes.findIndex((n) => n.id === x);
  const yIndex = nodes.findIndex((n) => n.id === y);

  if (xIndex === -1 || yIndex === -1) {
    steps.push({
      id: stepId++,
      description: `Cannot check: element ${xIndex === -1 ? x : y} not found`,
      snapshot: { data: { nodes: cloneNodes(nodes) } },
      meta: createStepMeta({ highlightedLine: 1, reads }),
    });
    return steps;
  }

  const workingNodes = cloneNodes(nodes);
  workingNodes[xIndex].state = 'current';
  workingNodes[yIndex].state = 'current';

  steps.push({
    id: stepId++,
    description: `Checking if ${x} and ${y} are connected`,
    snapshot: { data: { nodes: cloneNodes(workingNodes) } },
    meta: createStepMeta({ highlightedLine: 1, reads }),
  });

  // Find roots
  let xRoot = xIndex;
  while (workingNodes[xRoot].parent !== workingNodes[xRoot].id) {
    reads++;
    const parentId = workingNodes[xRoot].parent;
    xRoot = workingNodes.findIndex((n) => n.id === parentId);
  }

  let yRoot = yIndex;
  while (workingNodes[yRoot].parent !== workingNodes[yRoot].id) {
    reads++;
    const parentId = workingNodes[yRoot].parent;
    yRoot = workingNodes.findIndex((n) => n.id === parentId);
  }

  workingNodes[xRoot].state = 'root';
  workingNodes[yRoot].state = xRoot === yRoot ? 'root' : 'found';

  const connected = xRoot === yRoot;

  steps.push({
    id: stepId++,
    description: connected
      ? `Yes! ${x} and ${y} are connected (same root: ${workingNodes[xRoot].id})`
      : `No. ${x} (root: ${workingNodes[xRoot].id}) and ${y} (root: ${workingNodes[yRoot].id}) are in different sets`,
    snapshot: { data: { nodes: cloneNodes(workingNodes) } },
    meta: createStepMeta({ highlightedLine: 2, reads }),
  });

  return steps;
}

// =============================================================================
// Drawing
// =============================================================================

interface TreeLayout {
  nodeId: number;
  x: number;
  y: number;
  state: NodeState;
  rank: number;
  children: TreeLayout[];
}

function buildForest(nodes: DSUNode[]): TreeLayout[] {
  // Find roots
  const roots = nodes.filter((n) => n.parent === n.id);
  const forest: TreeLayout[] = [];

  for (const root of roots) {
    forest.push(buildTree(nodes, root.id));
  }

  return forest;
}

function buildTree(nodes: DSUNode[], rootId: number): TreeLayout {
  const node = nodes.find((n) => n.id === rootId)!;
  const children = nodes.filter((n) => n.parent === rootId && n.id !== rootId);

  return {
    nodeId: node.id,
    x: 0,
    y: 0,
    state: node.state,
    rank: node.rank,
    children: children.map((c) => buildTree(nodes, c.id)),
  };
}

function calculateTreeWidth(tree: TreeLayout): number {
  if (tree.children.length === 0) {
    return NODE_SPACING;
  }
  return tree.children.reduce((sum, child) => sum + calculateTreeWidth(child), 0);
}

function layoutTree(tree: TreeLayout, x: number, y: number): void {
  tree.x = x;
  tree.y = y;

  if (tree.children.length === 0) {
    return;
  }

  const totalWidth = calculateTreeWidth(tree);
  let currentX = x - totalWidth / 2;

  for (const child of tree.children) {
    const childWidth = calculateTreeWidth(child);
    layoutTree(child, currentX + childWidth / 2, y + LEVEL_HEIGHT);
    currentX += childWidth;
  }
}

function drawTree(tree: TreeLayout, ctx: CanvasRenderingContext2D, nodes: DSUNode[]): void {
  // Draw edges to children first
  ctx.strokeStyle = '#4b5563';
  ctx.lineWidth = 2;

  for (const child of tree.children) {
    ctx.beginPath();
    ctx.moveTo(tree.x, tree.y + NODE_RADIUS);
    ctx.lineTo(child.x, child.y - NODE_RADIUS);
    ctx.stroke();

    drawTree(child, ctx, nodes);
  }

  // Draw node
  ctx.beginPath();
  ctx.arc(tree.x, tree.y, NODE_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = STATE_COLORS[tree.state];
  ctx.fill();

  // Node value
  ctx.fillStyle = '#000';
  ctx.font = 'bold 14px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(tree.nodeId), tree.x, tree.y);

  // Rank label
  ctx.fillStyle = '#6b7280';
  ctx.font = '10px Inter, system-ui, sans-serif';
  ctx.fillText(`r:${tree.rank}`, tree.x, tree.y + NODE_RADIUS + 12);
}

function drawUnionFind(
  data: UnionFindData,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  const { nodes } = data;

  // Clear
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#9ca3af';
  ctx.font = '14px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Union-Find (Disjoint Set Union)', CANVAS_PADDING, 20);

  if (nodes.length === 0) {
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No sets created yet', width / 2, height / 2);
    return;
  }

  // Build and layout forest
  const forest = buildForest(nodes);

  // Calculate total width needed
  const totalForestWidth = forest.reduce((sum, tree) => sum + calculateTreeWidth(tree), 0);
  const forestGap = 40;
  const totalWidth = totalForestWidth + (forest.length - 1) * forestGap;

  // Position trees
  let currentX = (width - totalWidth) / 2;
  const startY = CANVAS_PADDING + 50;

  for (const tree of forest) {
    const treeWidth = calculateTreeWidth(tree);
    layoutTree(tree, currentX + treeWidth / 2, startY);
    currentX += treeWidth + forestGap;
  }

  // Draw all trees
  for (const tree of forest) {
    drawTree(tree, ctx, nodes);
  }

  // Draw legend at bottom
  const legendY = height - 30;
  ctx.font = '11px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';

  const legendItems = [
    { color: STATE_COLORS.root, label: 'Root' },
    { color: STATE_COLORS.current, label: 'Current' },
    { color: STATE_COLORS.path, label: 'Path' },
    { color: STATE_COLORS.merged, label: 'Merged' },
  ];

  let legendX = CANVAS_PADDING;
  for (const item of legendItems) {
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(legendX + 6, legendY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#9ca3af';
    ctx.fillText(item.label, legendX + 16, legendY + 4);
    legendX += 70;
  }
}

// =============================================================================
// Visualizer Class
// =============================================================================

class UnionFindVisualizer implements Visualizer<UnionFindData> {
  readonly config: VisualizerConfig = {
    id: 'union-find',
    name: 'Union-Find (DSU)',
    category: 'data-structure',
    description:
      'Disjoint Set Union with union by rank and path compression. Efficiently tracks connected components.',
    defaultSpeed: 600,
  };

  getInitialState(): Snapshot<UnionFindData> {
    // Start with some sample sets
    const nodes: DSUNode[] = [
      { id: 0, parent: 0, rank: 1, state: 'default' },
      { id: 1, parent: 0, rank: 0, state: 'default' },
      { id: 2, parent: 0, rank: 0, state: 'default' },
      { id: 3, parent: 3, rank: 1, state: 'default' },
      { id: 4, parent: 3, rank: 0, state: 'default' },
      { id: 5, parent: 5, rank: 0, state: 'default' },
    ];

    return { data: { nodes } };
  }

  getSteps(action: ActionPayload<UnionFindData>): Step<UnionFindData>[] {
    const { nodes } = action.data ?? this.getInitialState().data;

    switch (action.type) {
      case 'make-set': {
        const value = (action.params?.value as number) ?? nodes.length;
        return generateMakeSetSteps(nodes, value);
      }
      case 'find': {
        const x = (action.params?.value as number) ?? 0;
        return generateFindSteps(nodes, x);
      }
      case 'union': {
        const x = (action.params?.x as number) ?? 0;
        const y = (action.params?.y as number) ?? 1;
        return generateUnionSteps(nodes, x, y);
      }
      case 'connected': {
        const x = (action.params?.x as number) ?? 0;
        const y = (action.params?.y as number) ?? 1;
        return generateConnectedSteps(nodes, x, y);
      }
      case 'reset': {
        // Create fresh individual sets
        const count = (action.params?.count as number) ?? 6;
        const newNodes: DSUNode[] = [];
        for (let i = 0; i < count; i++) {
          newNodes.push({ id: i, parent: i, rank: 0, state: 'default' });
        }
        return [
          {
            id: 0,
            description: `Created ${count} individual sets`,
            snapshot: { data: { nodes: newNodes } },
            meta: createStepMeta({ writes: count }),
          },
        ];
      }
      default:
        return [
          {
            id: 0,
            description: `Union-Find structure ready with ${nodes.length} elements`,
            snapshot: { data: { nodes } },
            meta: createStepMeta({}),
          },
        ];
    }
  }

  draw(snapshot: Snapshot<UnionFindData>, ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    drawUnionFind(snapshot.data, ctx, width, height);
  }

  getPseudocode(): string[] {
    return [
      'find(x: number): number {',
      '  if (this.parent[x] !== x)',
      '    this.parent[x] = this.find(this.parent[x]); // path compression',
      '  return this.parent[x];',
      '}',
      '',
      'union(x: number, y: number): void {',
      '  const rootX = this.find(x), rootY = this.find(y);',
      '  if (rootX === rootY) return;',
      '  if (this.rank[rootX] < this.rank[rootY]) this.parent[rootX] = rootY;',
      '  else if (this.rank[rootX] > this.rank[rootY]) this.parent[rootY] = rootX;',
      '  else { this.parent[rootY] = rootX; this.rank[rootX]++; }',
      '}',
    ];
  }

  getCode(): CodeSnippets {
    return {
      typescript: [
        'class UnionFind {',
        '  private parent: number[];',
        '  private rank: number[];',
        '',
        '  constructor(size: number) {',
        '    this.parent = Array.from({ length: size }, (_, i) => i);',
        '    this.rank = new Array(size).fill(0);',
        '  }',
        '',
        '  find(x: number): number {',
        '    if (this.parent[x] !== x) {',
        '      this.parent[x] = this.find(this.parent[x]); // Path compression',
        '    }',
        '    return this.parent[x];',
        '  }',
        '',
        '  union(x: number, y: number): void {',
        '    const rootX = this.find(x);',
        '    const rootY = this.find(y);',
        '    if (rootX === rootY) return;',
        '',
        '    if (this.rank[rootX] < this.rank[rootY]) {',
        '      this.parent[rootX] = rootY;',
        '    } else if (this.rank[rootX] > this.rank[rootY]) {',
        '      this.parent[rootY] = rootX;',
        '    } else {',
        '      this.parent[rootY] = rootX;',
        '      this.rank[rootX]++;',
        '    }',
        '  }',
        '}',
      ],
      python: [
        'class UnionFind:',
        '    def __init__(self, size: int):',
        '        self.parent = list(range(size))',
        '        self.rank = [0] * size',
        '',
        '    def find(self, x: int) -> int:',
        '        if self.parent[x] != x:',
        '            self.parent[x] = self.find(self.parent[x])  # Path compression',
        '        return self.parent[x]',
        '',
        '    def union(self, x: int, y: int) -> None:',
        '        root_x = self.find(x)',
        '        root_y = self.find(y)',
        '        if root_x == root_y:',
        '            return',
        '',
        '        if self.rank[root_x] < self.rank[root_y]:',
        '            self.parent[root_x] = root_y',
        '        elif self.rank[root_x] > self.rank[root_y]:',
        '            self.parent[root_y] = root_x',
        '        else:',
        '            self.parent[root_y] = root_x',
        '            self.rank[root_x] += 1',
      ],
      java: [
        'class UnionFind {',
        '    private int[] parent;',
        '    private int[] rank;',
        '',
        '    public UnionFind(int size) {',
        '        parent = new int[size];',
        '        rank = new int[size];',
        '        for (int i = 0; i < size; i++) {',
        '            parent[i] = i;',
        '        }',
        '    }',
        '',
        '    public int find(int x) {',
        '        if (parent[x] != x) {',
        '            parent[x] = find(parent[x]); // Path compression',
        '        }',
        '        return parent[x];',
        '    }',
        '',
        '    public void union(int x, int y) {',
        '        int rootX = find(x);',
        '        int rootY = find(y);',
        '        if (rootX == rootY) return;',
        '',
        '        if (rank[rootX] < rank[rootY]) {',
        '            parent[rootX] = rootY;',
        '        } else if (rank[rootX] > rank[rootY]) {',
        '            parent[rootY] = rootX;',
        '        } else {',
        '            parent[rootY] = rootX;',
        '            rank[rootX]++;',
        '        }',
        '    }',
        '}',
      ],
    };
  }

  getComplexity(): ComplexityInfo {
    return {
      time: {
        best: 'O(α(n))',
        average: 'O(α(n))',
        worst: 'O(α(n))',
      },
      space: 'O(n)',
    };
  }

  getInputs(): InputField[] {
    return [
      {
        id: 'value',
        label: 'Element',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 99,
        placeholder: 'Element ID',
      },
      {
        id: 'x',
        label: 'X',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 99,
        placeholder: 'First element',
      },
      {
        id: 'y',
        label: 'Y',
        type: 'number',
        defaultValue: 1,
        min: 0,
        max: 99,
        placeholder: 'Second element',
      },
    ];
  }

  getActions(): ActionButton[] {
    return [
      { id: 'union', label: 'Union(X, Y)', primary: true },
      { id: 'find', label: 'Find(Element)' },
      { id: 'connected', label: 'Connected?(X, Y)' },
      { id: 'make-set', label: 'MakeSet(Element)' },
      { id: 'reset', label: 'Reset' },
    ];
  }
}

// =============================================================================
// Registration
// =============================================================================

const config: VisualizerConfig = {
  id: 'union-find',
  name: 'Union-Find (DSU)',
  category: 'data-structure',
  description:
    'Disjoint Set Union with union by rank and path compression. Efficiently tracks connected components.',
  defaultSpeed: 600,
};

registry.register<UnionFindData>(config, () => new UnionFindVisualizer());

export { UnionFindVisualizer };
