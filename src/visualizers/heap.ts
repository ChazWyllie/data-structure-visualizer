/**
 * Heap / Priority Queue Visualizer
 * Demonstrates min-heap and max-heap operations with tree and array visualization
 */

import type {
  Visualizer,
  VisualizerConfig,
  Snapshot,
  Step,
  ActionPayload,
  ComplexityInfo,
  InputField,
  ActionButton,
} from '../core/types';
import { createStepMeta } from '../core/types';
import { registry } from '../core/registry';
import { CANVAS_PADDING } from '../core/constants';

// =============================================================================
// Types
// =============================================================================

type HeapType = 'max' | 'min';

type NodeState = 'default' | 'current' | 'comparing' | 'swapping' | 'inserted' | 'removed';

interface HeapElement {
  value: number;
  state: NodeState;
}

interface HeapData {
  elements: HeapElement[];
  heapType: HeapType;
  message?: string;
}

// =============================================================================
// Constants
// =============================================================================

const NODE_RADIUS = 22;
const LEVEL_HEIGHT = 60;
const ARRAY_BAR_HEIGHT = 40;
const ARRAY_SECTION_HEIGHT = 80;

const STATE_COLORS: Record<NodeState, string> = {
  default: '#60a5fa',
  current: '#fbbf24',
  comparing: '#a78bfa',
  swapping: '#f97316',
  inserted: '#4ade80',
  removed: '#ef4444',
};

// =============================================================================
// Heap Operations (Pure Functions)
// =============================================================================

function compare(a: number, b: number, heapType: HeapType): boolean {
  return heapType === 'max' ? a > b : a < b;
}

function getParentIndex(i: number): number {
  return Math.floor((i - 1) / 2);
}

function getLeftChildIndex(i: number): number {
  return 2 * i + 1;
}

function getRightChildIndex(i: number): number {
  return 2 * i + 2;
}

// =============================================================================
// Step Generation
// =============================================================================

export function generatePushSteps(
  elements: HeapElement[],
  value: number,
  heapType: HeapType
): Step<HeapData>[] {
  const steps: Step<HeapData>[] = [];
  let stepId = 0;
  let comparisons = 0;
  let swaps = 0;

  // Clone elements
  const heap = elements.map((e) => ({ ...e, state: 'default' as NodeState }));

  // Initial state
  steps.push({
    id: stepId++,
    description: `Pushing value ${value} into ${heapType}-heap`,
    snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
    meta: createStepMeta({ comparisons, highlightedLine: 1 }),
  });

  // Add element at end
  heap.push({ value, state: 'inserted' });
  let currentIndex = heap.length - 1;

  steps.push({
    id: stepId++,
    description: `Added ${value} at index ${currentIndex} (end of array)`,
    snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
    meta: createStepMeta({ comparisons, highlightedLine: 2 }),
  });

  // Bubble up (heapify up)
  while (currentIndex > 0) {
    const parentIndex = getParentIndex(currentIndex);
    comparisons++;

    // Mark comparing
    heap[currentIndex].state = 'current';
    heap[parentIndex].state = 'comparing';

    const heapWord = heapType === 'max' ? 'greater' : 'smaller';
    steps.push({
      id: stepId++,
      description: `Comparing ${heap[currentIndex].value} with parent ${heap[parentIndex].value}`,
      snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
      meta: createStepMeta({ comparisons, highlightedLine: 3 }),
      activeIndices: [currentIndex, parentIndex],
    });

    if (compare(heap[currentIndex].value, heap[parentIndex].value, heapType)) {
      // Swap
      swaps++;
      heap[currentIndex].state = 'swapping';
      heap[parentIndex].state = 'swapping';

      steps.push({
        id: stepId++,
        description: `${heap[currentIndex].value} is ${heapWord} than ${heap[parentIndex].value}, swapping`,
        snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
        meta: createStepMeta({ comparisons, swaps, highlightedLine: 4 }),
        modifiedIndices: [currentIndex, parentIndex],
      });

      // Perform swap
      const temp = heap[currentIndex];
      heap[currentIndex] = heap[parentIndex];
      heap[parentIndex] = temp;

      // Reset states
      heap[currentIndex].state = 'default';
      heap[parentIndex].state = 'current';

      currentIndex = parentIndex;
    } else {
      // Heap property satisfied
      heap[currentIndex].state = 'inserted';
      heap[parentIndex].state = 'default';

      steps.push({
        id: stepId++,
        description: `Heap property satisfied. ${heap[currentIndex].value} is in correct position.`,
        snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
        meta: createStepMeta({ comparisons, swaps, highlightedLine: 5 }),
      });
      break;
    }
  }

  // Final state
  heap.forEach((e) => (e.state = 'default'));
  if (heap.length > 0) {
    // Find the inserted value and mark it
    const insertedIndex = heap.findIndex((e) => e.value === value);
    if (insertedIndex >= 0) {
      heap[insertedIndex].state = 'inserted';
    }
  }

  steps.push({
    id: stepId++,
    description: `Push complete. ${value} is now in the heap.`,
    snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
    meta: createStepMeta({ comparisons, swaps, highlightedLine: 6 }),
  });

  return steps;
}

