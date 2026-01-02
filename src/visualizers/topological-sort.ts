/**
 * Topological Sort Visualizer
 * For DAGs (Directed Acyclic Graphs) - used in dependency resolution
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

interface TopoSortData extends GraphData {
  sortedOrder: string[]; // Topological order (result)
  inDegree: Map<string, number>; // In-degree of each node
  queue: string[]; // Nodes with in-degree 0 (Kahn's algorithm)
}

// =============================================================================
// Create Sample DAG
// =============================================================================

function createSampleDAG(): GraphData {
  // A typical dependency graph:
  //   A → B → D
  //   ↓   ↓   ↓
  //   C → E → F
  return {
    nodes: [
      { id: 'A', x: 0.15, y: 0.3, state: 'default' },
      { id: 'B', x: 0.4, y: 0.2, state: 'default' },
      { id: 'C', x: 0.15, y: 0.7, state: 'default' },
      { id: 'D', x: 0.65, y: 0.2, state: 'default' },
      { id: 'E', x: 0.4, y: 0.7, state: 'default' },
      { id: 'F', x: 0.65, y: 0.7, state: 'default' },
    ],
    edges: [
      { id: 'AB', source: 'A', target: 'B', weight: 1, state: 'default' },
      { id: 'AC', source: 'A', target: 'C', weight: 1, state: 'default' },
      { id: 'BD', source: 'B', target: 'D', weight: 1, state: 'default' },
      { id: 'BE', source: 'B', target: 'E', weight: 1, state: 'default' },
      { id: 'CE', source: 'C', target: 'E', weight: 1, state: 'default' },
      { id: 'DF', source: 'D', target: 'F', weight: 1, state: 'default' },
      { id: 'EF', source: 'E', target: 'F', weight: 1, state: 'default' },
    ],
    directed: true,
  };
}

function createRandomDAG(nodeCount: number): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Create nodes in a grid-like pattern
  const cols = Math.min(nodeCount, 4);
  const rows = Math.ceil(nodeCount / cols);

  for (let i = 0; i < nodeCount; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    nodes.push({
      id: String.fromCharCode(65 + i),
      x: 0.15 + (col / (cols - 0.5)) * 0.7,
      y: 0.2 + (row / Math.max(rows - 0.5, 1)) * 0.6,
      state: 'default',
    });
  }

  // Add edges from earlier nodes to later nodes (ensures DAG property)
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      // 40% chance of edge
      if (Math.random() < 0.4) {
        edges.push({
          id: `${nodes[i].id}${nodes[j].id}`,
          source: nodes[i].id,
          target: nodes[j].id,
          weight: 1,
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
// Step Generator (Kahn's Algorithm)
// =============================================================================

export function generateTopoSortSteps(graph: GraphData): Step<TopoSortData>[] {
  const steps: Step<TopoSortData>[] = [];
  let stepId = 0;
  let comparisons = 0;

  const workingGraph = cloneGraph(graph);
  const sortedOrder: string[] = [];
  const inDegree = new Map<string, number>();
  const queue: string[] = [];

  // Initialize in-degree for all nodes
  for (const node of workingGraph.nodes) {
    inDegree.set(node.id, 0);
  }

  // Calculate in-degrees
  for (const edge of workingGraph.edges) {
    const currentDegree = inDegree.get(edge.target) ?? 0;
    inDegree.set(edge.target, currentDegree + 1);
  }

  // Initial state
  steps.push({
    id: stepId++,
    description: "Starting Topological Sort (Kahn's Algorithm)",
    snapshot: {
      data: {
        ...cloneGraph(workingGraph),
        sortedOrder: [],
        inDegree: new Map(inDegree),
        queue: [],
      },
    },
    meta: createStepMeta({ highlightedLine: 0 }),
  });

  // Show in-degrees
  const inDegreeStr = Array.from(inDegree.entries())
    .map(([id, deg]) => `${id}:${deg}`)
    .join(', ');

  steps.push({
    id: stepId++,
    description: `Calculated in-degrees: ${inDegreeStr}`,
    snapshot: {
      data: {
        ...cloneGraph(workingGraph),
        sortedOrder: [],
        inDegree: new Map(inDegree),
        queue: [],
      },
    },
    meta: createStepMeta({ highlightedLine: 1 }),
  });

  // Find all nodes with in-degree 0
  for (const node of workingGraph.nodes) {
    if (inDegree.get(node.id) === 0) {
      queue.push(node.id);
      const nodeRef = workingGraph.nodes.find((n) => n.id === node.id);
      if (nodeRef) {
        nodeRef.state = 'frontier';
      }
    }
  }

  steps.push({
    id: stepId++,
    description: `Nodes with in-degree 0 (ready): [${queue.join(', ')}]`,
    snapshot: {
      data: {
        ...cloneGraph(workingGraph),
        sortedOrder: [...sortedOrder],
        inDegree: new Map(inDegree),
        queue: [...queue],
      },
    },
    meta: createStepMeta({ highlightedLine: 2 }),
  });

  // Process queue
  while (queue.length > 0) {
    // Take first node from queue
    const currentId = queue.shift()!;
    const currentNode = workingGraph.nodes.find((n) => n.id === currentId);
    comparisons++;

    if (currentNode) {
      currentNode.state = 'current';
    }

    steps.push({
      id: stepId++,
      description: `Processing node ${currentId}`,
      snapshot: {
        data: {
          ...cloneGraph(workingGraph),
          sortedOrder: [...sortedOrder],
          inDegree: new Map(inDegree),
          queue: [...queue],
        },
      },
      meta: createStepMeta({ highlightedLine: 3, comparisons }),
    });

    // Add to sorted order
    sortedOrder.push(currentId);

    if (currentNode) {
      currentNode.state = 'visited';
    }

    // Reduce in-degree of neighbors
    const outgoingEdges = workingGraph.edges.filter((e) => e.source === currentId);

    for (const edge of outgoingEdges) {
      const targetId = edge.target;
      const newDegree = (inDegree.get(targetId) ?? 0) - 1;
      inDegree.set(targetId, newDegree);

      // Mark edge as processed
      const edgeRef = workingGraph.edges.find((e) => e.id === edge.id);
      if (edgeRef) {
        edgeRef.state = 'path';
      }

      if (newDegree === 0) {
        queue.push(targetId);
        const targetNode = workingGraph.nodes.find((n) => n.id === targetId);
        if (targetNode) {
          targetNode.state = 'frontier';
        }

        steps.push({
          id: stepId++,
          description: `Node ${targetId} now has in-degree 0, added to queue`,
          snapshot: {
            data: {
              ...cloneGraph(workingGraph),
              sortedOrder: [...sortedOrder],
              inDegree: new Map(inDegree),
              queue: [...queue],
            },
          },
          meta: createStepMeta({ highlightedLine: 4, comparisons }),
        });
      }
    }

    steps.push({
      id: stepId++,
      description: `Added ${currentId} to sorted order. Order so far: [${sortedOrder.join(', ')}]`,
      snapshot: {
        data: {
          ...cloneGraph(workingGraph),
          sortedOrder: [...sortedOrder],
          inDegree: new Map(inDegree),
          queue: [...queue],
        },
      },
      meta: createStepMeta({ highlightedLine: 5, comparisons }),
    });
  }

  // Check for cycle
  if (sortedOrder.length !== workingGraph.nodes.length) {
    steps.push({
      id: stepId++,
      description: 'Error: Graph contains a cycle! Topological sort not possible.',
      snapshot: {
        data: {
          ...cloneGraph(workingGraph),
          sortedOrder: [...sortedOrder],
          inDegree: new Map(inDegree),
          queue: [],
        },
      },
      meta: createStepMeta({ highlightedLine: 6, comparisons }),
    });
  } else {
    // Mark all as complete
    for (const node of workingGraph.nodes) {
      node.state = 'inMST';
    }
    for (const edge of workingGraph.edges) {
      edge.state = 'path';
    }

    steps.push({
      id: stepId++,
      description: `Topological Sort complete! Order: [${sortedOrder.join(' → ')}]`,
      snapshot: {
        data: {
          ...cloneGraph(workingGraph),
          sortedOrder: [...sortedOrder],
          inDegree: new Map(inDegree),
          queue: [],
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

function drawTopoSort(
  data: TopoSortData,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  // Use shared graph drawing
  drawGraph(ctx, data, width, height, 'Topological Sort (DAG)');

  // Draw sorted order
  if (data.sortedOrder.length > 0) {
    ctx.fillStyle = '#10b981';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Order: ${data.sortedOrder.join(' → ')}`, width - CANVAS_PADDING, 20);
  }

  // Draw queue
  if (data.queue.length > 0) {
    ctx.fillStyle = '#f59e0b';
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Queue: [${data.queue.join(', ')}]`, CANVAS_PADDING, height - 45);
  }

  // Legend
  const legendY = height - 25;
  ctx.font = '11px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';

  const legendItems = [
    { color: NODE_STATE_COLORS.frontier, label: 'Ready (in-deg 0)' },
    { color: NODE_STATE_COLORS.current, label: 'Processing' },
    { color: NODE_STATE_COLORS.visited, label: 'Sorted' },
  ];

  let legendX = CANVAS_PADDING;
  for (const item of legendItems) {
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(legendX + 6, legendY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#9ca3af';
    ctx.fillText(item.label, legendX + 16, legendY + 4);
    legendX += 110;
  }
}

// =============================================================================
// Visualizer Class
// =============================================================================

class TopologicalSortVisualizer implements Visualizer<TopoSortData> {
  readonly config: VisualizerConfig = {
    id: 'topological-sort',
    name: 'Topological Sort',
    category: 'graph',
    description:
      'Orders vertices in a DAG such that for every directed edge (u,v), u comes before v. Used for dependency resolution.',
    defaultSpeed: 700,
  };

  getInitialState(): Snapshot<TopoSortData> {
    const graph = createSampleDAG();
    return {
      data: {
        ...graph,
        sortedOrder: [],
        inDegree: new Map(),
        queue: [],
      },
    };
  }

  getSteps(action: ActionPayload<TopoSortData>): Step<TopoSortData>[] {
    const data = action.data ?? this.getInitialState().data;

    switch (action.type) {
      case 'run':
        return generateTopoSortSteps(data);
      case 'random': {
        const nodeCount = (action.params?.nodeCount as number) ?? 6;
        const newGraph = createRandomDAG(nodeCount);
        return generateTopoSortSteps(newGraph);
      }
      case 'reset': {
        const graph = createSampleDAG();
        return [
          {
            id: 0,
            description: 'Reset to sample DAG',
            snapshot: {
              data: {
                ...graph,
                sortedOrder: [],
                inDegree: new Map(),
                queue: [],
              },
            },
            meta: createStepMeta({}),
          },
        ];
      }
      default:
        return generateTopoSortSteps(data);
    }
  }

  draw(snapshot: Snapshot<TopoSortData>, ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    drawTopoSort(snapshot.data, ctx, width, height);
  }

  getPseudocode(): string[] {
    return [
      'topologicalSort(graph: Graph): string[] {',
      '  const inDegree = new Map<string, number>();',
      '  const queue: string[] = [], result: string[] = [];',
      '  for (const node of graph.nodes) {',
      '    if (inDegree.get(node) === 0) queue.push(node);',
      '  }',
      '  while (queue.length > 0) {',
      '    const node = queue.shift()!;',
      '    result.push(node);',
      '    for (const neighbor of graph.neighbors(node)) {',
      '      inDegree.set(neighbor, inDegree.get(neighbor)! - 1);',
      '      if (inDegree.get(neighbor) === 0) queue.push(neighbor);',
      '    }',
      '  }',
      '  return result;',
      '}',
    ];
  }

  getCode(): CodeSnippets {
    return {
      typescript: [
        'function topologicalSort(graph: Map<string, string[]>): string[] {',
        '  const inDegree = new Map<string, number>();',
        '  for (const node of graph.keys()) inDegree.set(node, 0);',
        '',
        '  for (const [, neighbors] of graph) {',
        '    for (const neighbor of neighbors) {',
        '      inDegree.set(neighbor, (inDegree.get(neighbor) ?? 0) + 1);',
        '    }',
        '  }',
        '',
        '  const queue: string[] = [];',
        '  for (const [node, degree] of inDegree) {',
        '    if (degree === 0) queue.push(node);',
        '  }',
        '',
        '  const result: string[] = [];',
        '  while (queue.length > 0) {',
        '    const node = queue.shift()!;',
        '    result.push(node);',
        '    for (const neighbor of graph.get(node) ?? []) {',
        '      const newDegree = inDegree.get(neighbor)! - 1;',
        '      inDegree.set(neighbor, newDegree);',
        '      if (newDegree === 0) queue.push(neighbor);',
        '    }',
        '  }',
        '  return result;',
        '}',
      ],
      python: [
        'from collections import deque',
        '',
        'def topological_sort(graph: dict[str, list[str]]) -> list[str]:',
        '    in_degree = {node: 0 for node in graph}',
        '',
        '    for neighbors in graph.values():',
        '        for neighbor in neighbors:',
        '            in_degree[neighbor] = in_degree.get(neighbor, 0) + 1',
        '',
        '    queue = deque([node for node, deg in in_degree.items() if deg == 0])',
        '    result = []',
        '',
        '    while queue:',
        '        node = queue.popleft()',
        '        result.append(node)',
        '        for neighbor in graph.get(node, []):',
        '            in_degree[neighbor] -= 1',
        '            if in_degree[neighbor] == 0:',
        '                queue.append(neighbor)',
        '',
        '    return result',
      ],
      java: [
        'List<String> topologicalSort(Map<String, List<String>> graph) {',
        '    Map<String, Integer> inDegree = new HashMap<>();',
        '    for (String node : graph.keySet()) inDegree.put(node, 0);',
        '',
        '    for (List<String> neighbors : graph.values()) {',
        '        for (String neighbor : neighbors) {',
        '            inDegree.merge(neighbor, 1, Integer::sum);',
        '        }',
        '    }',
        '',
        '    Queue<String> queue = new LinkedList<>();',
        '    for (var entry : inDegree.entrySet()) {',
        '        if (entry.getValue() == 0) queue.offer(entry.getKey());',
        '    }',
        '',
        '    List<String> result = new ArrayList<>();',
        '    while (!queue.isEmpty()) {',
        '        String node = queue.poll();',
        '        result.add(node);',
        '        for (String neighbor : graph.getOrDefault(node, List.of())) {',
        '            int newDegree = inDegree.get(neighbor) - 1;',
        '            inDegree.put(neighbor, newDegree);',
        '            if (newDegree == 0) queue.offer(neighbor);',
        '        }',
        '    }',
        '    return result;',
        '}',
      ],
    };
  }

  getComplexity(): ComplexityInfo {
    return {
      time: {
        best: 'O(V + E)',
        average: 'O(V + E)',
        worst: 'O(V + E)',
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
        max: 8,
      },
    ];
  }

  getActions(): ActionButton[] {
    return [
      { id: 'run', label: 'Run (Sample)', primary: true },
      { id: 'random', label: 'Random DAG' },
      { id: 'reset', label: 'Reset' },
    ];
  }
}

// =============================================================================
// Registration
// =============================================================================

registry.register<TopoSortData>(
  {
    id: 'topological-sort',
    name: 'Topological Sort',
    category: 'graph',
    description:
      'Orders vertices in a DAG such that for every directed edge (u,v), u comes before v. Used for dependency resolution.',
    defaultSpeed: 700,
  },
  () => new TopologicalSortVisualizer()
);

export { TopologicalSortVisualizer };
