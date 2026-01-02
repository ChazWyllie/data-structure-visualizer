/**
 * Queue Visualizer
 * Demonstrates queue operations with visual block representation
 */

import type {
  Visualizer,
  VisualizerConfig,
  Snapshot,
  Step,
  ActionPayload,
  ComplexityInfo,
  QueueElement,
  InputField,
  ActionButton,
  CodeSnippets,
} from '../core/types';
import { createStepMeta } from '../core/types';
import { registry } from '../core/registry';
import { CANVAS_PADDING } from '../core/constants';

// =============================================================================
// Types
// =============================================================================

interface QueueData {
  elements: QueueElement<number>[];
  maxSize: number;
}

type QueueElementState = QueueElement<number>['state'];

// =============================================================================
// Constants
// =============================================================================

const BLOCK_WIDTH = 60;
const BLOCK_HEIGHT = 50;
const BLOCK_GAP = 8;
const BLOCK_RADIUS = 6;

const STATE_COLORS: Record<QueueElementState, string> = {
  default: '#60a5fa',
  enqueuing: '#4ade80',
  dequeuing: '#f87171',
  front: '#fbbf24',
  rear: '#a78bfa',
};

// =============================================================================
// Step Generation
// =============================================================================

export function generateEnqueueSteps(
  queue: QueueElement<number>[],
  value: number,
  maxSize: number
): Step<QueueData>[] {
  const steps: Step<QueueData>[] = [];
  let stepId = 0;
  let writes = 0;

  // Initial state
  const initialElements = queue.map((e, i) => ({
    ...e,
    state: (i === 0 ? 'front' : i === queue.length - 1 ? 'rear' : 'default') as QueueElementState,
  }));

  steps.push({
    id: stepId++,
    description: `Preparing to enqueue ${value}`,
    snapshot: { data: { elements: initialElements, maxSize } },
    meta: createStepMeta({ writes, highlightedLine: 1 }),
  });

  if (queue.length >= maxSize) {
    steps.push({
      id: stepId++,
      description: `Queue is full! Cannot enqueue ${value}`,
      snapshot: { data: { elements: initialElements, maxSize } },
      meta: createStepMeta({ writes, highlightedLine: 2 }),
    });
    return steps;
  }

  // Enqueuing animation
  writes++;
  const enqueuingElements = [
    ...queue.map((e, i) => ({
      ...e,
      state: (i === 0 ? 'front' : 'default') as QueueElementState,
    })),
    { value, state: 'enqueuing' as QueueElementState },
  ];

  steps.push({
    id: stepId++,
    description: `Adding ${value} to the rear of the queue`,
    snapshot: { data: { elements: enqueuingElements, maxSize } },
    meta: createStepMeta({ writes, highlightedLine: 3 }),
  });

  // Final state
  const finalElements = [
    ...queue.map((e, i) => ({
      ...e,
      state: (i === 0 ? 'front' : 'default') as QueueElementState,
    })),
    { value, state: 'rear' as QueueElementState },
  ];

  // If this is the only element, it's both front and rear
  if (finalElements.length === 1) {
    finalElements[0].state = 'front';
  }

  steps.push({
    id: stepId++,
    description: `Successfully enqueued ${value}. Queue size: ${finalElements.length}`,
    snapshot: { data: { elements: finalElements, maxSize } },
    meta: createStepMeta({ writes, highlightedLine: 4 }),
  });

  return steps;
}