export function generatePopSteps(elements: HeapElement[], heapType: HeapType): Step<HeapData>[] {
  const steps: Step<HeapData>[] = [];
  let stepId = 0;
  let comparisons = 0;
  let swaps = 0;

  // Clone elements
  const heap = elements.map((e) => ({ ...e, state: 'default' as NodeState }));

  if (heap.length === 0) {
    steps.push({
      id: stepId++,
      description: 'Heap is empty. Nothing to pop.',
      snapshot: { data: { elements: [], heapType } },
      meta: createStepMeta({ comparisons, highlightedLine: 1 }),
    });
    return steps;
  }

  const rootValue = heap[0].value;
  heap[0].state = 'removed';

  steps.push({
    id: stepId++,
    description: `Popping root value ${rootValue} from ${heapType}-heap`,
    snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
    meta: createStepMeta({ comparisons, highlightedLine: 1 }),
  });

  if (heap.length === 1) {
    steps.push({
      id: stepId++,
      description: `Removed ${rootValue}. Heap is now empty.`,
      snapshot: { data: { elements: [], heapType } },
      meta: createStepMeta({ comparisons, highlightedLine: 2 }),
    });
    return steps;
  }

  // Move last element to root
  const lastValue = heap[heap.length - 1].value;
  heap[0] = { value: lastValue, state: 'current' };
  heap.pop();

  steps.push({
    id: stepId++,
    description: `Moved last element ${lastValue} to root position`,
    snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
    meta: createStepMeta({ comparisons, highlightedLine: 3 }),
  });

  // Bubble down (heapify down)
  let currentIndex = 0;
  const n = heap.length;
  let heapPropertySatisfied = false;

  while (!heapPropertySatisfied) {
    const leftIndex = getLeftChildIndex(currentIndex);
    const rightIndex = getRightChildIndex(currentIndex);
    let targetIndex = currentIndex;

    // Find the target (max or min child depending on heap type)
    if (leftIndex < n) {
      comparisons++;
      heap[currentIndex].state = 'current';
      heap[leftIndex].state = 'comparing';

      steps.push({
        id: stepId++,
        description: `Comparing ${heap[currentIndex].value} with left child ${heap[leftIndex].value}`,
        snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
        meta: createStepMeta({ comparisons, swaps, highlightedLine: 4 }),
        activeIndices: [currentIndex, leftIndex],
      });

      if (compare(heap[leftIndex].value, heap[targetIndex].value, heapType)) {
        targetIndex = leftIndex;
      }
      heap[leftIndex].state = 'default';
    }

    if (rightIndex < n) {
      comparisons++;
      heap[currentIndex].state = 'current';
      heap[rightIndex].state = 'comparing';

      steps.push({
        id: stepId++,
        description: `Comparing ${heap[currentIndex].value} with right child ${heap[rightIndex].value}`,
        snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
        meta: createStepMeta({ comparisons, swaps, highlightedLine: 4 }),
        activeIndices: [currentIndex, rightIndex],
      });

      if (compare(heap[rightIndex].value, heap[targetIndex].value, heapType)) {
        targetIndex = rightIndex;
      }
      heap[rightIndex].state = 'default';
    }

    if (targetIndex === currentIndex) {
      // Heap property satisfied
      heap[currentIndex].state = 'inserted';

      steps.push({
        id: stepId++,
        description: `Heap property satisfied. ${heap[currentIndex].value} is in correct position.`,
        snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
        meta: createStepMeta({ comparisons, swaps, highlightedLine: 5 }),
      });
      heapPropertySatisfied = true;
    } else {
      // Swap with target
      swaps++;
      heap[currentIndex].state = 'swapping';
      heap[targetIndex].state = 'swapping';

      steps.push({
        id: stepId++,
        description: `Swapping ${heap[currentIndex].value} with ${heap[targetIndex].value}`,
        snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
        meta: createStepMeta({ comparisons, swaps, highlightedLine: 6 }),
        modifiedIndices: [currentIndex, targetIndex],
      });

      // Perform swap
      const temp = heap[currentIndex];
      heap[currentIndex] = heap[targetIndex];
      heap[targetIndex] = temp;

      heap[currentIndex].state = 'default';
      heap[targetIndex].state = 'current';

      currentIndex = targetIndex;
    }
  }

  // Final state
  heap.forEach((e) => (e.state = 'default'));

  steps.push({
    id: stepId++,
    description: `Pop complete. Removed ${rootValue} from the heap.`,
    snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
    meta: createStepMeta({ comparisons, swaps, highlightedLine: 7 }),
  });

  return steps;
}

