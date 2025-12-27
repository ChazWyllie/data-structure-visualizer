/**
 * Binary Search Tree Visualizer Tests
 * Tests the step generation logic for BST operations
 */

import { describe, it, expect } from 'vitest';
import {
  generateInsertSteps,
  generateSearchSteps,
  generateInorderSteps,
} from '../visualizers/binary-search-tree';
import type { BSTNode } from '../visualizers/binary-search-tree';

// Helper to build a BST from values
function buildBST(values: number[]): BSTNode | null {
  let root: BSTNode | null = null;

  function insert(node: BSTNode | null, value: number): BSTNode {
    if (!node) {
      return { value, left: null, right: null };
    }
    if (value < node.value) {
      node.left = insert(node.left, value);
    } else if (value > node.value) {
      node.right = insert(node.right, value);
    }
    return node;
  }

  for (const v of values) {
    root = insert(root, v);
  }
  return root;
}

// =============================================================================
// Insert Tests
// =============================================================================

describe('generateInsertSteps', () => {
  it('should insert into empty tree', () => {
    const steps = generateInsertSteps(null, 50);

    expect(steps.length).toBeGreaterThan(1);
    const finalStep = steps[steps.length - 1];
    expect(finalStep.snapshot.data.root).not.toBeNull();
    expect(finalStep.snapshot.data.root?.value).toBe(50);
    expect(finalStep.description).toContain('Successfully inserted');
  });

  it('should insert left when value is smaller', () => {
    const root = buildBST([50]);
    const steps = generateInsertSteps(root, 30);

    // Should have comparison step saying "go left"
    const goLeftStep = steps.find((s) => s.description.includes('go left'));
    expect(goLeftStep).toBeDefined();

    const finalStep = steps[steps.length - 1];
    expect(finalStep.description).toContain('Successfully inserted 30');
  });

  it('should insert right when value is larger', () => {
    const root = buildBST([50]);
    const steps = generateInsertSteps(root, 70);

    // Should have comparison step saying "go right"
    const goRightStep = steps.find((s) => s.description.includes('go right'));
    expect(goRightStep).toBeDefined();

    const finalStep = steps[steps.length - 1];
    expect(finalStep.description).toContain('Successfully inserted 70');
  });

  it('should traverse multiple levels for deep insert', () => {
    const root = buildBST([50, 30, 70]);
    const steps = generateInsertSteps(root, 20);

    // Should go left twice: 50 -> 30 -> insert at 30's left
    const goLeftSteps = steps.filter((s) => s.description.includes('go left'));
    expect(goLeftSteps.length).toBe(2);

    const finalStep = steps[steps.length - 1];
    expect(finalStep.description).toContain('Successfully inserted 20');
  });

  it('should handle duplicate values', () => {
    const root = buildBST([50, 30, 70]);
    const steps = generateInsertSteps(root, 50);

    const duplicateStep = steps.find((s) => s.description.includes('already exists'));
    expect(duplicateStep).toBeDefined();
  });

  it('should track comparison count', () => {
    const root = buildBST([50, 30, 70, 20, 40]);
    const steps = generateInsertSteps(root, 25);

    // Path: 50 -> 30 -> 20 -> insert
    // Should have at least 3 comparisons
    const finalStep = steps[steps.length - 1];
    expect(finalStep.meta.comparisons).toBeGreaterThanOrEqual(3);
  });
});

// =============================================================================
// Search Tests
// =============================================================================

describe('generateSearchSteps', () => {
  it('should find existing value at root', () => {
    const root = buildBST([50, 30, 70]);
    const steps = generateSearchSteps(root, 50);

    const foundStep = steps.find((s) => s.description.includes('Found'));
    expect(foundStep).toBeDefined();
    expect(foundStep?.snapshot.data.message).toBe('Found!');
  });

  it('should find existing value in left subtree', () => {
    const root = buildBST([50, 30, 70, 20, 40]);
    const steps = generateSearchSteps(root, 20);

    const foundStep = steps.find((s) => s.description.includes('Found 20'));
    expect(foundStep).toBeDefined();
  });

  it('should find existing value in right subtree', () => {
    const root = buildBST([50, 30, 70, 60, 80]);
    const steps = generateSearchSteps(root, 80);

    const foundStep = steps.find((s) => s.description.includes('Found 80'));
    expect(foundStep).toBeDefined();
  });

  it('should handle value not found', () => {
    const root = buildBST([50, 30, 70]);
    const steps = generateSearchSteps(root, 25);

    const notFoundStep = steps.find((s) => s.description.includes('not found'));
    expect(notFoundStep).toBeDefined();
    expect(notFoundStep?.snapshot.data.message).toBe('Not found');
  });

  it('should handle search in empty tree', () => {
    const steps = generateSearchSteps(null, 50);

    expect(steps.length).toBe(2);
    const finalStep = steps[steps.length - 1];
    expect(finalStep.description).toContain('empty');
    expect(finalStep.description).toContain('not found');
  });

  it('should track comparison count during search', () => {
    const root = buildBST([50, 30, 70, 20, 40, 60, 80]);
    const steps = generateSearchSteps(root, 80);

    // Path: 50 -> 70 -> 80 (3 comparisons)
    const foundStep = steps.find((s) => s.description.includes('Found'));
    expect(foundStep?.meta.comparisons).toBe(3);
  });
});

// =============================================================================
// Inorder Traversal Tests
// =============================================================================

describe('generateInorderSteps', () => {
  it('should visit nodes in sorted order', () => {
    const root = buildBST([50, 30, 70, 20, 40, 60, 80]);
    const steps = generateInorderSteps(root);

    const finalStep = steps[steps.length - 1];
    expect(finalStep.description).toContain('20, 30, 40, 50, 60, 70, 80');
  });

  it('should handle single node tree', () => {
    const root = buildBST([42]);
    const steps = generateInorderSteps(root);

    const finalStep = steps[steps.length - 1];
    expect(finalStep.description).toContain('42');
  });

  it('should handle empty tree', () => {
    const steps = generateInorderSteps(null);

    expect(steps.length).toBe(2);
    const finalStep = steps[steps.length - 1];
    expect(finalStep.description).toContain('empty');
  });

  it('should handle left-skewed tree', () => {
    const root = buildBST([50, 40, 30, 20, 10]);
    const steps = generateInorderSteps(root);

    const finalStep = steps[steps.length - 1];
    expect(finalStep.description).toContain('10, 20, 30, 40, 50');
  });

  it('should handle right-skewed tree', () => {
    const root = buildBST([10, 20, 30, 40, 50]);
    const steps = generateInorderSteps(root);

    const finalStep = steps[steps.length - 1];
    expect(finalStep.description).toContain('10, 20, 30, 40, 50');
  });

  it('should create a step for each node visited', () => {
    const root = buildBST([50, 30, 70]);
    const steps = generateInorderSteps(root);

    // Should have: initial + 3 visit steps + final = 5 steps
    // Actually: initial + node visits + final
    const visitSteps = steps.filter((s) => s.description.includes('Visit node'));
    expect(visitSteps.length).toBe(3);
  });

  it('should track reads counter', () => {
    const root = buildBST([50, 30, 70, 20, 40]);
    const steps = generateInorderSteps(root);

    const finalStep = steps[steps.length - 1];
    expect(finalStep.meta.reads).toBe(5);
  });
});
