/**
 * Queue Visualizer Tests
 * Tests the step generation logic for queue enqueue/dequeue operations
 */

import { describe, it, expect } from 'vitest';
import { generateEnqueueSteps, generateDequeueSteps } from '../visualizers/linear/queue';
import type { QueueElement } from '../core/types';

const createQueue = (values: number[]): QueueElement<number>[] =>
  values.map((value) => ({ value, state: 'default' as const }));

describe('generateEnqueueSteps', () => {
  it('should enqueue element into empty queue', () => {
    const queue = createQueue([]);
    const steps = generateEnqueueSteps(queue, 42, 10);

    const finalStep = steps[steps.length - 1];
    const values = finalStep.snapshot.data.elements.map((e) => e.value);

    expect(values).toEqual([42]);
  });

  it('should enqueue element into non-empty queue', () => {
    const queue = createQueue([1, 2, 3]);
    const steps = generateEnqueueSteps(queue, 4, 10);

    const finalStep = steps[steps.length - 1];
    const values = finalStep.snapshot.data.elements.map((e) => e.value);

    expect(values).toEqual([1, 2, 3, 4]);
  });

  it('should handle queue overflow', () => {
    const queue = createQueue([1, 2, 3]);
    const steps = generateEnqueueSteps(queue, 4, 3); // maxSize is 3

    const finalStep = steps[steps.length - 1];
    expect(finalStep.description).toContain('full');
    expect(finalStep.snapshot.data.elements.length).toBe(3);
  });

  it('should mark new element as rear in final step', () => {
    const queue = createQueue([1, 2]);
    const steps = generateEnqueueSteps(queue, 3, 10);

    const finalStep = steps[steps.length - 1];
    const rearElement =
      finalStep.snapshot.data.elements[finalStep.snapshot.data.elements.length - 1];

    expect(rearElement.value).toBe(3);
    expect(rearElement.state).toBe('rear');
  });

  it('should mark single element as front (not rear)', () => {
    const queue = createQueue([]);
    const steps = generateEnqueueSteps(queue, 1, 10);

    const finalStep = steps[steps.length - 1];
    const onlyElement = finalStep.snapshot.data.elements[0];

    expect(onlyElement.value).toBe(1);
    expect(onlyElement.state).toBe('front');
  });

  it('should track writes correctly', () => {
    const queue = createQueue([]);
    const steps = generateEnqueueSteps(queue, 1, 10);

    const stepsWithWrites = steps.filter((s) => s.meta.writes > 0);
    expect(stepsWithWrites.length).toBeGreaterThan(0);
  });

  it('should show enqueuing state before final state', () => {
    const queue = createQueue([1]);
    const steps = generateEnqueueSteps(queue, 2, 10);

    const enqueuingStep = steps.find((s) =>
      s.snapshot.data.elements.some((e) => e.state === 'enqueuing')
    );

    expect(enqueuingStep).toBeDefined();
  });

  it('should preserve front marker during enqueue', () => {
    const queue = createQueue([1, 2, 3]);
    const steps = generateEnqueueSteps(queue, 4, 10);

    const finalStep = steps[steps.length - 1];
    const frontElement = finalStep.snapshot.data.elements[0];

    expect(frontElement.value).toBe(1);
    expect(frontElement.state).toBe('front');
  });
});

describe('generateDequeueSteps', () => {
  it('should dequeue element from queue', () => {
    const queue = createQueue([1, 2, 3]);
    const steps = generateDequeueSteps(queue, 10);

    const finalStep = steps[steps.length - 1];
    const values = finalStep.snapshot.data.elements.map((e) => e.value);

    expect(values).toEqual([2, 3]);
  });

  it('should dequeue single element to empty queue', () => {
    const queue = createQueue([42]);
    const steps = generateDequeueSteps(queue, 10);

    const finalStep = steps[steps.length - 1];
    expect(finalStep.snapshot.data.elements).toEqual([]);
  });

  it('should handle queue underflow', () => {
    const queue = createQueue([]);
    const steps = generateDequeueSteps(queue, 10);

    const finalStep = steps[steps.length - 1];
    expect(finalStep.description).toContain('empty');
    expect(finalStep.snapshot.data.elements.length).toBe(0);
  });

  it('should mark new front correctly after dequeue', () => {
    const queue = createQueue([1, 2, 3]);
    const steps = generateDequeueSteps(queue, 10);

    const finalStep = steps[steps.length - 1];
    const frontElement = finalStep.snapshot.data.elements[0];

    expect(frontElement.value).toBe(2);
    expect(frontElement.state).toBe('front');
  });

  it('should mark rear correctly after dequeue', () => {
    const queue = createQueue([1, 2, 3]);
    const steps = generateDequeueSteps(queue, 10);

    const finalStep = steps[steps.length - 1];
    const rearElement =
      finalStep.snapshot.data.elements[finalStep.snapshot.data.elements.length - 1];

    expect(rearElement.value).toBe(3);
    expect(rearElement.state).toBe('rear');
  });

  it('should track reads correctly', () => {
    const queue = createQueue([1, 2]);
    const steps = generateDequeueSteps(queue, 10);

    const stepsWithReads = steps.filter((s) => s.meta.reads > 0);
    expect(stepsWithReads.length).toBeGreaterThan(0);
  });

  it('should show dequeuing state before final state', () => {
    const queue = createQueue([1, 2]);
    const steps = generateDequeueSteps(queue, 10);

    const dequeuingStep = steps.find((s) =>
      s.snapshot.data.elements.some((e) => e.state === 'dequeuing')
    );

    expect(dequeuingStep).toBeDefined();
  });

  it('should describe dequeued value correctly', () => {
    const queue = createQueue([10, 20, 30]);
    const steps = generateDequeueSteps(queue, 10);

    const dequeueDescription = steps.find((s) => s.description.includes('Removing'));
    expect(dequeueDescription?.description).toContain('10');
  });

  it('should remove from front (FIFO order)', () => {
    const queue = createQueue([1, 2, 3]);

    // First dequeue
    const firstDequeue = generateDequeueSteps(queue, 10);
    const afterFirst = firstDequeue[firstDequeue.length - 1].snapshot.data.elements;
    expect(afterFirst.map((e) => e.value)).toEqual([2, 3]);

    // Second dequeue from remaining queue
    const secondQueue = afterFirst.map((e) => ({ value: e.value, state: 'default' as const }));
    const secondDequeue = generateDequeueSteps(secondQueue, 10);
    const afterSecond = secondDequeue[secondDequeue.length - 1].snapshot.data.elements;
    expect(afterSecond.map((e) => e.value)).toEqual([3]);
  });
});
