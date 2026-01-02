/**
 * Prim's Minimum Spanning Tree Visualizer
 * Uses Priority Queue (Min-Heap) for efficient edge selection
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
import type { GraphData } from './graph-shared';
import {
  cloneGraph,
  createSampleMSTGraph,
  createRandomGraph,
  drawGraph,
  getEdgesForNode,
  NODE_STATE_COLORS,
  EDGE_STATE_COLORS,
} from './graph-shared';

// =============================================================================
// Types
// =============================================================================

interface PrimData extends GraphData {
  mstEdges: string[]; // IDs of edges in MST
  mstWeight: number;
  visited: Set<string>; // Nodes already in MST
  priorityQueue: Array<{ edgeId: string; weight: number }>; // Min-heap representation
}

// =============================================================================
// Priority Queue (Min-Heap) for Prim's
// =============================================================================

interface HeapItem {
  edgeId: string;
  weight: number;
  source: string;
  target: string;
}

function createMinHeap(): HeapItem[] {
  return [];
}

function heapPush(heap: HeapItem[], item: HeapItem): void {
  heap.push(item);
  let i = heap.length - 1;

  let done = false;
  while (i > 0 && !done) {
    const parentIndex = Math.floor((i - 1) / 2);
    if (heap[parentIndex].weight <= heap[i].weight) {
      done = true;
    } else {
      [heap[parentIndex], heap[i]] = [heap[i], heap[parentIndex]];
      i = parentIndex;
    }
  }
}

function heapPop(heap: HeapItem[]): HeapItem | undefined {
  if (heap.length === 0) {
    return undefined;
  }
  if (heap.length === 1) {
    return heap.pop();
  }

  const min = heap[0];
  heap[0] = heap.pop()!;

  let i = 0;
  const len = heap.length;

  let done = false;
  while (!done) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    let smallest = i;

    if (left < len && heap[left].weight < heap[smallest].weight) {
      smallest = left;
    }
    if (right < len && heap[right].weight < heap[smallest].weight) {
      smallest = right;
    }

    if (smallest !== i) {
      [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
      i = smallest;
    } else {
      done = true;
    }
  }

  return min;
}

function heapIsEmpty(heap: HeapItem[]): boolean {
  return heap.length === 0;
}

// =============================================================================
// Step Generator
// =============================================================================

export function generatePrimSteps(graph: GraphData, startNodeId?: string): Step<PrimData>[] {
  const steps: Step<PrimData>[] = [];
  let stepId = 0;
  let comparisons = 0;

  const workingGraph = cloneGraph(graph);
  const mstEdges: string[] = [];
  let mstWeight = 0;
  const visited = new Set<string>();
  const heap = createMinHeap();

  // Use first node as start if not specified
  const startNode = startNodeId
    ? workingGraph.nodes.find((n) => n.id === startNodeId)
    : workingGraph.nodes[0];

  if (!startNode || workingGraph.nodes.length === 0) {
    return steps;
  }

  // Initial state
  steps.push({
    id: stepId++,
    description: `Prim's MST starting from node ${startNode.id}`,
    snapshot: {
      data: {
        ...cloneGraph(workingGraph),
        mstEdges: [],
        mstWeight: 0,
        visited: new Set<string>(),
        priorityQueue: [],
      },
    },
    meta: createStepMeta({ highlightedLine: 0 }),
  });

  // Mark start node as visited
  visited.add(startNode.id);
  const startNodeRef = workingGraph.nodes.find((n) => n.id === startNode.id)!;
  startNodeRef.state = 'inMST';

  // Add all edges from start node to priority queue
  const startEdges = getEdgesForNode(workingGraph.edges, startNode.id);
  for (const edge of startEdges) {
    const edgeRef = workingGraph.edges.find((e) => e.id === edge.id);
    if (edgeRef) {
      edgeRef.state = 'considering';
    }
    heapPush(heap, {
      edgeId: edge.id,
      weight: edge.weight,
      source: edge.source,
      target: edge.target,
    });
  }

  steps.push({
    id: stepId++,
    description: `Added ${startEdges.length} edge(s) from ${startNode.id} to priority queue`,
    snapshot: {
      data: {
        ...cloneGraph(workingGraph),
        mstEdges: [...mstEdges],
        mstWeight,
        visited: new Set(visited),
        priorityQueue: heap.map((h) => ({ edgeId: h.edgeId, weight: h.weight })),
      },
    },
    meta: createStepMeta({ highlightedLine: 1 }),
  });

  // Main loop: while heap is not empty and MST is incomplete
  while (!heapIsEmpty(heap) && mstEdges.length < workingGraph.nodes.length - 1) {
    const item = heapPop(heap);
    if (!item) {
      break;
    }

    const sourceVisited = visited.has(item.source);
    const targetVisited = visited.has(item.target);

    comparisons++;

    // Find edge reference for state updates
    const edgeRef = workingGraph.edges.find((e) => e.id === item.edgeId);

    // If both endpoints are visited, skip (would create cycle)
    if (sourceVisited && targetVisited) {
      if (edgeRef) {
        edgeRef.state = 'rejected';
      }

      steps.push({
        id: stepId++,
        description: `Skip edge ${item.source}-${item.target}: both nodes already in MST`,
        snapshot: {
          data: {
            ...cloneGraph(workingGraph),
            mstEdges: [...mstEdges],
            mstWeight,
            visited: new Set(visited),
            priorityQueue: heap.map((h) => ({ edgeId: h.edgeId, weight: h.weight })),
          },
        },
        meta: createStepMeta({ highlightedLine: 3, comparisons }),
      });

      // Reset edge state
      if (edgeRef) {
        edgeRef.state = 'default';
      }
      continue;
    }

    // Find the new node to add
    const newNodeId = sourceVisited ? item.target : item.source;
    const newNodeRef = workingGraph.nodes.find((n) => n.id === newNodeId);

    // Mark edge state as considering
    if (edgeRef) {
      edgeRef.state = 'considering';
    }
    if (newNodeRef) {
      newNodeRef.state = 'current';
    }

    steps.push({
      id: stepId++,
      description: `Considering edge ${item.source}-${item.target} (weight: ${item.weight}) to add node ${newNodeId}`,
      snapshot: {
        data: {
          ...cloneGraph(workingGraph),
          mstEdges: [...mstEdges],
          mstWeight,
          visited: new Set(visited),
          priorityQueue: heap.map((h) => ({ edgeId: h.edgeId, weight: h.weight })),
        },
      },
      meta: createStepMeta({ highlightedLine: 4, comparisons }),
    });

    // Add edge to MST
    visited.add(newNodeId);
    mstEdges.push(item.edgeId);
    mstWeight += item.weight;

    if (edgeRef) {
      edgeRef.state = 'inMST';
    }
    if (newNodeRef) {
      newNodeRef.state = 'inMST';
    }

    // Add all edges from the new node to the priority queue
    const newEdges = getEdgesForNode(workingGraph.edges, newNodeId);
    let addedCount = 0;
    for (const newEdge of newEdges) {
      const otherNodeId = newEdge.source === newNodeId ? newEdge.target : newEdge.source;
      if (!visited.has(otherNodeId)) {
        const newEdgeRef = workingGraph.edges.find((e) => e.id === newEdge.id);
        if (newEdgeRef && newEdgeRef.state !== 'inMST') {
          newEdgeRef.state = 'considering';
        }
        heapPush(heap, {
          edgeId: newEdge.id,
          weight: newEdge.weight,
          source: newEdge.source,
          target: newEdge.target,
        });
        addedCount++;
      }
    }

    steps.push({
      id: stepId++,
      description: `Added ${item.source}-${item.target} to MST. Node ${newNodeId} added. ${addedCount} new edge(s) in queue. Total weight: ${mstWeight}`,
      snapshot: {
        data: {
          ...cloneGraph(workingGraph),
          mstEdges: [...mstEdges],
          mstWeight,
          visited: new Set(visited),
          priorityQueue: heap.map((h) => ({ edgeId: h.edgeId, weight: h.weight })),
        },
      },
      meta: createStepMeta({ highlightedLine: 5, comparisons }),
    });
  }

  // Final state
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
    description: `Prim's complete! MST has ${mstEdges.length} edges with total weight ${mstWeight}`,
    snapshot: {
      data: {
        ...cloneGraph(workingGraph),
        mstEdges: [...mstEdges],
        mstWeight,
        visited: new Set(visited),
        priorityQueue: [],
      },
    },
    meta: createStepMeta({ highlightedLine: 6, comparisons }),
  });

  return steps;
}

// =============================================================================
// Drawing
// =============================================================================

function drawPrim(
  data: PrimData,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  // Use shared graph drawing
  drawGraph(ctx, data, width, height, "Prim's MST");

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
    { color: NODE_STATE_COLORS.current, label: 'Current' },
    { color: EDGE_STATE_COLORS.considering, label: 'Frontier' },
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

class PrimVisualizer implements Visualizer<PrimData> {
  readonly config: VisualizerConfig = {
    id: 'prim',
    name: "Prim's MST",
    category: 'graph',
    description:
      "Prim's algorithm finds the Minimum Spanning Tree by growing from a start node, always adding the minimum-weight edge connecting the tree to a new node.",
    defaultSpeed: 800,
  };

  getInitialState(): Snapshot<PrimData> {
    const graph = createSampleMSTGraph();
    return {
      data: {
        ...graph,
        mstEdges: [],
        mstWeight: 0,
        visited: new Set<string>(),
        priorityQueue: [],
      },
    };
  }

  getSteps(action: ActionPayload<PrimData>): Step<PrimData>[] {
    const data = action.data ?? this.getInitialState().data;
    const startNode = (action.params?.startNode as string) || undefined;

    switch (action.type) {
      case 'run':
        return generatePrimSteps(data, startNode);
      case 'random': {
        const nodeCount = (action.params?.nodeCount as number) ?? 6;
        const newGraph = createRandomGraph(nodeCount, 0.5);
        return generatePrimSteps(newGraph, startNode);
      }
      case 'reset': {
        const graph = createSampleMSTGraph();
        return [
          {
            id: 0,
            description: 'Reset to sample graph',
            snapshot: {
              data: {
                ...graph,
                mstEdges: [],
                mstWeight: 0,
                visited: new Set<string>(),
                priorityQueue: [],
              },
            },
            meta: createStepMeta({}),
          },
        ];
      }
      default:
        return generatePrimSteps(data, startNode);
    }
  }

  draw(snapshot: Snapshot<PrimData>, ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    drawPrim(snapshot.data, ctx, width, height);
  }

  getPseudocode(): string[] {
    return [
      'prim(graph: Graph, start: string): Edge[] {',
      '  const mst: Edge[] = [], visited = new Set([start]);',
      '  const pq = new PriorityQueue<Edge>();',
      '  for (const edge of graph.edgesFrom(start)) pq.enqueue(edge, edge.weight);',
      '  while (!pq.isEmpty() && visited.size < graph.nodeCount) {',
      '    const edge = pq.dequeue();',
      '    if (visited.has(edge.to)) continue;',
      '    visited.add(edge.to);',
      '    mst.push(edge);',
      '    for (const e of graph.edgesFrom(edge.to)) pq.enqueue(e, e.weight);',
      '  }',
      '  return mst;',
      '}',
    ];
  }

  getCode(): CodeSnippets {
    return {
      typescript: [
        'type Edge = { from: string; to: string; weight: number };',
        '',
        'function prim(graph: Map<string, Edge[]>, start: string): Edge[] {',
        '  const mst: Edge[] = [];',
        '  const visited = new Set<string>([start]);',
        '  const pq: Edge[] = [...(graph.get(start) ?? [])];',
        '',
        '  while (pq.length > 0 && visited.size < graph.size) {',
        '    pq.sort((a, b) => a.weight - b.weight);',
        '    const edge = pq.shift()!;',
        '',
        '    if (visited.has(edge.to)) continue;',
        '    visited.add(edge.to);',
        '    mst.push(edge);',
        '',
        '    for (const e of graph.get(edge.to) ?? []) {',
        '      if (!visited.has(e.to)) pq.push(e);',
        '    }',
        '  }',
        '  return mst;',
        '}',
      ],
      python: [
        'import heapq',
        '',
        'def prim(graph: dict[str, list[tuple[str, int]]], start: str)',
        '    -> list[tuple[str, str, int]]:',
        '    mst = []',
        '    visited = {start}',
        '    # (weight, from, to)',
        '    pq = [(w, start, to) for to, w in graph.get(start, [])]',
        '    heapq.heapify(pq)',
        '',
        '    while pq and len(visited) < len(graph):',
        '        weight, u, v = heapq.heappop(pq)',
        '        if v in visited:',
        '            continue',
        '        visited.add(v)',
        '        mst.append((u, v, weight))',
        '',
        '        for neighbor, w in graph.get(v, []):',
        '            if neighbor not in visited:',
        '                heapq.heappush(pq, (w, v, neighbor))',
        '',
        '    return mst',
      ],
      java: [
        'List<int[]> prim(Map<String, List<int[]>> graph, String start) {',
        '    List<int[]> mst = new ArrayList<>();',
        '    Set<String> visited = new HashSet<>();',
        '    visited.add(start);',
        '    PriorityQueue<int[]> pq = new PriorityQueue<>(',
        '        Comparator.comparingInt(e -> e[2]));',
        '',
        '    for (int[] edge : graph.getOrDefault(start, List.of())) {',
        '        pq.offer(edge);',
        '    }',
        '',
        '    while (!pq.isEmpty() && visited.size() < graph.size()) {',
        '        int[] edge = pq.poll();',
        '        String to = /* edge destination */;',
        '        if (visited.contains(to)) continue;',
        '        visited.add(to);',
        '        mst.add(edge);',
        '',
        '        for (int[] e : graph.getOrDefault(to, List.of())) {',
        '            if (!visited.contains(/* e destination */)) {',
        '                pq.offer(e);',
        '            }',
        '        }',
        '    }',
        '    return mst;',
        '}',
      ],
    };
  }

  getComplexity(): ComplexityInfo {
    return {
      time: {
        best: 'O((V+E) log V)',
        average: 'O((V+E) log V)',
        worst: 'O((V+E) log V)',
      },
      space: 'O(V + E)',
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
      },
      {
        id: 'startNode',
        label: 'Start Node',
        type: 'text',
        defaultValue: 'A',
        placeholder: 'e.g., A',
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

registry.register<PrimData>(
  {
    id: 'prim',
    name: "Prim's MST",
    category: 'graph',
    description:
      "Prim's algorithm finds the Minimum Spanning Tree by growing from a start node, always adding the minimum-weight edge connecting the tree to a new node.",
    defaultSpeed: 800,
  },
  () => new PrimVisualizer()
);

export { PrimVisualizer };
