/**
 * Topological Sort Visualizer Tests
 */

import { describe, it, expect } from 'vitest';
import { generateTopoSortSteps } from '../visualizers/topological-sort';
import type { GraphData } from '../visualizers/graph-shared';

function createSimpleDAG(): GraphData {
  // A → B → C
  return {
    nodes: [
      { id: 'A', x: 0.2, y: 0.5, state: 'default' },
      { id: 'B', x: 0.5, y: 0.5, state: 'default' },
      { id: 'C', x: 0.8, y: 0.5, state: 'default' },
    ],
    edges: [
      { id: 'AB', source: 'A', target: 'B', weight: 1, state: 'default' },
      { id: 'BC', source: 'B', target: 'C', weight: 1, state: 'default' },
    ],
    directed: true,
  };
}

function createDiamondDAG(): GraphData {
  //     A
  //    / \
  //   B   C
  //    \ /
  //     D
  return {
    nodes: [
      { id: 'A', x: 0.5, y: 0.2, state: 'default' },
      { id: 'B', x: 0.3, y: 0.5, state: 'default' },
      { id: 'C', x: 0.7, y: 0.5, state: 'default' },
      { id: 'D', x: 0.5, y: 0.8, state: 'default' },
    ],
    edges: [
      { id: 'AB', source: 'A', target: 'B', weight: 1, state: 'default' },
      { id: 'AC', source: 'A', target: 'C', weight: 1, state: 'default' },
      { id: 'BD', source: 'B', target: 'D', weight: 1, state: 'default' },
      { id: 'CD', source: 'C', target: 'D', weight: 1, state: 'default' },
    ],
    directed: true,
  };
}

function createMultiRootDAG(): GraphData {
  // A → C
  // B → C → D
  return {
    nodes: [
      { id: 'A', x: 0.2, y: 0.3, state: 'default' },
      { id: 'B', x: 0.2, y: 0.7, state: 'default' },
      { id: 'C', x: 0.5, y: 0.5, state: 'default' },
      { id: 'D', x: 0.8, y: 0.5, state: 'default' },
    ],
    edges: [
      { id: 'AC', source: 'A', target: 'C', weight: 1, state: 'default' },
      { id: 'BC', source: 'B', target: 'C', weight: 1, state: 'default' },
      { id: 'CD', source: 'C', target: 'D', weight: 1, state: 'default' },
    ],
    directed: true,
  };
}

describe('Topological Sort Visualizer', () => {
  describe('generateTopoSortSteps', () => {
    it('should sort simple linear DAG', () => {
      const graph = createSimpleDAG();
      const steps = generateTopoSortSteps(graph);

      expect(steps.length).toBeGreaterThan(0);

      const finalStep = steps[steps.length - 1];
      expect(finalStep.snapshot.data.sortedOrder).toEqual(['A', 'B', 'C']);
    });

    it('should handle diamond DAG', () => {
      const graph = createDiamondDAG();
      const steps = generateTopoSortSteps(graph);

      const finalStep = steps[steps.length - 1];
      const order = finalStep.snapshot.data.sortedOrder;

      // A must come first
      expect(order[0]).toBe('A');
      // D must come last
      expect(order[order.length - 1]).toBe('D');
      // B and C must come between A and D
      expect(order.indexOf('A')).toBeLessThan(order.indexOf('B'));
      expect(order.indexOf('A')).toBeLessThan(order.indexOf('C'));
      expect(order.indexOf('B')).toBeLessThan(order.indexOf('D'));
      expect(order.indexOf('C')).toBeLessThan(order.indexOf('D'));
    });

    it('should handle multiple root nodes', () => {
      const graph = createMultiRootDAG();
      const steps = generateTopoSortSteps(graph);

      const finalStep = steps[steps.length - 1];
      const order = finalStep.snapshot.data.sortedOrder;

      // A and B have in-degree 0, so they come first (order between them may vary)
      expect(order.indexOf('A')).toBeLessThan(order.indexOf('C'));
      expect(order.indexOf('B')).toBeLessThan(order.indexOf('C'));
      expect(order.indexOf('C')).toBeLessThan(order.indexOf('D'));
    });

    it('should include all nodes in sorted order', () => {
      const graph = createDiamondDAG();
      const steps = generateTopoSortSteps(graph);

      const finalStep = steps[steps.length - 1];
      expect(finalStep.snapshot.data.sortedOrder.length).toBe(graph.nodes.length);
    });

    it('should calculate in-degrees correctly', () => {
      const graph = createDiamondDAG();
      const steps = generateTopoSortSteps(graph);

      // Second step should show in-degrees
      const inDegreeStep = steps.find((s) => s.description.includes('in-degrees'));
      expect(inDegreeStep).toBeDefined();
      // A:0, B:1, C:1, D:2
      expect(inDegreeStep!.description).toContain('A:0');
    });

    it('should show nodes with in-degree 0 in initial queue', () => {
      const graph = createMultiRootDAG();
      const steps = generateTopoSortSteps(graph);

      // A and B should be in initial queue
      const queueStep = steps.find((s) => s.description.includes('in-degree 0'));
      expect(queueStep).toBeDefined();
    });
  });

  describe('step metadata', () => {
    it('should have unique sequential step ids', () => {
      const graph = createSimpleDAG();
      const steps = generateTopoSortSteps(graph);

      for (let i = 0; i < steps.length; i++) {
        expect(steps[i].id).toBe(i);
      }
    });

    it('should have descriptions for all steps', () => {
      const graph = createDiamondDAG();
      const steps = generateTopoSortSteps(graph);

      for (const step of steps) {
        expect(step.description).toBeTruthy();
        expect(step.description.length).toBeGreaterThan(0);
      }
    });

    it('should track comparisons', () => {
      const graph = createDiamondDAG();
      const steps = generateTopoSortSteps(graph);

      const finalStep = steps[steps.length - 1];
      expect(finalStep.meta.comparisons).toBeGreaterThan(0);
    });
  });
});
