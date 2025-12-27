/**
 * Step Engine
 * Manages step playback, animation loop, and step state
 */

import type { Step, EngineState, EngineEvent, EngineListener } from '../core/types';
import { DEFAULT_ANIMATION_SPEED_MS } from '../core/constants';

/**
 * Step Engine - Controls visualization playback
 */
export class StepEngine {
  private state: EngineState;
  private listeners: Set<EngineListener> = new Set();
  private animationFrameId: number | null = null;

  constructor() {
    this.state = this.createInitialState();
  }

  /**
   * Create initial engine state
   */
  private createInitialState(): EngineState {
    return {
      steps: [],
      index: 0,
      playing: false,
      speed: DEFAULT_ANIMATION_SPEED_MS,
      lastTick: 0,
    };
  }

  /**
   * Load steps into the engine
   */
  loadSteps(steps: Step[]): void {
    this.stop();
    this.state = {
      ...this.createInitialState(),
      steps,
      speed: this.state.speed, // Preserve speed setting
    };

    if (steps.length > 0) {
      this.emit({ type: 'step-change', index: 0, step: steps[0] });
    }
    this.emit({ type: 'reset' });
  }

  /**
   * Start playback
   */
  play(): void {
    if (this.state.steps.length === 0) {
      return;
    }

    // If at end, restart from beginning
    if (this.state.index >= this.state.steps.length - 1) {
      this.state.index = 0;
      this.emit({ type: 'step-change', index: 0, step: this.state.steps[0] });
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
    this.state.index = 0;
    this.state.lastTick = 0;
  }

  /**
   * Step forward one step
   */
  stepForward(): void {
    if (this.state.index < this.state.steps.length - 1) {
      this.state.index++;
      this.emitCurrentStep();
    }
  }

  /**
   * Step backward one step
   */
  stepBack(): void {
    if (this.state.index > 0) {
      this.state.index--;
      this.emitCurrentStep();
    }
  }

  /**
   * Reset to first step
   */
  reset(): void {
    this.pause();
    this.state.index = 0;
    if (this.state.steps.length > 0) {
      this.emitCurrentStep();
    }
    this.emit({ type: 'reset' });
  }

  /**
   * Go to the last step
   */
  goToEnd(): void {
    this.pause();
    if (this.state.steps.length > 0) {
      this.state.index = this.state.steps.length - 1;
      this.emitCurrentStep();
      this.emit({ type: 'complete' });
    }
  }

  /**
   * Go to a specific step index
   */
  goToStep(index: number): void {
    if (index >= 0 && index < this.state.steps.length) {
      this.state.index = index;
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
   * Get current state (read-only)
   */
  getState(): Readonly<EngineState> {
    return this.state;
  }

  /**
   * Get current step
   */
  getCurrentStep(): Step | null {
    return this.state.steps[this.state.index] ?? null;
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

      if (this.state.index < this.state.steps.length - 1) {
        this.state.index++;
        this.emitCurrentStep();
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
   * Emit current step change
   */
  private emitCurrentStep(): void {
    const step = this.state.steps[this.state.index];
    if (step) {
      this.emit({ type: 'step-change', index: this.state.index, step });
    }
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
  }
}
