/**
 * Stack Visualizer Tests
 * Tests the step generation logic for stack push/pop operations
 */

import { describe, it, expect } from 'vitest';
import { generatePushSteps, generatePopSteps } from '../visualizers/stack';
import type { StackElement } from '../core/types';

const createStack = (values: number[]): StackElement<number>[] =>
  values.map((value) => ({ value, state: 'default' as const }));

describe('generatePushSteps', () => {
  it('should push element onto empty stack', () => {
    const stack = createStack([]);
    const steps = generatePushSteps(stack, 42, 10);

    const finalStep = steps[steps.length - 1];
    const values = finalStep.snapshot.data.elements.map((e) => e.value);

    expect(values).toEqual([42]);
  });

  it('should push element onto non-empty stack', () => {
    const stack = createStack([1, 2, 3]);
    const steps = generatePushSteps(stack, 4, 10);

    const finalStep = steps[steps.length - 1];
    const values = finalStep.snapshot.data.elements.map((e) => e.value);

    expect(values).toEqual([1, 2, 3, 4]);
  });

  it('should handle stack overflow', () => {
    const stack = createStack([1, 2, 3]);
    const steps = generatePushSteps(stack, 4, 3); // maxSize is 3

    const finalStep = steps[steps.length - 1];
    expect(finalStep.description).toContain('overflow');
    expect(finalStep.snapshot.data.elements.length).toBe(3);
  });

  it('should mark new element as top in final step', () => {
    const stack = createStack([1, 2]);
    const steps = generatePushSteps(stack, 3, 10);

    const finalStep = steps[steps.length - 1];
    const topElement =
      finalStep.snapshot.data.elements[finalStep.snapshot.data.elements.length - 1];

    expect(topElement.value).toBe(3);
    expect(topElement.state).toBe('top');
  });

  it('should track writes correctly', () => {
    const stack = createStack([]);
    const steps = generatePushSteps(stack, 1, 10);

    const stepsWithWrites = steps.filter((s) => s.meta.writes > 0);
    expect(stepsWithWrites.length).toBeGreaterThan(0);
  });

  it('should show pushing state before final state', () => {
    const stack = createStack([1]);
    const steps = generatePushSteps(stack, 2, 10);

    const pushingStep = steps.find((s) =>
      s.snapshot.data.elements.some((e) => e.state === 'pushing')
    );

    expect(pushingStep).toBeDefined();
  });
});

describe('generatePopSteps', () => {
  it('should pop element from stack', () => {
    const stack = createStack([1, 2, 3]);
    const steps = generatePopSteps(stack, 10);

    const finalStep = steps[steps.length - 1];
    const values = finalStep.snapshot.data.elements.map((e) => e.value);

    expect(values).toEqual([1, 2]);
  });

  it('should pop single element to empty stack', () => {
    const stack = createStack([42]);
    const steps = generatePopSteps(stack, 10);

    const finalStep = steps[steps.length - 1];
    expect(finalStep.snapshot.data.elements).toEqual([]);
  });

  it('should handle stack underflow', () => {
    const stack = createStack([]);
    const steps = generatePopSteps(stack, 10);

    const finalStep = steps[steps.length - 1];
    expect(finalStep.description).toContain('underflow');
    expect(finalStep.snapshot.data.elements.length).toBe(0);
  });

  it('should mark new top correctly after pop', () => {
    const stack = createStack([1, 2, 3]);
    const steps = generatePopSteps(stack, 10);

    const finalStep = steps[steps.length - 1];
    const topElement =
      finalStep.snapshot.data.elements[finalStep.snapshot.data.elements.length - 1];

    expect(topElement.value).toBe(2);
    expect(topElement.state).toBe('top');
  });

  it('should track reads correctly', () => {
    const stack = createStack([1, 2]);
    const steps = generatePopSteps(stack, 10);

    const stepsWithReads = steps.filter((s) => s.meta.reads > 0);
    expect(stepsWithReads.length).toBeGreaterThan(0);
  });

  it('should show popping state before final state', () => {
    const stack = createStack([1, 2]);
    const steps = generatePopSteps(stack, 10);

    const poppingStep = steps.find((s) =>
      s.snapshot.data.elements.some((e) => e.state === 'popping')
    );

    expect(poppingStep).toBeDefined();
  });

  it('should describe popped value correctly', () => {
    const stack = createStack([10, 20, 30]);
    const steps = generatePopSteps(stack, 10);

    const popDescription = steps.find((s) => s.description.includes('Popping'));
    expect(popDescription?.description).toContain('30');
  });
});
