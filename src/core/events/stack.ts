import type { BaseEvent, BaseModelState, CompleteEvent, MessageEvent } from './generic';

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
// Stack Model State
// =============================================================================

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
// Event Union Types
// =============================================================================

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
