/**
 * Event Engine
 * Manages event-based visualization playback with reducer pattern
 *
 * Instead of storing full snapshots for each step, this engine:
 * 1. Stores an initial model state
 * 2. Stores a list of events
 * 3. Derives current state by reducing events from initial state
 * 4. Caches states every N events for fast seeking
 */

import type { Step, EngineEvent, EngineListener, StepMeta } from '../core/types';
import { createStepMeta } from '../core/types';
import type { BaseEvent, BaseModelState, Reducer } from '../core/events';
import { STATE_CACHE_INTERVAL } from '../core/events';
import { DEFAULT_ANIMATION_SPEED_MS } from '../core/constants';

/**
 * Event Engine State
 */
interface EventEngineState<S extends BaseModelState, E extends BaseEvent> {
  initialState: S;
  events: E[];
  index: number; // -1 = at initial state, 0+ = after event[index]
  currentState: S;
  playing: boolean;
  speed: number;
  lastTick: number;
  stateCache: Map<number, S>;
  reducer: Reducer<S, E>;
}

/**
 * Derived step info for UI compatibility
 */
interface DerivedStep<S> {
  id: number;
  description: string;
  state: S;
  meta: StepMeta;
  activeIndices?: number[];
  modifiedIndices?: number[];
  highlightedLine?: number;
}

/**
 * Event Engine - Controls event-based visualization playback
 */
export class EventEngine<S extends BaseModelState, E extends BaseEvent> {
  private state: EventEngineState<S, E>;
  private listeners: Set<EngineListener> = new Set();
  private animationFrameId: number | null = null;

  constructor(initialState: S, reducer: Reducer<S, E>) {
    this.state = {
      initialState,
      events: [],
      index: -1,
      currentState: { ...initialState },
      playing: false,
      speed: DEFAULT_ANIMATION_SPEED_MS,
      lastTick: 0,
      stateCache: new Map(),
      reducer,
    };
  }

  /**
   * Load events into the engine
   */
  loadEvents(events: E[], initialState?: S): void {
    this.stop();

    if (initialState) {
      this.state.initialState = initialState;
    }

    this.state.events = events;
    this.state.index = -1;
    this.state.currentState = { ...this.state.initialState };
    this.state.stateCache = new Map();

    // Pre-cache states at intervals for fast seeking
    this.buildStateCache();

    // Emit initial step
    this.emitCurrentStep();
    this.emit({ type: 'reset' });
  }

  /**
   * Build state cache for fast seeking
   */
  private buildStateCache(): void {
    this.state.stateCache.clear();
    this.state.stateCache.set(-1, { ...this.state.initialState });

    let currentState = { ...this.state.initialState };
    for (let i = 0; i < this.state.events.length; i++) {
      currentState = this.state.reducer(currentState, this.state.events[i]);
      if ((i + 1) % STATE_CACHE_INTERVAL === 0) {
        this.state.stateCache.set(i, { ...currentState });
      }
    }
  }

  /**
   * Compute state at a given event index
   */
  private computeStateAtIndex(targetIndex: number): S {
    // Find nearest cached state before target
    let startIndex = -1;
    let state = { ...this.state.initialState };

    for (const [cachedIndex, cachedState] of this.state.stateCache) {
      if (cachedIndex <= targetIndex && cachedIndex > startIndex) {
        startIndex = cachedIndex;
        state = { ...cachedState };
      }
    }

    // Reduce from cached state to target
    for (let i = startIndex + 1; i <= targetIndex; i++) {
      state = this.state.reducer(state, this.state.events[i]);
    }

    return state;
  }

  /**
   * Get the derived step at current index
   */
  private getDerivedStep(): DerivedStep<S> {
    const event = this.state.events[this.state.index];
    const state = this.state.currentState;

    if (!event) {
      // At initial state (index = -1)
      return {
        id: 0,
        description: 'Initial state',
        state,
        meta: createStepMeta({
          comparisons: state.comparisons,
          swaps: state.swaps,
          reads: state.reads,
          writes: state.writes,
        }),
      };
    }

    return {
      id: this.state.index + 1,
      description: event.description,
      state,
      meta: createStepMeta({
        comparisons: state.comparisons,
        swaps: state.swaps,
        reads: state.reads,
        writes: state.writes,
        highlightedLine: event.highlightedLine,
      }),
      activeIndices: event.activeIndices,
      modifiedIndices: event.modifiedIndices,
      highlightedLine: event.highlightedLine,
    };
  }

