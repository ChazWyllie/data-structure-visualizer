/**
 * Application Controller
 * Manages app state and coordinates between components
 */

import type {
  Visualizer,
  Step,
  Snapshot,
  AnimationState,
  PlaybackCommand,
  OperationCounters,
} from '../core/types';
import { registry, DEFAULT_ANIMATION_SPEED_MS } from '../core';
import { CanvasManager, RenderLoop } from '../render';
import {
  mountLayout,
  getElement,
  PlaybackControls,
  VisualizerSelector,
  InfoPanel,
  InputControls,
  Landing,
  ShowcaseDirectory,
  LandingV1Minimal,
  LandingV2Showcase,
  LandingV3Immersive,
  type LandingPageComponent,
} from '../ui';
import { iconSun, iconMoon } from '../ui/icons';
import { StepEngine } from '../engine/step-engine';

// Import visualizers to trigger registration
import '../visualizers';

/* eslint-disable no-console */

/**
 * Main Application Controller
 */
export class App {
  // Core components
  private canvasManager!: CanvasManager;
  private renderLoop: RenderLoop;
  private controls!: PlaybackControls;
  private _selector!: VisualizerSelector;
  private infoPanel!: InfoPanel;
  private inputControls!: InputControls;
  private stepEngine: StepEngine;
  private landing!: Landing;
  private showcase!: ShowcaseDirectory;
  private currentLandingPage: LandingPageComponent | null = null;
  private isLandingMode = true;

  // State
  private currentVisualizer: Visualizer | null = null;
  private animationState: AnimationState = {
    isPlaying: false,
    currentStepIndex: 0,
    totalSteps: 0,
    speed: DEFAULT_ANIMATION_SPEED_MS,
  };
  private _counters: OperationCounters = {
    comparisons: 0,
    swaps: 0,
    reads: 0,
    writes: 0,
  };

  constructor() {
    this.renderLoop = new RenderLoop();
    this.stepEngine = new StepEngine();
  }

  /** Get the visualizer selector */
  get selector(): VisualizerSelector {
    return this._selector;
  }

  /** Get operation counters */
  get counters(): OperationCounters {
    return this._counters;
  }

  /**
   * Initialize the application
   */
  init(): void {
    // Mount the layout
    mountLayout();

    // Initialize canvas manager
    const canvas = getElement<HTMLCanvasElement>('main-canvas');
    this.canvasManager = new CanvasManager(canvas);

    // Initialize UI components
    this.initControls();
    this.initSelector();
    this.initInputControls();
    this.initMobileToggle();
    this.initThemeToggle();
    this.infoPanel = new InfoPanel();

    // Subscribe to step engine events
    this.setupStepEngineListeners();

    // Initialize landing page and showcase
    this.initLanding();
    this.initShowcase();

    // Handle canvas resize
    this.canvasManager.onResize(() => {
      if (!this.isLandingMode) {
        this.render();
      }
    });

    // Start in landing mode (do not auto-load a visualizer)
    // Navigation is handled by main.ts via hash routing

    console.log('Data Structure Visualizer initialized');
    console.log(`Registered visualizers: ${registry.count}`);
  }

  /**
   * Initialize playback controls
   */
  private initControls(): void {
    const controlsContainer = getElement('controls-container');
    this.controls = new PlaybackControls(controlsContainer, {
      onCommand: (command) => this.handleCommand(command),
      onSpeedChange: (speed) => this.handleSpeedChange(speed),
    });
  }

  /**
   * Initialize visualizer selector
   */
  private initSelector(): void {
    const selectorContainer = getElement('visualizer-selector-container');
    this._selector = new VisualizerSelector(selectorContainer, (id) => {
      // When user selects via dropdown, navigate via hash
      window.location.hash = `viz=${id}`;
    });
  }

  /**
   * Initialize landing page
   */
  private initLanding(): void {
    const landingRoot = getElement('landing-root');
    this.landing = new Landing(landingRoot, (id) => {
      // When user clicks a landing card, navigate via hash
      window.location.hash = `viz=${id}`;
    });
  }

