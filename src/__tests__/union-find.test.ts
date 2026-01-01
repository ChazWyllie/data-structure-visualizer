/**
 * Union-Find (Disjoint Set Union) Visualizer Tests
 */

import { describe, it, expect } from 'vitest';
import {
  generateMakeSetSteps,
  generateFindSteps,
  generateUnionSteps,
  generateConnectedSteps,
} from '../visualizers/union-find';

type NodeState = 'default' | 'current' | 'root' | 'path' | 'merged' | 'found';

interface DSUNode {
  id: number;
  parent: number;
  rank: number;
  state: NodeState;
}

function createInitialNodes(): DSUNode[] {
  return [
    { id: 0, parent: 0, rank: 0, state: 'default' },
    { id: 1, parent: 1, rank: 0, state: 'default' },
    { id: 2, parent: 2, rank: 0, state: 'default' },
    { id: 3, parent: 3, rank: 0, state: 'default' },
  ];
}

describe('Union-Find Visualizer', () => {
  describe('generateMakeSetSteps', () => {
    it('should create a new set with element pointing to itself', () => {
      const nodes: DSUNode[] = [];
      const steps = generateMakeSetSteps(nodes, 5);

      expect(steps.length).toBeGreaterThan(0);
      const finalStep = steps[steps.length - 1];
      expect(finalStep.snapshot.data.nodes).toHaveLength(1);
      expect(finalStep.snapshot.data.nodes[0].id).toBe(5);
      expect(finalStep.snapshot.data.nodes[0].parent).toBe(5);
      expect(finalStep.snapshot.data.nodes[0].rank).toBe(0);
    });

    it('should not create duplicate elements', () => {
      const nodes: DSUNode[] = [{ id: 5, parent: 5, rank: 0, state: 'default' }];
      const steps = generateMakeSetSteps(nodes, 5);

      expect(steps).toHaveLength(1);
      expect(steps[0].description).toContain('already exists');
    });
  });

  describe('generateFindSteps', () => {
    it('should find root of element that is its own parent', () => {
      const nodes = createInitialNodes();
      const steps = generateFindSteps(nodes, 0);

      const finalStep = steps[steps.length - 1];
      expect(finalStep.description).toContain('Find(0)');
      expect(finalStep.description).toContain('0'); // Root is 0
    });

    it('should find root through parent chain', () => {
      const nodes: DSUNode[] = [
        { id: 0, parent: 0, rank: 1, state: 'default' },
        { id: 1, parent: 0, rank: 0, state: 'default' }, // 1's parent is 0
        { id: 2, parent: 1, rank: 0, state: 'default' }, // 2's parent is 1
      ];
      const steps = generateFindSteps(nodes, 2);

      const finalStep = steps[steps.length - 1];
      expect(finalStep.description).toContain('Find(2)');
      expect(finalStep.description).toContain('0'); // Root should be 0
    });

    it('should apply path compression', () => {
      const nodes: DSUNode[] = [
        { id: 0, parent: 0, rank: 2, state: 'default' },
        { id: 1, parent: 0, rank: 1, state: 'default' },
        { id: 2, parent: 1, rank: 0, state: 'default' }, // Chain: 2 -> 1 -> 0
      ];
      const steps = generateFindSteps(nodes, 2);

      // After path compression, 2 should point directly to 0
      const finalNodes = steps[steps.length - 1].snapshot.data.nodes;
      const node2 = finalNodes.find((n) => n.id === 2);
      expect(node2?.parent).toBe(0);
    });

    it('should handle element not found', () => {
      const nodes = createInitialNodes();
      const steps = generateFindSteps(nodes, 99);

      expect(steps).toHaveLength(1);
      expect(steps[0].description).toContain('not found');
    });
  });

  describe('generateUnionSteps', () => {
    it('should union two separate sets', () => {
      const nodes = createInitialNodes();
      const steps = generateUnionSteps(nodes, 0, 1);

      const finalStep = steps[steps.length - 1];
      expect(finalStep.description).toContain('Union complete');

      // Either 0 or 1 should be the root
      const finalNodes = finalStep.snapshot.data.nodes;
      const node0 = finalNodes.find((n) => n.id === 0)!;
      const node1 = finalNodes.find((n) => n.id === 1)!;

      // One should point to the other
      expect(node0.parent === 1 || node1.parent === 0).toBe(true);
    });

    it('should not modify if already in same set', () => {
      const nodes: DSUNode[] = [
        { id: 0, parent: 0, rank: 1, state: 'default' },
        { id: 1, parent: 0, rank: 0, state: 'default' },
      ];
      const steps = generateUnionSteps(nodes, 0, 1);

      const finalStep = steps[steps.length - 1];
      expect(finalStep.description).toContain('already in the same set');
    });

    it('should union by rank - lower rank attaches to higher', () => {
      const nodes: DSUNode[] = [
        { id: 0, parent: 0, rank: 2, state: 'default' },
        { id: 1, parent: 1, rank: 0, state: 'default' },
      ];
      const steps = generateUnionSteps(nodes, 0, 1);

      const finalStep = steps[steps.length - 1];
      const finalNodes = finalStep.snapshot.data.nodes;
      const node1 = finalNodes.find((n) => n.id === 1)!;

      // 1 should point to 0 (higher rank)
      expect(node1.parent).toBe(0);
    });

    it('should increment rank when unioning equal ranks', () => {
      const nodes: DSUNode[] = [
        { id: 0, parent: 0, rank: 0, state: 'default' },
        { id: 1, parent: 1, rank: 0, state: 'default' },
      ];
      const steps = generateUnionSteps(nodes, 0, 1);

      const finalStep = steps[steps.length - 1];
      const finalNodes = finalStep.snapshot.data.nodes;
      const node0 = finalNodes.find((n) => n.id === 0)!;

      // One of them should have rank 1 now
      expect(node0.rank).toBe(1);
    });

    it('should handle element not found', () => {
      const nodes = createInitialNodes();
      const steps = generateUnionSteps(nodes, 0, 99);

      expect(steps).toHaveLength(1);
      expect(steps[0].description).toContain('not found');
    });
  });

  describe('generateConnectedSteps', () => {
    it('should return true for elements in same set', () => {
      const nodes: DSUNode[] = [
        { id: 0, parent: 0, rank: 1, state: 'default' },
        { id: 1, parent: 0, rank: 0, state: 'default' },
      ];
      const steps = generateConnectedSteps(nodes, 0, 1);

      const finalStep = steps[steps.length - 1];
      expect(finalStep.description).toContain('Yes');
      expect(finalStep.description).toContain('connected');
    });

    it('should return false for elements in different sets', () => {
      const nodes = createInitialNodes();
      const steps = generateConnectedSteps(nodes, 0, 1);

      const finalStep = steps[steps.length - 1];
      expect(finalStep.description).toContain('No');
      expect(finalStep.description).toContain('different sets');
    });

    it('should handle element not found', () => {
      const nodes = createInitialNodes();
      const steps = generateConnectedSteps(nodes, 0, 99);

      expect(steps).toHaveLength(1);
      expect(steps[0].description).toContain('not found');
    });
  });

  describe('step metadata', () => {
    it('should have unique sequential step ids', () => {
      const nodes = createInitialNodes();
      const steps = generateUnionSteps(nodes, 0, 1);

      for (let i = 0; i < steps.length; i++) {
        expect(steps[i].id).toBe(i);
      }
    });

    it('should have descriptions for all steps', () => {
      const nodes = createInitialNodes();
      const steps = generateFindSteps(nodes, 0);

      for (const step of steps) {
        expect(step.description).toBeTruthy();
        expect(step.description.length).toBeGreaterThan(0);
      }
    });
  });
});