export function generatePeekSteps(elements: HeapElement[], heapType: HeapType): Step<HeapData>[] {
  const steps: Step<HeapData>[] = [];
  let stepId = 0;

  const heap = elements.map((e) => ({ ...e, state: 'default' as NodeState }));

  if (heap.length === 0) {
    steps.push({
      id: stepId++,
      description: 'Heap is empty. Nothing to peek.',
      snapshot: { data: { elements: [], heapType } },
      meta: createStepMeta({ highlightedLine: 1 }),
    });
    return steps;
  }

  heap[0].state = 'current';

  steps.push({
    id: stepId++,
    description: `Peeking at root: ${heap[0].value} (${heapType === 'max' ? 'maximum' : 'minimum'} value)`,
    snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
    meta: createStepMeta({ highlightedLine: 1 }),
  });

  return steps;
}

export function generateHeapifySteps(values: number[], heapType: HeapType): Step<HeapData>[] {
  const steps: Step<HeapData>[] = [];
  let stepId = 0;
  let comparisons = 0;
  let swaps = 0;

  // Create initial array
  const heap: HeapElement[] = values.map((v) => ({ value: v, state: 'default' as NodeState }));
  const n = heap.length;

  steps.push({
    id: stepId++,
    description: `Building ${heapType}-heap from array [${values.join(', ')}]`,
    snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
    meta: createStepMeta({ comparisons, highlightedLine: 1 }),
  });

  // Build heap (bottom-up)
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    // Heapify at index i
    let currentIndex = i;

    steps.push({
      id: stepId++,
      description: `Heapifying subtree at index ${i} (value: ${heap[i].value})`,
      snapshot: {
        data: {
          elements: heap.map((e, idx) => ({
            ...e,
            state: idx === i ? 'current' : e.state,
          })),
          heapType,
        },
      },
      meta: createStepMeta({ comparisons, swaps, highlightedLine: 2 }),
    });

    // Bubble down
    let heapPropertySatisfied = false;
    while (!heapPropertySatisfied) {
      const leftIndex = getLeftChildIndex(currentIndex);
      const rightIndex = getRightChildIndex(currentIndex);
      let targetIndex = currentIndex;

      if (leftIndex < n) {
        comparisons++;
        if (compare(heap[leftIndex].value, heap[targetIndex].value, heapType)) {
          targetIndex = leftIndex;
        }
      }

      if (rightIndex < n) {
        comparisons++;
        if (compare(heap[rightIndex].value, heap[targetIndex].value, heapType)) {
          targetIndex = rightIndex;
        }
      }

      if (targetIndex === currentIndex) {
        heapPropertySatisfied = true;
      } else {
        // Swap
        swaps++;
        heap[currentIndex].state = 'swapping';
        heap[targetIndex].state = 'swapping';

        steps.push({
          id: stepId++,
          description: `Swapping ${heap[currentIndex].value} with ${heap[targetIndex].value}`,
          snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
          meta: createStepMeta({ comparisons, swaps, highlightedLine: 3 }),
          modifiedIndices: [currentIndex, targetIndex],
        });

        // Perform swap
        const temp = heap[currentIndex];
        heap[currentIndex] = heap[targetIndex];
        heap[targetIndex] = temp;

        heap[currentIndex].state = 'default';
        heap[targetIndex].state = 'current';

        currentIndex = targetIndex;
      }
    }

    heap[currentIndex].state = 'default';
  }

  // Final state
  heap.forEach((e) => (e.state = 'default'));

  steps.push({
    id: stepId++,
    description: `${heapType === 'max' ? 'Max' : 'Min'}-heap built successfully!`,
    snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
    meta: createStepMeta({ comparisons, swaps, highlightedLine: 4 }),
  });

  return steps;
}

