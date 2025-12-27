/**
 * Bubble Sort Visualizer
 * Demonstrates bubble sort algorithm with array bar visualization
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
} from '../core/constants';

// =============================================================================
// Types
// =============================================================================

interface BubbleSortData {
  elements: ArrayElement<number>[];
}

// =============================================================================
// Color Mapping
// =============================================================================

const STATE_COLORS: Record<ElementState, string> = {
  default: '#60a5fa',
  comparing: '#fbbf24',
  swapping: '#f87171',
  sorted: '#4ade80',
  pivot: '#a78bfa',
  active: '#22d3ee',
};

// =============================================================================
// Step Generation (Pure Function)
// =============================================================================

/**
 * Generate bubble sort steps - pure function for testability
 */
export function generateBubbleSortSteps(arr: number[]): Step<BubbleSortData>[] {
  const steps: Step<BubbleSortData>[] = [];
  const elements = arr.map((value) => ({ value, state: 'default' as ElementState }));
  let stepId = 0;
  let comparisons = 0;
  let swaps = 0;

  // Initial state
  steps.push({
    id: stepId++,
    description: 'Initial array state',
    snapshot: { data: { elements: elements.map((e) => ({ ...e })) } },
    meta: createStepMeta({ highlightedLine: 1 }),
  });

  const n = elements.length;

  for (let i = 0; i < n - 1; i++) {
    // Start of pass
    steps.push({
      id: stepId++,
      description: `Pass ${i + 1}: Bubble largest unsorted element to position ${n - 1 - i}`,
      snapshot: { data: { elements: elements.map((e) => ({ ...e })) } },
      meta: createStepMeta({ comparisons, swaps, highlightedLine: 2 }),
    });

    for (let j = 0; j < n - i - 1; j++) {
      // Comparing step
      comparisons++;
      const comparingElements = elements.map((e, idx) => ({
        ...e,
        state: (idx === j || idx === j + 1
          ? 'comparing'
          : idx > n - 1 - i
            ? 'sorted'
            : 'default') as ElementState,
      }));

      steps.push({
        id: stepId++,
        description: `Comparing elements at index ${j} (${elements[j].value}) and ${j + 1} (${elements[j + 1].value})`,
        snapshot: { data: { elements: comparingElements } },
        meta: createStepMeta({ comparisons, swaps, highlightedLine: 3 }),
        activeIndices: [j, j + 1],
      });

      if (elements[j].value > elements[j + 1].value) {
        // Swapping step
        swaps++;
        const swappingElements = elements.map((e, idx) => ({
          ...e,
          state: (idx === j || idx === j + 1
            ? 'swapping'
            : idx > n - 1 - i
              ? 'sorted'
              : 'default') as ElementState,
        }));

        steps.push({
          id: stepId++,
          description: `Swapping ${elements[j].value} and ${elements[j + 1].value} (${elements[j].value} > ${elements[j + 1].value})`,
          snapshot: { data: { elements: swappingElements } },
          meta: createStepMeta({ comparisons, swaps, highlightedLine: 4 }),
          activeIndices: [j, j + 1],
          modifiedIndices: [j, j + 1],
        });

        // Perform swap
        const temp = elements[j];
        elements[j] = elements[j + 1];
        elements[j + 1] = temp;
      }
    }

    // Mark element as sorted
    elements[n - 1 - i].state = 'sorted';
    steps.push({
      id: stepId++,
      description: `Element ${elements[n - 1 - i].value} is now in its sorted position`,
      snapshot: { data: { elements: elements.map((e) => ({ ...e })) } },
      meta: createStepMeta({ comparisons, swaps, highlightedLine: 5 }),
    });
  }

  // Mark first element as sorted (if array is not empty)
  if (elements.length > 0) {
    elements[0].state = 'sorted';
  }
  steps.push({
    id: stepId++,
    description: 'Array is now fully sorted!',
    snapshot: {
      data: { elements: elements.map((e) => ({ ...e, state: 'sorted' as ElementState })) },
    },
    meta: createStepMeta({ comparisons, swaps, highlightedLine: 6 }),
  });

  return steps;
}

// =============================================================================
// Rendering (Pure Function)
// =============================================================================

