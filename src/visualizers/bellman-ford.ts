/**
 * Bellman-Ford Algorithm Visualizer
 * Single-source shortest paths with negative edge support
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
import type { GraphData, GraphNode, GraphEdge } from './graph-shared';
import { cloneGraph, drawGraph, NODE_STATE_COLORS } from './graph-shared';

// =============================================================================
// Types
// =============================================================================

interface BellmanFordData extends GraphData {
  distances: Map<string, number>; // Shortest distance from source
  predecessors: Map<string, string | null>; // Previous node in shortest path
  currentIteration: number;
  hasNegativeCycle: boolean;
  sourceNode: string;
}

const INFINITY = 999999;

// =============================================================================
// Create Sample Graph
// =============================================================================

function createSampleBFGraph(): GraphData {
  // Graph with some negative edges (but no negative cycle)
  return {
    nodes: [
      { id: 'A', x: 0.15, y: 0.5, state: 'default' },
      { id: 'B', x: 0.4, y: 0.25, state: 'default' },
      { id: 'C', x: 0.4, y: 0.75, state: 'default' },
      { id: 'D', x: 0.65, y: 0.25, state: 'default' },
      { id: 'E', x: 0.65, y: 0.75, state: 'default' },
      { id: 'F', x: 0.85, y: 0.5, state: 'default' },
    ],
    edges: [
      { id: 'AB', source: 'A', target: 'B', weight: 4, state: 'default' },
      { id: 'AC', source: 'A', target: 'C', weight: 2, state: 'default' },
      { id: 'BD', source: 'B', target: 'D', weight: 3, state: 'default' },
      { id: 'CB', source: 'C', target: 'B', weight: -1, state: 'default' }, // Negative edge
      { id: 'CE', source: 'C', target: 'E', weight: 5, state: 'default' },
      { id: 'DE', source: 'D', target: 'E', weight: -2, state: 'default' }, // Negative edge
      { id: 'DF', source: 'D', target: 'F', weight: 2, state: 'default' },
      { id: 'EF', source: 'E', target: 'F', weight: 1, state: 'default' },
    ],
    directed: true,
  };
}

function createRandomGraph(nodeCount: number): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Create nodes
  const radius = 0.35;
  for (let i = 0; i < nodeCount; i++) {
    const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2;
    nodes.push({
      id: String.fromCharCode(65 + i),
      x: 0.5 + radius * Math.cos(angle),
      y: 0.5 + radius * Math.sin(angle),
      state: 'default',
    });
  }

  // Create random edges with some negative weights
  for (let i = 0; i < nodeCount; i++) {
    for (let j = 0; j < nodeCount; j++) {
      if (i !== j && Math.random() < 0.3) {
        // Random weight between -2 and 8
        const weight = Math.floor(Math.random() * 11) - 2;
        edges.push({
          id: `${nodes[i].id}${nodes[j].id}`,
          source: nodes[i].id,
          target: nodes[j].id,
          weight,
          state: 'default',
        });
      }
    }
  }

  return {
    nodes,
    edges,
    directed: true,
  };
}

// =============================================================================
// Step Generator
// =============================================================================

export function generateBellmanFordSteps(
  graph: GraphData,
  sourceId: string = 'A'
): Step<BellmanFordData>[] {
  const steps: Step<BellmanFordData>[] = [];
  let stepId = 0;
  let comparisons = 0;

  const workingGraph = cloneGraph(graph);
  const distances = new Map<string, number>();
  const predecessors = new Map<string, string | null>();

  // Initialize distances
  for (const node of workingGraph.nodes) {
    distances.set(node.id, node.id === sourceId ? 0 : INFINITY);
    predecessors.set(node.id, null);
  }

  // Mark source node
  const sourceNode = workingGraph.nodes.find((n) => n.id === sourceId);
  if (sourceNode) {
    sourceNode.state = 'inMST';
  }

  // Initial state
  steps.push({
    id: stepId++,
    description: `Bellman-Ford starting from node ${sourceId}`,
    snapshot: {
      data: {
        ...cloneGraph(workingGraph),
        distances: new Map(distances),
        predecessors: new Map(predecessors),
        currentIteration: 0,
        hasNegativeCycle: false,
        sourceNode: sourceId,
      },
    },
    meta: createStepMeta({ highlightedLine: 0 }),
  });

  const distStr = Array.from(distances.entries())
    .map(([id, d]) => `${id}:${d === INFINITY ? '∞' : d}`)
    .join(', ');

  steps.push({
    id: stepId++,
    description: `Initialized distances: ${distStr}`,
    snapshot: {
      data: {
        ...cloneGraph(workingGraph),
        distances: new Map(distances),
        predecessors: new Map(predecessors),
        currentIteration: 0,
        hasNegativeCycle: false,
        sourceNode: sourceId,
      },
    },
    meta: createStepMeta({ highlightedLine: 1 }),
  });

  // Main loop: V-1 iterations
  const nodeCount = workingGraph.nodes.length;

  for (let i = 1; i < nodeCount; i++) {
    let updated = false;

    steps.push({
      id: stepId++,
      description: `Iteration ${i} of ${nodeCount - 1}`,
      snapshot: {
        data: {
          ...cloneGraph(workingGraph),
          distances: new Map(distances),
          predecessors: new Map(predecessors),
          currentIteration: i,
          hasNegativeCycle: false,
          sourceNode: sourceId,
        },
      },
      meta: createStepMeta({ highlightedLine: 2, comparisons }),
    });

    // Relax all edges
    for (const edge of workingGraph.edges) {
      comparisons++;

      const u = edge.source;
      const v = edge.target;
      const weight = edge.weight;
      const distU = distances.get(u) ?? INFINITY;
      const distV = distances.get(v) ?? INFINITY;

      // Mark edge as being considered
      const edgeRef = workingGraph.edges.find((e) => e.id === edge.id);
      if (edgeRef) {
        edgeRef.state = 'considering';
      }

      // Mark nodes
      const sourceNodeRef = workingGraph.nodes.find((n) => n.id === u);
      const targetNodeRef = workingGraph.nodes.find((n) => n.id === v);
      if (sourceNodeRef && sourceNodeRef.state !== 'inMST') {
        sourceNodeRef.state = 'current';
      }
      if (targetNodeRef && targetNodeRef.state !== 'inMST') {
        targetNodeRef.state = 'frontier';
      }

      if (distU !== INFINITY && distU + weight < distV) {
        // Relaxation
        distances.set(v, distU + weight);
        predecessors.set(v, u);
        updated = true;

        if (edgeRef) {
          edgeRef.state = 'path';
        }
        if (targetNodeRef) {
          targetNodeRef.state = 'visited';
        }

        steps.push({
          id: stepId++,
          description: `Relaxed edge ${u}→${v}: ${distV === INFINITY ? '∞' : distV} → ${distU + weight} (via ${u})`,
          snapshot: {
            data: {
              ...cloneGraph(workingGraph),
              distances: new Map(distances),
              predecessors: new Map(predecessors),
              currentIteration: i,
              hasNegativeCycle: false,
              sourceNode: sourceId,
            },
          },
          meta: createStepMeta({ highlightedLine: 3, comparisons }),
        });
      }

      // Reset edge state
      if (edgeRef?.state === 'considering') {
        edgeRef.state = 'default';
      }
      // Reset node states (keep special states)
      if (sourceNodeRef?.state === 'current') {
        sourceNodeRef.state = 'default';
      }
      if (targetNodeRef?.state === 'frontier') {
        targetNodeRef.state = 'default';
      }
    }

    if (!updated) {
      steps.push({
        id: stepId++,
        description: `No updates in iteration ${i}. Algorithm can terminate early.`,
        snapshot: {
          data: {
            ...cloneGraph(workingGraph),
            distances: new Map(distances),
            predecessors: new Map(predecessors),
            currentIteration: i,
            hasNegativeCycle: false,
            sourceNode: sourceId,
          },
        },
        meta: createStepMeta({ highlightedLine: 4, comparisons }),
      });
      break;
    }
  }

  // Check for negative cycle (one more pass)
  let hasNegativeCycle = false;

  steps.push({
    id: stepId++,
    description: 'Checking for negative cycles...',
    snapshot: {
      data: {
        ...cloneGraph(workingGraph),
        distances: new Map(distances),
        predecessors: new Map(predecessors),
        currentIteration: nodeCount,
        hasNegativeCycle: false,
        sourceNode: sourceId,
      },
    },
    meta: createStepMeta({ highlightedLine: 5, comparisons }),
  });

  for (const edge of workingGraph.edges) {
    const u = edge.source;
    const v = edge.target;
    const weight = edge.weight;
    const distU = distances.get(u) ?? INFINITY;
    const distV = distances.get(v) ?? INFINITY;

    if (distU !== INFINITY && distU + weight < distV) {
      hasNegativeCycle = true;

      // Mark problematic edge
      const edgeRef = workingGraph.edges.find((e) => e.id === edge.id);
      if (edgeRef) {
        edgeRef.state = 'rejected';
      }

      steps.push({
        id: stepId++,
        description: `Negative cycle detected at edge ${u}→${v}!`,
        snapshot: {
          data: {
            ...cloneGraph(workingGraph),
            distances: new Map(distances),
            predecessors: new Map(predecessors),
            currentIteration: nodeCount,
            hasNegativeCycle: true,
            sourceNode: sourceId,
          },
        },
        meta: createStepMeta({ highlightedLine: 6, comparisons }),
      });
      break;
    }
  }

  if (!hasNegativeCycle) {
    // Mark shortest paths
    for (const node of workingGraph.nodes) {
      node.state = distances.get(node.id) !== INFINITY ? 'inMST' : 'default';
    }

    // Mark path edges
    for (const [nodeId, predId] of predecessors.entries()) {
      if (predId) {
        const edge = workingGraph.edges.find((e) => e.source === predId && e.target === nodeId);
        if (edge) {
          edge.state = 'path';
        }
      }
    }

    const finalDistStr = Array.from(distances.entries())
      .map(([id, d]) => `${id}:${d === INFINITY ? '∞' : d}`)
      .join(', ');

    steps.push({
      id: stepId++,
      description: `Complete! Shortest distances: ${finalDistStr}`,
      snapshot: {
        data: {
          ...cloneGraph(workingGraph),
          distances: new Map(distances),
          predecessors: new Map(predecessors),
          currentIteration: nodeCount,
          hasNegativeCycle: false,
          sourceNode: sourceId,
        },
      },
      meta: createStepMeta({ highlightedLine: 7, comparisons }),
    });
  }

  return steps;
}

// =============================================================================
// Drawing
// =============================================================================

function drawBellmanFord(
  data: BellmanFordData,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  // Use shared graph drawing
  drawGraph(ctx, data, width, height, 'Bellman-Ford (Shortest Paths)');

  // Draw iteration info
  ctx.fillStyle = '#9ca3af';
  ctx.font = '12px Inter, system-ui, sans-serif';
  ctx.textAlign = 'right';

  if (data.hasNegativeCycle) {
    ctx.fillStyle = '#ef4444';
    ctx.fillText('Negative cycle detected!', width - CANVAS_PADDING, 20);
  } else {
    ctx.fillText(
      `Source: ${data.sourceNode} | Iteration: ${data.currentIteration}`,
      width - CANVAS_PADDING,
      20
    );
  }

  // Draw distances
  ctx.fillStyle = '#10b981';
  ctx.font = '11px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';

  const distStr = Array.from(data.distances.entries())
    .map(([id, d]) => `${id}:${d >= INFINITY ? '∞' : d}`)
    .join('  ');

  ctx.fillText(`Distances: ${distStr}`, CANVAS_PADDING, height - 45);

  // Legend
  const legendY = height - 25;
  ctx.font = '11px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';

  const legendItems = [
    { color: NODE_STATE_COLORS.current, label: 'Source' },
    { color: NODE_STATE_COLORS.frontier, label: 'Checking' },
    { color: NODE_STATE_COLORS.visited, label: 'Updated' },
    { color: NODE_STATE_COLORS.inMST, label: 'Reached' },
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
// Visualizer Class
// =============================================================================

class BellmanFordVisualizer implements Visualizer<BellmanFordData> {
  readonly config: VisualizerConfig = {
    id: 'bellman-ford',
    name: 'Bellman-Ford',
    category: 'graph',
    description:
      'Finds shortest paths from a source vertex, supporting negative edge weights and detecting negative cycles.',
    defaultSpeed: 600,
  };

  getInitialState(): Snapshot<BellmanFordData> {
    const graph = createSampleBFGraph();
    return {
      data: {
        ...graph,
        distances: new Map(),
        predecessors: new Map(),
        currentIteration: 0,
        hasNegativeCycle: false,
        sourceNode: 'A',
      },
    };
  }

  getSteps(action: ActionPayload<BellmanFordData>): Step<BellmanFordData>[] {
    const data = action.data ?? this.getInitialState().data;
    const sourceNode = (action.params?.sourceNode as string) ?? 'A';

    switch (action.type) {
      case 'run':
        return generateBellmanFordSteps(data, sourceNode);
      case 'random': {
        const nodeCount = (action.params?.nodeCount as number) ?? 6;
        const newGraph = createRandomGraph(nodeCount);
        return generateBellmanFordSteps(newGraph, 'A');
      }
      case 'reset': {
        const graph = createSampleBFGraph();
        return [
          {
            id: 0,
            description: 'Reset to sample graph',
            snapshot: {
              data: {
                ...graph,
                distances: new Map(),
                predecessors: new Map(),
                currentIteration: 0,
                hasNegativeCycle: false,
                sourceNode: 'A',
              },
            },
            meta: createStepMeta({}),
          },
        ];
      }
      default:
        return generateBellmanFordSteps(data, sourceNode);
    }
  }

  draw(snapshot: Snapshot<BellmanFordData>, ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    drawBellmanFord(snapshot.data, ctx, width, height);
  }

  getPseudocode(): string[] {
    return [
      'bellmanFord(graph: Graph, source: string): Map<string, number> | null {',
      '  const dist = new Map<string, number>();',
      '  dist.set(source, 0);',
      '  for (let i = 0; i < V - 1; i++) {',
      '    for (const { u, v, weight } of graph.edges) {',
      '      if (dist.get(u)! + weight < (dist.get(v) ?? Infinity)) {',
      '        dist.set(v, dist.get(u)! + weight);',
      '      }',
      '    }',
      '  }',
      '  // Check for negative cycles',
      '  for (const { u, v, weight } of graph.edges) {',
      '    if (dist.get(u)! + weight < dist.get(v)!) return null;',
      '  }',
      '  return dist;',
      '}',
    ];
  }

  getCode(): CodeSnippets {
    return {
      typescript: [
        'type Edge = { from: string; to: string; weight: number };',
        '',
        'function bellmanFord(nodes: string[], edges: Edge[], source: string)',
        '  : Map<string, number> | null {',
        '  const dist = new Map<string, number>();',
        '  for (const node of nodes) dist.set(node, Infinity);',
        '  dist.set(source, 0);',
        '',
        '  // Relax edges V-1 times',
        '  for (let i = 0; i < nodes.length - 1; i++) {',
        '    for (const { from, to, weight } of edges) {',
        '      const d = dist.get(from)!;',
        '      if (d !== Infinity && d + weight < dist.get(to)!) {',
        '        dist.set(to, d + weight);',
        '      }',
        '    }',
        '  }',
        '',
        '  // Detect negative cycles',
        '  for (const { from, to, weight } of edges) {',
        '    if (dist.get(from)! + weight < dist.get(to)!) {',
        '      return null; // Negative cycle detected',
        '    }',
        '  }',
        '  return dist;',
        '}',
      ],
      python: [
        'def bellman_ford(nodes: list[str], edges: list[tuple[str, str, int]],',
        '                 source: str) -> dict[str, int] | None:',
        '    dist = {node: float("inf") for node in nodes}',
        '    dist[source] = 0',
        '',
        '    # Relax edges V-1 times',
        '    for _ in range(len(nodes) - 1):',
        '        for u, v, weight in edges:',
        '            if dist[u] != float("inf") and dist[u] + weight < dist[v]:',
        '                dist[v] = dist[u] + weight',
        '',
        '    # Detect negative cycles',
        '    for u, v, weight in edges:',
        '        if dist[u] + weight < dist[v]:',
        '            return None  # Negative cycle detected',
        '',
        '    return dist',
      ],
      java: [
        'Map<String, Integer> bellmanFord(List<String> nodes,',
        '    List<int[]> edges, String source) {',
        '    Map<String, Integer> dist = new HashMap<>();',
        '    for (String node : nodes) dist.put(node, Integer.MAX_VALUE);',
        '    dist.put(source, 0);',
        '',
        '    // Relax edges V-1 times',
        '    for (int i = 0; i < nodes.size() - 1; i++) {',
        '        for (int[] edge : edges) {',
        '            String u = nodes.get(edge[0]);',
        '            String v = nodes.get(edge[1]);',
        '            int weight = edge[2];',
        '            if (dist.get(u) != Integer.MAX_VALUE',
        '                && dist.get(u) + weight < dist.get(v)) {',
        '                dist.put(v, dist.get(u) + weight);',
        '            }',
        '        }',
        '    }',
        '',
        '    // Detect negative cycles',
        '    for (int[] edge : edges) {',
        '        String u = nodes.get(edge[0]);',
        '        String v = nodes.get(edge[1]);',
        '        if (dist.get(u) + edge[2] < dist.get(v)) {',
        '            return null;',
        '        }',
        '    }',
        '    return dist;',
        '}',
      ],
    };
  }

  getComplexity(): ComplexityInfo {
    return {
      time: {
        best: 'O(V*E)',
        average: 'O(V*E)',
        worst: 'O(V*E)',
      },
      space: 'O(V)',
    };
  }

  getInputs(): InputField[] {
    return [
      {
        id: 'sourceNode',
        label: 'Source Node',
        type: 'text',
        defaultValue: 'A',
        placeholder: 'e.g., A',
      },
      {
        id: 'nodeCount',
        label: 'Nodes (Random)',
        type: 'number',
        defaultValue: 6,
        min: 4,
        max: 8,
      },
    ];
  }

  getActions(): ActionButton[] {
    return [
      { id: 'run', label: 'Run (Sample)', primary: true },
      { id: 'random', label: 'Random Graph' },
      { id: 'reset', label: 'Reset' },
    ];
  }
}

// =============================================================================
// Registration
// =============================================================================

registry.register<BellmanFordData>(
  {
    id: 'bellman-ford',
    name: 'Bellman-Ford',
    category: 'graph',
    description:
      'Finds shortest paths from a source vertex, supporting negative edge weights and detecting negative cycles.',
    defaultSpeed: 600,
  },
  () => new BellmanFordVisualizer()
);

export { BellmanFordVisualizer };