// =============================================================================
// Drawing
// =============================================================================

interface TreeNode {
  value: number;
  state: NodeState;
  x: number;
  y: number;
  index: number;
}

function calculateTreeLayout(
  elements: HeapElement[],
  canvasWidth: number,
  treeAreaHeight: number
): TreeNode[] {
  if (elements.length === 0) {
    return [];
  }

  const nodes: TreeNode[] = [];
  const depth = Math.floor(Math.log2(elements.length)) + 1;
  const startY = CANVAS_PADDING + NODE_RADIUS + 10;
  const availableHeight = treeAreaHeight - startY - NODE_RADIUS - 10;
  const levelHeight = Math.min(LEVEL_HEIGHT, availableHeight / Math.max(1, depth - 1));

  for (let i = 0; i < elements.length; i++) {
    const level = Math.floor(Math.log2(i + 1));
    const nodesInLevel = Math.pow(2, level);
    const positionInLevel = i - (nodesInLevel - 1);

    const levelWidth = canvasWidth - CANVAS_PADDING * 2;
    const spacing = levelWidth / nodesInLevel;
    const x = CANVAS_PADDING + spacing * (positionInLevel + 0.5);
    const y = startY + level * levelHeight;

    nodes.push({
      value: elements[i].value,
      state: elements[i].state,
      x,
      y,
      index: i,
    });
  }

  return nodes;
}

function drawHeap(
  data: HeapData,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  const { elements, heapType } = data;
  const treeAreaHeight = height - ARRAY_SECTION_HEIGHT;

  // Clear
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  // Draw heap type label
  ctx.fillStyle = '#9ca3af';
  ctx.font = '14px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${heapType === 'max' ? 'Max' : 'Min'}-Heap`, CANVAS_PADDING, 20);

  if (elements.length === 0) {
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Heap is empty', width / 2, height / 2);
    return;
  }

  // Calculate tree layout
  const nodes = calculateTreeLayout(elements, width, treeAreaHeight);

  // Draw edges first
  ctx.strokeStyle = '#4b5563';
  ctx.lineWidth = 2;

  for (let i = 0; i < nodes.length; i++) {
    const leftChildIdx = getLeftChildIndex(i);
    const rightChildIdx = getRightChildIndex(i);

    if (leftChildIdx < nodes.length) {
      ctx.beginPath();
      ctx.moveTo(nodes[i].x, nodes[i].y + NODE_RADIUS);
      ctx.lineTo(nodes[leftChildIdx].x, nodes[leftChildIdx].y - NODE_RADIUS);
      ctx.stroke();
    }

    if (rightChildIdx < nodes.length) {
      ctx.beginPath();
      ctx.moveTo(nodes[i].x, nodes[i].y + NODE_RADIUS);
      ctx.lineTo(nodes[rightChildIdx].x, nodes[rightChildIdx].y - NODE_RADIUS);
      ctx.stroke();
    }
  }

  // Draw nodes
  for (const node of nodes) {
    // Node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = STATE_COLORS[node.state];
    ctx.fill();

    // Node value
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(node.value), node.x, node.y);

    // Index label below
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.fillText(String(node.index), node.x, node.y + NODE_RADIUS + 12);
  }

  // Draw array representation at bottom
  const arrayY = height - ARRAY_SECTION_HEIGHT + 20;
  const maxBarWidth = 50;
  const gap = 4;
  const totalWidth = elements.length * (maxBarWidth + gap) - gap;
  const startX = Math.max(CANVAS_PADDING, (width - totalWidth) / 2);
  const barWidth = Math.min(maxBarWidth, (width - CANVAS_PADDING * 2) / elements.length - gap);

  // Array label
  ctx.fillStyle = '#9ca3af';
  ctx.font = '12px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Array representation:', CANVAS_PADDING, arrayY - 5);

  for (let i = 0; i < elements.length; i++) {
    const x = startX + i * (barWidth + gap);
    const y = arrayY + 10;

    // Bar background
    ctx.fillStyle = STATE_COLORS[elements[i].state];
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, ARRAY_BAR_HEIGHT, 4);
    ctx.fill();

    // Value
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(elements[i].value), x + barWidth / 2, y + ARRAY_BAR_HEIGHT / 2);

    // Index
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.fillText(String(i), x + barWidth / 2, y + ARRAY_BAR_HEIGHT + 12);
  }
}

