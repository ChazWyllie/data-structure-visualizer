/**
 * Event-driven visualization types
 *
 * This module defines the event-based architecture for visualizers.
 * Instead of storing full snapshots per step, we store events and
 * derive state by reducing events from an initial state.
 */

// =============================================================================
// Base Event Types
// =============================================================================

/** Base event interface - all events extend this */
export interface BaseEvent {
  /** Event type discriminator */
  type: string;
  /** Description of what's happening */
  description: string;
  /** Line number in pseudocode to highlight (1-based) */
  highlightedLine?: number;
  /** Elements being compared/accessed (for highlighting) */
  activeIndices?: number[];
  /** Elements being swapped/modified */
  modifiedIndices?: number[];
}

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
// Stack Events
// =============================================================================

/** Push a value onto the stack */
export interface PushEvent extends BaseEvent {
  type: 'PUSH';
  /** Value to push */
  value: number;
}

/** Pop a value from the stack */
export interface PopEvent extends BaseEvent {
  type: 'POP';
}

/** Stack overflow error */
export interface StackOverflowEvent extends BaseEvent {
  type: 'STACK_OVERFLOW';
  /** Value that couldn't be pushed */
  value: number;
}

/** Stack underflow error */
export interface StackUnderflowEvent extends BaseEvent {
  type: 'STACK_UNDERFLOW';
}

/** Clear the stack */
export interface StackClearEvent extends BaseEvent {
  type: 'STACK_CLEAR';
}

/** Initialize stack state */
export interface InitStackEvent extends BaseEvent {
  type: 'INIT_STACK';
  /** Initial stack values (bottom to top) */
  values: number[];
  /** Maximum stack size */
  maxSize: number;
}

// =============================================================================
// Queue Events (for future use)
// =============================================================================

export interface EnqueueEvent extends BaseEvent {
  type: 'ENQUEUE';
  value: number;
}

export interface DequeueEvent extends BaseEvent {
  type: 'DEQUEUE';
}

// =============================================================================
// Linked List Events (for future use)
// =============================================================================

export interface InsertNodeEvent extends BaseEvent {
  type: 'INSERT_NODE';
  value: number;
  position: number | 'head' | 'tail';
}

export interface DeleteNodeEvent extends BaseEvent {
  type: 'DELETE_NODE';
  value: number;
}

export interface VisitNodeEvent extends BaseEvent {
  type: 'VISIT_NODE';
  nodeIndex: number;
}

// =============================================================================
// Tree Events (for future use)
// =============================================================================

export interface TreeInsertEvent extends BaseEvent {
  type: 'TREE_INSERT';
  value: number;
  path: ('left' | 'right')[];
}

export interface TreeVisitEvent extends BaseEvent {
  type: 'TREE_VISIT';
  value: number;
}

// =============================================================================
// Generic Events
// =============================================================================

/** Message event for informational steps */
export interface MessageEvent extends BaseEvent {
  type: 'MESSAGE';
}

/** Complete event for when algorithm finishes */
export interface CompleteEvent extends BaseEvent {
  type: 'COMPLETE';
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

/** All stack related events */
export type StackEvent =
  | InitStackEvent
  | PushEvent
  | PopEvent
  | StackOverflowEvent
  | StackUnderflowEvent
  | StackClearEvent
  | MessageEvent
  | CompleteEvent;

/** All visualization events */
export type VisualizationEvent =
  | ArrayEvent
  | StackEvent
  | EnqueueEvent
  | DequeueEvent
  | InsertNodeEvent
  | DeleteNodeEvent
  | VisitNodeEvent
  | TreeInsertEvent
  | TreeVisitEvent;

// =============================================================================
// Model State Types
// =============================================================================

/** Base model state - all model states extend this */
export interface BaseModelState {
  /** Cumulative comparisons */
  comparisons: number;
  /** Cumulative swaps */
  swaps: number;
  /** Cumulative reads */
  reads: number;
  /** Cumulative writes */
  writes: number;
}

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

/** Stack model state */
export interface StackModelState extends BaseModelState {
  /** Current stack values (bottom to top) */
  values: number[];
  /** Maximum stack size */
  maxSize: number;
  /** Visual state for each element */
  states: ('default' | 'pushing' | 'popping' | 'top')[];
  /** Error state if any */
  error?: 'overflow' | 'underflow';
}

// =============================================================================
// Event-Driven Visualizer Interface
// =============================================================================

/** Reducer function type */
export type Reducer<S extends BaseModelState, E extends BaseEvent> = (state: S, event: E) => S;

/**
 * Event-driven visualizer interface
 * Visualizers that use the event model implement this interface
 */
export interface EventVisualizer<S extends BaseModelState, E extends BaseEvent, V = unknown> {
  /** Get the initial model state */
  getInitialModelState(): S;

  /** Generate events for the given action */
  getEvents(actionPayload: { type: string; params?: Record<string, unknown> }): E[];

  /** Reduce model state by applying an event */
  reduce(state: S, event: E): S;

  /** Derive view model from model state (for rendering) */
  deriveSnapshot(state: S): V;
}

// =============================================================================
// Event Engine State
// =============================================================================

/** Event engine state */
export interface EventEngineState<S extends BaseModelState> {
  /** Initial model state */
  initialState: S;
  /** All events */
  events: BaseEvent[];
  /** Current event index (-1 means before first event, at initial state) */
  index: number;
  /** Current computed model state */
  currentState: S;
  /** Whether animation is playing */
  playing: boolean;
  /** Animation speed in ms per event */
  speed: number;
  /** Last tick timestamp */
  lastTick: number;
  /** Cached states for fast seeking (every N events) */
  stateCache: Map<number, S>;
}

/** Cache interval for state snapshots */
export const STATE_CACHE_INTERVAL = 10;