export function generateDequeueSteps(
  queue: QueueElement<number>[],
  maxSize: number
): Step<QueueData>[] {
  const steps: Step<QueueData>[] = [];
  let stepId = 0;
  let reads = 0;

  if (queue.length === 0) {
    steps.push({
      id: stepId++,
      description: 'Queue is empty! Cannot dequeue',
      snapshot: { data: { elements: [], maxSize } },
      meta: createStepMeta({ reads, highlightedLine: 1 }),
    });
    return steps;
  }

  // Initial state
  const initialElements = queue.map((e, i) => ({
    ...e,
    state: (i === 0 ? 'front' : i === queue.length - 1 ? 'rear' : 'default') as QueueElementState,
  }));

  steps.push({
    id: stepId++,
    description: `Preparing to dequeue (front value: ${queue[0].value})`,
    snapshot: { data: { elements: initialElements, maxSize } },
    meta: createStepMeta({ reads, highlightedLine: 1 }),
  });

  // Dequeuing animation
  reads++;
  const dequeuedValue = queue[0].value;
  const dequeueingElements = queue.map((e, i) => ({
    ...e,
    state: (i === 0
      ? 'dequeuing'
      : i === queue.length - 1
        ? 'rear'
        : 'default') as QueueElementState,
  }));

  steps.push({
    id: stepId++,
    description: `Removing ${dequeuedValue} from the front of the queue`,
    snapshot: { data: { elements: dequeueingElements, maxSize } },
    meta: createStepMeta({ reads, highlightedLine: 2 }),
  });

  // Final state
  const remainingQueue = queue.slice(1);
  const finalElements = remainingQueue.map((e, i) => ({
    ...e,
    state: (i === 0
      ? 'front'
      : i === remainingQueue.length - 1
        ? 'rear'
        : 'default') as QueueElementState,
  }));

  steps.push({
    id: stepId++,
    description: `Dequeued ${dequeuedValue}. Queue size: ${finalElements.length}`,
    snapshot: { data: { elements: finalElements, maxSize } },
    meta: createStepMeta({ reads, highlightedLine: 3 }),
  });

  return steps;
}

// =============================================================================
// Rendering
// =============================================================================

function drawQueue(
  elements: QueueElement<number>[],
  maxSize: number,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  const centerY = height / 2;
  const startX = CANVAS_PADDING + 60;

  // Draw queue container
  const containerWidth = maxSize * (BLOCK_WIDTH + BLOCK_GAP) + BLOCK_GAP;
  const containerHeight = BLOCK_HEIGHT + 20;
  const containerX = startX - 10;
  const containerY = centerY - containerHeight / 2;

  ctx.strokeStyle = '#3a3a3a';
  ctx.lineWidth = 2;
  ctx.strokeRect(containerX, containerY, containerWidth, containerHeight);

  // Draw front/rear labels
  ctx.fillStyle = '#71717a';
  ctx.font = '12px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('FRONT', startX - 30, centerY + 4);
  ctx.fillText('REAR', containerX + containerWidth + 30, centerY + 4);

  // Draw arrows
  ctx.fillStyle = '#71717a';
  ctx.fillText('→', startX - 30, centerY + 20);
  ctx.fillText('←', containerX + containerWidth + 30, centerY + 20);

  // Draw queue elements
  elements.forEach((element, index) => {
    const x = startX + index * (BLOCK_WIDTH + BLOCK_GAP);
    const y = centerY - BLOCK_HEIGHT / 2;

    // Draw block
    ctx.fillStyle = STATE_COLORS[element.state];
    ctx.beginPath();
    ctx.roundRect(x, y, BLOCK_WIDTH, BLOCK_HEIGHT, BLOCK_RADIUS);
    ctx.fill();

    // Draw value
    ctx.fillStyle = '#0f0f0f';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(element.value.toString(), x + BLOCK_WIDTH / 2, centerY);

    // Draw index
    ctx.fillStyle = '#71717a';
    ctx.font = '10px system-ui';
    ctx.fillText(`[${index}]`, x + BLOCK_WIDTH / 2, y + BLOCK_HEIGHT + 14);
  });

  // Draw capacity indicator
  ctx.fillStyle = '#71717a';
  ctx.font = '11px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText(`Size: ${elements.length}/${maxSize}`, CANVAS_PADDING, CANVAS_PADDING + 16);
}

// =============================================================================
// Visualizer Class
// =============================================================================

class QueueVisualizer implements Visualizer<QueueData> {
  readonly config: VisualizerConfig = {
    id: 'queue',
    name: 'Queue',
    category: 'data-structure',
    description:
      'A First-In-First-Out (FIFO) data structure. Elements are added at the rear and removed from the front.',
    defaultSpeed: 400,
  };

  private maxSize = 8;
  private currentData: QueueData;

  constructor() {
    this.currentData = { elements: [], maxSize: this.maxSize };
  }

  getInitialState(): Snapshot<QueueData> {
    this.currentData = { elements: [], maxSize: this.maxSize };
    return { data: this.currentData };
  }

