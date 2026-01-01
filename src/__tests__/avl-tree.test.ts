/**
 * AVL Tree Visualizer Tests
 */

import { describe, it, expect } from 'vitest';

// We need to create a minimal AVL structure for testing
interface TestAVLNode {
  id: string;
  value: number;
  height: number;
  balanceFactor: number;
  left: TestAVLNode | null;
  right: TestAVLNode | null;
  state: 'default';
}

interface TestAVLData {
  root: TestAVLNode | null;
  values: number[];
}

// Import the actual step generators
// Note: We need to import after defining types to use the module's exports
import { generateInsertSteps, generateSearchSteps } from '../visualizers/avl-tree';

function createEmptyAVL(): TestAVLData {
  return {
    root: null,
    values: [],
  };
}

function createBalancedAVL(): TestAVLData {
  // Create a simple balanced tree:
  //       30
  //      /  \
  //    20    40
  const root: TestAVLNode = {
    id: 'root',
    value: 30,
    height: 2,
    balanceFactor: 0,
    left: {
      id: 'left',
      value: 20,
      height: 1,
      balanceFactor: 0,
      left: null,
      right: null,
      state: 'default',
    },
    right: {
      id: 'right',
      value: 40,
      height: 1,
      balanceFactor: 0,
      left: null,
      right: null,
      state: 'default',
    },
    state: 'default',
  };

  return {
    root,
    values: [20, 30, 40],
  };
}

function createUnbalancedRightAVL(): TestAVLData {
  // Create a right-heavy tree that will trigger left rotation:
  //    10
  //      \
  //       20
  const root: TestAVLNode = {
    id: 'root',
    value: 10,
    height: 2,
    balanceFactor: -1,
    left: null,
    right: {
      id: 'right',
      value: 20,
      height: 1,
      balanceFactor: 0,
      left: null,
      right: null,
      state: 'default',
    },
    state: 'default',
  };

  return {
    root,
    values: [10, 20],
  };
}

describe('AVL Tree Visualizer', () => {
  describe('generateInsertSteps', () => {
    it('should insert into empty tree', () => {
      const avl = createEmptyAVL();
      const steps = generateInsertSteps(avl, 50);

      expect(steps.length).toBeGreaterThan(0);

      const finalStep = steps[steps.length - 1];
      expect(finalStep.snapshot.data.root).not.toBeNull();
      expect(finalStep.snapshot.data.root?.value).toBe(50);
    });

    it('should insert smaller value to left', () => {
      const avl = createBalancedAVL();
      const steps = generateInsertSteps(avl, 10);

      // Should have comparison steps showing 10 < 30
      const compareStep = steps.find((s) => s.description.includes('Comparing 10 with'));
      expect(compareStep).toBeDefined();
    });

    it('should insert larger value to right', () => {
      const avl = createBalancedAVL();
      const steps = generateInsertSteps(avl, 50);

      // Should have comparison steps showing 50 > values
      const compareStep = steps.find((s) => s.description.includes('Comparing 50 with'));
      expect(compareStep).toBeDefined();
    });

    it('should trigger rotation on unbalanced insert', () => {
      const avl = createUnbalancedRightAVL();
      // Insert 30 to create RR case
      const steps = generateInsertSteps(avl, 30);

      // Should have a rotation step
      const rotationStep = steps.find(
        (s) => s.description.includes('rotation') || s.description.includes('Rotate')
      );
      expect(rotationStep).toBeDefined();
    });

    it('should handle duplicate value', () => {
      const avl = createBalancedAVL();
      const steps = generateInsertSteps(avl, 30);

      const duplicateStep = steps.find((s) => s.description.includes('already exists'));
      expect(duplicateStep).toBeDefined();
    });
  });

  describe('generateSearchSteps', () => {
    it('should find existing value', () => {
      const avl = createBalancedAVL();
      const steps = generateSearchSteps(avl, 20);

      const foundStep = steps.find((s) => s.description.includes('Found'));
      expect(foundStep).toBeDefined();
    });

    it('should report when value not found', () => {
      const avl = createBalancedAVL();
      const steps = generateSearchSteps(avl, 99);

      const notFoundStep = steps.find((s) => s.description.includes('not found'));
      expect(notFoundStep).toBeDefined();
    });

    it('should track comparisons during search', () => {
      const avl = createBalancedAVL();
      const steps = generateSearchSteps(avl, 40);

      const finalStep = steps[steps.length - 1];
      expect(finalStep.meta.comparisons).toBeGreaterThan(0);
    });

    it('should handle empty tree', () => {
      const avl = createEmptyAVL();
      const steps = generateSearchSteps(avl, 10);

      const notFoundStep = steps.find((s) => s.description.includes('not found'));
      expect(notFoundStep).toBeDefined();
    });
  });

  describe('step metadata', () => {
    it('should have unique sequential step ids', () => {
      const avl = createBalancedAVL();
      const steps = generateInsertSteps(avl, 15);

      for (let i = 0; i < steps.length; i++) {
        expect(steps[i].id).toBe(i);
      }
    });

    it('should have descriptions for all steps', () => {
      const avl = createBalancedAVL();
      const steps = generateSearchSteps(avl, 30);

      for (const step of steps) {
        expect(step.description).toBeTruthy();
        expect(step.description.length).toBeGreaterThan(0);
      }
    });
  });
});
