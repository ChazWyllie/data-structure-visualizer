/**
 * Singly Linked List Visualizer
 * Demonstrates linked list operations with node and arrow visualization
 */

import type {
  Visualizer,
  VisualizerConfig,
  Snapshot,
  Step,
  ActionPayload,
  ComplexityInfo,
  LinkedListNode,
  InputField,
  ActionButton,
} from '../core/types';
import { createStepMeta } from '../core/types';
import { registry } from '../core/registry';
import { CANVAS_PADDING } from '../core/constants';

// =============================================================================
// Types
// =============================================================================

interface LinkedListData {
  nodes: LinkedListNode<number>[];
}

type NodeState = LinkedListNode<number>['state'];

// =============================================================================
// Constants
// =============================================================================

const NODE_RADIUS = 25;
const NODE_GAP = 80;

const STATE_COLORS: Record<NodeState, string> = {
  default: '#60a5fa',
  current: '#fbbf24',
  found: '#4ade80',
  inserting: '#a78bfa',
  deleting: '#f87171',
};

// =============================================================================
// Utility
// =============================================================================

let nodeIdCounter = 0;
function generateNodeId(): string {
  return `node-${++nodeIdCounter}`;
}

// =============================================================================
// Step Generation
// =============================================================================

export function generateInsertAtTailSteps(
  nodes: LinkedListNode<number>[],
  value: number
): Step<LinkedListData>[] {
  const steps: Step<LinkedListData>[] = [];
  let stepId = 0;
  let reads = 0;
  let writes = 0;

  // Initial state
  steps.push({
    id: stepId++,
    description: `Preparing to insert ${value} at the tail`,
    snapshot: { data: { nodes: nodes.map((n) => ({ ...n, state: 'default' as NodeState })) } },
    meta: createStepMeta({ reads, writes, highlightedLine: 1 }),
  });

  if (nodes.length === 0) {
    // Empty list - create head
    writes++;
    const newNode: LinkedListNode<number> = {
      id: generateNodeId(),
      value,
      state: 'inserting',
    };

    steps.push({
      id: stepId++,
      description: `List is empty. Creating new head node with value ${value}`,
      snapshot: { data: { nodes: [newNode] } },
      meta: createStepMeta({ reads, writes, highlightedLine: 2 }),
    });

    steps.push({
      id: stepId++,
      description: `Successfully inserted ${value} as head`,
      snapshot: { data: { nodes: [{ ...newNode, state: 'default' as NodeState }] } },
      meta: createStepMeta({ reads, writes, highlightedLine: 3 }),
    });

    return steps;
  }

  // Traverse to tail
  for (let i = 0; i < nodes.length; i++) {
    reads++;
    const traverseNodes = nodes.map((n, idx) => ({
      ...n,
      state: (idx === i ? 'current' : idx < i ? 'default' : 'default') as NodeState,
    }));

    steps.push({
      id: stepId++,
      description:
        i === nodes.length - 1
          ? `Found tail node (value: ${nodes[i].value})`
          : `Traversing: visiting node ${i} (value: ${nodes[i].value})`,
      snapshot: { data: { nodes: traverseNodes } },
      meta: createStepMeta({ reads, writes, highlightedLine: 4 }),
      activeIndices: [i],
    });
  }

  // Insert at tail
  writes++;
  const newNode: LinkedListNode<number> = {
    id: generateNodeId(),
    value,
    state: 'inserting',
  };

  const insertingNodes = [...nodes.map((n) => ({ ...n, state: 'default' as NodeState })), newNode];

  steps.push({
    id: stepId++,
    description: `Inserting new node with value ${value} after tail`,
    snapshot: { data: { nodes: insertingNodes } },
    meta: createStepMeta({ reads, writes, highlightedLine: 5 }),
  });

  // Final state
  const finalNodes = insertingNodes.map((n) => ({ ...n, state: 'default' as NodeState }));
  steps.push({
    id: stepId++,
    description: `Successfully inserted ${value}. List length: ${finalNodes.length}`,
    snapshot: { data: { nodes: finalNodes } },
    meta: createStepMeta({ reads, writes, highlightedLine: 6 }),
  });

  return steps;
}

