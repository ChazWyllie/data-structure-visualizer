import type { BaseEvent, BaseModelState, Reducer } from '../core/events';

export function createBaseModelState(): BaseModelState {
  return {
    comparisons: 0,
    swaps: 0,
    reads: 0,
    writes: 0,
  };
}

export function buildValueStates<T extends string>(
  values: number[],
  mapState: (index: number, values: number[]) => T
): T[] {
  return values.map((_, index) => mapState(index, values));
}

export function buildElementSnapshot<T extends string>(
  values: number[],
  states: T[],
  fallbackState: T
): { value: number; state: T }[] {
  return values.map((value, index) => ({
    value,
    state: states[index] ?? fallbackState,
  }));
}

export function reduceEvents<S extends BaseModelState, E extends BaseEvent>(
  initialState: S,
  events: E[],
  reducer: Reducer<S, E>
): S {
  return events.reduce(reducer, initialState);
}
