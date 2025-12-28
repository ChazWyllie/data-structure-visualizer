/**
 * Heap Sort Visualizer Tests
 */

import { describe, it, expect } from 'vitest';
import { generateHeapSortSteps } from '../visualizers/heap-sort';

describe('generateHeapSortSteps', () => {
  it('should return steps that end with a sorted array', () => {
    const input = [5, 3, 8, 4, 2];
    const steps = generateHeapSortSteps(input);
    const finalStep = steps[steps.length - 1];
    const sortedValues = finalStep.snapshot.data.elements.map((e) => e.value);
    expect(sortedValues).toEqual([2, 3, 4, 5, 8]);
  });

  it('should handle an already sorted array', () => {
    const input = [1, 2, 3, 4, 5];
    const steps = generateHeapSortSteps(input);
    const finalStep = steps[steps.length - 1];
    const sortedValues = finalStep.snapshot.data.elements.map((e) => e.value);
    expect(sortedValues).toEqual([1, 2, 3, 4, 5]);
  });

  it('should handle a reverse sorted array', () => {
    const input = [5, 4, 3, 2, 1];
    const steps = generateHeapSortSteps(input);
    const finalStep = steps[steps.length - 1];
    const sortedValues = finalStep.snapshot.data.elements.map((e) => e.value);
    expect(sortedValues).toEqual([1, 2, 3, 4, 5]);
  });

  it('should handle single element array', () => {
    const input = [42];
    const steps = generateHeapSortSteps(input);
    const finalStep = steps[steps.length - 1];
    expect(finalStep.snapshot.data.elements[0].value).toBe(42);
  });

  it('should handle empty array', () => {
    const input: number[] = [];
    const steps = generateHeapSortSteps(input);
    const finalStep = steps[steps.length - 1];
    expect(finalStep.snapshot.data.elements).toEqual([]);
  });

  it('should mark all elements as sorted in final step', () => {
    const input = [3, 1, 4];
    const steps = generateHeapSortSteps(input);
    const finalStep = steps[steps.length - 1];
    const allSorted = finalStep.snapshot.data.elements.every((e) => e.state === 'sorted');
    expect(allSorted).toBe(true);
  });

  it('should track comparisons', () => {
    const input = [3, 1, 2];
    const steps = generateHeapSortSteps(input);
    const stepsWithComparisons = steps.filter((s) => s.meta.comparisons > 0);
    expect(stepsWithComparisons.length).toBeGreaterThan(0);
  });

  it('should assign unique step IDs', () => {
    const input = [4, 2, 7, 1];
    const steps = generateHeapSortSteps(input);
    const ids = steps.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should handle array with duplicates', () => {
    const input = [3, 1, 3, 2, 1];
    const steps = generateHeapSortSteps(input);
    const finalStep = steps[steps.length - 1];
    const sortedValues = finalStep.snapshot.data.elements.map((e) => e.value);
    expect(sortedValues).toEqual([1, 1, 2, 3, 3]);
  });
});
