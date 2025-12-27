/**
 * Bubble Sort Visualizer Tests
 * Tests the step generation logic for bubble sort algorithm
 */

import { describe, it, expect } from 'vitest';
import { generateBubbleSortSteps } from '../visualizers/bubble-sort';

describe('generateBubbleSortSteps', () => {
  it('should return steps that end with a sorted array', () => {
    const input = [5, 3, 8, 4, 2];
    const steps = generateBubbleSortSteps(input);

    // Get the final step
    const finalStep = steps[steps.length - 1];
    const sortedValues = finalStep.snapshot.data.elements.map((e) => e.value);

    expect(sortedValues).toEqual([2, 3, 4, 5, 8]);
  });

  it('should handle an already sorted array', () => {
    const input = [1, 2, 3, 4, 5];
    const steps = generateBubbleSortSteps(input);

    const finalStep = steps[steps.length - 1];
    const sortedValues = finalStep.snapshot.data.elements.map((e) => e.value);

    expect(sortedValues).toEqual([1, 2, 3, 4, 5]);
  });

  it('should handle a reverse sorted array', () => {
    const input = [5, 4, 3, 2, 1];
    const steps = generateBubbleSortSteps(input);

    const finalStep = steps[steps.length - 1];
    const sortedValues = finalStep.snapshot.data.elements.map((e) => e.value);

    expect(sortedValues).toEqual([1, 2, 3, 4, 5]);
  });

  it('should handle an array with single element', () => {
    const input = [42];
    const steps = generateBubbleSortSteps(input);

    const finalStep = steps[steps.length - 1];
    expect(finalStep.snapshot.data.elements[0].value).toBe(42);
  });

  it('should handle an empty array', () => {
    const input: number[] = [];
    const steps = generateBubbleSortSteps(input);

    const finalStep = steps[steps.length - 1];
    expect(finalStep.snapshot.data.elements).toEqual([]);
  });

  it('should mark all elements as sorted in final step', () => {
    const input = [3, 1, 4];
    const steps = generateBubbleSortSteps(input);

    const finalStep = steps[steps.length - 1];
    const allSorted = finalStep.snapshot.data.elements.every((e) => e.state === 'sorted');

    expect(allSorted).toBe(true);
  });

  it('should track comparisons correctly', () => {
    const input = [3, 1, 2];
    const steps = generateBubbleSortSteps(input);

    // Find steps with comparisons tracked
    const stepsWithComparisons = steps.filter((s) => s.meta.comparisons > 0);
    expect(stepsWithComparisons.length).toBeGreaterThan(0);
  });

  it('should track swaps correctly when swaps occur', () => {
    const input = [3, 1]; // Will swap
    const steps = generateBubbleSortSteps(input);

    const stepsWithSwaps = steps.filter((s) => s.meta.swaps > 0);
    expect(stepsWithSwaps.length).toBeGreaterThan(0);
  });

  it('should include step descriptions', () => {
    const input = [2, 1];
    const steps = generateBubbleSortSteps(input);

    expect(steps.every((s) => s.description.length > 0)).toBe(true);
  });

  it('should assign unique step IDs', () => {
    const input = [4, 2, 7, 1];
    const steps = generateBubbleSortSteps(input);

    const ids = steps.map((s) => s.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });
});
