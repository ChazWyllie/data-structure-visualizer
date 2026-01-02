/**
 * Merge Sort Visualizer
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

interface MergeStep {
  elements: { value: number; state: ElementState }[];
  description: string;
  comparisons: number;
  writes: number;
  line: number;
  activeIndices?: number[];
  modifiedIndices?: number[];
}

export function generateMergeSortSteps(arr: number[]): Step<SortingData>[] {
  const elements = arr.map((value) => ({ value, state: 'default' as ElementState }));
  const mergeSteps: MergeStep[] = [];
  let comparisons = 0;
  let writes = 0;

  mergeSteps.push({
    elements: elements.map((e) => ({ ...e })),
    description: 'Initial array state',
    comparisons: 0,
    writes: 0,
    line: 1,
  });

  function merge(left: number, mid: number, right: number): void {
    const leftArr = elements.slice(left, mid + 1).map((e) => e.value);
    const rightArr = elements.slice(mid + 1, right + 1).map((e) => e.value);

    // Highlight the subarrays being merged
    const mergeStartElements = elements.map((e, idx) => ({
      ...e,
      state: (idx >= left && idx <= mid
        ? 'active'
        : idx > mid && idx <= right
          ? 'pivot'
          : 'default') as ElementState,
    }));
    mergeSteps.push({
      elements: mergeStartElements,
      description: `Merging subarrays [${left}..${mid}] and [${mid + 1}..${right}]`,
      comparisons,
      writes,
      line: 4,
    });

    let i = 0,
      j = 0,
      k = left;

    while (i < leftArr.length && j < rightArr.length) {
      comparisons++;
      if (leftArr[i] <= rightArr[j]) {
        writes++;
        elements[k] = { value: leftArr[i], state: 'swapping' };
        i++;
      } else {
        writes++;
        elements[k] = { value: rightArr[j], state: 'swapping' };
        j++;
      }
      const stepElements = elements.map((e, idx) => ({
        ...e,
        state: (idx === k
          ? 'swapping'
          : idx >= left && idx <= right
            ? 'comparing'
            : 'default') as ElementState,
      }));
      mergeSteps.push({
        elements: stepElements,
        description: `Placing ${elements[k].value} at index ${k}`,
        comparisons,
        writes,
        line: 5,
        modifiedIndices: [k],
      });
      k++;
    }

    while (i < leftArr.length) {
      writes++;
      elements[k] = { value: leftArr[i], state: 'sorted' };
      const stepElements = elements.map((e) => ({ ...e }));
      mergeSteps.push({
        elements: stepElements,
        description: `Copying remaining ${leftArr[i]} to index ${k}`,
        comparisons,
        writes,
        line: 6,
        modifiedIndices: [k],
      });
      i++;
      k++;
    }

    while (j < rightArr.length) {
      writes++;
      elements[k] = { value: rightArr[j], state: 'sorted' };
      const stepElements = elements.map((e) => ({ ...e }));
      mergeSteps.push({
        elements: stepElements,
        description: `Copying remaining ${rightArr[j]} to index ${k}`,
        comparisons,
        writes,
        line: 6,
        modifiedIndices: [k],
      });
      j++;
      k++;
    }
  }

  function mergeSort(left: number, right: number): void {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);

      const divideElements = elements.map((e, idx) => ({
        ...e,
        state: (idx >= left && idx <= right ? 'active' : 'default') as ElementState,
      }));
      mergeSteps.push({
        elements: divideElements,
        description: `Dividing array at indices [${left}..${right}], mid = ${mid}`,
        comparisons,
        writes,
        line: 2,
      });

      mergeSort(left, mid);
      mergeSort(mid + 1, right);
      merge(left, mid, right);
    }
  }

  if (arr.length > 0) {
    mergeSort(0, arr.length - 1);
  }

  mergeSteps.push({
    elements: elements.map((e) => ({ ...e, state: 'sorted' as ElementState })),
    description: 'Array is now fully sorted!',
    comparisons,
    writes,
    line: 7,
  });

  return mergeSteps.map((step, idx) => ({
    id: idx,
    description: step.description,
    snapshot: { data: { elements: step.elements } },
    meta: createStepMeta({
      comparisons: step.comparisons,
      writes: step.writes,
      highlightedLine: step.line,
    }),
    activeIndices: step.activeIndices,
    modifiedIndices: step.modifiedIndices,
  }));
}

class MergeSortVisualizer implements Visualizer<SortingData> {
  readonly config: VisualizerConfig = {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'sorting',
    description:
      'A divide-and-conquer algorithm that splits the array, sorts each half, then merges them.',
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
    return generateMergeSortSteps(arr);
  }

  draw(snapshot: Snapshot<SortingData>, ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    drawArrayBars(snapshot.data.elements, ctx, canvas.width / dpr, canvas.height / dpr);
  }

  getPseudocode(): string[] {
    return [
      'function mergeSort(arr: T[], l: number, r: number): T[] {',
      '  if (l < r) {',
      '    const mid = Math.floor((l + r) / 2);',
      '    mergeSort(arr, l, mid);',
      '    mergeSort(arr, mid + 1, r);',
      '    merge(arr, l, mid, r);',
      '  }',
      '  return arr;',
      '}',
    ];
  }

  getCode(): CodeSnippets {
    return {
      typescript: [
        'function mergeSort(arr: number[]): number[] {',
        '  if (arr.length <= 1) return arr;',
        '  const mid = Math.floor(arr.length / 2);',
        '  const left = mergeSort(arr.slice(0, mid));',
        '  const right = mergeSort(arr.slice(mid));',
        '  return merge(left, right);',
        '}',
        '',
        'function merge(left: number[], right: number[]): number[] {',
        '  const result: number[] = [];',
        '  let i = 0, j = 0;',
        '  while (i < left.length && j < right.length) {',
        '    if (left[i] <= right[j]) result.push(left[i++]);',
        '    else result.push(right[j++]);',
        '  }',
        '  return [...result, ...left.slice(i), ...right.slice(j)];',
        '}',
      ],
      python: [
        'def merge_sort(arr: list[int]) -> list[int]:',
        '    if len(arr) <= 1:',
        '        return arr',
        '    mid = len(arr) // 2',
        '    left = merge_sort(arr[:mid])',
        '    right = merge_sort(arr[mid:])',
        '    return merge(left, right)',
        '',
        'def merge(left: list[int], right: list[int]) -> list[int]:',
        '    result = []',
        '    i = j = 0',
        '    while i < len(left) and j < len(right):',
        '        if left[i] <= right[j]:',
        '            result.append(left[i])',
        '            i += 1',
        '        else:',
        '            result.append(right[j])',
        '            j += 1',
        '    return result + left[i:] + right[j:]',
      ],
      java: [
        'void mergeSort(int[] arr, int l, int r) {',
        '    if (l < r) {',
        '        int mid = l + (r - l) / 2;',
        '        mergeSort(arr, l, mid);',
        '        mergeSort(arr, mid + 1, r);',
        '        merge(arr, l, mid, r);',
        '    }',
        '}',
        '',
        'void merge(int[] arr, int l, int m, int r) {',
        '    int[] left = Arrays.copyOfRange(arr, l, m + 1);',
        '    int[] right = Arrays.copyOfRange(arr, m + 1, r + 1);',
        '    int i = 0, j = 0, k = l;',
        '    while (i < left.length && j < right.length) {',
        '        arr[k++] = left[i] <= right[j] ? left[i++] : right[j++];',
        '    }',
        '    while (i < left.length) arr[k++] = left[i++];',
        '    while (j < right.length) arr[k++] = right[j++];',
        '}',
      ],
    };
  }

  getComplexity(): ComplexityInfo {
    return {
      time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
      space: 'O(n)',
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
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'sorting',
    description:
      'A divide-and-conquer algorithm that recursively splits the array, sorts each half, then merges them.',
    defaultSpeed: 200,
  },
  () => new MergeSortVisualizer()
);

export { MergeSortVisualizer };