// =============================================================================
// Visualizer Class
// =============================================================================

class HeapVisualizer implements Visualizer<HeapData> {
  readonly config: VisualizerConfig = {
    id: 'heap',
    name: 'Heap / Priority Queue',
    category: 'data-structure',
    description:
      'A complete binary tree maintaining the heap property. Supports push, pop, peek, and heapify operations.',
    defaultSpeed: 500,
  };

  private heapType: HeapType = 'max';

  getInitialState(): Snapshot<HeapData> {
    // Start with a sample heap
    const initialValues = [50, 30, 40, 10, 20, 35, 25];
    const elements: HeapElement[] = initialValues.map((v) => ({
      value: v,
      state: 'default',
    }));

    return {
      data: {
        elements,
        heapType: this.heapType,
      },
    };
  }

  getSteps(action: ActionPayload<HeapData>): Step<HeapData>[] {
    const { elements, heapType } = action.data ?? this.getInitialState().data;
    this.heapType = heapType;

    switch (action.type) {
      case 'push': {
        const value = (action.params?.value as number) ?? Math.floor(Math.random() * 100);
        return generatePushSteps(elements, value, heapType);
      }
      case 'pop':
        return generatePopSteps(elements, heapType);
      case 'peek':
        return generatePeekSteps(elements, heapType);
      case 'heapify': {
        const values =
          (action.params?.values as number[]) ??
          Array.from({ length: 7 }, () => Math.floor(Math.random() * 100));
        return generateHeapifySteps(values, heapType);
      }
      case 'toggle-type': {
        // Toggle between min and max heap and rebuild
        const newType: HeapType = heapType === 'max' ? 'min' : 'max';
        const values = elements.map((e) => e.value);
        return generateHeapifySteps(values, newType);
      }
      default:
        return [
          {
            id: 0,
            description: `${heapType === 'max' ? 'Max' : 'Min'} heap ready with ${elements.length} elements`,
            snapshot: { data: { elements, heapType } },
            meta: createStepMeta({}),
          },
        ];
    }
  }

  draw(snapshot: Snapshot<HeapData>, ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    drawHeap(snapshot.data, ctx, width, height);
  }

  getPseudocode(): string[] {
    return [
      'function push(value):',
      '  add value at end of array',
      '  while parent < current (max) or parent > current (min):',
      '    swap with parent',
      '  heap property satisfied',
      '  return',
      '',
      'function pop():',
      '  save root value',
      '  move last element to root',
      '  while current violates heap property:',
      '    swap with larger (max) or smaller (min) child',
      '  return saved value',
    ];
  }

  getComplexity(): ComplexityInfo {
    return {
      time: {
        best: 'O(1)',
        average: 'O(log n)',
        worst: 'O(log n)',
      },
      space: 'O(n)',
    };
  }

  getInputs(): InputField[] {
    return [
      {
        id: 'value',
        label: 'Value',
        type: 'number',
        defaultValue: 45,
        min: 0,
        max: 999,
        placeholder: 'Value to push',
      },
    ];
  }

  getActions(): ActionButton[] {
    return [
      { id: 'push', label: 'Push', primary: true },
      { id: 'pop', label: 'Pop' },
      { id: 'peek', label: 'Peek' },
      { id: 'heapify', label: 'Random Heap' },
      { id: 'toggle-type', label: 'Toggle Min/Max' },
    ];
  }
}

// =============================================================================
// Registration
// =============================================================================

const config: VisualizerConfig = {
  id: 'heap',
  name: 'Heap / Priority Queue',
  category: 'data-structure',
  description:
    'A complete binary tree maintaining the heap property. Supports push, pop, peek, and heapify operations.',
  defaultSpeed: 500,
};

registry.register<HeapData>(config, () => new HeapVisualizer());

export { HeapVisualizer };
