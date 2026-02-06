import type { BaseEvent, BaseModelState, CompleteEvent, MessageEvent } from './generic';

// =============================================================================
// Array/Sorting Events
// =============================================================================

/** Compare two elements in an array */
export interface CompareEvent extends BaseEvent {
  type: 'COMPARE';
  /** Index of first element */
  indexA: number;
  /** Index of second element */
  indexB: number;
}

/** Swap two elements in an array */
export interface SwapEvent extends BaseEvent {
  type: 'SWAP';
  /** Index of first element */
  indexA: number;
  /** Index of second element */
  indexB: number;
}

/** Set an element value at an index */
export interface SetEvent extends BaseEvent {
  type: 'SET';
  /** Index to set */
  index: number;
  /** New value */
  value: number;
}

/** Mark element(s) as sorted */
export interface MarkSortedEvent extends BaseEvent {
  type: 'MARK_SORTED';
  /** Indices to mark as sorted */
  indices: number[];
}

/** Start a new pass in a sorting algorithm */
export interface PassStartEvent extends BaseEvent {
  type: 'PASS_START';
  /** Pass number (1-based) */
  passNumber: number;
}

/** Initialize array state */
export interface InitArrayEvent extends BaseEvent {
  type: 'INIT_ARRAY';
  /** Initial array values */
  values: number[];
}

// =============================================================================
// Array Model State
// =============================================================================

/** Array model state for sorting algorithms */
export interface ArrayModelState extends BaseModelState {
  /** Current array values */
  values: number[];
  /** Visual state for each element */
  states: ('default' | 'comparing' | 'swapping' | 'sorted')[];
  /** Indices being actively compared */
  activeIndices: number[];
  /** Indices being modified */
  modifiedIndices: number[];
}

// =============================================================================
// Event Union Types
// =============================================================================

/** All array/sorting related events */
export type ArrayEvent =
  | InitArrayEvent
  | CompareEvent
  | SwapEvent
  | SetEvent
  | MarkSortedEvent
  | PassStartEvent
  | MessageEvent
  | CompleteEvent;