/**
 * Draw array bars to canvas
 */
function drawArrayBars(
  elements: ArrayElement<number>[],
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  // Clear canvas
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  if (elements.length === 0) {
    return;
  }

  // Calculate bar dimensions
  const availableWidth = width - CANVAS_PADDING * 2;
  const availableHeight = height - CANVAS_PADDING * 2;

  const totalBars = elements.length;
  const rawBarWidth = availableWidth / totalBars;
  const barWidth = Math.max(
    MIN_BAR_WIDTH,
    Math.min(MAX_BAR_WIDTH, rawBarWidth * (1 - BAR_GAP_RATIO))
  );
  const gap = rawBarWidth - barWidth;

  const maxValue = Math.max(...elements.map((e) => e.value));

  // Draw bars
  elements.forEach((element, index) => {
    const barHeight = (element.value / maxValue) * availableHeight;
    const x = CANVAS_PADDING + index * (barWidth + gap);
    const y = height - CANVAS_PADDING - barHeight;

    ctx.fillStyle = STATE_COLORS[element.state];
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, BAR_CORNER_RADIUS);
    ctx.fill();

    // Draw value label if bar is wide enough
    if (barWidth >= 20) {
      ctx.fillStyle = '#e4e4e7';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(element.value.toString(), x + barWidth / 2, y - 4);
    }
  });
}

// =============================================================================
// Visualizer Class
// =============================================================================

class BubbleSortVisualizer implements Visualizer<BubbleSortData> {
  readonly config: VisualizerConfig = {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'sorting',
    description:
      'A simple comparison-based sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.',
    defaultSpeed: 300,
  };

  private arraySize = 15;
  private currentData: BubbleSortData;

  constructor() {
    this.currentData = this.generateRandomData();
  }

  private generateRandomData(): BubbleSortData {
    const elements: ArrayElement<number>[] = [];
    for (let i = 0; i < this.arraySize; i++) {
      elements.push({
        value: Math.floor(Math.random() * 95) + 5,
        state: 'default',
      });
    }
    return { elements };
  }

  getInitialState(): Snapshot<BubbleSortData> {
    this.currentData = this.generateRandomData();
    return { data: this.currentData };
  }

  getSteps(actionPayload: ActionPayload<BubbleSortData>): Step<BubbleSortData>[] {
    if (actionPayload.type === 'randomize') {
      this.arraySize = (actionPayload.params?.size as number) || this.arraySize;
      this.currentData = this.generateRandomData();
      return [
        {
          id: 0,
          description: 'Generated new random array',
          snapshot: { data: this.currentData },
          meta: createStepMeta({ highlightedLine: 1 }),
        },
      ];
    }

    const arr =
      actionPayload.data?.elements.map((e) => e.value) ??
      this.currentData.elements.map((e) => e.value);
    return generateBubbleSortSteps(arr);
  }

  draw(snapshot: Snapshot<BubbleSortData>, ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    drawArrayBars(snapshot.data.elements, ctx, width, height);
  }

  getPseudocode(): string[] {
    return [
      'function bubbleSort(arr):',
      '  for i = 0 to n-1:',
      '    for j = 0 to n-i-1:',
      '      if arr[j] > arr[j+1]:',
      '        swap(arr[j], arr[j+1])',
      '  return arr',
    ];
  }

  getComplexity(): ComplexityInfo {
    return {
      time: {
        best: 'O(n)',
        average: 'O(n²)',
        worst: 'O(n²)',
      },
      space: 'O(1)',
    };
  }

  getInputs(): InputField[] {
    return [
      {
        id: 'size',
        label: 'Array Size',
        type: 'range',
        defaultValue: 15,
        min: 5,
        max: 50,
        step: 1,
      },
    ];
  }

  getActions(): ActionButton[] {
    return [
      { id: 'randomize', label: 'Randomize', primary: false },
      { id: 'sort', label: 'Sort', primary: true },
    ];
  }
}

// =============================================================================
// Registration
// =============================================================================

registry.register<BubbleSortData>(
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'sorting',
    description: 'A simple comparison-based sorting algorithm',
    defaultSpeed: 300,
  },
  () => new BubbleSortVisualizer()
);

export { BubbleSortVisualizer };
