/**
 * Event-driven visualization types
 *
 * This module defines the event-based architecture for visualizers.
 * Instead of storing full snapshots per step, we store events and
 * derive state by reducing events from an initial state.
 */

import type { ArrayEvent } from './events/array';
import type { BaseEvent, BaseModelState } from './events/generic';
import type { StackEvent } from './events/stack';
import type {
  DequeueEvent,
  DeleteNodeEvent,
  EnqueueEvent,
  InsertNodeEvent,
  TreeInsertEvent,
  TreeVisitEvent,
  VisitNodeEvent,
} from './events/experimental';

export * from './events/array';
export * from './events/generic';
export * from './events/stack';
export * from './events/experimental';

// =============================================================================
// Event Union Types
// =============================================================================

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
