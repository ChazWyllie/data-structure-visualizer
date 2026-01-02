/**
 * Core type definitions for the Data Structure Visualizer
 */

// =============================================================================
// Snapshot & Step Types
// =============================================================================

/** Snapshot of data structure state at a point in time */
export interface Snapshot<T = unknown> {
  /** The actual data state */
  data: T;
  /** Optional metadata about the state */
  metadata?: Record<string, unknown>;
}

/** Step metadata including counters and complexity */
export interface StepMeta {
  /** Cumulative comparisons up to this step */
  comparisons: number;
  /** Cumulative swaps up to this step */
  swaps: number;
  /** Cumulative reads/visits up to this step */
  reads: number;
  /** Cumulative writes/allocations up to this step */
  writes: number;
  /** Line number in pseudocode to highlight (1-based) */
  highlightedLine?: number;
  /** Color for pseudocode highlight (matches visualization state) */
  highlightColor?: string;
  /** Time complexity at this step (for display) */
  complexity?: string;
}

/** Creates a default StepMeta */
export function createStepMeta(overrides: Partial<StepMeta> = {}): StepMeta {
  return {
    comparisons: 0,
    swaps: 0,
    reads: 0,
    writes: 0,
    ...overrides,
  };
}

/** Represents a single step in the visualization */
export interface Step<T = unknown> {
  /** Unique step identifier */
  id: number;
  /** Description of what's happening at this step */
  description: string;
  /** The data snapshot at this step */
  snapshot: Snapshot<T>;
  /** Step metadata (counters, highlighted line, etc.) */
  meta: StepMeta;
  /** Elements being compared/accessed (for highlighting) */
  activeIndices?: number[];
  /** Elements being swapped/modified */
  modifiedIndices?: number[];
}

// =============================================================================
// Visualizer Types
// =============================================================================

/** Configuration metadata for a visualizer */
export interface VisualizerConfig {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Category for grouping (e.g., 'sorting', 'tree', 'graph') */
  category: string;
  /** Description shown in UI */
  description: string;
  /** Default animation speed in milliseconds per step */
  defaultSpeed?: number;
}

/** Action payload for generating steps */
export interface ActionPayload<T = unknown> {
  /** The action type (e.g., 'sort', 'insert', 'delete') */
  type: string;
  /** The data to operate on */
  data: T;
  /** Optional parameters for the action */
  params?: Record<string, unknown>;
}

/** Input field definition for visualizer controls */
export interface InputField {
  /** Unique identifier for this input */
  id: string;
  /** Label to display */
  label: string;
  /** Input type */
  type: 'number' | 'text' | 'range';
  /** Default value */
  defaultValue: string | number;
  /** Minimum value (for number/range) */
  min?: number;
  /** Maximum value (for number/range) */
  max?: number;
  /** Step value (for number/range) */
  step?: number;
  /** Placeholder text */
  placeholder?: string;
}

/** Supported code languages */
export type CodeLanguage = 'typescript' | 'python' | 'java';

/** Code snippets for multiple languages */
export interface CodeSnippets {
  typescript: string[];
  python: string[];
  java: string[];
}

/** Action button definition */
export interface ActionButton {
  /** Unique identifier */
  id: string;
  /** Button label */
  label: string;
  /** Whether this is a primary action */
  primary?: boolean;
}

/**
 * The main Visualizer interface
 * Every visualizer must implement these three core methods
 */
export interface Visualizer<T = unknown> {
  /** Configuration metadata */
  readonly config: VisualizerConfig;

  /** Get the initial state for the visualization */
  getInitialState(): Snapshot<T>;

  /** Generate all steps for the given action */
  getSteps(actionPayload: ActionPayload<T>): Step<T>[];

  /** Draw the current snapshot to the canvas */
  draw(snapshot: Snapshot<T>, ctx: CanvasRenderingContext2D): void;

  /** Get pseudocode lines for display */
  getPseudocode(): string[];

  /** Get code snippets in multiple languages (optional, defaults to pseudocode) */
  getCode?(): CodeSnippets;

  /** Get time complexity info */
  getComplexity(): ComplexityInfo;

  /** Get input fields for this visualizer */
  getInputs(): InputField[];

  /** Get action buttons for this visualizer */
  getActions(): ActionButton[];

  /** Optional: Clean up resources */
  dispose?(): void;
}

/** Factory function type for creating visualizer instances */
export type VisualizerFactory<T = unknown> = () => Visualizer<T>;

// =============================================================================
// Step Engine Types
// =============================================================================

/** Step Engine state */
export interface EngineState {
  /** All steps for current visualization */
  steps: Step[];
  /** Current step index (0-based) */
  index: number;
  /** Whether animation is playing */
  playing: boolean;
  /** Animation speed in ms per step */
  speed: number;
  /** Last tick timestamp */
  lastTick: number;
}

/** Step Engine event types */
export type EngineEvent =
  | { type: 'step-change'; index: number; step: Step }
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'reset' }
  | { type: 'complete' };

/** Step Engine event listener */
export type EngineListener = (event: EngineEvent) => void;

// =============================================================================
// Animation Types
// =============================================================================

/** Animation state for playback control */
export interface AnimationState {
  /** Whether animation is currently playing */
  isPlaying: boolean;
  /** Current step index (0-based) */
  currentStepIndex: number;
  /** Total number of steps */
  totalSteps: number;
  /** Playback speed in milliseconds per step */
  speed: number;
}

/** Playback control commands */
export type PlaybackCommand =
  | 'play'
  | 'pause'
  | 'step-forward'
  | 'step-back'
  | 'reset'
  | 'go-to-end';

// =============================================================================
// Complexity & Info Types
// =============================================================================

/** Time and space complexity information */
export interface ComplexityInfo {
  /** Time complexity (e.g., 'O(n²)', 'O(n log n)') */
  time: {
    best: string;
    average: string;
    worst: string;
  };
  /** Space complexity */
  space: string;
}

/** Counter for tracking operations */
export interface OperationCounters {
  comparisons: number;
  swaps: number;
  reads: number;
  writes: number;
}

// =============================================================================
// Array Visualization Types
// =============================================================================

/** Element state for rendering */
export type ElementState = 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot' | 'active';

/** Array element with visual state */
export interface ArrayElement<T = number> {
  value: T;
  state: ElementState;
}

// =============================================================================
// Data Structure Types
// =============================================================================

/** Stack element with visual state */
export interface StackElement<T = number> {
  value: T;
  state: 'default' | 'pushing' | 'popping' | 'top';
}

/** Queue element with visual state */
export interface QueueElement<T = number> {
  value: T;
  state: 'default' | 'enqueuing' | 'dequeuing' | 'front' | 'rear';
}

/** Linked list node */
export interface LinkedListNode<T = number> {
  id: string;
  value: T;
  state: 'default' | 'current' | 'found' | 'inserting' | 'deleting';
}

// =============================================================================
// Canvas Types
// =============================================================================

/** Canvas dimensions */
export interface CanvasDimensions {
  width: number;
  height: number;
}

/** Render context with additional utilities */
export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  dimensions: CanvasDimensions;
  dpr: number;
}
