/**
 * Linked List Visualizer Tests
 * Tests the step generation logic for linked list delete-by-value operation
 */

import { describe, it, expect } from 'vitest';
import { generateDeleteByValueSteps, generateInsertAtTailSteps } from '../visualizers/linked-list';
import type { LinkedListNode } from '../core/types';

const createList = (values: number[]): LinkedListNode<number>[] =>
  values.map((value, index) => ({
    id: `node-${index}`,
    value,
    state: 'default' as const,
  }));

describe('generateDeleteByValueSteps', () => {
  it('should delete first occurrence of value', () => {
    const nodes = createList([1, 2, 3, 4, 5]);
    const steps = generateDeleteByValueSteps(nodes, 3);

    const finalStep = steps[steps.length - 1];
    const values = finalStep.snapshot.data.nodes.map((n) => n.value);

    expect(values).toEqual([1, 2, 4, 5]);
  });

  it('should delete head node correctly', () => {
    const nodes = createList([1, 2, 3]);
    const steps = generateDeleteByValueSteps(nodes, 1);

    const finalStep = steps[steps.length - 1];
    const values = finalStep.snapshot.data.nodes.map((n) => n.value);

    expect(values).toEqual([2, 3]);
  });

  it('should delete tail node correctly', () => {
    const nodes = createList([1, 2, 3]);
    const steps = generateDeleteByValueSteps(nodes, 3);

    const finalStep = steps[steps.length - 1];
    const values = finalStep.snapshot.data.nodes.map((n) => n.value);

    expect(values).toEqual([1, 2]);
  });

  it('should handle single node list', () => {
    const nodes = createList([42]);
    const steps = generateDeleteByValueSteps(nodes, 42);

    const finalStep = steps[steps.length - 1];
    expect(finalStep.snapshot.data.nodes).toEqual([]);
  });

  it('should handle empty list', () => {
    const nodes = createList([]);
    const steps = generateDeleteByValueSteps(nodes, 1);

    const finalStep = steps[steps.length - 1];
    expect(finalStep.description).toContain('empty');
    expect(finalStep.snapshot.data.nodes).toEqual([]);
  });

  it('should handle value not found', () => {
    const nodes = createList([1, 2, 3]);
    const steps = generateDeleteByValueSteps(nodes, 99);

    const finalStep = steps[steps.length - 1];
    expect(finalStep.description).toContain('not found');
    // List should remain unchanged
    expect(finalStep.snapshot.data.nodes.length).toBe(3);
  });

  it('should show search traversal steps', () => {
    const nodes = createList([1, 2, 3, 4]);
    const steps = generateDeleteByValueSteps(nodes, 3);

    // Should have steps showing nodes being checked as 'current'
    const searchSteps = steps.filter((s) =>
      s.snapshot.data.nodes.some((n) => n.state === 'current')
    );

    expect(searchSteps.length).toBeGreaterThan(0);
  });

  it('should show deleting state before removal', () => {
    const nodes = createList([1, 2, 3]);
    const steps = generateDeleteByValueSteps(nodes, 2);

    const deletingStep = steps.find((s) =>
      s.snapshot.data.nodes.some((n) => n.state === 'deleting')
    );

    expect(deletingStep).toBeDefined();
    expect(deletingStep?.snapshot.data.nodes.find((n) => n.state === 'deleting')?.value).toBe(2);
  });

  it('should track reads during search', () => {
    const nodes = createList([1, 2, 3, 4, 5]);
    const steps = generateDeleteByValueSteps(nodes, 4);

    const maxReads = Math.max(...steps.map((s) => s.meta.reads));
    expect(maxReads).toBeGreaterThanOrEqual(4); // Should read at least 4 nodes
  });

  it('should track writes during deletion', () => {
    const nodes = createList([1, 2, 3]);
    const steps = generateDeleteByValueSteps(nodes, 2);

    const stepsWithWrites = steps.filter((s) => s.meta.writes > 0);
    expect(stepsWithWrites.length).toBeGreaterThan(0);
  });

  it('should only delete first occurrence in list with duplicates', () => {
    const nodes = createList([1, 2, 2, 3]);
    const steps = generateDeleteByValueSteps(nodes, 2);

    const finalStep = steps[steps.length - 1];
    const values = finalStep.snapshot.data.nodes.map((n) => n.value);

    // Should only remove first 2, leaving one 2 behind
    expect(values).toEqual([1, 2, 3]);
  });

  it('should describe found value in step', () => {
    const nodes = createList([1, 2, 3]);
    const steps = generateDeleteByValueSteps(nodes, 2);

    const foundStep = steps.find((s) => s.description.includes('Found'));
    expect(foundStep?.description).toContain('2');
  });
});

describe('generateInsertAtTailSteps', () => {
  it('should insert into empty list', () => {
    const nodes = createList([]);
    const steps = generateInsertAtTailSteps(nodes, 42);

    const finalStep = steps[steps.length - 1];
    const values = finalStep.snapshot.data.nodes.map((n) => n.value);

    expect(values).toEqual([42]);
  });

  it('should insert at tail of existing list', () => {
    const nodes = createList([1, 2, 3]);
    const steps = generateInsertAtTailSteps(nodes, 4);

    const finalStep = steps[steps.length - 1];
    const values = finalStep.snapshot.data.nodes.map((n) => n.value);

    expect(values).toEqual([1, 2, 3, 4]);
  });
});