  getSteps(actionPayload: ActionPayload<QueueData>): Step<QueueData>[] {
    const queue = actionPayload.data?.elements ?? this.currentData.elements;
    const maxSize = actionPayload.data?.maxSize ?? this.maxSize;

    switch (actionPayload.type) {
      case 'enqueue': {
        const value = (actionPayload.params?.value as number) ?? Math.floor(Math.random() * 99) + 1;
        const steps = generateEnqueueSteps(queue, value, maxSize);
        const lastStep = steps[steps.length - 1];
        if (lastStep) {
          this.currentData = lastStep.snapshot.data;
        }
        return steps;
      }
      case 'dequeue': {
        const steps = generateDequeueSteps(queue, maxSize);
        const lastStep = steps[steps.length - 1];
        if (lastStep) {
          this.currentData = lastStep.snapshot.data;
        }
        return steps;
      }
      case 'clear':
        this.currentData = { elements: [], maxSize };
        return [
          {
            id: 0,
            description: 'Queue cleared',
            snapshot: { data: this.currentData },
            meta: createStepMeta({ highlightedLine: 1 }),
          },
        ];
      default:
        return [
          {
            id: 0,
            description: 'Queue ready',
            snapshot: { data: this.currentData },
            meta: createStepMeta(),
          },
        ];
    }
  }

  draw(snapshot: Snapshot<QueueData>, ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    drawQueue(snapshot.data.elements, snapshot.data.maxSize, ctx, width, height);
  }

  getPseudocode(): string[] {
    return [
      'enqueue(value: T): void {',
      '  if (this.size === maxSize) throw new Error("Full");',
      '  this.items[this.rear++] = value;',
      '}',
      '',
      'dequeue(): T {',
      '  if (this.size === 0) throw new Error("Empty");',
      '  return this.items[this.front++];',
      '}',
    ];
  }

  getCode(): CodeSnippets {
    return {
      typescript: [
        'class Queue<T> {',
        '  private items: T[] = [];',
        '',
        '  enqueue(value: T): void {',
        '    this.items.push(value);',
        '  }',
        '',
        '  dequeue(): T | undefined {',
        '    return this.items.shift();',
        '  }',
        '',
        '  peek(): T | undefined {',
        '    return this.items[0];',
        '  }',
        '',
        '  isEmpty(): boolean {',
        '    return this.items.length === 0;',
        '  }',
        '}',
      ],
      python: [
        'from collections import deque',
        '',
        'class Queue:',
        '    def __init__(self):',
        '        self.items = deque()',
        '',
        '    def enqueue(self, value):',
        '        self.items.append(value)',
        '',
        '    def dequeue(self):',
        '        if self.is_empty():',
        '            raise IndexError("Queue empty")',
        '        return self.items.popleft()',
        '',
        '    def is_empty(self):',
        '        return len(self.items) == 0',
      ],
      java: [
        'class Queue<T> {',
        '    private LinkedList<T> items = new LinkedList<>();',
        '',
        '    public void enqueue(T value) {',
        '        items.addLast(value);',
        '    }',
        '',
        '    public T dequeue() {',
        '        if (isEmpty()) throw new NoSuchElementException();',
        '        return items.removeFirst();',
        '    }',
        '',
        '    public T peek() {',
        '        return items.peekFirst();',
        '    }',
        '',
        '    public boolean isEmpty() {',
        '        return items.isEmpty();',
        '    }',
        '}',
      ],
    };
  }

  getComplexity(): ComplexityInfo {
    return {
      time: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
      space: 'O(n)',
    };
  }

  getInputs(): InputField[] {
    return [
      {
        id: 'value',
        label: 'Value',
        type: 'number',
        defaultValue: '',
        min: 1,
        max: 999,
        placeholder: 'Enter value',
      },
    ];
  }

  getActions(): ActionButton[] {
    return [
      { id: 'enqueue', label: 'Enqueue', primary: true },
      { id: 'dequeue', label: 'Dequeue', primary: false },
      { id: 'clear', label: 'Clear', primary: false },
    ];
  }
}

// =============================================================================
// Registration
// =============================================================================

registry.register<QueueData>(
  {
    id: 'queue',
    name: 'Queue',
    category: 'data-structure',
    description:
      'A First-In-First-Out (FIFO) data structure supporting enqueue at rear and dequeue at front.',
    defaultSpeed: 400,
  },
  () => new QueueVisualizer()
);

export { QueueVisualizer };
