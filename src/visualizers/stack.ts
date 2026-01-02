/**
 * Stack Visualizer
 * Demonstrates stack operations with visual block representation
 */

import type {
  Visualizer,
  VisualizerConfig,
  Snapshot,
  Step,
  ActionPayload,
  ComplexityInfo,
  StackElement,
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

interface StackData {
  elements: StackElement<number>[];
  maxSize: number;
}

type StackElementState = StackElement<number>['state'];

// =============================================================================
// Constants
// =============================================================================

const BLOCK_WIDTH = 120;
const BLOCK_HEIGHT = 40;
const BLOCK_GAP = 4;
const BLOCK_RADIUS = 6;

const STATE_COLORS: Record<StackElementState, string> = {
  default: '#60a5fa',
  pushing: '#4ade80',
  popping: '#f87171',
  top: '#fbbf24',
};

// =============================================================================
// Step Generation
// =============================================================================

export function generatePushSteps(
  stack: StackElement<number>[],
  value: number,
  maxSize: number
): Step<StackData>[] {
  const steps: Step<StackData>[] = [];
  let stepId = 0;
  let writes = 0;

  // Initial state
  const initialElements = stack.map((e, i) => ({
    ...e,
    state: (i === stack.length - 1 ? 'top' : 'default') as StackElementState,
  }));

  steps.push({
    id: stepId++,
    description: `Preparing to push ${value} onto the stack`,
    snapshot: { data: { elements: initialElements, maxSize } },
    meta: createStepMeta({ writes, highlightedLine: 1 }),
  });

  if (stack.length >= maxSize) {
    steps.push({
      id: stepId++,
      description: `Stack overflow! Cannot push ${value} - stack is full`,
      snapshot: { data: { elements: initialElements, maxSize } },
      meta: createStepMeta({ writes, highlightedLine: 2 }),
    });
    return steps;
  }

  // Creating new element
  const pushingElements = [
    ...stack.map((e) => ({ ...e, state: 'default' as StackElementState })),
    { value, state: 'pushing' as StackElementState },
  ];
  writes++;

  steps.push({
    id: stepId++,
    description: `Pushing ${value} onto the stack`,
    snapshot: { data: { elements: pushingElements, maxSize } },
    meta: createStepMeta({ writes, highlightedLine: 3 }),
  });

  // Final state
  const finalElements = [
    ...stack.map((e) => ({ ...e, state: 'default' as StackElementState })),
    { value, state: 'top' as StackElementState },
  ];

  steps.push({
    id: stepId++,
    description: `Successfully pushed ${value}. Stack size: ${finalElements.length}`,
    snapshot: { data: { elements: finalElements, maxSize } },
    meta: createStepMeta({ writes, highlightedLine: 4 }),
  });

  return steps;
}

export function generatePopSteps(
  stack: StackElement<number>[],
  maxSize: number
): Step<StackData>[] {
  const steps: Step<StackData>[] = [];
  let stepId = 0;
  let reads = 0;

  if (stack.length === 0) {
    steps.push({
      id: stepId++,
      description: 'Stack underflow! Cannot pop - stack is empty',
      snapshot: { data: { elements: [], maxSize } },
      meta: createStepMeta({ reads, highlightedLine: 1 }),
    });
    return steps;
  }

  // Initial state with top highlighted
  const initialElements = stack.map((e, i) => ({
    ...e,
    state: (i === stack.length - 1 ? 'top' : 'default') as StackElementState,
  }));

  steps.push({
    id: stepId++,
    description: `Preparing to pop from stack (top value: ${stack[stack.length - 1].value})`,
    snapshot: { data: { elements: initialElements, maxSize } },
    meta: createStepMeta({ reads, highlightedLine: 1 }),
  });

  // Popping animation
  reads++;
  const poppedValue = stack[stack.length - 1].value;
  const poppingElements = stack.map((e, i) => ({
    ...e,
    state: (i === stack.length - 1 ? 'popping' : 'default') as StackElementState,
  }));

  steps.push({
    id: stepId++,
    description: `Popping ${poppedValue} from the stack`,
    snapshot: { data: { elements: poppingElements, maxSize } },
    meta: createStepMeta({ reads, highlightedLine: 2 }),
  });

  // Final state
  const remainingStack = stack.slice(0, -1);
  const finalElements = remainingStack.map((e, i) => ({
    ...e,
    state: (i === remainingStack.length - 1 ? 'top' : 'default') as StackElementState,
  }));

  steps.push({
    id: stepId++,
    description: `Popped ${poppedValue}. Stack size: ${finalElements.length}`,
    snapshot: { data: { elements: finalElements, maxSize } },
    meta: createStepMeta({ reads, highlightedLine: 3 }),
  });

  return steps;
}

// =============================================================================
// Rendering
// =============================================================================

function drawStack(
  elements: StackElement<number>[],
  maxSize: number,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  const centerX = width / 2;
  const baseY = height - CANVAS_PADDING - 20;

  // Draw stack container outline
  const containerHeight = maxSize * (BLOCK_HEIGHT + BLOCK_GAP) + BLOCK_GAP;
  const containerWidth = BLOCK_WIDTH + 20;
  const containerX = centerX - containerWidth / 2;
  const containerY = baseY - containerHeight;

  ctx.strokeStyle = '#3a3a3a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(containerX, containerY);
  ctx.lineTo(containerX, baseY);
  ctx.lineTo(containerX + containerWidth, baseY);
  ctx.lineTo(containerX + containerWidth, containerY);
  ctx.stroke();

  // Draw "bottom" label
  ctx.fillStyle = '#71717a';
  ctx.font = '12px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('bottom', centerX, baseY + 16);

  // Draw stack elements from bottom to top
  elements.forEach((element, index) => {
    const x = centerX - BLOCK_WIDTH / 2;
    const y = baseY - (index + 1) * (BLOCK_HEIGHT + BLOCK_GAP);

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
    ctx.fillText(element.value.toString(), centerX, y + BLOCK_HEIGHT / 2);

    // Draw index
    ctx.fillStyle = '#71717a';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(`[${index}]`, x - 8, y + BLOCK_HEIGHT / 2);
  });

  // Draw "top" arrow if stack has elements
  if (elements.length > 0) {
    const topY = baseY - elements.length * (BLOCK_HEIGHT + BLOCK_GAP) - 10;
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('↓ TOP', centerX, topY);
  }

  // Draw capacity indicator
  ctx.fillStyle = '#71717a';
  ctx.font = '11px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText(`Size: ${elements.length}/${maxSize}`, CANVAS_PADDING, CANVAS_PADDING + 16);
}

// =============================================================================
// Visualizer Class
// =============================================================================

class StackVisualizer implements Visualizer<StackData> {
  readonly config: VisualizerConfig = {
    id: 'stack',
    name: 'Stack',
    category: 'data-structure',
    description:
      'A Last-In-First-Out (LIFO) data structure. Elements are added (pushed) and removed (popped) from the top only.',
    defaultSpeed: 400,
  };

  private maxSize = 8;
  private currentData: StackData;

  constructor() {
    this.currentData = { elements: [], maxSize: this.maxSize };
  }

  getInitialState(): Snapshot<StackData> {
    this.currentData = { elements: [], maxSize: this.maxSize };
    return { data: this.currentData };
  }

  getSteps(actionPayload: ActionPayload<StackData>): Step<StackData>[] {
    const stack = actionPayload.data?.elements ?? this.currentData.elements;
    const maxSize = actionPayload.data?.maxSize ?? this.maxSize;

    switch (actionPayload.type) {
      case 'push': {
        const value = (actionPayload.params?.value as number) ?? Math.floor(Math.random() * 99) + 1;
        const steps = generatePushSteps(stack, value, maxSize);
        // Update current data with final state
        const lastStep = steps[steps.length - 1];
        if (lastStep) {
          this.currentData = lastStep.snapshot.data;
        }
        return steps;
      }
      case 'pop': {
        const steps = generatePopSteps(stack, maxSize);
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
            description: 'Stack cleared',
            snapshot: { data: this.currentData },
            meta: createStepMeta({ highlightedLine: 1 }),
          },
        ];
      default:
        return [
          {
            id: 0,
            description: 'Stack ready',
            snapshot: { data: this.currentData },
            meta: createStepMeta(),
          },
        ];
    }
  }

  draw(snapshot: Snapshot<StackData>, ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    drawStack(snapshot.data.elements, snapshot.data.maxSize, ctx, width, height);
  }

  getPseudocode(): string[] {
    return [
      'push(value: T): void {',
      '  if (this.size === maxSize) throw new Error("Overflow");',
      '  this.items[this.top++] = value;',
      '}',
      '',
      'pop(): T {',
      '  if (this.size === 0) throw new Error("Underflow");',
      '  return this.items[--this.top];',
      '}',
    ];
  }

  getCode(): CodeSnippets {
    return {
      typescript: [
        'class Stack<T> {',
        '  private items: T[] = [];',
        '',
        '  push(value: T): void {',
        '    this.items.push(value);',
        '  }',
        '',
        '  pop(): T | undefined {',
        '    return this.items.pop();',
        '  }',
        '',
        '  peek(): T | undefined {',
        '    return this.items[this.items.length - 1];',
        '  }',
        '',
        '  isEmpty(): boolean {',
        '    return this.items.length === 0;',
        '  }',
        '}',
      ],
      python: [
        'class Stack:',
        '    def __init__(self):',
        '        self.items = []',
        '',
        '    def push(self, value):',
        '        self.items.append(value)',
        '',
        '    def pop(self):',
        '        if self.is_empty():',
        '            raise IndexError("Stack underflow")',
        '        return self.items.pop()',
        '',
        '    def peek(self):',
        '        return self.items[-1] if self.items else None',
        '',
        '    def is_empty(self):',
        '        return len(self.items) == 0',
      ],
      java: [
        'class Stack<T> {',
        '    private List<T> items = new ArrayList<>();',
        '',
        '    public void push(T value) {',
        '        items.add(value);',
        '    }',
        '',
        '    public T pop() {',
        '        if (isEmpty()) throw new EmptyStackException();',
        '        return items.remove(items.size() - 1);',
        '    }',
        '',
        '    public T peek() {',
        '        if (isEmpty()) return null;',
        '        return items.get(items.size() - 1);',
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
      { id: 'push', label: 'Push', primary: true },
      { id: 'pop', label: 'Pop', primary: false },
      { id: 'clear', label: 'Clear', primary: false },
    ];
  }
}

// =============================================================================
// Registration
// =============================================================================

registry.register<StackData>(
  {
    id: 'stack',
    name: 'Stack',
    category: 'data-structure',
    description:
      'A Last-In-First-Out (LIFO) data structure supporting push and pop operations at the top.',
    defaultSpeed: 400,
  },
  () => new StackVisualizer()
);

export { StackVisualizer };
