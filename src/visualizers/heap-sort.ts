/**
 * Heap Sort Visualizer
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
  CodeSnippets,
} from '../core/types';
import { createStepMeta } from '../core/types';
import { registry } from '../core/registry';
import type { SortingData } from './sorting-shared';
import { drawArrayBars, generateRandomArray } from './sorting-shared';

interface HeapStep {
  elements: { value: number; state: ElementState }[];
  description: string;
  comparisons: number;
  swaps: number;
  line: number;
  activeIndices?: number[];
  modifiedIndices?: number[];
}

export function generateHeapSortSteps(arr: number[]): Step<SortingData>[] {
  const elements = arr.map((value) => ({ value, state: 'default' as ElementState }));
  const heapSteps: HeapStep[] = [];
  let comparisons = 0;
  let swaps = 0;
  const n = elements.length;

  heapSteps.push({
    elements: elements.map((e) => ({ ...e })),
    description: 'Initial array state',
    comparisons: 0,
    swaps: 0,
    line: 1,
  });

  function heapify(size: number, i: number, sortedStart: number): void {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    const heapifyElements = elements.map((e, idx) => ({
      ...e,
      state: (idx >= sortedStart
        ? 'sorted'
        : idx === i
          ? 'active'
          : idx === left || idx === right
            ? 'comparing'
            : 'default') as ElementState,
    }));
    heapSteps.push({
      elements: heapifyElements,
      description: `Heapifying at index ${i} (value: ${elements[i].value})`,
      comparisons,
      swaps,
      line: 4,
    });

    if (left < size) {
      comparisons++;
      if (elements[left].value > elements[largest].value) {
        largest = left;
      }
    }

    if (right < size) {
      comparisons++;
      if (elements[right].value > elements[largest].value) {
        largest = right;
      }
    }

    if (largest !== i) {
      swaps++;
      const temp = elements[i];
      elements[i] = elements[largest];
      elements[largest] = temp;

      const swapElements = elements.map((e, idx) => ({
        ...e,
        state: (idx >= sortedStart
          ? 'sorted'
          : idx === i || idx === largest
            ? 'swapping'
            : 'default') as ElementState,
      }));
      heapSteps.push({
        elements: swapElements,
        description: `Swapping ${elements[i].value} and ${elements[largest].value}`,
        comparisons,
        swaps,
        line: 5,
        modifiedIndices: [i, largest],
      });

      heapify(size, largest, sortedStart);
    }
  }

  // Build max heap
  heapSteps.push({
    elements: elements.map((e) => ({ ...e })),
    description: 'Building max heap...',
    comparisons,
    swaps,
    line: 2,
  });

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i, n);
  }

  const heapBuiltElements = elements.map((e) => ({ ...e, state: 'active' as ElementState }));
  heapSteps.push({
    elements: heapBuiltElements,
    description: 'Max heap built successfully',
    comparisons,
    swaps,
    line: 3,
  });

  // Extract elements from heap
  for (let i = n - 1; i > 0; i--) {
    swaps++;
    const temp = elements[0];
    elements[0] = elements[i];
    elements[i] = temp;

    const extractElements = elements.map((e, idx) => ({
      ...e,
      state: (idx > i ? 'sorted' : idx === 0 || idx === i ? 'swapping' : 'default') as ElementState,
    }));
    heapSteps.push({
      elements: extractElements,
      description: `Extracting max ${elements[i].value} to position ${i}`,
      comparisons,
      swaps,
      line: 6,
      modifiedIndices: [0, i],
    });

    elements[i].state = 'sorted';
    heapify(i, 0, i);
  }

  if (elements.length > 0) {
    elements[0].state = 'sorted';
  }

  heapSteps.push({
    elements: elements.map((e) => ({ ...e, state: 'sorted' as ElementState })),
    description: 'Array is now fully sorted!',
    comparisons,
    swaps,
    line: 7,
  });

  return heapSteps.map((step, idx) => ({
    id: idx,
    description: step.description,
    snapshot: { data: { elements: step.elements } },
    meta: createStepMeta({
      comparisons: step.comparisons,
      swaps: step.swaps,
      highlightedLine: step.line,
    }),
    activeIndices: step.activeIndices,
    modifiedIndices: step.modifiedIndices,
  }));
}

class HeapSortVisualizer implements Visualizer<SortingData> {
  readonly config: VisualizerConfig = {
    id: 'heap-sort',
    name: 'Heap Sort',
    category: 'sorting',
    description: 'Builds a max heap and repeatedly extracts the maximum element.',
    defaultSpeed: 200,
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
    return generateHeapSortSteps(arr);
  }

  draw(snapshot: Snapshot<SortingData>, ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    drawArrayBars(snapshot.data.elements, ctx, canvas.width / dpr, canvas.height / dpr);
  }

  getPseudocode(): string[] {
    return [
      'function heapSort(arr: T[]): void {',
      '  buildMaxHeap(arr);',
      '  for (let i = n - 1; i > 0; i--) {',
      '    [arr[0], arr[i]] = [arr[i], arr[0]];',
      '    heapify(arr, i, 0);',
      '  }',
      '}',
    ];
  }

  getCode(): CodeSnippets {
    return {
      typescript: [
        'function heapSort(arr: number[]): void {',
        '  const n = arr.length;',
        '  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(arr, n, i);',
        '  for (let i = n - 1; i > 0; i--) {',
        '    [arr[0], arr[i]] = [arr[i], arr[0]];',
        '    heapify(arr, i, 0);',
        '  }',
        '}',
        '',
        'function heapify(arr: number[], n: number, i: number): void {',
        '  let largest = i;',
        '  const left = 2 * i + 1, right = 2 * i + 2;',
        '  if (left < n && arr[left] > arr[largest]) largest = left;',
        '  if (right < n && arr[right] > arr[largest]) largest = right;',
        '  if (largest !== i) {',
        '    [arr[i], arr[largest]] = [arr[largest], arr[i]];',
        '    heapify(arr, n, largest);',
        '  }',
        '}',
      ],
      python: [
        'def heap_sort(arr: list[int]) -> None:',
        '    n = len(arr)',
        '    for i in range(n // 2 - 1, -1, -1):',
        '        heapify(arr, n, i)',
        '    for i in range(n - 1, 0, -1):',
        '        arr[0], arr[i] = arr[i], arr[0]',
        '        heapify(arr, i, 0)',
        '',
        'def heapify(arr: list[int], n: int, i: int) -> None:',
        '    largest = i',
        '    left, right = 2 * i + 1, 2 * i + 2',
        '    if left < n and arr[left] > arr[largest]:',
        '        largest = left',
        '    if right < n and arr[right] > arr[largest]:',
        '        largest = right',
        '    if largest != i:',
        '        arr[i], arr[largest] = arr[largest], arr[i]',
        '        heapify(arr, n, largest)',
      ],
      java: [
        'void heapSort(int[] arr) {',
        '    int n = arr.length;',
        '    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);',
        '    for (int i = n - 1; i > 0; i--) {',
        '        int temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;',
        '        heapify(arr, i, 0);',
        '    }',
        '}',
        '',
        'void heapify(int[] arr, int n, int i) {',
        '    int largest = i, left = 2*i + 1, right = 2*i + 2;',
        '    if (left < n && arr[left] > arr[largest]) largest = left;',
        '    if (right < n && arr[right] > arr[largest]) largest = right;',
        '    if (largest != i) {',
        '        int temp = arr[i]; arr[i] = arr[largest]; arr[largest] = temp;',
        '        heapify(arr, n, largest);',
        '    }',
        '}',
      ],
    };
  }

  getComplexity(): ComplexityInfo {
    return {
      time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
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

registry.register<SortingData>(
  {
    id: 'heap-sort',
    name: 'Heap Sort',
    category: 'sorting',
    description:
      'Builds a max heap from the array and repeatedly extracts the maximum element to sort.',
    defaultSpeed: 200,
  },
  () => new HeapSortVisualizer()
);

export { HeapSortVisualizer };