  /**
   * Convert to Step<T> for backwards compatibility with UI
   */
  toStep<T>(deriveSnapshot: (state: S) => T): Step<T> {
    const derived = this.getDerivedStep();
    return {
      id: derived.id,
      description: derived.description,
      snapshot: { data: deriveSnapshot(derived.state) },
      meta: derived.meta,
      activeIndices: derived.activeIndices,
      modifiedIndices: derived.modifiedIndices,
    };
  }

  /**
   * Start playback
   */
  play(): void {
    if (this.state.events.length === 0) {
      return;
    }

    // If at end, restart from beginning
    if (this.state.index >= this.state.events.length - 1) {
      this.state.index = -1;
      this.state.currentState = { ...this.state.initialState };
      this.emitCurrentStep();
    }

    this.state.playing = true;
    this.state.lastTick = performance.now();
    this.emit({ type: 'play' });
    this.tick();
  }

  /**
   * Pause playback
   */
  pause(): void {
    this.state.playing = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.emit({ type: 'pause' });
  }

  /**
   * Stop and reset to beginning
   */
  stop(): void {
    this.pause();
    this.state.index = -1;
    this.state.currentState = { ...this.state.initialState };
    this.state.lastTick = 0;
  }

  /**
   * Step forward one event
   */
  stepForward(): void {
    if (this.state.index < this.state.events.length - 1) {
      this.state.index++;
      this.state.currentState = this.state.reducer(
        this.state.currentState,
        this.state.events[this.state.index]
      );
      this.emitCurrentStep();
    }
  }

  /**
   * Step backward one event
   */
  stepBack(): void {
    if (this.state.index >= 0) {
      this.state.index--;
      // Recompute state from cache
      this.state.currentState = this.computeStateAtIndex(this.state.index);
      this.emitCurrentStep();
    }
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.pause();
    this.state.index = -1;
    this.state.currentState = { ...this.state.initialState };
    this.emitCurrentStep();
    this.emit({ type: 'reset' });
  }

  /**
   * Go to the last event
   */
  goToEnd(): void {
    this.pause();
    if (this.state.events.length > 0) {
      this.state.index = this.state.events.length - 1;
      this.state.currentState = this.computeStateAtIndex(this.state.index);
      this.emitCurrentStep();
      this.emit({ type: 'complete' });
    }
  }

  /**
   * Go to a specific event index
   */
  goToIndex(index: number): void {
    const targetIndex = Math.max(-1, Math.min(index, this.state.events.length - 1));
    if (targetIndex !== this.state.index) {
      this.state.index = targetIndex;
      this.state.currentState = this.computeStateAtIndex(targetIndex);
      this.emitCurrentStep();
    }
  }

  /**
   * Set playback speed
   */
  setSpeed(speed: number): void {
    this.state.speed = speed;
  }

  /**
   * Get total number of steps (events + 1 for initial state)
   */
  getTotalSteps(): number {
    return this.state.events.length + 1;
  }

  /**
   * Get current step index (0-based, including initial state)
   */
  getCurrentStepIndex(): number {
    return this.state.index + 1;
  }

  /**
   * Get current model state
   */
  getCurrentState(): Readonly<S> {
    return this.state.currentState;
  }

  /**
   * Get all events
   */
  getEvents(): readonly E[] {
    return this.state.events;
  }

  /**
   * Check if playing
   */
  isPlaying(): boolean {
    return this.state.playing;
  }

  /**
   * Subscribe to engine events
   */
  subscribe(listener: EngineListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Animation tick
   */
  private tick = (): void => {
    if (!this.state.playing) {
      return;
    }

    const now = performance.now();
    const elapsed = now - this.state.lastTick;

    if (elapsed >= this.state.speed) {
      this.state.lastTick = now;

      if (this.state.index < this.state.events.length - 1) {
        this.stepForward();
      } else {
        // Reached end
        this.state.playing = false;
        this.emit({ type: 'complete' });
        return;
      }
    }

    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  /**
   * Emit current step change (for UI compatibility)
   */
  private emitCurrentStep(): void {
    // Create a minimal Step object for backwards compatibility
    const derived = this.getDerivedStep();
    const step: Step = {
      id: derived.id,
      description: derived.description,
      snapshot: { data: derived.state },
      meta: derived.meta,
      activeIndices: derived.activeIndices,
      modifiedIndices: derived.modifiedIndices,
    };
    this.emit({ type: 'step-change', index: this.state.index + 1, step });
  }

  /**
   * Emit an event to all listeners
   */
  private emit(event: EngineEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }

  /**
   * Dispose and clean up
   */
  dispose(): void {
    this.stop();
    this.listeners.clear();
    this.state.stateCache.clear();
  }
}
