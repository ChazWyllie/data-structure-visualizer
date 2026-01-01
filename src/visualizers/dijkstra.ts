/**
 * Dijkstra's Algorithm Visualizer
 * Single-source shortest paths for graphs with non-negative edge weights
 *
 * Uses a priority queue (min-heap) for efficient vertex selection.
 * More efficient than Bellman-Ford for non-negative weights: O((V + E) log V)
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
import type { GraphData, GraphNode, GraphEdge } from './graph-shared';
import { cloneGraph, drawGraph, NODE_STATE_COLORS } from './graph-shared';

// =============================================================================
// Types
// =============================================================================

interface DijkstraData extends GraphData {
  distances: Map<string, number>; // Shortest distance from source
  predecessors: Map<string, string | null>; // Previous node in shortest path
  visited: Set<string>; // Nodes that have been finalized
  currentNode: string | null; // Currently processing node
  sourceNode: string;
}

const INFINITY = 999999;

// =============================================================================
// Priority Queue (Min-Heap)
// =============================================================================

interface PQEntry {
  nodeId: string;
  distance: number;
}

class MinPriorityQueue {
  private heap: PQEntry[] = [];

  insert(nodeId: string, distance: number): void {
    this.heap.push({ nodeId, distance });
    this.bubbleUp(this.heap.length - 1);
  }

  extractMin(): PQEntry | null {
    if (this.heap.length === 0) {
      return null;
    }
    const min = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return min;
  }

  decreaseKey(nodeId: string, newDistance: number): void {
    const index = this.heap.findIndex((e) => e.nodeId === nodeId);
    if (index !== -1 && newDistance < this.heap[index].distance) {
      this.heap[index].distance = newDistance;
      this.bubbleUp(index);
    }
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].distance <= this.heap[index].distance) {
        break;
      }
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;
    let smallest = index;

    do {
      index = smallest;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < length && this.heap[leftChild].distance < this.heap[smallest].distance) {
        smallest = leftChild;
      }
      if (rightChild < length && this.heap[rightChild].distance < this.heap[smallest].distance) {
        smallest = rightChild;
      }
      if (smallest !== index) {
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      }
    } while (smallest !== index);
  }
}

// =============================================================================
// Sample Graph Creation
// =============================================================================

function createSampleDijkstraGraph(): GraphData {
  // Graph with non-negative edges (typical road network style)
  return {
    nodes: [
      { id: 'A', x: 0.15, y: 0.5, state: 'default' },
      { id: 'B', x: 0.35, y: 0.25, state: 'default' },
      { id: 'C', x: 0.35, y: 0.75, state: 'default' },
      { id: 'D', x: 0.55, y: 0.25, state: 'default' },
      { id: 'E', x: 0.55, y: 0.75, state: 'default' },
      { id: 'F', x: 0.75, y: 0.5, state: 'default' },
      { id: 'G', x: 0.9, y: 0.5, state: 'default' },
    ],
    edges: [
      { id: 'AB', source: 'A', target: 'B', weight: 4, state: 'default' },
      { id: 'AC', source: 'A', target: 'C', weight: 2, state: 'default' },
      { id: 'BD', source: 'B', target: 'D', weight: 5, state: 'default' },
      { id: 'BC', source: 'B', target: 'C', weight: 1, state: 'default' },
      { id: 'CD', source: 'C', target: 'D', weight: 8, state: 'default' },
      { id: 'CE', source: 'C', target: 'E', weight: 10, state: 'default' },
      { id: 'DE', source: 'D', target: 'E', weight: 2, state: 'default' },
      { id: 'DF', source: 'D', target: 'F', weight: 6, state: 'default' },
      { id: 'EF', source: 'E', target: 'F', weight: 3, state: 'default' },
      { id: 'FG', source: 'F', target: 'G', weight: 1, state: 'default' },
    ],
    directed: false, // Undirected graph for Dijkstra demo
  };
}

function createRandomGraph(nodeCount: number): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Create nodes in a circle layout
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

  // Create random edges with non-negative weights
  const edgeSet = new Set<string>();
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      if (Math.random() < 0.4) {
        const weight = Math.floor(Math.random() * 10) + 1;
        const edgeKey = `${nodes[i].id}${nodes[j].id}`;
        if (!edgeSet.has(edgeKey)) {
          edgeSet.add(edgeKey);
          edges.push({
            id: edgeKey,
            source: nodes[i].id,
            target: nodes[j].id,
            weight,
            state: 'default',
          });
        }
      }
    }
  }

  // Ensure graph is connected
  for (let i = 1; i < nodeCount; i++) {
    const edgeKey = `${nodes[i - 1].id}${nodes[i].id}`;
    if (!edgeSet.has(edgeKey)) {
      const weight = Math.floor(Math.random() * 10) + 1;
      edges.push({
        id: edgeKey,
        source: nodes[i - 1].id,
        target: nodes[i].id,
        weight,
        state: 'default',
      });
    }
  }

  return {
    nodes,
    edges,
    directed: false,
  };
}

// =============================================================================
// Step Generator
// =============================================================================

export function generateDijkstraSteps(
  graph: GraphData,
  sourceId: string = 'A'
): Step<DijkstraData>[] {
  const steps: Step<DijkstraData>[] = [];
  let stepId = 0;
  let comparisons = 0;

  const workingGraph = cloneGraph(graph);
  const distances = new Map<string, number>();
  const predecessors = new Map<string, string | null>();
  const visited = new Set<string>();

  // Initialize distances
  for (const node of workingGraph.nodes) {
    distances.set(node.id, node.id === sourceId ? 0 : INFINITY);
    predecessors.set(node.id, null);
  }

  // Mark source node
  const sourceNode = workingGraph.nodes.find((n) => n.id === sourceId);
  if (sourceNode) {
    sourceNode.state = 'current';
  }

  // Initial step
  steps.push({
    id: stepId++,
    description: `Dijkstra's algorithm starting from node ${sourceId}`,
    snapshot: {
      data: {
        ...cloneGraph(workingGraph),
        distances: new Map(distances),
        predecessors: new Map(predecessors),
        visited: new Set(visited),
        currentNode: sourceId,
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
        visited: new Set(visited),
        currentNode: sourceId,
        sourceNode: sourceId,
      },
    },
    meta: createStepMeta({ highlightedLine: 1 }),
  });

  // Initialize priority queue
  const pq = new MinPriorityQueue();
  pq.insert(sourceId, 0);

  steps.push({
    id: stepId++,
    description: `Added source ${sourceId} to priority queue with distance 0`,
    snapshot: {
      data: {
        ...cloneGraph(workingGraph),
        distances: new Map(distances),
        predecessors: new Map(predecessors),
        visited: new Set(visited),
        currentNode: sourceId,
        sourceNode: sourceId,
      },
    },
    meta: createStepMeta({ highlightedLine: 2 }),
  });

  // Build adjacency list for efficient neighbor lookup
  const adjacency = new Map<string, { neighbor: string; weight: number; edgeId: string }[]>();
  for (const node of workingGraph.nodes) {
    adjacency.set(node.id, []);
  }
  for (const edge of workingGraph.edges) {
    adjacency.get(edge.source)?.push({
      neighbor: edge.target,
      weight: edge.weight ?? 1,
      edgeId: edge.id,
    });
    // For undirected graphs, add reverse edge
    if (!graph.directed) {
      adjacency.get(edge.target)?.push({
        neighbor: edge.source,
        weight: edge.weight ?? 1,
        edgeId: edge.id,
      });
    }
  }

  // Main Dijkstra loop
  while (!pq.isEmpty()) {
    const minEntry = pq.extractMin();
    if (!minEntry) {
      break;
    }

    const { nodeId: currentId, distance: currentDist } = minEntry;

    // Skip if already visited (stale entry in priority queue)
    if (visited.has(currentId)) {
      continue;
    }

    // Mark as visited
    visited.add(currentId);
    const currentNodeRef = workingGraph.nodes.find((n) => n.id === currentId);
    if (currentNodeRef) {
      currentNodeRef.state = 'inMST'; // Using inMST to show "finalized"
    }

    steps.push({
      id: stepId++,
      description: `Processing node ${currentId} with distance ${currentDist}`,
      snapshot: {
        data: {
          ...cloneGraph(workingGraph),
          distances: new Map(distances),
          predecessors: new Map(predecessors),
          visited: new Set(visited),
          currentNode: currentId,
          sourceNode: sourceId,
        },
      },
      meta: createStepMeta({ highlightedLine: 3, comparisons }),
    });

    // Explore neighbors
    const neighbors = adjacency.get(currentId) ?? [];
    for (const { neighbor, weight, edgeId } of neighbors) {
      if (visited.has(neighbor)) {
        continue;
      }

      comparisons++;

      // Find and highlight edge
      const edgeRef = workingGraph.edges.find((e) => e.id === edgeId);
      if (edgeRef) {
        edgeRef.state = 'considering';
      }

      const neighborNodeRef = workingGraph.nodes.find((n) => n.id === neighbor);
      if (neighborNodeRef?.state === 'default') {
        neighborNodeRef.state = 'frontier';
      }

      const currentDistToNode = distances.get(currentId) ?? INFINITY;
      const newDist = currentDistToNode + weight;
      const oldDist = distances.get(neighbor) ?? INFINITY;

      steps.push({
        id: stepId++,
        description: `Checking edge ${currentId} → ${neighbor} (weight ${weight}): current=${currentDistToNode}, new=${newDist}, old=${oldDist === INFINITY ? '∞' : oldDist}`,
        snapshot: {
          data: {
            ...cloneGraph(workingGraph),
            distances: new Map(distances),
            predecessors: new Map(predecessors),
            visited: new Set(visited),
            currentNode: currentId,
            sourceNode: sourceId,
          },
        },
        meta: createStepMeta({ highlightedLine: 4, comparisons }),
      });

      if (newDist < oldDist) {
        distances.set(neighbor, newDist);
        predecessors.set(neighbor, currentId);
        pq.insert(neighbor, newDist); // Add new entry (lazy deletion)

        if (edgeRef) {
          edgeRef.state = 'inMST'; // Mark as part of shortest path tree
        }

        steps.push({
          id: stepId++,
          description: `Relaxed: dist[${neighbor}] = ${newDist} (via ${currentId})`,
          snapshot: {
            data: {
              ...cloneGraph(workingGraph),
              distances: new Map(distances),
              predecessors: new Map(predecessors),
              visited: new Set(visited),
              currentNode: currentId,
              sourceNode: sourceId,
            },
          },
          meta: createStepMeta({ highlightedLine: 5, comparisons }),
        });
      } else {
        if (edgeRef) {
          edgeRef.state = 'default';
        }
      }
    }
  }

  // Final state
  const finalDistStr = Array.from(distances.entries())
    .map(([id, d]) => `${id}:${d === INFINITY ? '∞' : d}`)
    .join(', ');

  steps.push({
    id: stepId++,
    description: `Dijkstra complete. Shortest distances: ${finalDistStr}`,
    snapshot: {
      data: {
        ...cloneGraph(workingGraph),
        distances: new Map(distances),
        predecessors: new Map(predecessors),
        visited: new Set(visited),
        currentNode: null,
        sourceNode: sourceId,
      },
    },
    meta: createStepMeta({ highlightedLine: 6, comparisons }),
  });

  return steps;
}

// =============================================================================
// Draw Function
// =============================================================================

function drawDijkstra(
  data: DijkstraData,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  // Draw the base graph
  drawGraph(ctx, data, width, height);

  // Draw distance labels on nodes
  const graphWidth = width - 2 * CANVAS_PADDING;
  const graphHeight = height - 2 * CANVAS_PADDING - 40; // Reserve space for legend

  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  for (const node of data.nodes) {
    const x = CANVAS_PADDING + node.x * graphWidth;
    const y = CANVAS_PADDING + node.y * graphHeight;
    const dist = data.distances.get(node.id);
    const distLabel = dist === undefined || dist === INFINITY ? '∞' : String(dist);

    // Draw distance below node
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`d=${distLabel}`, x, y + 22);
  }

  // Draw legend
  const legendY = height - 30;
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const legendItems = [
    { color: NODE_STATE_COLORS.current, label: 'Current' },
    { color: NODE_STATE_COLORS.frontier, label: 'In Queue' },
    { color: NODE_STATE_COLORS.inMST, label: 'Finalized' },
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

class DijkstraVisualizer implements Visualizer<DijkstraData> {
  readonly config: VisualizerConfig = {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    category: 'graph',
    description:
      'Finds shortest paths from a source vertex using a priority queue. Requires non-negative edge weights.',
    defaultSpeed: 600,
  };

  getInitialState(): Snapshot<DijkstraData> {
    const graph = createSampleDijkstraGraph();
    return {
      data: {
        ...graph,
        distances: new Map(),
        predecessors: new Map(),
        visited: new Set(),
        currentNode: null,
        sourceNode: 'A',
      },
    };
  }

  getSteps(action: ActionPayload<DijkstraData>): Step<DijkstraData>[] {
    const data = action.data ?? this.getInitialState().data;
    const sourceNode = (action.params?.sourceNode as string) ?? 'A';

    switch (action.type) {
      case 'run':
        return generateDijkstraSteps(data, sourceNode);
      case 'random': {
        const nodeCount = (action.params?.nodeCount as number) ?? 7;
        const newGraph = createRandomGraph(nodeCount);
        return generateDijkstraSteps(newGraph, 'A');
      }
      case 'reset': {
        const graph = createSampleDijkstraGraph();
        return [
          {
            id: 0,
            description: 'Reset to sample graph',
            snapshot: {
              data: {
                ...graph,
                distances: new Map(),
                predecessors: new Map(),
                visited: new Set(),
                currentNode: null,
                sourceNode: 'A',
              },
            },
            meta: createStepMeta({}),
          },
        ];
      }
      default:
        return generateDijkstraSteps(data, sourceNode);
    }
  }

  draw(snapshot: Snapshot<DijkstraData>, ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    drawDijkstra(snapshot.data, ctx, width, height);
  }

  getPseudocode(): string[] {
    return [
      "Dijkstra's Algorithm:",
      '1. Initialize dist[source] = 0, others = ∞',
      '2. Add source to priority queue',
      '3. While queue not empty:',
      '   u = extract min from queue',
      '   For each neighbor v of u:',
      '     if dist[u] + weight(u,v) < dist[v]:',
      '       dist[v] = dist[u] + weight(u,v)',
      '       Add v to priority queue',
    ];
  }

  getComplexity(): ComplexityInfo {
    return {
      time: {
        best: 'O((V + E) log V)',
        average: 'O((V + E) log V)',
        worst: 'O((V + E) log V)',
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
        defaultValue: 7,
        min: 4,
        max: 10,
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

registry.register<DijkstraData>(
  {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    category: 'graph',
    description:
      'Finds shortest paths from a source vertex using a priority queue. Requires non-negative edge weights.',
    defaultSpeed: 600,
  },
  () => new DijkstraVisualizer()
);

export { DijkstraVisualizer };
