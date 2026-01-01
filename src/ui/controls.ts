/**
 * Playback Controls Component
 * Play/Pause/Step/Reset/Speed controls
 */

import type { AnimationState, PlaybackCommand } from '../core/types';
import {
  iconPlay,
  iconPause,
  iconStepBack,
  iconStepForward,
  iconSkipStart,
  iconSkipEnd,
} from './icons';
import {
  DEFAULT_ANIMATION_SPEED_MS,
  MIN_ANIMATION_SPEED_MS,
  MAX_ANIMATION_SPEED_MS,
  SPEED_STEP_MS,
} from '../core/constants';

export type ControlsEventHandler = (command: PlaybackCommand) => void;
export type SpeedChangeHandler = (speed: number) => void;

export interface ControlsConfig {
  onCommand: ControlsEventHandler;
  onSpeedChange: SpeedChangeHandler;
}

/**
 * Playback Controls Manager
 */
export class PlaybackControls {
  private container: HTMLElement;
  private config: ControlsConfig;
  private state: AnimationState = {
    isPlaying: false,
    currentStepIndex: 0,
    totalSteps: 0,
    speed: DEFAULT_ANIMATION_SPEED_MS,
  };

  // Element references
  private playPauseBtn!: HTMLButtonElement;
  private stepBackBtn!: HTMLButtonElement;
  private stepForwardBtn!: HTMLButtonElement;
  private resetBtn!: HTMLButtonElement;
  private goToEndBtn!: HTMLButtonElement;
  private speedSlider!: HTMLInputElement;
  private speedValue!: HTMLSpanElement;
  private progressBar!: HTMLProgressElement;

  constructor(container: HTMLElement, config: ControlsConfig) {
    this.container = container;
    this.config = config;
    this.render();
    this.bindEvents();
  }

  /**
   * Render the controls HTML
   */
  private render(): void {
    this.container.innerHTML = `
      <div class="controls-wrapper">
        <div class="controls-group controls-playback">
          <button class="btn btn-control" id="btn-reset" title="Reset (R)">
            <span class="control-icon">${iconSkipStart({ size: 18 })}</span>
          </button>
          <button class="btn btn-control" id="btn-step-back" title="Step Back (←)">
            <span class="control-icon">${iconStepBack({ size: 18 })}</span>
          </button>
          <button class="btn btn-control btn-primary" id="btn-play-pause" title="Play/Pause (Space)">
            <span class="control-icon" id="play-pause-icon">${iconPlay({ size: 18 })}</span>
          </button>
          <button class="btn btn-control" id="btn-step-forward" title="Step Forward (→)">
            <span class="control-icon">${iconStepForward({ size: 18 })}</span>
          </button>
          <button class="btn btn-control" id="btn-go-to-end" title="Go to End (E)">
            <span class="control-icon">${iconSkipEnd({ size: 18 })}</span>
          </button>
        </div>

        <div class="controls-group controls-progress">
          <progress id="progress-bar" value="0" max="100"></progress>
        </div>

        <div class="controls-group controls-speed">
          <label class="speed-label" for="speed-slider">Speed:</label>
          <input
            type="range"
            id="speed-slider"
            min="${MIN_ANIMATION_SPEED_MS}"
            max="${MAX_ANIMATION_SPEED_MS}"
            step="${SPEED_STEP_MS}"
            value="${DEFAULT_ANIMATION_SPEED_MS}"
          />
          <span class="speed-value" id="speed-value">${DEFAULT_ANIMATION_SPEED_MS}ms</span>
        </div>
      </div>
    `;

    // Cache element references
    this.playPauseBtn = this.container.querySelector('#btn-play-pause')!;
    this.stepBackBtn = this.container.querySelector('#btn-step-back')!;
    this.stepForwardBtn = this.container.querySelector('#btn-step-forward')!;
    this.resetBtn = this.container.querySelector('#btn-reset')!;
    this.goToEndBtn = this.container.querySelector('#btn-go-to-end')!;
    this.speedSlider = this.container.querySelector('#speed-slider')!;
    this.speedValue = this.container.querySelector('#speed-value')!;
    this.progressBar = this.container.querySelector('#progress-bar')!;
  }

  /**
   * Bind event listeners
   */
  private bindEvents(): void {
    this.playPauseBtn.addEventListener('click', () => {
      this.config.onCommand(this.state.isPlaying ? 'pause' : 'play');
    });

    this.stepBackBtn.addEventListener('click', () => {
      this.config.onCommand('step-back');
    });

    this.stepForwardBtn.addEventListener('click', () => {
      this.config.onCommand('step-forward');
    });

    this.resetBtn.addEventListener('click', () => {
      this.config.onCommand('reset');
    });

    this.goToEndBtn.addEventListener('click', () => {
      this.config.onCommand('go-to-end');
    });

    this.speedSlider.addEventListener('input', () => {
      const speed = parseInt(this.speedSlider.value, 10);
      this.speedValue.textContent = `${speed}ms`;
      this.config.onSpeedChange(speed);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeydown);
  }

  /**
   * Handle keyboard shortcuts
   */
  private handleKeydown = (e: KeyboardEvent): void => {
    // Ignore if typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        this.config.onCommand(this.state.isPlaying ? 'pause' : 'play');
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.config.onCommand('step-back');
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.config.onCommand('step-forward');
        break;
      case 'KeyR':
        e.preventDefault();
        this.config.onCommand('reset');
        break;
      case 'KeyE':
        e.preventDefault();
        this.config.onCommand('go-to-end');
        break;
    }
  };

  /**
   * Update the controls state
   */
  updateState(state: Partial<AnimationState>): void {
    this.state = { ...this.state, ...state };

    // Update play/pause button with SVG icon
    const iconContainer = this.container.querySelector('#play-pause-icon')!;
    iconContainer.innerHTML = this.state.isPlaying
      ? iconPause({ size: 18 })
      : iconPlay({ size: 18 });
    this.playPauseBtn.title = this.state.isPlaying ? 'Pause (Space)' : 'Play (Space)';

    // Update progress bar
    // Handle edge case: when totalSteps is 0 or 1, avoid division by zero
    if (this.state.totalSteps <= 1) {
      this.progressBar.value = this.state.totalSteps === 1 ? 100 : 0;
    } else {
      const progress = (this.state.currentStepIndex / (this.state.totalSteps - 1)) * 100;
      this.progressBar.value = progress;
    }

    // Update button states
    this.stepBackBtn.disabled = this.state.currentStepIndex <= 0;
    this.stepForwardBtn.disabled = this.state.currentStepIndex >= this.state.totalSteps - 1;
    this.resetBtn.disabled = this.state.currentStepIndex === 0 && !this.state.isPlaying;
    this.goToEndBtn.disabled = this.state.currentStepIndex >= this.state.totalSteps - 1;
  }

  /**
   * Set enabled/disabled state for all controls
   */
  setEnabled(enabled: boolean): void {
    const buttons = this.container.querySelectorAll('button');
    buttons.forEach((btn) => {
      btn.disabled = !enabled;
    });
    this.speedSlider.disabled = !enabled;
  }

  /**
   * Clean up event listeners
   */
  dispose(): void {
    document.removeEventListener('keydown', this.handleKeydown);
  }
}
