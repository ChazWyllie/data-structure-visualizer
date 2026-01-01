/**
 * Graph Shared Types and Utilities
 * Shared infrastructure for graph visualizers
 */

import { CANVAS_PADDING } from '../core/constants';

// =============================================================================
// Types
// =============================================================================

export type NodeState = 'default' | 'current' | 'visited' | 'inMST' | 'frontier' | 'path';
export type EdgeState = 'default' | 'considering' | 'inMST' | 'rejected' | 'path';

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  state: NodeState;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  state: EdgeState;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
}

// =============================================================================
// Constants
// =============================================================================

export const GRAPH_NODE_RADIUS = 24;
export const EDGE_WIDTH = 2;
export const EDGE_HIGHLIGHT_WIDTH = 4;

export const NODE_STATE_COLORS: Record<NodeState, string> = {
  default: '#60a5fa',
  current: '#fbbf24',
  visited: '#a78bfa',
  inMST: '#4ade80',
  frontier: '#f97316',
  path: '#22d3ee',
};

export const EDGE_STATE_COLORS: Record<EdgeState, string> = {
  default: '#4b5563',
  considering: '#fbbf24',
  inMST: '#4ade80',
  rejected: '#ef4444',
  path: '#22d3ee',
};

// =============================================================================
// Sample Graphs
// =============================================================================

export function createSampleMSTGraph(): GraphData {
  // A graph with 6 nodes arranged in a nice layout for MST visualization
  const nodes: GraphNode[] = [
    { id: 'A', x: 0.15, y: 0.3, state: 'default' },
    { id: 'B', x: 0.4, y: 0.15, state: 'default' },
    { id: 'C', x: 0.65, y: 0.3, state: 'default' },
    { id: 'D', x: 0.15, y: 0.7, state: 'default' },
    { id: 'E', x: 0.4, y: 0.85, state: 'default' },
    { id: 'F', x: 0.65, y: 0.7, state: 'default' },
  ];

  const edges: GraphEdge[] = [
    { id: 'AB', source: 'A', target: 'B', weight: 4, state: 'default' },
    { id: 'AC', source: 'A', target: 'C', weight: 6, state: 'default' },
    { id: 'AD', source: 'A', target: 'D', weight: 2, state: 'default' },
    { id: 'BC', source: 'B', target: 'C', weight: 3, state: 'default' },
    { id: 'BE', source: 'B', target: 'E', weight: 5, state: 'default' },
    { id: 'CF', source: 'C', target: 'F', weight: 1, state: 'default' },
    { id: 'DE', source: 'D', target: 'E', weight: 7, state: 'default' },
    { id: 'DF', source: 'D', target: 'F', weight: 8, state: 'default' },
    { id: 'EF', source: 'E', target: 'F', weight: 4, state: 'default' },
  ];

  return { nodes, edges, directed: false };
}

export function createRandomGraph(nodeCount: number, edgeDensity: number = 0.4): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Place nodes in a circle
  for (let i = 0; i < nodeCount; i++) {
    const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2;
    const radius = 0.35;
    nodes.push({
      id: String.fromCharCode(65 + i), // A, B, C, ...
      x: 0.5 + radius * Math.cos(angle),
      y: 0.5 + radius * Math.sin(angle),
      state: 'default',
    });
  }

  // Create random edges
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      if (Math.random() < edgeDensity) {
        const weight = Math.floor(Math.random() * 9) + 1;
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

  // Ensure graph is connected by adding edges if needed
  const connected = new Set<string>([nodes[0].id]);
  for (let i = 1; i < nodeCount; i++) {
    const nodeId = nodes[i].id;
    // Check if this node is connected
    let isConnected = false;
    for (const edge of edges) {
      if (
        (edge.source === nodeId && connected.has(edge.target)) ||
        (edge.target === nodeId && connected.has(edge.source))
      ) {
        isConnected = true;
        break;
      }
    }

    if (!isConnected) {
      // Connect to a random connected node
      const connectedArr = Array.from(connected);
      const target = connectedArr[Math.floor(Math.random() * connectedArr.length)];
      const weight = Math.floor(Math.random() * 9) + 1;
      edges.push({
        id: `${nodeId}${target}`,
        source: nodeId,
        target,
        weight,
        state: 'default',
      });
    }

    connected.add(nodeId);
  }

  return { nodes, edges, directed: false };
}

// =============================================================================
// Clone Helpers
// =============================================================================

export function cloneGraph(graph: GraphData): GraphData {
  return {
    nodes: graph.nodes.map((n) => ({ ...n })),
    edges: graph.edges.map((e) => ({ ...e })),
    directed: graph.directed,
  };
}

export function cloneNodes(nodes: GraphNode[]): GraphNode[] {
  return nodes.map((n) => ({ ...n }));
}

