/**
 * Dijkstra's Algorithm Visualizer Tests
 */

import { describe, it, expect } from 'vitest';
import { generateDijkstraSteps } from '../visualizers/dijkstra';
import type { GraphData } from '../visualizers/graph-shared';

function createSimpleGraph(): GraphData {
  // A -- B -- C (linear path, weights 2 and 3)
  return {
    nodes: [
      { id: 'A', x: 0.2, y: 0.5, state: 'default' },
      { id: 'B', x: 0.5, y: 0.5, state: 'default' },
      { id: 'C', x: 0.8, y: 0.5, state: 'default' },
    ],
    edges: [
      { id: 'AB', source: 'A', target: 'B', weight: 2, state: 'default' },
      { id: 'BC', source: 'B', target: 'C', weight: 3, state: 'default' },
    ],
    directed: false,
  };
}

function createTriangleGraph(): GraphData {
  // A -- B with shortcut A -- C -- B
  return {
    nodes: [
      { id: 'A', x: 0.2, y: 0.5, state: 'default' },
      { id: 'B', x: 0.8, y: 0.5, state: 'default' },
      { id: 'C', x: 0.5, y: 0.2, state: 'default' },
    ],
    edges: [
      { id: 'AB', source: 'A', target: 'B', weight: 10, state: 'default' },
      { id: 'AC', source: 'A', target: 'C', weight: 2, state: 'default' },
      { id: 'CB', source: 'C', target: 'B', weight: 3, state: 'default' },
    ],
    directed: false,
  };
}

function createDisconnectedGraph(): GraphData {
  // A -- B   C (C is disconnected)
  return {
    nodes: [
      { id: 'A', x: 0.2, y: 0.5, state: 'default' },
      { id: 'B', x: 0.5, y: 0.5, state: 'default' },
      { id: 'C', x: 0.8, y: 0.5, state: 'default' },
    ],
    edges: [{ id: 'AB', source: 'A', target: 'B', weight: 2, state: 'default' }],
    directed: false,
  };
}

describe("Dijkstra's Algorithm Visualizer", () => {
  describe('generateDijkstraSteps', () => {
    it('should find shortest paths in simple graph', () => {
      const graph = createSimpleGraph();
      const steps = generateDijkstraSteps(graph, 'A');

      expect(steps.length).toBeGreaterThan(0);

      const finalStep = steps[steps.length - 1];
      const distances = finalStep.snapshot.data.distances;

      expect(distances.get('A')).toBe(0);
      expect(distances.get('B')).toBe(2);
      expect(distances.get('C')).toBe(5); // 2 + 3
    });

    it('should find shorter path via intermediate node', () => {
      const graph = createTriangleGraph();
      const steps = generateDijkstraSteps(graph, 'A');

      const finalStep = steps[steps.length - 1];
      const distances = finalStep.snapshot.data.distances;

      // Direct A->B is 10, but A->C->B is 2+3=5
      expect(distances.get('B')).toBe(5);
    });

    it('should handle disconnected nodes', () => {
      const graph = createDisconnectedGraph();
      const steps = generateDijkstraSteps(graph, 'A');

      const finalStep = steps[steps.length - 1];
      const distances = finalStep.snapshot.data.distances;

      expect(distances.get('A')).toBe(0);
      expect(distances.get('B')).toBe(2);
      // C should remain at infinity (999999)
      expect(distances.get('C')).toBe(999999);
    });

    it('should initialize distances correctly', () => {
      const graph = createSimpleGraph();
      const steps = generateDijkstraSteps(graph, 'A');

      const initStep = steps.find((s) => s.description.includes('Initialized distances'));
      expect(initStep).toBeDefined();
      expect(initStep!.description).toContain('A:0');
    });

    it('should add source to priority queue', () => {
      const graph = createSimpleGraph();
      const steps = generateDijkstraSteps(graph, 'A');

      const pqStep = steps.find((s) => s.description.includes('priority queue'));
      expect(pqStep).toBeDefined();
    });
  });

  describe('edge relaxation', () => {
    it('should relax edges when shorter path found', () => {
      const graph = createSimpleGraph();
      const steps = generateDijkstraSteps(graph, 'A');

      const relaxStep = steps.find((s) => s.description.includes('Relaxed'));
      expect(relaxStep).toBeDefined();
    });

    it('should track predecessors for path reconstruction', () => {
      const graph = createSimpleGraph();
      const steps = generateDijkstraSteps(graph, 'A');

      const finalStep = steps[steps.length - 1];
      const predecessors = finalStep.snapshot.data.predecessors;

      expect(predecessors.get('A')).toBeNull();
      expect(predecessors.get('B')).toBe('A');
      expect(predecessors.get('C')).toBe('B');
    });
  });

  describe('step metadata', () => {
    it('should have unique sequential step ids', () => {
      const graph = createSimpleGraph();
      const steps = generateDijkstraSteps(graph, 'A');

      for (let i = 0; i < steps.length; i++) {
        expect(steps[i].id).toBe(i);
      }
    });

    it('should have descriptions for all steps', () => {
      const graph = createSimpleGraph();
      const steps = generateDijkstraSteps(graph, 'A');

      for (const step of steps) {
        expect(step.description).toBeTruthy();
        expect(step.description.length).toBeGreaterThan(0);
      }
    });

    it('should track comparisons', () => {
      const graph = createTriangleGraph();
      const steps = generateDijkstraSteps(graph, 'A');

      const finalStep = steps[steps.length - 1];
      expect(finalStep.meta.comparisons).toBeGreaterThan(0);
    });
  });

  describe('visited set', () => {
    it('should mark all reachable nodes as visited', () => {
      const graph = createSimpleGraph();
      const steps = generateDijkstraSteps(graph, 'A');

      const finalStep = steps[steps.length - 1];
      const visited = finalStep.snapshot.data.visited;

      expect(visited.has('A')).toBe(true);
      expect(visited.has('B')).toBe(true);
      expect(visited.has('C')).toBe(true);
    });

    it('should not visit disconnected nodes', () => {
      const graph = createDisconnectedGraph();
      const steps = generateDijkstraSteps(graph, 'A');

      const finalStep = steps[steps.length - 1];
      const visited = finalStep.snapshot.data.visited;

      expect(visited.has('C')).toBe(false);
    });
  });
});
