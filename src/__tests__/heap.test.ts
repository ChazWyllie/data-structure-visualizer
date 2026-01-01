/**
 * Heap / Priority Queue Visualizer Tests
 */

import { describe, it, expect } from 'vitest';
import {
  generatePushSteps,
  generatePopSteps,
  generatePeekSteps,
  generateHeapifySteps,
} from '../visualizers/heap';

describe('Heap Visualizer', () => {
  describe('generatePushSteps', () => {
    it('should push value into empty heap', () => {
      const elements: { value: number; state: 'default' }[] = [];
      const steps = generatePushSteps(elements, 50, 'max');

      expect(steps.length).toBeGreaterThan(0);
      const finalStep = steps[steps.length - 1];
      expect(finalStep.snapshot.data.elements).toHaveLength(1);
      expect(finalStep.snapshot.data.elements[0].value).toBe(50);
    });

    it('should maintain max-heap property after push', () => {
      const elements = [
        { value: 50, state: 'default' as const },
        { value: 30, state: 'default' as const },
        { value: 40, state: 'default' as const },
      ];
      const steps = generatePushSteps(elements, 60, 'max');

      const finalStep = steps[steps.length - 1];
      const heap = finalStep.snapshot.data.elements;

      // Max-heap: parent >= children
      expect(heap[0].value).toBe(60); // 60 should bubble up to root
    });

    it('should maintain min-heap property after push', () => {
      const elements = [
        { value: 10, state: 'default' as const },
        { value: 30, state: 'default' as const },
        { value: 20, state: 'default' as const },
      ];
      const steps = generatePushSteps(elements, 5, 'min');

      const finalStep = steps[steps.length - 1];
      const heap = finalStep.snapshot.data.elements;

      // Min-heap: parent <= children
      expect(heap[0].value).toBe(5); // 5 should bubble up to root
    });

    it('should track comparisons and swaps', () => {
      const elements = [
        { value: 50, state: 'default' as const },
        { value: 30, state: 'default' as const },
        { value: 40, state: 'default' as const },
      ];
      const steps = generatePushSteps(elements, 60, 'max');

      const finalStep = steps[steps.length - 1];
      expect(finalStep.meta.comparisons).toBeGreaterThan(0);
      expect(finalStep.meta.swaps).toBeGreaterThan(0);
    });

    it('should not bubble up if value is in correct position', () => {
      const elements = [
        { value: 50, state: 'default' as const },
        { value: 30, state: 'default' as const },
        { value: 40, state: 'default' as const },
      ];
      const steps = generatePushSteps(elements, 10, 'max');

      const finalStep = steps[steps.length - 1];
      // 10 is smaller than parent 30, so no swaps needed (stays at end)
      expect(finalStep.meta.swaps).toBe(0);
    });
  });

  describe('generatePopSteps', () => {
    it('should handle empty heap', () => {
      const elements: { value: number; state: 'default' }[] = [];
      const steps = generatePopSteps(elements, 'max');

      expect(steps).toHaveLength(1);
      expect(steps[0].description).toContain('empty');
    });

    it('should handle single element heap', () => {
      const elements = [{ value: 50, state: 'default' as const }];
      const steps = generatePopSteps(elements, 'max');

      const finalStep = steps[steps.length - 1];
      expect(finalStep.snapshot.data.elements).toHaveLength(0);
    });

    it('should maintain max-heap property after pop', () => {
      const elements = [
        { value: 50, state: 'default' as const },
        { value: 30, state: 'default' as const },
        { value: 40, state: 'default' as const },
        { value: 10, state: 'default' as const },
        { value: 20, state: 'default' as const },
      ];
      const steps = generatePopSteps(elements, 'max');

      const finalStep = steps[steps.length - 1];
      const heap = finalStep.snapshot.data.elements;

      // After removing 50, new root should be 40 (next largest)
      expect(heap[0].value).toBe(40);
      // Heap should have 4 elements
      expect(heap).toHaveLength(4);
    });

    it('should maintain min-heap property after pop', () => {
      const elements = [
        { value: 10, state: 'default' as const },
        { value: 30, state: 'default' as const },
        { value: 20, state: 'default' as const },
        { value: 50, state: 'default' as const },
        { value: 40, state: 'default' as const },
      ];
      const steps = generatePopSteps(elements, 'min');

      const finalStep = steps[steps.length - 1];
      const heap = finalStep.snapshot.data.elements;

      // After removing 10, new root should be 20 (next smallest)
      expect(heap[0].value).toBe(20);
    });
  });

  describe('generatePeekSteps', () => {
    it('should handle empty heap', () => {
      const elements: { value: number; state: 'default' }[] = [];
      const steps = generatePeekSteps(elements, 'max');

      expect(steps).toHaveLength(1);
      expect(steps[0].description).toContain('empty');
    });

    it('should show root value without modifying heap', () => {
      const elements = [
        { value: 50, state: 'default' as const },
        { value: 30, state: 'default' as const },
      ];
      const steps = generatePeekSteps(elements, 'max');

      expect(steps).toHaveLength(1);
      expect(steps[0].description).toContain('50');
      expect(steps[0].snapshot.data.elements[0].state).toBe('current');
    });
  });

  describe('generateHeapifySteps', () => {
    it('should build max-heap from unsorted array', () => {
      const values = [3, 1, 4, 1, 5, 9, 2, 6];
      const steps = generateHeapifySteps(values, 'max');

      const finalStep = steps[steps.length - 1];
      const heap = finalStep.snapshot.data.elements;

      // Max-heap property: parent >= children for all nodes
      for (let i = 0; i < heap.length; i++) {
        const leftIdx = 2 * i + 1;
        const rightIdx = 2 * i + 2;

        if (leftIdx < heap.length) {
          expect(heap[i].value).toBeGreaterThanOrEqual(heap[leftIdx].value);
        }
        if (rightIdx < heap.length) {
          expect(heap[i].value).toBeGreaterThanOrEqual(heap[rightIdx].value);
        }
      }
    });

    it('should build min-heap from unsorted array', () => {
      const values = [3, 1, 4, 1, 5, 9, 2, 6];
      const steps = generateHeapifySteps(values, 'min');

      const finalStep = steps[steps.length - 1];
      const heap = finalStep.snapshot.data.elements;

      // Min-heap property: parent <= children for all nodes
      for (let i = 0; i < heap.length; i++) {
        const leftIdx = 2 * i + 1;
        const rightIdx = 2 * i + 2;

        if (leftIdx < heap.length) {
          expect(heap[i].value).toBeLessThanOrEqual(heap[leftIdx].value);
        }
        if (rightIdx < heap.length) {
          expect(heap[i].value).toBeLessThanOrEqual(heap[rightIdx].value);
        }
      }
    });

    it('should handle already heapified array', () => {
      const values = [9, 5, 6, 2, 3];
      const steps = generateHeapifySteps(values, 'max');

      const finalStep = steps[steps.length - 1];
      // Should still produce valid heap
      expect(finalStep.snapshot.data.elements[0].value).toBe(9);
    });

    it('should handle single element', () => {
      const values = [42];
      const steps = generateHeapifySteps(values, 'max');

      const finalStep = steps[steps.length - 1];
      expect(finalStep.snapshot.data.elements).toHaveLength(1);
      expect(finalStep.snapshot.data.elements[0].value).toBe(42);
    });

    it('should handle empty array', () => {
      const values: number[] = [];
      const steps = generateHeapifySteps(values, 'max');

      expect(steps.length).toBeGreaterThan(0);
      const finalStep = steps[steps.length - 1];
      expect(finalStep.snapshot.data.elements).toHaveLength(0);
    });
  });

  describe('step metadata', () => {
    it('should have unique sequential step ids', () => {
      const values = [5, 3, 8, 1, 2];
      const steps = generateHeapifySteps(values, 'max');

      for (let i = 0; i < steps.length; i++) {
        expect(steps[i].id).toBe(i);
      }
    });

    it('should have descriptions for all steps', () => {
      const elements = [{ value: 50, state: 'default' as const }];
      const steps = generatePushSteps(elements, 25, 'max');

      for (const step of steps) {
        expect(step.description).toBeTruthy();
        expect(step.description.length).toBeGreaterThan(0);
      }
    });
  });
});
