/**
 * Named constants - no magic numbers!
 */

// =============================================================================
// Animation Constants
// =============================================================================

/** Default animation speed in milliseconds per step */
export const DEFAULT_ANIMATION_SPEED_MS = 500;

/** Minimum animation speed (fastest) */
export const MIN_ANIMATION_SPEED_MS = 50;

/** Maximum animation speed (slowest) */
export const MAX_ANIMATION_SPEED_MS = 2000;

/** Speed step increment for slider */
export const SPEED_STEP_MS = 50;

// =============================================================================
// Canvas Constants
// =============================================================================

/** Minimum canvas padding in pixels */
export const CANVAS_PADDING = 20;

/** Bar gap ratio (percentage of bar width) */
export const BAR_GAP_RATIO = 0.2;

/** Minimum bar width in pixels */
export const MIN_BAR_WIDTH = 4;

/** Maximum bar width in pixels */
export const MAX_BAR_WIDTH = 80;

/** Corner radius for rounded bars */
export const BAR_CORNER_RADIUS = 4;

// =============================================================================
// Array Demo Constants
// =============================================================================

/** Default array size for demo */
export const DEFAULT_ARRAY_SIZE = 20;

/** Minimum value in generated arrays */
export const MIN_ARRAY_VALUE = 5;

/** Maximum value in generated arrays */
export const MAX_ARRAY_VALUE = 100;

// =============================================================================
// UI Constants
// =============================================================================

/** Sidebar width in pixels */
export const SIDEBAR_WIDTH = 320;

/** Header height in pixels */
export const HEADER_HEIGHT = 56;

/** Controls height in pixels */
export const CONTROLS_HEIGHT = 64;

/** Transition duration for UI animations */
export const UI_TRANSITION_MS = 200;

// =============================================================================
// Z-Index Scale
// =============================================================================

export const Z_INDEX = {
  BASE: 0,
  CANVAS: 10,
  CONTROLS: 50,
  DROPDOWN: 100,
  MODAL: 200,
  TOOLTIP: 300,
} as const;

// =============================================================================
// Playback Speed Presets
// =============================================================================

export const SPEED_PRESETS = {
  SLOW: 1000,
  NORMAL: 500,
  FAST: 200,
  VERY_FAST: 100,
} as const;

// =============================================================================
// Category Labels
// =============================================================================

export const CATEGORY_LABELS: Record<string, string> = {
  sorting: 'Sorting Algorithms',
  searching: 'Searching Algorithms',
  tree: 'Tree Structures',
  graph: 'Graph Algorithms',
  'linked-list': 'Linked Lists',
  stack: 'Stacks',
  queue: 'Queues',
  demo: 'Demos',
} as const;
