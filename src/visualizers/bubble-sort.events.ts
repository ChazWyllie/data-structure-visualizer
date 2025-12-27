/**
 * Bubble Sort - Event-Based Model
 *
 * This module provides an event-driven implementation of bubble sort
 * using the reducer pattern for efficient state management.
 */

import type {
  ArrayEvent,
  ArrayModelState,
  CompareEvent,
  SwapEvent,
  MarkSortedEvent,
  PassStartEvent,
  InitArrayEvent,
  CompleteEvent,
} from '../core/events';

// =============================================================================
// Initial State Factory
// =============================================================================

/**
 * Create initial model state for bubble sort
 */
export function createInitialArrayState(values: number[]): ArrayModelState {
  return {
    values: [...values],
    states: values.map(() => 'default'),
    activeIndices: [],
    modifiedIndices: [],
    comparisons: 0,
    swaps: 0,
    reads: 0,
    writes: 0,
  };
}

// =============================================================================
// Event Generator
// =============================================================================

/**
 * Generate bubble sort events - pure function
 */
export function generateBubbleSortEvents(arr: number[]): ArrayEvent[] {
  const events: ArrayEvent[] = [];
  const values = [...arr];
  const n = values.length;

  // Initial state event
  events.push({
    type: 'INIT_ARRAY',
    values: [...values],
    description: 'Initial array state',
    highlightedLine: 1,
  } as InitArrayEvent);

  for (let i = 0; i < n - 1; i++) {
    // Pass start event
    events.push({
      type: 'PASS_START',
      passNumber: i + 1,
      description: `Pass ${i + 1}: Bubble largest unsorted element to position ${n - 1 - i}`,
      highlightedLine: 2,
    } as PassStartEvent);

    for (let j = 0; j < n - i - 1; j++) {
      // Compare event
      events.push({
        type: 'COMPARE',
        indexA: j,
        indexB: j + 1,
        description: `Comparing elements at index ${j} (${values[j]}) and ${j + 1} (${values[j + 1]})`,
        highlightedLine: 3,
        activeIndices: [j, j + 1],
      } as CompareEvent);

      if (values[j] > values[j + 1]) {
        // Swap event
        events.push({
          type: 'SWAP',
          indexA: j,
          indexB: j + 1,
          description: `Swapping ${values[j]} and ${values[j + 1]} (${values[j]} > ${values[j + 1]})`,
          highlightedLine: 4,
          activeIndices: [j, j + 1],
          modifiedIndices: [j, j + 1],
        } as SwapEvent);

        // Perform swap in our tracking array
        const temp = values[j];
        values[j] = values[j + 1];
        values[j + 1] = temp;
      }
    }

    // Mark element as sorted
    events.push({
      type: 'MARK_SORTED',
      indices: [n - 1 - i],
      description: `Element ${values[n - 1 - i]} is now in its sorted position`,
      highlightedLine: 5,
    } as MarkSortedEvent);
  }

  // Mark first element as sorted and complete
  if (n > 0) {
    events.push({
      type: 'MARK_SORTED',
      indices: [0],
      description: 'First element is in its sorted position',
      highlightedLine: 5,
    } as MarkSortedEvent);
  }

  events.push({
    type: 'COMPLETE',
    description: 'Array is now fully sorted!',
    highlightedLine: 6,
  } as CompleteEvent);

  return events;
}

// =============================================================================
// Reducer
// =============================================================================

/**
 * Reduce array state by applying an event
 */
export function reduceArrayEvent(state: ArrayModelState, event: ArrayEvent): ArrayModelState {
  switch (event.type) {
    case 'INIT_ARRAY':
      return {
        ...state,
        values: [...event.values],
        states: event.values.map(() => 'default'),
        activeIndices: [],
        modifiedIndices: [],
      };

    case 'COMPARE':
      return {
        ...state,
        comparisons: state.comparisons + 1,
        activeIndices: [event.indexA, event.indexB],
        modifiedIndices: [],
        states: state.states.map((s, i) =>
          i === event.indexA || i === event.indexB
            ? 'comparing'
            : s === 'sorted'
              ? 'sorted'
              : 'default'
        ),
      };

    case 'SWAP': {
      const newValues = [...state.values];
      const temp = newValues[event.indexA];
      newValues[event.indexA] = newValues[event.indexB];
      newValues[event.indexB] = temp;

      return {
        ...state,
        values: newValues,
        swaps: state.swaps + 1,
        writes: state.writes + 2,
        activeIndices: [event.indexA, event.indexB],
        modifiedIndices: [event.indexA, event.indexB],
        states: state.states.map((s, i) =>
          i === event.indexA || i === event.indexB
            ? 'swapping'
            : s === 'sorted'
              ? 'sorted'
              : 'default'
        ),
      };
    }

    case 'MARK_SORTED':
      return {
        ...state,
        activeIndices: [],
        modifiedIndices: [],
        states: state.states.map((s, i) => (event.indices.includes(i) ? 'sorted' : s)),
      };

    case 'PASS_START':
      return {
        ...state,
        activeIndices: [],
        modifiedIndices: [],
        states: state.states.map((s) => (s === 'sorted' ? 'sorted' : 'default')),
      };

    case 'COMPLETE':
      return {
        ...state,
        activeIndices: [],
        modifiedIndices: [],
        states: state.states.map(() => 'sorted'),
      };

    case 'MESSAGE':
      return state;

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
export function deriveArraySnapshot(state: ArrayModelState): {
  elements: { value: number; state: string }[];
} {
  return {
    elements: state.values.map((value, i) => ({
      value,
      state: state.states[i],
    })),
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Check if array is sorted (ascending)
 */
export function isSorted(values: number[]): boolean {
  for (let i = 0; i < values.length - 1; i++) {
    if (values[i] > values[i + 1]) {
      return false;
    }
  }
  return true;
}

/**
 * Reduce all events to get final state
 */
export function reduceAllEvents(
  initialState: ArrayModelState,
  events: ArrayEvent[]
): ArrayModelState {
  return events.reduce(reduceArrayEvent, initialState);
}
