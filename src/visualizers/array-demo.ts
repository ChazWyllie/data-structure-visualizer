/**
 * Array Demo Visualizer
 * Sample visualizer that draws bars for an array snapshot
 * Demonstrates the visualizer interface pattern
 */

import type {
  Visualizer,
  VisualizerConfig,
  Snapshot,
  Step,
  ActionPayload,
  ComplexityInfo,
  ArrayElement,
  ElementState,
  InputField,
  ActionButton,
} from '../core/types';
import { createStepMeta } from '../core/types';
import { registry } from '../core/registry';
import {
  CANVAS_PADDING,
  BAR_GAP_RATIO,
  MIN_BAR_WIDTH,
  MAX_BAR_WIDTH,
  BAR_CORNER_RADIUS,
  DEFAULT_ARRAY_SIZE,
  MIN_ARRAY_VALUE,
  MAX_ARRAY_VALUE,
} from '../core/constants';

// =============================================================================
// Types
// =============================================================================

interface ArrayDemoData {
  elements: ArrayElement<number>[];
}

// =============================================================================
// Color Mapping
// =============================================================================

const STATE_COLORS: Record<ElementState, string> = {
  default: '#60a5fa', // --vis-default
  comparing: '#fbbf24', // --vis-comparing
  swapping: '#f87171', // --vis-swapping
  sorted: '#4ade80', // --vis-sorted
  pivot: '#a78bfa', // --vis-pivot
  active: '#22d3ee', // --vis-active
};

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Generate a random array of numbers
 */
function generateRandomArray(size: number): number[] {
  return Array.from(
    { length: size },
    () => Math.floor(Math.random() * (MAX_ARRAY_VALUE - MIN_ARRAY_VALUE + 1)) + MIN_ARRAY_VALUE
  );
}

/**
 * Convert raw array to ArrayElement array
 */
function toElements(arr: number[], state: ElementState = 'default'): ArrayElement<number>[] {
  return arr.map((value) => ({ value, state }));
}

