/**
 * Prim's MST Visualizer Tests
 */

import { describe, it, expect } from 'vitest';
import { generatePrimSteps } from '../visualizers/prim';
import type { GraphData } from '../visualizers/graph-shared';

function createSimpleGraph(): GraphData {
  return {
    nodes: [
      { id: 'A', x: 0.2, y: 0.5, state: 'default' },
      { id: 'B', x: 0.5, y: 0.2, state: 'default' },
      { id: 'C', x: 0.8, y: 0.5, state: 'default' },
      { id: 'D', x: 0.5, y: 0.8, state: 'default' },
    ],
    edges: [
      { id: 'AB', source: 'A', target: 'B', weight: 1, state: 'default' },
      { id: 'BC', source: 'B', target: 'C', weight: 2, state: 'default' },
      { id: 'CD', source: 'C', target: 'D', weight: 3, state: 'default' },
      { id: 'DA', source: 'D', target: 'A', weight: 4, state: 'default' },
      { id: 'AC', source: 'A', target: 'C', weight: 5, state: 'default' }, // Diagonal
    ],
    directed: false,
  };
}

function createTriangleGraph(): GraphData {
  return {
    nodes: [
      { id: 'A', x: 0.5, y: 0.2, state: 'default' },
      { id: 'B', x: 0.2, y: 0.8, state: 'default' },
      { id: 'C', x: 0.8, y: 0.8, state: 'default' },
    ],
    edges: [
      { id: 'AB', source: 'A', target: 'B', weight: 3, state: 'default' },
      { id: 'BC', source: 'B', target: 'C', weight: 1, state: 'default' },
      { id: 'CA', source: 'C', target: 'A', weight: 2, state: 'default' },
    ],
    directed: false,
  };
}

describe("Prim's MST Visualizer", () => {
  describe('generatePrimSteps', () => {
    it('should find MST for simple graph', () => {
      const graph = createSimpleGraph();
      const steps = generatePrimSteps(graph, 'A');

      expect(steps.length).toBeGreaterThan(0);

      const finalStep = steps[steps.length - 1];
      // MST should have n-1 edges for n nodes
      expect(finalStep.snapshot.data.mstEdges.length).toBe(graph.nodes.length - 1);
    });

    it('should find MST with minimum total weight', () => {
      const graph = createSimpleGraph();
      const steps = generatePrimSteps(graph, 'A');

      const finalStep = steps[steps.length - 1];
      // MST should have total weight 6 (AB:1 + BC:2 + CD:3)
      expect(finalStep.snapshot.data.mstWeight).toBe(6);
    });

    it('should correctly handle triangle graph', () => {
      const graph = createTriangleGraph();
      const steps = generatePrimSteps(graph, 'A');

      const finalStep = steps[steps.length - 1];
      // MST should have 2 edges for 3 nodes
      expect(finalStep.snapshot.data.mstEdges.length).toBe(2);
      // Should have total weight 3 (CA:2 + BC:1 = 3) when starting from A
      expect(finalStep.snapshot.data.mstWeight).toBe(3);
    });

    it('should start from specified node', () => {
      const graph = createSimpleGraph();
      const steps = generatePrimSteps(graph, 'B');

      // First step should mention starting from B
      expect(steps[0].description).toContain('B');
    });

    it('should use default start node when not specified', () => {
      const graph = createSimpleGraph();
      const steps = generatePrimSteps(graph);

      // First step should mention starting from first node (A)
      expect(steps[0].description).toContain('A');
    });

    it('should track visited nodes correctly', () => {
      const graph = createSimpleGraph();
      const steps = generatePrimSteps(graph, 'A');

      const finalStep = steps[steps.length - 1];
      // All nodes should be visited
      expect(finalStep.snapshot.data.visited.size).toBe(graph.nodes.length);
    });

    it('should mark MST edges correctly in final state', () => {
      const graph = createSimpleGraph();
      const steps = generatePrimSteps(graph, 'A');

      const finalStep = steps[steps.length - 1];
      const mstEdgeIds = finalStep.snapshot.data.mstEdges;

      for (const edge of finalStep.snapshot.data.edges) {
        if (mstEdgeIds.includes(edge.id)) {
          expect(edge.state).toBe('inMST');
        }
      }
    });

    it('should mark all nodes as in MST when complete', () => {
      const graph = createSimpleGraph();
      const steps = generatePrimSteps(graph, 'A');

      const finalStep = steps[steps.length - 1];

      for (const node of finalStep.snapshot.data.nodes) {
        expect(node.state).toBe('inMST');
      }
    });

    it('should handle empty graph', () => {
      const graph: GraphData = {
        nodes: [],
        edges: [],
        directed: false,
      };

      const steps = generatePrimSteps(graph);
      expect(steps.length).toBe(0);
    });
  });

  describe('step metadata', () => {
    it('should have unique sequential step ids', () => {
      const graph = createSimpleGraph();
      const steps = generatePrimSteps(graph, 'A');

      for (let i = 0; i < steps.length; i++) {
        expect(steps[i].id).toBe(i);
      }
    });

    it('should have descriptions for all steps', () => {
      const graph = createSimpleGraph();
      const steps = generatePrimSteps(graph, 'A');

      for (const step of steps) {
        expect(step.description).toBeTruthy();
        expect(step.description.length).toBeGreaterThan(0);
      }
    });

    it('should track comparisons', () => {
      const graph = createSimpleGraph();
      const steps = generatePrimSteps(graph, 'A');

      const finalStep = steps[steps.length - 1];
      expect(finalStep.meta.comparisons).toBeGreaterThan(0);
    });
  });
});