  /**
   * Initialize showcase directory
   */
  private initShowcase(): void {
    const showcaseRoot = getElement('showcase-root');
    this.showcase = new ShowcaseDirectory(showcaseRoot, (landingId) => {
      // When user clicks a showcase card, navigate to landing preview
      window.location.hash = landingId;
    });
  }

  /**
   * Initialize input controls
   */
  private initInputControls(): void {
    const inputControlsSection = getElement('input-controls-section');
    this.inputControls = new InputControls(inputControlsSection);

    this.inputControls.setActionCallback((actionId, inputs) => {
      this.handleAction(actionId, inputs);
    });
  }

  /**
   * Initialize mobile panel toggle
   */
  private initMobileToggle(): void {
    const toggleBtn = document.getElementById('mobile-panel-toggle');
    const infoPanel = document.getElementById('info-panel');

    if (toggleBtn && infoPanel) {
      toggleBtn.addEventListener('click', () => {
        infoPanel.classList.toggle('collapsed');
        const isExpanded = !infoPanel.classList.contains('collapsed');
        toggleBtn.setAttribute('aria-expanded', String(isExpanded));
      });
    }
  }

  /**
   * Initialize theme toggle button
   */
  private initThemeToggle(): void {
    const THEME_KEY = 'dsv-theme';
    const toggleBtn = document.getElementById('theme-toggle');
    const iconSpan = toggleBtn?.querySelector('.theme-icon');

    if (!toggleBtn || !iconSpan) {
      return;
    }

    // Apply saved theme or default to dark
    const savedTheme = localStorage.getItem(THEME_KEY) ?? 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    iconSpan.innerHTML = savedTheme === 'dark' ? iconSun({ size: 20 }) : iconMoon({ size: 20 });

    toggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') ?? 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem(THEME_KEY, newTheme);
      iconSpan.innerHTML = newTheme === 'dark' ? iconSun({ size: 20 }) : iconMoon({ size: 20 });
    });
  }

  /**
   * Set up step engine event listeners
   */
  private setupStepEngineListeners(): void {
    this.stepEngine.subscribe((event) => {
      switch (event.type) {
        case 'step-change':
          this.onStepChange(event.index, event.step);
          break;
        case 'play':
          this.animationState.isPlaying = true;
          this.controls.updateState(this.animationState);
          break;
        case 'pause':
        case 'complete':
          this.animationState.isPlaying = false;
          this.controls.updateState(this.animationState);
          break;
        case 'reset':
          this.resetCounters();
          this.updateAnimationStateFromEngine();
          this.controls.updateState(this.animationState);
          break;
      }
    });
  }

  /**
   * Handle step change events from the engine
   */
  private onStepChange(index: number, step: Step): void {
    this.animationState.currentStepIndex = index;

    // Update counters from step meta if available
    if (step.meta) {
      this._counters = {
        comparisons: step.meta.comparisons ?? this._counters.comparisons,
        swaps: step.meta.swaps ?? this._counters.swaps,
        reads: step.meta.reads ?? this._counters.reads,
        writes: step.meta.writes ?? this._counters.writes,
      };
      this.infoPanel.setCounters(this._counters);
    }

    this.updateStepInfo();
    this.controls.updateState(this.animationState);
    this.render();
  }

  /**
   * Update animation state from engine state
   */
  private updateAnimationStateFromEngine(): void {
    const engineState = this.stepEngine.getState();
    this.animationState = {
      ...this.animationState,
      currentStepIndex: engineState.index,
      totalSteps: engineState.steps.length,
      isPlaying: engineState.playing,
      speed: engineState.speed,
    };
  }

  /**
   * Load a visualizer by ID
   */
  private loadVisualizer(id: string): void {
    console.log(`[loadVisualizer] Loading: ${id}`);
    // Clean up previous visualizer
    if (this.currentVisualizer?.dispose) {
      this.currentVisualizer.dispose();
    }

    // Get new visualizer instance
    const visualizer = registry.get(id);
    if (!visualizer) {
      console.error(`Visualizer "${id}" not found`);
      return;
    }

    this.currentVisualizer = visualizer;

    // Update info panel
    this.infoPanel.setDescription(visualizer.config.description);

    if (visualizer.getPseudocode) {
      const codeSnippets = visualizer.getCode?.() ?? null;
      this.infoPanel.setPseudocode(visualizer.getPseudocode(), undefined, codeSnippets);
    }

    if (visualizer.getComplexity) {
      this.infoPanel.setComplexity(visualizer.getComplexity());
    }

    // Update input controls
    this.updateInputControls();

    // Generate initial steps
    this.regenerateSteps();

    console.log(`Loaded visualizer: ${visualizer.config.name}`);
  }

  /**
   * Update input controls for current visualizer
   */
  private updateInputControls(): void {
    if (!this.currentVisualizer) {
      this.inputControls.setInputFields([]);
      this.inputControls.setActionButtons([]);
      return;
    }

    const inputs = this.currentVisualizer.getInputs?.() ?? [];
    const actions = this.currentVisualizer.getActions?.() ?? [];

    this.inputControls.setInputFields(inputs);
    this.inputControls.setActionButtons(actions);
  }

  /**
   * Handle action button clicks
   */
  private handleAction(actionId: string, inputs: Record<string, string | number>): void {
    if (!this.currentVisualizer) {
      return;
    }

    // Pause any running animation
    this.stepEngine.pause();

    // Generate new steps based on the action
    // Pass user inputs as params, not data
    const steps = this.currentVisualizer.getSteps({
      type: actionId,
      data: null as unknown,
      params: inputs,
    });

    // Load new steps into engine
    this.stepEngine.loadSteps(steps);
    this.animationState.totalSteps = steps.length;
    this.controls.updateState(this.animationState);

    // Auto-play for actions
    if (steps.length > 1) {
      this.stepEngine.play();
    }

    // Note: render() is called automatically via step-change event from loadSteps()
    console.log(`Action "${actionId}" generated ${steps.length} steps`);
  }

  /**
   * Regenerate steps for current visualizer
   */
  private regenerateSteps(): void {
    if (!this.currentVisualizer) {
      return;
    }

    const initialState = this.currentVisualizer.getInitialState();
    const steps = this.currentVisualizer.getSteps({
      type: 'demo',
      data: initialState.data,
    });

    // Load steps into engine
    this.stepEngine.loadSteps(steps);

    // Update animation state
    this.animationState = {
      ...this.animationState,
      isPlaying: false,
      currentStepIndex: 0,
      totalSteps: steps.length,
    };

    this.resetCounters();
    this.controls.updateState(this.animationState);
    this.updateStepInfo();
    // Note: render() is called automatically via step-change event from loadSteps()

    console.log(`Generated ${steps.length} steps`);
  }

  /**
   * Handle playback commands
   */
  private handleCommand(command: PlaybackCommand): void {
    switch (command) {
      case 'play':
        this.stepEngine.play();
        break;
      case 'pause':
        this.stepEngine.pause();
        break;
      case 'step-forward':
        this.stepEngine.stepForward();
        break;
      case 'step-back':
        this.stepEngine.stepBack();
        break;
      case 'reset':
        this.stepEngine.reset();
        this.regenerateSteps();
        break;
      case 'go-to-end':
        this.stepEngine.goToEnd();
        break;
    }
  }

  /**
   * Handle speed change
   */
  private handleSpeedChange(speed: number): void {
    this.animationState.speed = speed;
    this.stepEngine.setSpeed(speed);
  }

  /**
   * Render the current state
   */
  private render(): void {
    // Ensure canvas is ready for drawing with proper HiDPI scale
    this.canvasManager.prepareForDraw();

    if (!this.currentVisualizer) {
      console.log('[render] No currentVisualizer, rendering empty state');
      this.renderEmptyState();
      return;
    }

    const currentStep = this.stepEngine.getCurrentStep();
    console.log(
      `[render] visualizer=${this.currentVisualizer.config.id}, step=${currentStep?.id}, desc=${currentStep?.description?.slice(0, 50)}`
    );
    if (currentStep) {
      const ctx = this.canvasManager.getContext();
      const snapshot: Snapshot<unknown> = currentStep.snapshot;
      this.currentVisualizer.draw(snapshot, ctx);
    } else {
      this.renderEmptyState();
    }
  }

  /**
   * Render empty state placeholder
   */
  private renderEmptyState(): void {
    const ctx = this.canvasManager.getContext();
    const { width, height } = this.canvasManager.getDimensions();

    // Clear with background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Draw icon
    ctx.fillStyle = '#3a3a3a';
    ctx.font = '48px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📊', width / 2, height / 2 - 40);

    // Draw title
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '600 18px system-ui';
    ctx.fillText('Select a Visualizer', width / 2, height / 2 + 10);

    // Draw subtitle
    ctx.fillStyle = '#71717a';
    ctx.font = '14px system-ui';
    ctx.fillText('Choose an algorithm from the dropdown above', width / 2, height / 2 + 35);
  }

  /**
   * Update step info in the panel
   */
  private updateStepInfo(): void {
    const currentStep = this.stepEngine.getCurrentStep();
    const engineState = this.stepEngine.getState();

    this.infoPanel.setStepInfo(currentStep, engineState.index, engineState.steps.length);
  }

  /**
   * Reset operation counters
   */
  private resetCounters(): void {
    this._counters = { comparisons: 0, swaps: 0, reads: 0, writes: 0 };
    this.infoPanel.resetCounters();
  }

  /**
   * Set the landing mode (show/hide landing vs visualizer UI)
   */
  private setLandingMode(isLanding: boolean): void {
    this.isLandingMode = isLanding;
    const app = document.getElementById('app');
    if (app) {
      app.setAttribute('data-mode', isLanding ? 'landing' : 'visualizer');
    }

    // Hide/show and enable/disable controls based on mode
    this.controls.setEnabled(!isLanding);
  }

  /**
   * Show the entry page (V2 Showcase as primary landing, called from main.ts)
   */
  showEntry(): void {
    // Pause and reset engine
    this.stepEngine.pause();
    this.stepEngine.reset();

    // Clear current visualizer
    if (this.currentVisualizer?.dispose) {
      this.currentVisualizer.dispose();
    }
    this.currentVisualizer = null;

    // Unmount other views
    this.landing.unmount();
    this.showcase.unmount();
    this.unmountCurrentLandingPage();
    this.isLandingMode = false;

    // Set app mode to landing (hides canvas/controls)
    const app = document.getElementById('app');
    if (app) {
      app.setAttribute('data-mode', 'landing');
    }
    this.controls.setEnabled(false);

    // Create V2 Showcase in entry mode (no back button)
    const lpRoot = getElement('lp-root');
    this.currentLandingPage = new LandingV2Showcase(
      lpRoot,
      () => {
        window.location.hash = 'home';
      },
      true
    ); // isEntryMode = true

    this.currentLandingPage.mount();
    console.log('Showing entry page (V2 Showcase)');
  }

  /**
   * Show the landing page (public, called from main.ts)
   */
  showLanding(): void {
    // Pause and reset engine
    this.stepEngine.pause();
    this.stepEngine.reset();

    // Clear current visualizer
    if (this.currentVisualizer?.dispose) {
      this.currentVisualizer.dispose();
    }
    this.currentVisualizer = null;

    // Reset UI state
    this.resetCounters();
    this.animationState = {
      isPlaying: false,
      currentStepIndex: 0,
      totalSteps: 0,
      speed: this.animationState.speed,
    };
    this.controls.updateState(this.animationState);

    // Clear info panel
    this.infoPanel.setDescription('Select a visualizer to begin');
    this.infoPanel.setPseudocode(['// Select a visualizer']);
    this.infoPanel.setComplexity({ time: { best: '—', average: '—', worst: '—' }, space: '—' });
    this.infoPanel.setStepInfo(null, 0, 0);

    // Clear input controls
    this.inputControls.setInputFields([]);
    this.inputControls.setActionButtons([]);

    // Clear selector selection
    this._selector.clear();

    // Switch to landing mode
    this.setLandingMode(true);
    this.showcase.unmount();
    this.unmountCurrentLandingPage();
    this.landing.mount();

    console.log('Showing landing page');
  }

  /**
   * Show the showcase directory (public, called from main.ts)
   */
  showShowcase(): void {
    // Pause and reset engine
    this.stepEngine.pause();
    this.stepEngine.reset();

    // Clear current visualizer
    if (this.currentVisualizer?.dispose) {
      this.currentVisualizer.dispose();
    }
    this.currentVisualizer = null;

    // Unmount other views
    this.landing.unmount();
    this.unmountCurrentLandingPage();
    this.isLandingMode = false;

    // Set app mode to landing (hides canvas/controls)
    const app = document.getElementById('app');
    if (app) {
      app.setAttribute('data-mode', 'landing');
    }
    this.controls.setEnabled(false);

    // Mount showcase
    this.showcase.mount();

    console.log('Showing showcase directory');
  }

  /**
   * Show a landing page preview (public, called from main.ts)
   */
  showLandingPreview(landingId: string): void {
    // Pause and reset engine
    this.stepEngine.pause();
    this.stepEngine.reset();

    // Clear current visualizer
    if (this.currentVisualizer?.dispose) {
      this.currentVisualizer.dispose();
    }
    this.currentVisualizer = null;

    // Unmount other views
    this.landing.unmount();
    this.showcase.unmount();
    this.unmountCurrentLandingPage();
    this.isLandingMode = false;

    // Set app mode to landing (hides canvas/controls)
    const app = document.getElementById('app');
    if (app) {
      app.setAttribute('data-mode', 'landing');
    }
    this.controls.setEnabled(false);

    // Create and mount the appropriate landing page
    const lpRoot = getElement('lp-root');
    const backHandler = () => {
      window.location.hash = 'showcase';
    };

    switch (landingId) {
      case 'landing-v1':
        this.currentLandingPage = new LandingV1Minimal(lpRoot, backHandler);
        break;
      case 'landing-v2':
        this.currentLandingPage = new LandingV2Showcase(lpRoot, backHandler);
        break;
      case 'landing-v3':
        this.currentLandingPage = new LandingV3Immersive(lpRoot, backHandler);
        break;
      default:
        console.warn(`Unknown landing page: ${landingId}`);
        window.location.hash = 'showcase';
        return;
    }

    this.currentLandingPage.mount();
    console.log(`Showing landing page preview: ${landingId}`);
  }

  /**
   * Unmount the current landing page preview if any
   */
  private unmountCurrentLandingPage(): void {
    if (this.currentLandingPage) {
      this.currentLandingPage.unmount();
      this.currentLandingPage = null;
    }
  }

  /**
   * Load a visualizer by ID (public, called from main.ts)
   */
  loadVisualizerById(id: string): boolean {
    // Check if the visualizer exists
    if (!registry.has(id)) {
      console.warn(`Visualizer "${id}" not found, redirecting to home`);
      return false;
    }

    // Switch out of all overlay modes
    this.landing.unmount();
    this.showcase.unmount();
    this.unmountCurrentLandingPage();
    this.setLandingMode(false);

    // Update selector UI (but don't trigger its callback)
    if (this._selector.getSelectedId() !== id) {
      // Manually update the dropdown value without firing onSelect
      const selectEl = document.getElementById('visualizer-select') as HTMLSelectElement | null;
      if (selectEl) {
        selectEl.value = id;
      }
    }

    // Load the visualizer
    this.loadVisualizer(id);

    // Initial render
    requestAnimationFrame(() => {
      this.canvasManager.refresh();
      this.render();
    });

    return true;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.renderLoop.stop();
    this.stepEngine.pause();
    this.canvasManager.dispose();
    this.controls.dispose();
    if (this.currentVisualizer?.dispose) {
      this.currentVisualizer.dispose();
    }
  }
}

/**
 * Create and initialize the application
 */
export function createApp(): App {
  const app = new App();
  app.init();
  return app;
}
