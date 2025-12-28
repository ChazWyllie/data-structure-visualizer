/**
 * Selection Sort Visualizer
 */

import type {
  Visualizer,
  VisualizerConfig,
  Snapshot,
  Step,
  ActionPayload,
  ComplexityInfo,
  ElementState,
  InputField,
  ActionButton,
} from '../core/types';
import { createStepMeta } from '../core/types';
import { registry } from '../core/registry';
import type { SortingData } from './sorting-shared';
import { drawArrayBars, generateRandomArray } from './sorting-shared';

export function generateSelectionSortSteps(arr: number[]): Step<SortingData>[] {
  const steps: Step<SortingData>[] = [];
  const elements = arr.map((value) => ({ value, state: 'default' as ElementState }));
  let stepId = 0;
  let comparisons = 0;
  let swaps = 0;

  steps.push({
    id: stepId++,
    description: 'Initial array state',
    snapshot: { data: { elements: elements.map((e) => ({ ...e })) } },
    meta: createStepMeta({ highlightedLine: 1 }),
  });

  const n = elements.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    // Mark current position as active
    const startElements = elements.map((e, idx) => ({
      ...e,
      state: (idx < i ? 'sorted' : idx === i ? 'active' : 'default') as ElementState,
    }));
    steps.push({
      id: stepId++,
      description: `Finding minimum element from index ${i} to ${n - 1}`,
      snapshot: { data: { elements: startElements } },
      meta: createStepMeta({ comparisons, swaps, highlightedLine: 2 }),
    });

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      const comparingElements = elements.map((e, idx) => ({
        ...e,
        state: (idx < i
          ? 'sorted'
          : idx === minIdx
            ? 'pivot'
            : idx === j
              ? 'comparing'
              : 'default') as ElementState,
      }));
      steps.push({
        id: stepId++,
        description: `Comparing element at ${j} (${elements[j].value}) with current min at ${minIdx} (${elements[minIdx].value})`,
        snapshot: { data: { elements: comparingElements } },
        meta: createStepMeta({ comparisons, swaps, highlightedLine: 3 }),
        activeIndices: [minIdx, j],
      });

      if (elements[j].value < elements[minIdx].value) {
        minIdx = j;
        const newMinElements = elements.map((e, idx) => ({
          ...e,
          state: (idx < i ? 'sorted' : idx === minIdx ? 'pivot' : 'default') as ElementState,
        }));
        steps.push({
          id: stepId++,
          description: `New minimum found: ${elements[minIdx].value} at index ${minIdx}`,
          snapshot: { data: { elements: newMinElements } },
          meta: createStepMeta({ comparisons, swaps, highlightedLine: 4 }),
        });
      }
    }

    if (minIdx !== i) {
      swaps++;
      const swappingElements = elements.map((e, idx) => ({
        ...e,
        state: (idx < i
          ? 'sorted'
          : idx === i || idx === minIdx
            ? 'swapping'
            : 'default') as ElementState,
      }));
      steps.push({
        id: stepId++,
        description: `Swapping ${elements[i].value} at index ${i} with ${elements[minIdx].value} at index ${minIdx}`,
        snapshot: { data: { elements: swappingElements } },
        meta: createStepMeta({ comparisons, swaps, highlightedLine: 5 }),
        modifiedIndices: [i, minIdx],
      });

      const temp = elements[i];
      elements[i] = elements[minIdx];
      elements[minIdx] = temp;
    }

    elements[i].state = 'sorted';
  }

  if (elements.length > 0) {
    elements[n - 1].state = 'sorted';
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

class SelectionSortVisualizer implements Visualizer<SortingData> {
  readonly config: VisualizerConfig = {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'sorting',
    description: 'Finds the minimum element and places it at the beginning, repeatedly.',
    defaultSpeed: 300,
  };

  private arraySize = 15;
  private currentData: SortingData;

  constructor() {
    this.currentData = generateRandomArray(this.arraySize);
  }

  getInitialState(): Snapshot<SortingData> {
    this.currentData = generateRandomArray(this.arraySize);
    return { data: this.currentData };
  }

  getSteps(actionPayload: ActionPayload<SortingData>): Step<SortingData>[] {
    if (actionPayload.type === 'randomize') {
      this.arraySize = (actionPayload.params?.size as number) || this.arraySize;
      this.currentData = generateRandomArray(this.arraySize);
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
    return generateSelectionSortSteps(arr);
  }

  draw(snapshot: Snapshot<SortingData>, ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    drawArrayBars(snapshot.data.elements, ctx, canvas.width / dpr, canvas.height / dpr);
  }

  getPseudocode(): string[] {
    return [
      'function selectionSort(arr):',
      '  for i = 0 to n-1:',
      '    minIdx = i',
      '    for j = i+1 to n:',
      '      if arr[j] < arr[minIdx]: minIdx = j',
      '    swap(arr[i], arr[minIdx])',
    ];
  }

  getComplexity(): ComplexityInfo {
    return { time: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' }, space: 'O(1)' };
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

registry.register<SortingData>(
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'sorting',
    description: 'Selection sort algorithm',
    defaultSpeed: 300,
  },
  () => new SelectionSortVisualizer()
);

export { SelectionSortVisualizer };
