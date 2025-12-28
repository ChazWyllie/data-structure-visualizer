/**
 * Insertion Sort Visualizer
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

export function generateInsertionSortSteps(arr: number[]): Step<SortingData>[] {
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
  if (n > 0) {
    elements[0].state = 'sorted';
  }

  for (let i = 1; i < n; i++) {
    const key = elements[i].value;
    let j = i - 1;

    const pickElements = elements.map((e, idx) => ({
      ...e,
      state: (idx < i ? 'sorted' : idx === i ? 'active' : 'default') as ElementState,
    }));
    steps.push({
      id: stepId++,
      description: `Inserting element ${key} at index ${i} into sorted portion`,
      snapshot: { data: { elements: pickElements } },
      meta: createStepMeta({ comparisons, swaps, highlightedLine: 2 }),
    });

    while (j >= 0 && elements[j].value > key) {
      comparisons++;
      const comparingElements = elements.map((e, idx) => ({
        ...e,
        state: (idx === j
          ? 'comparing'
          : idx === i
            ? 'active'
            : idx < i
              ? 'sorted'
              : 'default') as ElementState,
      }));
      steps.push({
        id: stepId++,
        description: `Comparing ${key} with ${elements[j].value} at index ${j}`,
        snapshot: { data: { elements: comparingElements } },
        meta: createStepMeta({ comparisons, swaps, highlightedLine: 3 }),
        activeIndices: [j, i],
      });

      swaps++;
      elements[j + 1] = elements[j];
      const shiftElements = elements.map((e, idx) => ({
        ...e,
        state: (idx === j + 1 ? 'swapping' : idx < i ? 'sorted' : 'default') as ElementState,
      }));
      steps.push({
        id: stepId++,
        description: `Shifting ${elements[j + 1].value} from index ${j} to ${j + 1}`,
        snapshot: { data: { elements: shiftElements } },
        meta: createStepMeta({ comparisons, swaps, highlightedLine: 4 }),
        modifiedIndices: [j, j + 1],
      });

      j--;
    }

    if (j >= 0) {
      comparisons++;
    }

    elements[j + 1] = { value: key, state: 'sorted' };
    for (let k = 0; k <= i; k++) {
      elements[k].state = 'sorted';
    }

    const insertedElements = elements.map((e) => ({ ...e }));
    steps.push({
      id: stepId++,
      description: `Inserted ${key} at index ${j + 1}`,
      snapshot: { data: { elements: insertedElements } },
      meta: createStepMeta({ comparisons, swaps, highlightedLine: 5 }),
    });
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

class InsertionSortVisualizer implements Visualizer<SortingData> {
  readonly config: VisualizerConfig = {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'sorting',
    description:
      'Builds sorted array one element at a time by inserting each element into its correct position.',
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
    return generateInsertionSortSteps(arr);
  }

  draw(snapshot: Snapshot<SortingData>, ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    drawArrayBars(snapshot.data.elements, ctx, canvas.width / dpr, canvas.height / dpr);
  }

  getPseudocode(): string[] {
    return [
      'function insertionSort(arr):',
      '  for i = 1 to n:',
      '    key = arr[i], j = i-1',
      '    while j >= 0 and arr[j] > key:',
      '      arr[j+1] = arr[j], j--',
      '    arr[j+1] = key',
    ];
  }

  getComplexity(): ComplexityInfo {
    return { time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' }, space: 'O(1)' };
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
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'sorting',
    description: 'Insertion sort algorithm',
    defaultSpeed: 300,
  },
  () => new InsertionSortVisualizer()
);

export { InsertionSortVisualizer };