export function cloneEdges(edges: GraphEdge[]): GraphEdge[] {
  return edges.map((e) => ({ ...e }));
}

// =============================================================================
// Drawing Helpers
// =============================================================================

export function scalePosition(
  relativeX: number,
  relativeY: number,
  width: number,
  height: number
): { x: number; y: number } {
  const padding = CANVAS_PADDING + GRAPH_NODE_RADIUS;
  const availableWidth = width - padding * 2;
  const availableHeight = height - padding * 2;

  return {
    x: padding + relativeX * availableWidth,
    y: padding + relativeY * availableHeight,
  };
}

export function drawGraphNode(
  ctx: CanvasRenderingContext2D,
  node: GraphNode,
  width: number,
  height: number
): void {
  const pos = scalePosition(node.x, node.y, width, height);

  // Draw node circle
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, GRAPH_NODE_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = NODE_STATE_COLORS[node.state];
  ctx.fill();

  // Draw node label
  ctx.fillStyle = '#000';
  ctx.font = 'bold 14px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.id, pos.x, pos.y);
}

export function drawGraphEdge(
  ctx: CanvasRenderingContext2D,
  edge: GraphEdge,
  nodes: GraphNode[],
  width: number,
  height: number,
  showWeight: boolean = true
): void {
  const sourceNode = nodes.find((n) => n.id === edge.source);
  const targetNode = nodes.find((n) => n.id === edge.target);

  if (!sourceNode || !targetNode) {
    return;
  }

  const source = scalePosition(sourceNode.x, sourceNode.y, width, height);
  const target = scalePosition(targetNode.x, targetNode.y, width, height);

  // Calculate edge endpoints at node boundaries
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const len = Math.sqrt(dx * dx + dy * dy);

  if (len === 0) {
    return;
  }

  const ux = dx / len;
  const uy = dy / len;

  const startX = source.x + ux * GRAPH_NODE_RADIUS;
  const startY = source.y + uy * GRAPH_NODE_RADIUS;
  const endX = target.x - ux * GRAPH_NODE_RADIUS;
  const endY = target.y - uy * GRAPH_NODE_RADIUS;

  // Draw edge line
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = EDGE_STATE_COLORS[edge.state];
  ctx.lineWidth = edge.state === 'default' ? EDGE_WIDTH : EDGE_HIGHLIGHT_WIDTH;
  ctx.stroke();

  // Draw weight label
  if (showWeight) {
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    // Offset weight label perpendicular to edge
    const offsetX = -uy * 12;
    const offsetY = ux * 12;

    // Background
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(midX + offsetX, midY + offsetY, 12, 0, Math.PI * 2);
    ctx.fill();

    // Weight text
    ctx.fillStyle = edge.state === 'default' ? '#9ca3af' : EDGE_STATE_COLORS[edge.state];
    ctx.font = 'bold 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(edge.weight), midX + offsetX, midY + offsetY);
  }
}

export function drawGraph(
  ctx: CanvasRenderingContext2D,
  graph: GraphData,
  width: number,
  height: number,
  title?: string
): void {
  // Clear
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  // Title
  if (title) {
    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(title, CANVAS_PADDING, 20);
  }

  // Draw edges first (so nodes appear on top)
  for (const edge of graph.edges) {
    drawGraphEdge(ctx, edge, graph.nodes, width, height);
  }

  // Draw nodes
  for (const node of graph.nodes) {
    drawGraphNode(ctx, node, width, height);
  }
}

// =============================================================================
// Graph Utilities
// =============================================================================

export function getNodeById(nodes: GraphNode[], id: string): GraphNode | undefined {
  return nodes.find((n) => n.id === id);
}

export function getEdgeById(edges: GraphEdge[], id: string): GraphEdge | undefined {
  return edges.find((e) => e.id === id);
}

export function getEdgesBetween(
  edges: GraphEdge[],
  nodeA: string,
  nodeB: string
): GraphEdge | undefined {
  return edges.find(
    (e) => (e.source === nodeA && e.target === nodeB) || (e.source === nodeB && e.target === nodeA)
  );
}

export function getAdjacentNodes(edges: GraphEdge[], nodeId: string): string[] {
  const adjacent: string[] = [];
  for (const edge of edges) {
    if (edge.source === nodeId) {
      adjacent.push(edge.target);
    } else if (edge.target === nodeId) {
      adjacent.push(edge.source);
    }
  }
  return adjacent;
}

export function getEdgesForNode(edges: GraphEdge[], nodeId: string): GraphEdge[] {
  return edges.filter((e) => e.source === nodeId || e.target === nodeId);
}

export function sortEdgesByWeight(edges: GraphEdge[]): GraphEdge[] {
  return [...edges].sort((a, b) => a.weight - b.weight);
}

export function calculateTotalWeight(edges: GraphEdge[]): number {
  return edges.reduce((sum, e) => sum + e.weight, 0);
}
