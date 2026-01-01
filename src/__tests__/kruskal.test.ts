/**
 * Kruskal's MST Visualizer Tests
 */

import { describe, it, expect } from 'vitest';
import { generateKruskalSteps } from '../visualizers/kruskal';
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

describe("Kruskal's MST Visualizer", () => {
  describe('generateKruskalSteps', () => {
    it('should find MST for simple graph', () => {
      const graph = createSimpleGraph();
      const steps = generateKruskalSteps(graph);

      expect(steps.length).toBeGreaterThan(0);

      const finalStep = steps[steps.length - 1];
      // MST should have n-1 edges for n nodes
      expect(finalStep.snapshot.data.mstEdges.length).toBe(graph.nodes.length - 1);
    });

    it('should find MST with minimum total weight', () => {
      const graph = createSimpleGraph();
      const steps = generateKruskalSteps(graph);

      const finalStep = steps[steps.length - 1];
      // MST should include edges AB(1), BC(2), CD(3) = total 6
      // Not DA(4) or AC(5) since they would create cycles
      expect(finalStep.snapshot.data.mstWeight).toBe(6);
    });

    it('should correctly handle triangle graph', () => {
      const graph = createTriangleGraph();
      const steps = generateKruskalSteps(graph);

      const finalStep = steps[steps.length - 1];
      // MST should have 2 edges for 3 nodes
      expect(finalStep.snapshot.data.mstEdges.length).toBe(2);
      // Should pick BC(1) and CA(2) = total 3 (not AB(3))
      expect(finalStep.snapshot.data.mstWeight).toBe(3);
    });

    it('should process edges in sorted order', () => {
      const graph = createSimpleGraph();
      const steps = generateKruskalSteps(graph);

      // Find step that mentions sorting
      const sortStep = steps.find((s) => s.description.includes('Sorted'));
      expect(sortStep).toBeDefined();
      expect(sortStep!.description).toContain('1, 2, 3, 4, 5');
    });

    it('should reject edges that would create cycles', () => {
      // Create a 4-node graph where a cycle will be rejected before MST is complete
      // Square with diagonal: need 3 edges for MST, but we'll force an early cycle
      const graph: GraphData = {
        nodes: [
          { id: 'A', x: 0.2, y: 0.2, state: 'default' },
          { id: 'B', x: 0.8, y: 0.2, state: 'default' },
          { id: 'C', x: 0.8, y: 0.8, state: 'default' },
          { id: 'D', x: 0.2, y: 0.8, state: 'default' },
        ],
        edges: [
          { id: 'AB', source: 'A', target: 'B', weight: 1, state: 'default' },
          { id: 'BC', source: 'B', target: 'C', weight: 2, state: 'default' },
          // This edge creates triangle ABC before we have full MST
          { id: 'AC', source: 'A', target: 'C', weight: 3, state: 'default' },
          { id: 'CD', source: 'C', target: 'D', weight: 4, state: 'default' },
        ],
        directed: false,
      };

      const steps = generateKruskalSteps(graph);

      // After adding AB(1) and BC(2), when we try AC(3), A and C are already
      // connected through B, so AC should be rejected
      const rejectedStep = steps.find((s) => s.description.includes('Rejected'));
      expect(rejectedStep).toBeDefined();
      expect(rejectedStep!.description).toContain('A');
      expect(rejectedStep!.description).toContain('C');
    });

    it('should mark MST edges correctly in final state', () => {
      const graph = createSimpleGraph();
      const steps = generateKruskalSteps(graph);

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
      const steps = generateKruskalSteps(graph);

      const finalStep = steps[steps.length - 1];

      for (const node of finalStep.snapshot.data.nodes) {
        expect(node.state).toBe('inMST');
      }
    });
  });

  describe('step metadata', () => {
    it('should have unique sequential step ids', () => {
      const graph = createSimpleGraph();
      const steps = generateKruskalSteps(graph);

      for (let i = 0; i < steps.length; i++) {
        expect(steps[i].id).toBe(i);
      }
    });

    it('should have descriptions for all steps', () => {
      const graph = createSimpleGraph();
      const steps = generateKruskalSteps(graph);

      for (const step of steps) {
        expect(step.description).toBeTruthy();
        expect(step.description.length).toBeGreaterThan(0);
      }
    });

    it('should track comparisons', () => {
      const graph = createSimpleGraph();
      const steps = generateKruskalSteps(graph);

      const finalStep = steps[steps.length - 1];
      expect(finalStep.meta.comparisons).toBeGreaterThan(0);
    });
  });
});
