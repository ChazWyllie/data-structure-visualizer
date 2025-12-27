/**
 * Stack - Event-Based Model
 *
 * This module provides an event-driven implementation of stack operations
 * using the reducer pattern for efficient state management.
 */

import type {
  StackEvent,
  StackModelState,
  PushEvent,
  PopEvent,
  StackOverflowEvent,
  StackUnderflowEvent,
  StackClearEvent,
  InitStackEvent,
  MessageEvent,
  CompleteEvent,
} from '../core/events';

// =============================================================================
// Initial State Factory
// =============================================================================

/**
 * Create initial model state for stack
 */
export function createInitialStackState(
  values: number[] = [],
  maxSize: number = 8
): StackModelState {
  return {
    values: [...values],
    maxSize,
    states: values.map((_, i) => (i === values.length - 1 ? 'top' : 'default')),
    comparisons: 0,
    swaps: 0,
    reads: 0,
    writes: 0,
    error: undefined,
  };
}

// =============================================================================
// Event Generators
// =============================================================================

/**
 * Generate push events
 */
export function generatePushEvents(
  currentValues: number[],
  value: number,
  maxSize: number
): StackEvent[] {
  const events: StackEvent[] = [];

  // Initial message
  events.push({
    type: 'MESSAGE',
    description: `Preparing to push ${value} onto the stack`,
    highlightedLine: 1,
  } as MessageEvent);

  if (currentValues.length >= maxSize) {
    // Overflow error
    events.push({
      type: 'STACK_OVERFLOW',
      value,
      description: `Stack overflow! Cannot push ${value} - stack is full`,
      highlightedLine: 2,
    } as StackOverflowEvent);
    return events;
  }

  // Push event
  events.push({
    type: 'PUSH',
    value,
    description: `Pushing ${value} onto the stack`,
    highlightedLine: 3,
  } as PushEvent);

  // Complete message
  events.push({
    type: 'COMPLETE',
    description: `Successfully pushed ${value}. Stack size: ${currentValues.length + 1}`,
    highlightedLine: 4,
  } as CompleteEvent);

  return events;
}

/**
 * Generate pop events
 */
export function generatePopEvents(currentValues: number[], _maxSize: number): StackEvent[] {
  const events: StackEvent[] = [];

  if (currentValues.length === 0) {
    // Underflow error
    events.push({
      type: 'STACK_UNDERFLOW',
      description: 'Stack underflow! Cannot pop - stack is empty',
      highlightedLine: 1,
    } as StackUnderflowEvent);
    return events;
  }

  const topValue = currentValues[currentValues.length - 1];

  // Initial message
  events.push({
    type: 'MESSAGE',
    description: `Preparing to pop from stack (top value: ${topValue})`,
    highlightedLine: 1,
  } as MessageEvent);

  // Pop event
  events.push({
    type: 'POP',
    description: `Popping ${topValue} from the stack`,
    highlightedLine: 2,
  } as PopEvent);

  // Complete message
  events.push({
    type: 'COMPLETE',
    description: `Popped ${topValue}. Stack size: ${currentValues.length - 1}`,
    highlightedLine: 3,
  } as CompleteEvent);

  return events;
}

/**
 * Generate clear events
 */
export function generateClearEvents(): StackEvent[] {
  return [
    {
      type: 'STACK_CLEAR',
      description: 'Stack cleared',
      highlightedLine: 1,
    } as StackClearEvent,
  ];
}

/**
 * Generate init events
 */
export function generateInitEvents(values: number[], maxSize: number): StackEvent[] {
  return [
    {
      type: 'INIT_STACK',
      values: [...values],
      maxSize,
      description: 'Stack initialized',
      highlightedLine: 1,
    } as InitStackEvent,
  ];
}

// =============================================================================
// Reducer
// =============================================================================

/**
 * Reduce stack state by applying an event
 */
export function reduceStackEvent(state: StackModelState, event: StackEvent): StackModelState {
  switch (event.type) {
    case 'INIT_STACK':
      return {
        ...state,
        values: [...event.values],
        maxSize: event.maxSize,
        states: event.values.map((_, i) => (i === event.values.length - 1 ? 'top' : 'default')),
        error: undefined,
      };

    case 'PUSH': {
      const newValues = [...state.values, event.value];
      return {
        ...state,
        values: newValues,
        writes: state.writes + 1,
        states: newValues.map((_, i) => (i === newValues.length - 1 ? 'pushing' : 'default')),
        error: undefined,
      };
    }

    case 'POP': {
      const newValues = state.values.slice(0, -1);
      return {
        ...state,
        values: newValues,
        reads: state.reads + 1,
        states: [
          ...newValues.map((_, i) => (i === newValues.length - 1 ? 'top' : 'default')),
        ] as StackModelState['states'],
        error: undefined,
      };
    }

    case 'STACK_OVERFLOW':
      return {
        ...state,
        error: 'overflow',
      };

    case 'STACK_UNDERFLOW':
      return {
        ...state,
        error: 'underflow',
      };

    case 'STACK_CLEAR':
      return {
        ...state,
        values: [],
        states: [],
        error: undefined,
      };

    case 'MESSAGE':
      // Messages don't change state, just provide information
      return {
        ...state,
        // Update states to show current top
        states: state.values.map((_, i) =>
          i === state.values.length - 1 ? 'top' : 'default'
        ) as StackModelState['states'],
      };

    case 'COMPLETE':
      return {
        ...state,
        // Update states to show current top
        states: state.values.map((_, i) =>
          i === state.values.length - 1 ? 'top' : 'default'
        ) as StackModelState['states'],
        error: undefined,
      };

    default:
      return state;
  }
}

// =============================================================================
// Snapshot Derivation
// =============================================================================

/**
 * Derive view model from model state for rendering
 */
export function deriveStackSnapshot(state: StackModelState): {
  elements: { value: number; state: string }[];
  maxSize: number;
} {
  return {
    elements: state.values.map((value, i) => ({
      value,
      state: state.states[i] ?? 'default',
    })),
    maxSize: state.maxSize,
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Reduce all events to get final state
 */
export function reduceAllStackEvents(
  initialState: StackModelState,
  events: StackEvent[]
): StackModelState {
  return events.reduce(reduceStackEvent, initialState);
}

/**
 * Get the top value of the stack (or undefined if empty)
 */
export function peek(state: StackModelState): number | undefined {
  return state.values[state.values.length - 1];
}

/**
 * Check if stack is empty
 */
export function isEmpty(state: StackModelState): boolean {
  return state.values.length === 0;
}

/**
 * Check if stack is full
 */
export function isFull(state: StackModelState): boolean {
  return state.values.length >= state.maxSize;
}
