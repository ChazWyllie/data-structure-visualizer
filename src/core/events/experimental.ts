import type { BaseEvent } from './generic';

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