export function generateDeleteByValueSteps(
  nodes: LinkedListNode<number>[],
  value: number
): Step<LinkedListData>[] {
  const steps: Step<LinkedListData>[] = [];
  let stepId = 0;
  let reads = 0;
  let writes = 0;

  // Initial state
  steps.push({
    id: stepId++,
    description: `Searching for node with value ${value} to delete`,
    snapshot: { data: { nodes: nodes.map((n) => ({ ...n, state: 'default' as NodeState })) } },
    meta: createStepMeta({ reads, writes, highlightedLine: 1 }),
  });

  if (nodes.length === 0) {
    steps.push({
      id: stepId++,
      description: 'List is empty. Nothing to delete.',
      snapshot: { data: { nodes: [] } },
      meta: createStepMeta({ reads, writes, highlightedLine: 2 }),
    });
    return steps;
  }

  // Search for value
  let foundIndex = -1;
  for (let i = 0; i < nodes.length; i++) {
    reads++;
    const searchNodes = nodes.map((n, idx) => ({
      ...n,
      state: (idx === i ? 'current' : 'default') as NodeState,
    }));

    const isMatch = nodes[i].value === value;
    steps.push({
      id: stepId++,
      description: isMatch
        ? `Found ${value} at position ${i}!`
        : `Checking node ${i}: ${nodes[i].value} !== ${value}`,
      snapshot: { data: { nodes: searchNodes } },
      meta: createStepMeta({ reads, writes, highlightedLine: 3 }),
      activeIndices: [i],
    });

    if (isMatch) {
      foundIndex = i;
      break;
    }
  }

  if (foundIndex === -1) {
    steps.push({
      id: stepId++,
      description: `Value ${value} not found in the list`,
      snapshot: { data: { nodes: nodes.map((n) => ({ ...n, state: 'default' as NodeState })) } },
      meta: createStepMeta({ reads, writes, highlightedLine: 4 }),
    });
    return steps;
  }

  // Mark for deletion
  writes++;
  const deletingNodes = nodes.map((n, idx) => ({
    ...n,
    state: (idx === foundIndex ? 'deleting' : 'default') as NodeState,
  }));

  steps.push({
    id: stepId++,
    description: `Deleting node with value ${value}`,
    snapshot: { data: { nodes: deletingNodes } },
    meta: createStepMeta({ reads, writes, highlightedLine: 5 }),
  });

  // Final state - remove the node
  const remainingNodes = nodes
    .filter((_, idx) => idx !== foundIndex)
    .map((n) => ({ ...n, state: 'default' as NodeState }));

  steps.push({
    id: stepId++,
    description: `Successfully deleted ${value}. List length: ${remainingNodes.length}`,
    snapshot: { data: { nodes: remainingNodes } },
    meta: createStepMeta({ reads, writes, highlightedLine: 6 }),
  });

  return steps;
}

// =============================================================================
// Rendering
// =============================================================================

function drawLinkedList(
  nodes: LinkedListNode<number>[],
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  const centerY = height / 2;
  const startX = CANVAS_PADDING + NODE_RADIUS + 40;

  // Draw "HEAD" label
  ctx.fillStyle = '#71717a';
  ctx.font = '12px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('HEAD', startX - 50, centerY - 8);

  // Draw head arrow
  if (nodes.length > 0) {
    ctx.strokeStyle = '#71717a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX - 35, centerY);
    ctx.lineTo(startX - NODE_RADIUS - 5, centerY);
    ctx.stroke();

    // Arrow head
    ctx.beginPath();
    ctx.moveTo(startX - NODE_RADIUS - 5, centerY);
    ctx.lineTo(startX - NODE_RADIUS - 12, centerY - 5);
    ctx.lineTo(startX - NODE_RADIUS - 12, centerY + 5);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillText('null', startX, centerY);
  }

  // Draw nodes and arrows
  nodes.forEach((node, index) => {
    const x = startX + index * (NODE_RADIUS * 2 + NODE_GAP);

    // Draw node circle
    ctx.fillStyle = STATE_COLORS[node.state];
    ctx.beginPath();
    ctx.arc(x, centerY, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Draw value
    ctx.fillStyle = '#0f0f0f';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.value.toString(), x, centerY);

    // Draw index
    ctx.fillStyle = '#71717a';
    ctx.font = '10px system-ui';
    ctx.fillText(`[${index}]`, x, centerY + NODE_RADIUS + 14);

    // Draw arrow to next node
    if (index < nodes.length - 1) {
      const arrowStartX = x + NODE_RADIUS + 5;
      const arrowEndX = x + NODE_RADIUS * 2 + NODE_GAP - NODE_RADIUS - 5;

      ctx.strokeStyle = '#71717a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(arrowStartX, centerY);
      ctx.lineTo(arrowEndX, centerY);
      ctx.stroke();

      // Arrow head
      ctx.fillStyle = '#71717a';
      ctx.beginPath();
      ctx.moveTo(arrowEndX, centerY);
      ctx.lineTo(arrowEndX - 7, centerY - 5);
      ctx.lineTo(arrowEndX - 7, centerY + 5);
      ctx.closePath();
      ctx.fill();
    } else {
      // Draw null pointer for last node
      const nullX = x + NODE_RADIUS + 20;
      ctx.fillStyle = '#71717a';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('→ null', nullX, centerY);
    }
  });

  // Draw length indicator
  ctx.fillStyle = '#71717a';
  ctx.font = '11px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText(`Length: ${nodes.length}`, CANVAS_PADDING, CANVAS_PADDING + 16);
}

