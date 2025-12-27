/**
 * Event-Based Visualizer Tests
 * Tests the event generation and reducer logic for event-driven visualizers
 */

import { describe, it, expect } from 'vitest';
import {
  generateBubbleSortEvents,
  createInitialArrayState,
  reduceArrayEvent,
  reduceAllEvents,
  isSorted,
} from '../visualizers/bubble-sort.events';
import {
  generatePushEvents,
  generatePopEvents,
  generateClearEvents,
  createInitialStackState,
  reduceStackEvent,
  reduceAllStackEvents,
  peek,
  isEmpty,
  isFull,
} from '../visualizers/stack.events';
import type { ArrayEvent, StackEvent } from '../core/events';

// =============================================================================
// Bubble Sort Event Tests
// =============================================================================

describe('Bubble Sort Events', () => {
  describe('generateBubbleSortEvents', () => {
    it('should generate INIT_ARRAY event first', () => {
      const events = generateBubbleSortEvents([5, 3, 1]);
      expect(events[0].type).toBe('INIT_ARRAY');
    });

    it('should generate COMPARE events for each comparison', () => {
      const events = generateBubbleSortEvents([3, 1]);
      const compareEvents = events.filter((e) => e.type === 'COMPARE');
      expect(compareEvents.length).toBeGreaterThan(0);
    });

    it('should generate SWAP events when elements need swapping', () => {
      const events = generateBubbleSortEvents([3, 1]);
      const swapEvents = events.filter((e) => e.type === 'SWAP');
      expect(swapEvents.length).toBeGreaterThan(0);
    });

    it('should not generate SWAP events for sorted array', () => {
      const events = generateBubbleSortEvents([1, 2, 3]);
      const swapEvents = events.filter((e) => e.type === 'SWAP');
      expect(swapEvents.length).toBe(0);
    });

    it('should generate COMPLETE event at end', () => {
      const events = generateBubbleSortEvents([3, 1]);
      const lastEvent = events[events.length - 1];
      expect(lastEvent.type).toBe('COMPLETE');
    });

    it('should generate PASS_START events for each pass', () => {
      const events = generateBubbleSortEvents([3, 2, 1]);
      const passEvents = events.filter((e) => e.type === 'PASS_START');
      // n-1 passes for array of length n
      expect(passEvents.length).toBe(2);
    });
  });

  describe('reduceArrayEvent', () => {
    it('should initialize array with INIT_ARRAY event', () => {
      const initialState = createInitialArrayState([]);
      const event: ArrayEvent = {
        type: 'INIT_ARRAY',
        values: [5, 3, 1],
        description: 'Init',
      };

      const newState = reduceArrayEvent(initialState, event);
      expect(newState.values).toEqual([5, 3, 1]);
      expect(newState.states).toEqual(['default', 'default', 'default']);
    });

    it('should increment comparisons on COMPARE event', () => {
      const state = createInitialArrayState([5, 3, 1]);
      const event: ArrayEvent = {
        type: 'COMPARE',
        indexA: 0,
        indexB: 1,
        description: 'Comparing',
      };

      const newState = reduceArrayEvent(state, event);
      expect(newState.comparisons).toBe(1);
      expect(newState.activeIndices).toEqual([0, 1]);
    });

    it('should swap values and increment counters on SWAP event', () => {
      const state = createInitialArrayState([5, 3, 1]);
      const event: ArrayEvent = {
        type: 'SWAP',
        indexA: 0,
        indexB: 1,
        description: 'Swapping',
      };

      const newState = reduceArrayEvent(state, event);
      expect(newState.values).toEqual([3, 5, 1]);
      expect(newState.swaps).toBe(1);
      expect(newState.writes).toBe(2);
    });

    it('should mark elements as sorted on MARK_SORTED event', () => {
      const state = createInitialArrayState([1, 2, 3]);
      const event: ArrayEvent = {
        type: 'MARK_SORTED',
        indices: [2],
        description: 'Marking sorted',
      };

      const newState = reduceArrayEvent(state, event);
      expect(newState.states[2]).toBe('sorted');
    });

    it('should mark all as sorted on COMPLETE event', () => {
      const state = createInitialArrayState([1, 2, 3]);
      const event: ArrayEvent = {
        type: 'COMPLETE',
        description: 'Done',
      };

      const newState = reduceArrayEvent(state, event);
      expect(newState.states).toEqual(['sorted', 'sorted', 'sorted']);
    });
  });

  describe('reduceAllEvents (integration)', () => {
    it('should produce sorted array from unsorted input', () => {
      const input = [5, 3, 8, 4, 2];
      const events = generateBubbleSortEvents(input);
      const initialState = createInitialArrayState([]);
      const finalState = reduceAllEvents(initialState, events);

      expect(finalState.values).toEqual([2, 3, 4, 5, 8]);
      expect(isSorted(finalState.values)).toBe(true);
    });

    it('should handle already sorted array', () => {
      const input = [1, 2, 3, 4, 5];
      const events = generateBubbleSortEvents(input);
      const initialState = createInitialArrayState([]);
      const finalState = reduceAllEvents(initialState, events);

      expect(finalState.values).toEqual([1, 2, 3, 4, 5]);
      expect(finalState.swaps).toBe(0);
    });

    it('should handle reverse sorted array', () => {
      const input = [5, 4, 3, 2, 1];
      const events = generateBubbleSortEvents(input);
      const initialState = createInitialArrayState([]);
      const finalState = reduceAllEvents(initialState, events);

      expect(finalState.values).toEqual([1, 2, 3, 4, 5]);
      expect(finalState.swaps).toBeGreaterThan(0);
    });

    it('should handle single element', () => {
      const events = generateBubbleSortEvents([42]);
      const initialState = createInitialArrayState([]);
      const finalState = reduceAllEvents(initialState, events);

      expect(finalState.values).toEqual([42]);
    });

    it('should handle empty array', () => {
      const events = generateBubbleSortEvents([]);
      const initialState = createInitialArrayState([]);
      const finalState = reduceAllEvents(initialState, events);

      expect(finalState.values).toEqual([]);
    });

    it('should track correct comparison count', () => {
      // For [3, 1, 2]: Pass 1 has 2 comparisons, Pass 2 has 1 = 3 total
      const events = generateBubbleSortEvents([3, 1, 2]);
      const initialState = createInitialArrayState([]);
      const finalState = reduceAllEvents(initialState, events);

      expect(finalState.comparisons).toBe(3);
    });
  });
});

