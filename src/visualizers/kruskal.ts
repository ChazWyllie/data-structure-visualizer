/**
 * Kruskal's Minimum Spanning Tree Visualizer
 * Uses Union-Find for cycle detection
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
import type { GraphData, GraphNode } from './graph-shared';
import {
  cloneGraph,
  createSampleMSTGraph,
  createRandomGraph,
  drawGraph,
  sortEdgesByWeight,
  NODE_STATE_COLORS,
  EDGE_STATE_COLORS,
} from './graph-shared';

// =============================================================================
// Types
// =============================================================================

interface KruskalData extends GraphData {
  mstEdges: string[]; // IDs of edges in MST
  mstWeight: number;
  unionFind: { parent: Map<string, string>; rank: Map<string, number> };
}

// =============================================================================
// Union-Find for Kruskal's
// =============================================================================

function createUnionFind(nodes: GraphNode[]): {
  parent: Map<string, string>;
  rank: Map<string, number>;
} {
  const parent = new Map<string, string>();
  const rank = new Map<string, number>();

  for (const node of nodes) {
    parent.set(node.id, node.id);
    rank.set(node.id, 0);
  }

  return { parent, rank };
}

function find(parent: Map<string, string>, x: string): string {
  if (parent.get(x) !== x) {
    // Path compression
    const root = find(parent, parent.get(x)!);
    parent.set(x, root);
    return root;
  }
  return x;
}

function union(
  parent: Map<string, string>,
  rank: Map<string, number>,
  x: string,
  y: string
): boolean {
  const rootX = find(parent, x);
  const rootY = find(parent, y);

  if (rootX === rootY) {
    return false; // Already in same set (would create cycle)
  }

  // Union by rank
  const rankX = rank.get(rootX)!;
  const rankY = rank.get(rootY)!;

  if (rankX < rankY) {
    parent.set(rootX, rootY);
  } else if (rankX > rankY) {
    parent.set(rootY, rootX);
  } else {
    parent.set(rootY, rootX);
    rank.set(rootX, rankX + 1);
  }

  return true;
}

// =============================================================================
// Step Generation
// =============================================================================

export function generateKruskalSteps(graph: GraphData): Step<KruskalData>[] {
  const steps: Step<KruskalData>[] = [];
  let stepId = 0;
  let comparisons = 0;

  const workingGraph = cloneGraph(graph);
  const mstEdges: string[] = [];
  let mstWeight = 0;
  const uf = createUnionFind(workingGraph.nodes);

  // Initial state
  steps.push({
    id: stepId++,
    description: "Starting Kruskal's algorithm - finding Minimum Spanning Tree",
    snapshot: {
      data: {
        ...workingGraph,
        mstEdges: [...mstEdges],
        mstWeight,
        unionFind: { parent: new Map(uf.parent), rank: new Map(uf.rank) },
      },
    },
    meta: createStepMeta({ highlightedLine: 1, comparisons }),
  });

  // Sort edges by weight
  const sortedEdges = sortEdgesByWeight(workingGraph.edges);

  steps.push({
    id: stepId++,
    description: `Sorted ${sortedEdges.length} edges by weight: [${sortedEdges.map((e) => e.weight).join(', ')}]`,
    snapshot: {
      data: {
        ...workingGraph,
        mstEdges: [...mstEdges],
        mstWeight,
        unionFind: { parent: new Map(uf.parent), rank: new Map(uf.rank) },
      },
    },
    meta: createStepMeta({ highlightedLine: 2, comparisons }),
  });

  // Process edges in order
  for (const edge of sortedEdges) {
    comparisons++;

    // Find this edge in working graph and mark as considering
    const workingEdge = workingGraph.edges.find((e) => e.id === edge.id);
    if (workingEdge) {
      workingEdge.state = 'considering';
    }

    // Mark source and target nodes
    const sourceNode = workingGraph.nodes.find((n) => n.id === edge.source);
    const targetNode = workingGraph.nodes.find((n) => n.id === edge.target);
    if (sourceNode) {
      sourceNode.state = 'current';
    }
    if (targetNode) {
      targetNode.state = 'current';
    }

    steps.push({
      id: stepId++,
      description: `Considering edge ${edge.source}-${edge.target} (weight: ${edge.weight})`,
      snapshot: {
        data: {
          ...cloneGraph(workingGraph),
          mstEdges: [...mstEdges],
          mstWeight,
          unionFind: { parent: new Map(uf.parent), rank: new Map(uf.rank) },
        },
      },
      meta: createStepMeta({ highlightedLine: 3, comparisons }),
    });

    // Check if adding this edge creates a cycle (using Union-Find)
    const rootSource = find(uf.parent, edge.source);
    const rootTarget = find(uf.parent, edge.target);

    if (rootSource === rootTarget) {
      // Would create cycle - reject
      if (workingEdge) {
        workingEdge.state = 'rejected';
      }

      steps.push({
        id: stepId++,
        description: `Rejected: ${edge.source} and ${edge.target} are already connected (would create cycle)`,
        snapshot: {
          data: {
            ...cloneGraph(workingGraph),
            mstEdges: [...mstEdges],
            mstWeight,
            unionFind: { parent: new Map(uf.parent), rank: new Map(uf.rank) },
          },
        },
        meta: createStepMeta({ highlightedLine: 4, comparisons }),
      });

      // Reset edge state
      if (workingEdge) {
        workingEdge.state = 'default';
      }
    } else {
      // Add to MST
      union(uf.parent, uf.rank, edge.source, edge.target);
      mstEdges.push(edge.id);
      mstWeight += edge.weight;

      if (workingEdge) {
        workingEdge.state = 'inMST';
      }
      if (sourceNode) {
        sourceNode.state = 'inMST';
      }
      if (targetNode) {
        targetNode.state = 'inMST';
      }

      steps.push({
        id: stepId++,
        description: `Added: ${edge.source}-${edge.target} (weight: ${edge.weight}). MST weight: ${mstWeight}`,
        snapshot: {
          data: {
            ...cloneGraph(workingGraph),
            mstEdges: [...mstEdges],
            mstWeight,
            unionFind: { parent: new Map(uf.parent), rank: new Map(uf.rank) },
          },
        },
        meta: createStepMeta({ highlightedLine: 5, comparisons }),
      });
    }

    // Reset node states (keep MST state)
    if (sourceNode && sourceNode.state !== 'inMST') {
      sourceNode.state = 'default';
    }
    if (targetNode && targetNode.state !== 'inMST') {
      targetNode.state = 'default';
    }

    // Check if MST is complete (n-1 edges for n nodes)
    if (mstEdges.length === workingGraph.nodes.length - 1) {
      break;
    }
  }

  // Final state - highlight all MST edges
  for (const edge of workingGraph.edges) {
    if (mstEdges.includes(edge.id)) {
      edge.state = 'inMST';
    } else {
      edge.state = 'default';
    }
  }
  for (const node of workingGraph.nodes) {
    node.state = 'inMST';
  }

  steps.push({
    id: stepId++,
    description: `Kruskal's complete! MST has ${mstEdges.length} edges with total weight ${mstWeight}`,
    snapshot: {
      data: {
        ...cloneGraph(workingGraph),
        mstEdges: [...mstEdges],
        mstWeight,
        unionFind: { parent: new Map(uf.parent), rank: new Map(uf.rank) },
      },
    },
    meta: createStepMeta({ highlightedLine: 6, comparisons }),
  });

  return steps;
}

// =============================================================================
// Drawing
// =============================================================================

function drawKruskal(
  data: KruskalData,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  // Use shared graph drawing
  drawGraph(ctx, data, width, height, "Kruskal's MST");

  // Draw MST info
  ctx.fillStyle = '#9ca3af';
  ctx.font = '12px Inter, system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(
    `MST Edges: ${data.mstEdges.length}/${data.nodes.length - 1} | Weight: ${data.mstWeight}`,
    width - CANVAS_PADDING,
    20
  );

  // Legend
  const legendY = height - 25;
  ctx.font = '11px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';

  const legendItems = [
    { color: NODE_STATE_COLORS.inMST, label: 'In MST' },
    { color: EDGE_STATE_COLORS.considering, label: 'Considering' },
    { color: EDGE_STATE_COLORS.rejected, label: 'Rejected' },
  ];

  let legendX = CANVAS_PADDING;
  for (const item of legendItems) {
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(legendX + 6, legendY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#9ca3af';
    ctx.fillText(item.label, legendX + 16, legendY + 4);
    legendX += 90;
  }
}

// =============================================================================
// Visualizer Class
// =============================================================================

class KruskalVisualizer implements Visualizer<KruskalData> {
  readonly config: VisualizerConfig = {
    id: 'kruskal',
    name: "Kruskal's MST",
    category: 'graph',
    description:
      "Kruskal's algorithm finds the Minimum Spanning Tree by greedily adding edges in weight order, using Union-Find to detect cycles.",
    defaultSpeed: 800,
  };

  getInitialState(): Snapshot<KruskalData> {
    const graph = createSampleMSTGraph();
    const uf = createUnionFind(graph.nodes);

    return {
      data: {
        ...graph,
        mstEdges: [],
        mstWeight: 0,
        unionFind: uf,
      },
    };
  }

  getSteps(action: ActionPayload<KruskalData>): Step<KruskalData>[] {
    const data = action.data ?? this.getInitialState().data;

    switch (action.type) {
      case 'run':
        return generateKruskalSteps(data);
      case 'random': {
        const nodeCount = (action.params?.nodeCount as number) ?? 6;
        const newGraph = createRandomGraph(nodeCount, 0.5);
        return generateKruskalSteps(newGraph);
      }
      case 'reset': {
        const graph = createSampleMSTGraph();
        const uf = createUnionFind(graph.nodes);
        return [
          {
            id: 0,
            description: 'Reset to sample graph',
            snapshot: {
              data: {
                ...graph,
                mstEdges: [],
                mstWeight: 0,
                unionFind: uf,
              },
            },
            meta: createStepMeta({}),
          },
        ];
      }
      default:
        return generateKruskalSteps(data);
    }
  }

  draw(snapshot: Snapshot<KruskalData>, ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    drawKruskal(snapshot.data, ctx, width, height);
  }

  getPseudocode(): string[] {
    return [
      "Kruskal's Algorithm:",
      '1. Sort all edges by weight',
      '2. For each edge (u, v) in sorted order:',
      '   if Find(u) != Find(v):',
      '     Add edge to MST',
      '     Union(u, v)',
      '3. Return MST',
    ];
  }

  getComplexity(): ComplexityInfo {
    return {
      time: {
        best: 'O(E log E)',
        average: 'O(E log E)',
        worst: 'O(E log E)',
      },
      space: 'O(V)',
    };
  }

  getInputs(): InputField[] {
    return [
      {
        id: 'nodeCount',
        label: 'Nodes',
        type: 'number',
        defaultValue: 6,
        min: 3,
        max: 10,
        placeholder: 'Number of nodes',
      },
    ];
  }

  getActions(): ActionButton[] {
    return [
      { id: 'run', label: 'Run Kruskal', primary: true },
      { id: 'random', label: 'Random Graph' },
      { id: 'reset', label: 'Reset' },
    ];
  }
}

// =============================================================================
// Registration
// =============================================================================

const config: VisualizerConfig = {
  id: 'kruskal',
  name: "Kruskal's MST",
  category: 'graph',
  description:
    "Kruskal's algorithm finds the Minimum Spanning Tree by greedily adding edges in weight order, using Union-Find to detect cycles.",
  defaultSpeed: 800,
};

registry.register<KruskalData>(config, () => new KruskalVisualizer());

export { KruskalVisualizer };
