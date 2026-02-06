/**
 * Generic event types shared across visualizers.
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