// =============================================================================
// Stack Event Tests
// =============================================================================

describe('Stack Events', () => {
  describe('generatePushEvents', () => {
    it('should generate MESSAGE, PUSH, COMPLETE events for valid push', () => {
      const events = generatePushEvents([], 42, 8);

      expect(events.map((e) => e.type)).toEqual(['MESSAGE', 'PUSH', 'COMPLETE']);
    });

    it('should generate STACK_OVERFLOW event when stack is full', () => {
      const fullStack = [1, 2, 3, 4, 5, 6, 7, 8];
      const events = generatePushEvents(fullStack, 99, 8);

      expect(events.some((e) => e.type === 'STACK_OVERFLOW')).toBe(true);
    });

    it('should not generate PUSH event when overflow', () => {
      const fullStack = [1, 2, 3, 4, 5, 6, 7, 8];
      const events = generatePushEvents(fullStack, 99, 8);

      expect(events.some((e) => e.type === 'PUSH')).toBe(false);
    });
  });

  describe('generatePopEvents', () => {
    it('should generate MESSAGE, POP, COMPLETE events for valid pop', () => {
      const events = generatePopEvents([1, 2, 3], 8);

      expect(events.map((e) => e.type)).toEqual(['MESSAGE', 'POP', 'COMPLETE']);
    });

    it('should generate STACK_UNDERFLOW event when stack is empty', () => {
      const events = generatePopEvents([], 8);

      expect(events[0].type).toBe('STACK_UNDERFLOW');
      expect(events.length).toBe(1);
    });
  });

  describe('generateClearEvents', () => {
    it('should generate STACK_CLEAR event', () => {
      const events = generateClearEvents();

      expect(events.length).toBe(1);
      expect(events[0].type).toBe('STACK_CLEAR');
    });
  });

  describe('reduceStackEvent', () => {
    it('should add value on PUSH event', () => {
      const state = createInitialStackState([1, 2], 8);
      const event: StackEvent = {
        type: 'PUSH',
        value: 3,
        description: 'Pushing',
      };

      const newState = reduceStackEvent(state, event);
      expect(newState.values).toEqual([1, 2, 3]);
      expect(newState.writes).toBe(1);
    });

    it('should remove top value on POP event', () => {
      const state = createInitialStackState([1, 2, 3], 8);
      const event: StackEvent = {
        type: 'POP',
        description: 'Popping',
      };

      const newState = reduceStackEvent(state, event);
      expect(newState.values).toEqual([1, 2]);
      expect(newState.reads).toBe(1);
    });

    it('should set error on STACK_OVERFLOW event', () => {
      const state = createInitialStackState([1, 2, 3], 8);
      const event: StackEvent = {
        type: 'STACK_OVERFLOW',
        value: 99,
        description: 'Overflow',
      };

      const newState = reduceStackEvent(state, event);
      expect(newState.error).toBe('overflow');
      expect(newState.values).toEqual([1, 2, 3]); // Unchanged
    });

    it('should set error on STACK_UNDERFLOW event', () => {
      const state = createInitialStackState([], 8);
      const event: StackEvent = {
        type: 'STACK_UNDERFLOW',
        description: 'Underflow',
      };

      const newState = reduceStackEvent(state, event);
      expect(newState.error).toBe('underflow');
    });

    it('should clear stack on STACK_CLEAR event', () => {
      const state = createInitialStackState([1, 2, 3], 8);
      const event: StackEvent = {
        type: 'STACK_CLEAR',
        description: 'Clearing',
      };

      const newState = reduceStackEvent(state, event);
      expect(newState.values).toEqual([]);
    });
  });

  describe('reduceAllStackEvents (integration)', () => {
    it('should produce correct state after multiple pushes', () => {
      const initialState = createInitialStackState([], 8);
      const events: StackEvent[] = [
        ...generatePushEvents([], 10, 8),
        ...generatePushEvents([10], 20, 8),
        ...generatePushEvents([10, 20], 30, 8),
      ];

      const finalState = reduceAllStackEvents(initialState, events);
      expect(finalState.values).toEqual([10, 20, 30]);
    });

    it('should produce correct state after push and pop', () => {
      const initialState = createInitialStackState([], 8);

      // Push 3 values
      let events: StackEvent[] = [];
      events = events.concat(generatePushEvents([], 10, 8));

      // Simulate the state after first push
      let state = reduceAllStackEvents(initialState, events);
      events = events.concat(generatePushEvents(state.values, 20, 8));

      state = reduceAllStackEvents(initialState, events);
      events = events.concat(generatePushEvents(state.values, 30, 8));

      state = reduceAllStackEvents(initialState, events);

      // Now pop
      events = events.concat(generatePopEvents(state.values, 8));

      const finalState = reduceAllStackEvents(initialState, events);
      expect(finalState.values).toEqual([10, 20]);
    });

    it('should handle overflow correctly', () => {
      const fullStack = [1, 2, 3, 4, 5, 6, 7, 8];
      const initialState = createInitialStackState(fullStack, 8);
      const events = generatePushEvents(fullStack, 99, 8);

      const finalState = reduceAllStackEvents(initialState, events);
      expect(finalState.values).toEqual(fullStack); // Unchanged
      expect(finalState.error).toBe('overflow');
    });

    it('should handle underflow correctly', () => {
      const initialState = createInitialStackState([], 8);
      const events = generatePopEvents([], 8);

      const finalState = reduceAllStackEvents(initialState, events);
      expect(finalState.values).toEqual([]);
      expect(finalState.error).toBe('underflow');
    });
  });

  describe('utility functions', () => {
    it('peek should return top value', () => {
      const state = createInitialStackState([1, 2, 3], 8);
      expect(peek(state)).toBe(3);
    });

    it('peek should return undefined for empty stack', () => {
      const state = createInitialStackState([], 8);
      expect(peek(state)).toBeUndefined();
    });

    it('isEmpty should return true for empty stack', () => {
      const state = createInitialStackState([], 8);
      expect(isEmpty(state)).toBe(true);
    });

    it('isEmpty should return false for non-empty stack', () => {
      const state = createInitialStackState([1], 8);
      expect(isEmpty(state)).toBe(false);
    });

    it('isFull should return true when at max size', () => {
      const state = createInitialStackState([1, 2, 3, 4, 5, 6, 7, 8], 8);
      expect(isFull(state)).toBe(true);
    });

    it('isFull should return false when below max size', () => {
      const state = createInitialStackState([1, 2, 3], 8);
      expect(isFull(state)).toBe(false);
    });
  });
});

// =============================================================================
// isSorted utility tests
// =============================================================================

describe('isSorted utility', () => {
  it('should return true for sorted array', () => {
    expect(isSorted([1, 2, 3, 4, 5])).toBe(true);
  });

  it('should return false for unsorted array', () => {
    expect(isSorted([5, 3, 1])).toBe(false);
  });

  it('should return true for single element', () => {
    expect(isSorted([42])).toBe(true);
  });

  it('should return true for empty array', () => {
    expect(isSorted([])).toBe(true);
  });

  it('should return true for array with duplicates in order', () => {
    expect(isSorted([1, 2, 2, 3])).toBe(true);
  });
});
