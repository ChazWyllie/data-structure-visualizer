/**
 * Quick Sort Visualizer
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

interface QuickStep {
  elements: { value: number; state: ElementState }[];
  description: string;
  comparisons: number;
  swaps: number;
  line: number;
  activeIndices?: number[];
  modifiedIndices?: number[];
}

export function generateQuickSortSteps(arr: number[]): Step<SortingData>[] {
  const elements = arr.map((value) => ({ value, state: 'default' as ElementState }));
  const quickSteps: QuickStep[] = [];
  let comparisons = 0;
  let swaps = 0;
  const sortedIndices = new Set<number>();

  quickSteps.push({
    elements: elements.map((e) => ({ ...e })),
    description: 'Initial array state',
    comparisons: 0,
    swaps: 0,
    line: 1,
  });

  function partition(low: number, high: number): number {
    const pivotValue = elements[high].value;

    const pivotElements = elements.map((e, idx) => ({
      ...e,
      state: (sortedIndices.has(idx)
        ? 'sorted'
        : idx === high
          ? 'pivot'
          : idx >= low && idx < high
            ? 'active'
            : 'default') as ElementState,
    }));
    quickSteps.push({
      elements: pivotElements,
      description: `Choosing pivot: ${pivotValue} at index ${high}`,
      comparisons,
      swaps,
      line: 3,
    });

    let i = low - 1;

    for (let j = low; j < high; j++) {
      comparisons++;
      const comparingElements = elements.map((e, idx) => ({
        ...e,
        state: (sortedIndices.has(idx)
          ? 'sorted'
          : idx === high
            ? 'pivot'
            : idx === j
              ? 'comparing'
              : idx >= low && idx <= i
                ? 'active'
                : 'default') as ElementState,
      }));
      quickSteps.push({
        elements: comparingElements,
        description: `Comparing ${elements[j].value} with pivot ${pivotValue}`,
        comparisons,
        swaps,
        line: 4,
        activeIndices: [j, high],
      });

      if (elements[j].value < pivotValue) {
        i++;
        if (i !== j) {
          swaps++;
          const temp = elements[i];
          elements[i] = elements[j];
          elements[j] = temp;

          const swapElements = elements.map((e, idx) => ({
            ...e,
            state: (sortedIndices.has(idx)
              ? 'sorted'
              : idx === i || idx === j
                ? 'swapping'
                : idx === high
                  ? 'pivot'
                  : 'default') as ElementState,
          }));
          quickSteps.push({
            elements: swapElements,
            description: `Swapping ${elements[i].value} and ${elements[j].value}`,
            comparisons,
            swaps,
            line: 5,
            modifiedIndices: [i, j],
          });
        }
      }
    }

    swaps++;
    const temp = elements[i + 1];
    elements[i + 1] = elements[high];
    elements[high] = temp;

    const pivotPlacedElements = elements.map((e, idx) => ({
      ...e,
      state: (sortedIndices.has(idx)
        ? 'sorted'
        : idx === i + 1
          ? 'sorted'
          : 'default') as ElementState,
    }));
    sortedIndices.add(i + 1);
    quickSteps.push({
      elements: pivotPlacedElements,
      description: `Pivot ${elements[i + 1].value} placed at final position ${i + 1}`,
      comparisons,
      swaps,
      line: 6,
      modifiedIndices: [i + 1, high],
    });

    return i + 1;
  }

  function quickSort(low: number, high: number): void {
    if (low < high) {
      const rangeElements = elements.map((e, idx) => ({
        ...e,
        state: (sortedIndices.has(idx)
          ? 'sorted'
          : idx >= low && idx <= high
            ? 'active'
            : 'default') as ElementState,
      }));
      quickSteps.push({
        elements: rangeElements,
        description: `Sorting subarray [${low}..${high}]`,
        comparisons,
        swaps,
        line: 2,
      });

      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    } else if (low === high) {
      sortedIndices.add(low);
    }
  }

  if (arr.length > 0) {
    quickSort(0, arr.length - 1);
  }

  quickSteps.push({
    elements: elements.map((e) => ({ ...e, state: 'sorted' as ElementState })),
    description: 'Array is now fully sorted!',
    comparisons,
    swaps,
    line: 7,
  });

  return quickSteps.map((step, idx) => ({
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

class QuickSortVisualizer implements Visualizer<SortingData> {
  readonly config: VisualizerConfig = {
    id: 'quick-sort',
    name: 'Quick Sort',
    category: 'sorting',
    description:
      'A divide-and-conquer algorithm that picks a pivot and partitions the array around it.',
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
    return generateQuickSortSteps(arr);
  }

  draw(snapshot: Snapshot<SortingData>, ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    drawArrayBars(snapshot.data.elements, ctx, canvas.width / dpr, canvas.height / dpr);
  }

  getPseudocode(): string[] {
    return [
      'function quickSort(arr: T[], low: number, high: number): void {',
      '  if (low < high) {',
      '    const pivot = arr[high];',
      '    const pi = partition(arr, low, high);',
      '    quickSort(arr, low, pi - 1);',
      '    quickSort(arr, pi + 1, high);',
      '  }',
      '}',
    ];
  }

  getCode(): CodeSnippets {
    return {
      typescript: [
        'function quickSort(arr: number[], low: number, high: number): void {',
        '  if (low < high) {',
        '    const pi = partition(arr, low, high);',
        '    quickSort(arr, low, pi - 1);',
        '    quickSort(arr, pi + 1, high);',
        '  }',
        '}',
        '',
        'function partition(arr: number[], low: number, high: number): number {',
        '  const pivot = arr[high];',
        '  let i = low - 1;',
        '  for (let j = low; j < high; j++) {',
        '    if (arr[j] < pivot) {',
        '      i++;',
        '      [arr[i], arr[j]] = [arr[j], arr[i]];',
        '    }',
        '  }',
        '  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];',
        '  return i + 1;',
        '}',
      ],
      python: [
        'def quick_sort(arr: list[int], low: int, high: int) -> None:',
        '    if low < high:',
        '        pi = partition(arr, low, high)',
        '        quick_sort(arr, low, pi - 1)',
        '        quick_sort(arr, pi + 1, high)',
        '',
        'def partition(arr: list[int], low: int, high: int) -> int:',
        '    pivot = arr[high]',
        '    i = low - 1',
        '    for j in range(low, high):',
        '        if arr[j] < pivot:',
        '            i += 1',
        '            arr[i], arr[j] = arr[j], arr[i]',
        '    arr[i + 1], arr[high] = arr[high], arr[i + 1]',
        '    return i + 1',
      ],
      java: [
        'void quickSort(int[] arr, int low, int high) {',
        '    if (low < high) {',
        '        int pi = partition(arr, low, high);',
        '        quickSort(arr, low, pi - 1);',
        '        quickSort(arr, pi + 1, high);',
        '    }',
        '}',
        '',
        'int partition(int[] arr, int low, int high) {',
        '    int pivot = arr[high];',
        '    int i = low - 1;',
        '    for (int j = low; j < high; j++) {',
        '        if (arr[j] < pivot) {',
        '            i++;',
        '            int temp = arr[i];',
        '            arr[i] = arr[j];',
        '            arr[j] = temp;',
        '        }',
        '    }',
        '    int temp = arr[i + 1];',
        '    arr[i + 1] = arr[high];',
        '    arr[high] = temp;',
        '    return i + 1;',
        '}',
      ],
    };
  }

  getComplexity(): ComplexityInfo {
    return {
      time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
      space: 'O(log n)',
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
    id: 'quick-sort',
    name: 'Quick Sort',
    category: 'sorting',
    description:
      'A divide-and-conquer algorithm that selects a pivot and partitions elements around it.',
    defaultSpeed: 200,
  },
  () => new QuickSortVisualizer()
);

export { QuickSortVisualizer };