/**
 * Draw a rounded rectangle
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}

// =============================================================================
// Array Demo Visualizer Class
// =============================================================================

class ArrayDemoVisualizer implements Visualizer<ArrayDemoData> {
  readonly config: VisualizerConfig = {
    id: 'array-demo',
    name: 'Array Demo',
    category: 'demo',
    description:
      'A demonstration visualizer that displays an array as vertical bars. Shows how elements can be highlighted in different states.',
    defaultSpeed: 500,
  };

  private initialData: ArrayDemoData;

  constructor() {
    this.initialData = {
      elements: toElements(generateRandomArray(DEFAULT_ARRAY_SIZE)),
    };
  }

  /**
   * Get the initial state for the visualization
   */
  getInitialState(): Snapshot<ArrayDemoData> {
    return {
      data: { ...this.initialData },
      metadata: { generated: Date.now() },
    };
  }

  /**
   * Generate steps for a demo animation
   */
  getSteps(actionPayload: ActionPayload<ArrayDemoData>): Step<ArrayDemoData>[] {
    const steps: Step<ArrayDemoData>[] = [];
    const data = actionPayload.data || this.initialData;
    const elements = [...data.elements];

    // Step 0: Initial state
    steps.push({
      id: 0,
      description: 'Initial array state',
      snapshot: {
        data: { elements: elements.map((e) => ({ ...e, state: 'default' as ElementState })) },
      },
      meta: createStepMeta({ highlightedLine: 1 }),
    });

    // Demo: Highlight each element sequentially
    for (let i = 0; i < elements.length; i++) {
      const stepElements = elements.map((e, idx) => ({
        ...e,
        state: (idx === i ? 'active' : idx < i ? 'sorted' : 'default') as ElementState,
      }));

      steps.push({
        id: i + 1,
        description: `Visiting element at index ${i} (value: ${elements[i].value})`,
        snapshot: { data: { elements: stepElements } },
        activeIndices: [i],
        meta: createStepMeta({ reads: i + 1, highlightedLine: 2 }),
      });
    }

    // Final step: All sorted
    steps.push({
      id: elements.length + 1,
      description: 'All elements visited',
      snapshot: {
        data: { elements: elements.map((e) => ({ ...e, state: 'sorted' as ElementState })) },
      },
      meta: createStepMeta({ reads: elements.length, highlightedLine: 3 }),
    });

    return steps;
  }

  /**
   * Draw the current snapshot to the canvas
   */
  draw(snapshot: Snapshot<ArrayDemoData>, ctx: CanvasRenderingContext2D): void {
    const { elements } = snapshot.data;
    const canvas = ctx.canvas;

    // Get logical dimensions (accounting for devicePixelRatio)
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    // Clear canvas with background
    ctx.fillStyle = '#0a0a0a'; // --surface-canvas
    ctx.fillRect(0, 0, width, height);

    if (elements.length === 0) {
      return;
    }

    // Calculate bar dimensions
    const availableWidth = width - CANVAS_PADDING * 2;
    const availableHeight = height - CANVAS_PADDING * 2;

    // Calculate bar width with gap
    const totalBars = elements.length;
    const rawBarWidth = availableWidth / totalBars;
    const barWidth = Math.max(
      MIN_BAR_WIDTH,
      Math.min(MAX_BAR_WIDTH, rawBarWidth * (1 - BAR_GAP_RATIO))
    );
    const gap = rawBarWidth - barWidth;

    // Find max value for scaling
    const maxValue = Math.max(...elements.map((e) => e.value));

    // Draw bars
    elements.forEach((element, index) => {
      const barHeight = (element.value / maxValue) * availableHeight;
      const x = CANVAS_PADDING + index * (barWidth + gap);
      const y = height - CANVAS_PADDING - barHeight;

      // Set color based on state
      ctx.fillStyle = STATE_COLORS[element.state];

      // Draw rounded bar
      drawRoundedRect(ctx, x, y, barWidth, barHeight, BAR_CORNER_RADIUS);

      // Draw value label if bar is wide enough
      if (barWidth >= 20) {
        ctx.fillStyle = '#e4e4e7'; // --text-primary
        ctx.font = '10px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(element.value.toString(), x + barWidth / 2, y - 4);
      }
    });
  }

  /**
   * Get pseudocode for display
   */
  getPseudocode(): string[] {
    return [
      'function visitArray(arr):',
      '  for i = 0 to arr.length - 1:',
      '    visit(arr[i])',
      '  return "done"',
    ];
  }

  /**
   * Get complexity info
   */
  getComplexity(): ComplexityInfo {
    return {
      time: {
        best: 'O(n)',
        average: 'O(n)',
        worst: 'O(n)',
      },
      space: 'O(1)',
    };
  }

  /**
   * Get input fields for this visualizer
   */
  getInputs(): InputField[] {
    return [
      {
        id: 'size',
        label: 'Array Size',
        type: 'number',
        defaultValue: DEFAULT_ARRAY_SIZE,
        min: 3,
        max: 50,
      },
    ];
  }

  /**
   * Get action buttons for this visualizer
   */
  getActions(): ActionButton[] {
    return [
      { id: 'randomize', label: 'Randomize' },
      { id: 'demo', label: 'Demo', primary: true },
    ];
  }

  /**
   * Reset with new random data
   */
  reset(): void {
    this.initialData = {
      elements: toElements(generateRandomArray(DEFAULT_ARRAY_SIZE)),
    };
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    // No resources to clean up
  }
}

// =============================================================================
// Self-Registration
// =============================================================================

// Register the visualizer with the registry
registry.register<ArrayDemoData>(
  {
    id: 'array-demo',
    name: 'Array Demo',
    category: 'demo',
    description: 'A demonstration visualizer that displays an array as vertical bars.',
    defaultSpeed: 500,
  },
  () => new ArrayDemoVisualizer()
);

// Export for direct use
export { ArrayDemoVisualizer };
export type { ArrayDemoData };