// =============================================================================
// Visualizer Class
// =============================================================================

class LinkedListVisualizer implements Visualizer<LinkedListData> {
  readonly config: VisualizerConfig = {
    id: 'linked-list',
    name: 'Singly Linked List',
    category: 'linked-list',
    description:
      'A linear data structure where elements are stored in nodes, each pointing to the next node in the sequence.',
    defaultSpeed: 500,
  };

  private currentData: LinkedListData;

  constructor() {
    this.currentData = { nodes: [] };
  }

  getInitialState(): Snapshot<LinkedListData> {
    this.currentData = { nodes: [] };
    return { data: this.currentData };
  }

  getSteps(actionPayload: ActionPayload<LinkedListData>): Step<LinkedListData>[] {
    const nodes = actionPayload.data?.nodes ?? this.currentData.nodes;

    switch (actionPayload.type) {
      case 'insert': {
        const value = (actionPayload.params?.value as number) ?? Math.floor(Math.random() * 99) + 1;
        const steps = generateInsertAtTailSteps(nodes, value);
        const lastStep = steps[steps.length - 1];
        if (lastStep) {
          this.currentData = lastStep.snapshot.data;
        }
        return steps;
      }
      case 'delete': {
        const value = actionPayload.params?.value as number;
        if (value === undefined) {
          return [
            {
              id: 0,
              description: 'Please enter a value to delete',
              snapshot: { data: this.currentData },
              meta: createStepMeta(),
            },
          ];
        }
        const steps = generateDeleteByValueSteps(nodes, value);
        const lastStep = steps[steps.length - 1];
        if (lastStep) {
          this.currentData = lastStep.snapshot.data;
        }
        return steps;
      }
      case 'clear':
        this.currentData = { nodes: [] };
        return [
          {
            id: 0,
            description: 'List cleared',
            snapshot: { data: this.currentData },
            meta: createStepMeta({ highlightedLine: 1 }),
          },
        ];
      default:
        return [
          {
            id: 0,
            description: 'Linked list ready',
            snapshot: { data: this.currentData },
            meta: createStepMeta(),
          },
        ];
    }
  }

  draw(snapshot: Snapshot<LinkedListData>, ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    drawLinkedList(snapshot.data.nodes, ctx, width, height);
  }

  getPseudocode(): string[] {
    return [
      'function insertAtTail(value):',
      '  node = new Node(value)',
      '  if head == null: head = node; return',
      '  current = head',
      '  while current.next != null:',
      '    current = current.next',
      '  current.next = node',
    ];
  }

  getComplexity(): ComplexityInfo {
    return {
      time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(1)',
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
      { id: 'insert', label: 'Insert at Tail', primary: true },
      { id: 'delete', label: 'Delete by Value', primary: false },
      { id: 'clear', label: 'Clear', primary: false },
    ];
  }
}

// =============================================================================
// Registration
// =============================================================================

registry.register<LinkedListData>(
  {
    id: 'linked-list',
    name: 'Singly Linked List',
    category: 'linked-list',
    description: 'A linear data structure with nodes pointing to the next',
    defaultSpeed: 500,
  },
  () => new LinkedListVisualizer()
);

export { LinkedListVisualizer };
