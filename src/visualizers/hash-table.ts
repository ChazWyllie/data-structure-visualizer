/**
 * Hash Table Visualizer
 * Demonstrates hash table operations with chaining collision resolution
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

type EntryState = 'default' | 'hashing' | 'collision' | 'inserted' | 'found' | 'deleted';

interface HashEntry {
  key: string;
  value: number;
  state: EntryState;
}

interface HashBucket {
  entries: HashEntry[];
  state: 'default' | 'active' | 'collision';
}

interface HashTableData {
  buckets: HashBucket[];
  size: number; // Total number of entries
  capacity: number; // Number of buckets
  loadFactor: number;
  message?: string;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_CAPACITY = 8;
const MAX_LOAD_FACTOR = 0.75;
const BUCKET_WIDTH = 60;
const BUCKET_HEIGHT = 40;
const ENTRY_HEIGHT = 30;
const CHAIN_GAP = 5;

const STATE_COLORS: Record<EntryState, string> = {
  default: '#60a5fa',
  hashing: '#fbbf24',
  collision: '#f97316',
  inserted: '#4ade80',
  found: '#22d3ee',
  deleted: '#ef4444',
};

const BUCKET_COLORS: Record<string, string> = {
  default: '#374151',
  active: '#4b5563',
  collision: '#7c2d12',
};

// =============================================================================
// Hash Function
// =============================================================================

function hashKey(key: string, capacity: number): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) % capacity;
  }
  return Math.abs(hash);
}

// =============================================================================
// Helper Functions
// =============================================================================

function cloneBuckets(buckets: HashBucket[]): HashBucket[] {
  return buckets.map((b) => ({
    entries: b.entries.map((e) => ({ ...e })),
    state: b.state,
  }));
}

function calculateLoadFactor(size: number, capacity: number): number {
  return size / capacity;
}

function createEmptyTable(capacity: number): HashBucket[] {
  return Array.from({ length: capacity }, () => ({
    entries: [],
    state: 'default' as const,
  }));
}

// =============================================================================
// Step Generation
// =============================================================================

export function generateInsertSteps(
  buckets: HashBucket[],
  key: string,
  value: number,
  size: number,
  capacity: number
): Step<HashTableData>[] {
  const steps: Step<HashTableData>[] = [];
  let stepId = 0;
  let reads = 0;
  let writes = 0;

  const workingBuckets = cloneBuckets(buckets);
  let workingSize = size;

  steps.push({
    id: stepId++,
    description: `Inserting key "${key}" with value ${value}`,
    snapshot: {
      data: {
        buckets: cloneBuckets(workingBuckets),
        size: workingSize,
        capacity,
        loadFactor: calculateLoadFactor(workingSize, capacity),
      },
    },
    meta: createStepMeta({ highlightedLine: 1, reads, writes }),
  });

  // Calculate hash
  const hashValue = hashKey(key, capacity);
  workingBuckets[hashValue].state = 'active';

  steps.push({
    id: stepId++,
    description: `hash("${key}") = ${hashValue} (bucket index)`,
    snapshot: {
      data: {
        buckets: cloneBuckets(workingBuckets),
        size: workingSize,
        capacity,
        loadFactor: calculateLoadFactor(workingSize, capacity),
      },
    },
    meta: createStepMeta({ highlightedLine: 2, reads: ++reads, writes }),
  });

  // Check for existing key
  const existingIndex = workingBuckets[hashValue].entries.findIndex((e) => e.key === key);

  if (existingIndex !== -1) {
    // Update existing
    workingBuckets[hashValue].entries[existingIndex].state = 'found';

    steps.push({
      id: stepId++,
      description: `Key "${key}" already exists, updating value`,
      snapshot: {
        data: {
          buckets: cloneBuckets(workingBuckets),
          size: workingSize,
          capacity,
          loadFactor: calculateLoadFactor(workingSize, capacity),
        },
      },
      meta: createStepMeta({ highlightedLine: 3, reads: ++reads, writes }),
    });

    workingBuckets[hashValue].entries[existingIndex].value = value;
    workingBuckets[hashValue].entries[existingIndex].state = 'inserted';
    writes++;

    steps.push({
      id: stepId++,
      description: `Updated "${key}" = ${value}`,
      snapshot: {
        data: {
          buckets: cloneBuckets(workingBuckets),
          size: workingSize,
          capacity,
          loadFactor: calculateLoadFactor(workingSize, capacity),
        },
      },
      meta: createStepMeta({ highlightedLine: 4, reads, writes }),
    });
  } else {
    // Check for collision
    if (workingBuckets[hashValue].entries.length > 0) {
      workingBuckets[hashValue].state = 'collision';
      workingBuckets[hashValue].entries.forEach((e) => (e.state = 'collision'));

      steps.push({
        id: stepId++,
        description: `Collision detected! Bucket ${hashValue} already has ${workingBuckets[hashValue].entries.length} entries`,
        snapshot: {
          data: {
            buckets: cloneBuckets(workingBuckets),
            size: workingSize,
            capacity,
            loadFactor: calculateLoadFactor(workingSize, capacity),
          },
        },
        meta: createStepMeta({ highlightedLine: 5, reads, writes }),
      });
    }

    // Add to chain
    const newEntry: HashEntry = { key, value, state: 'inserted' };
    workingBuckets[hashValue].entries.push(newEntry);
    workingSize++;
    writes++;

    steps.push({
      id: stepId++,
      description: `Added "${key}" = ${value} to chain at bucket ${hashValue}`,
      snapshot: {
        data: {
          buckets: cloneBuckets(workingBuckets),
          size: workingSize,
          capacity,
          loadFactor: calculateLoadFactor(workingSize, capacity),
        },
      },
      meta: createStepMeta({ highlightedLine: 6, reads, writes }),
    });
  }

  // Check load factor
  const newLoadFactor = calculateLoadFactor(workingSize, capacity);
  if (newLoadFactor > MAX_LOAD_FACTOR) {
    steps.push({
      id: stepId++,
      description: `Load factor ${newLoadFactor.toFixed(2)} exceeds ${MAX_LOAD_FACTOR}. Consider resizing!`,
      snapshot: {
        data: {
          buckets: cloneBuckets(workingBuckets),
          size: workingSize,
          capacity,
          loadFactor: newLoadFactor,
        },
      },
      meta: createStepMeta({ highlightedLine: 7, reads, writes }),
    });
  }

  // Final state
  workingBuckets.forEach((b) => {
    b.state = 'default';
    b.entries.forEach((e) => (e.state = 'default'));
  });
  workingBuckets[hashValue].entries.find((e) => e.key === key)!.state = 'inserted';

  steps.push({
    id: stepId++,
    description: `Insert complete. Table size: ${workingSize}/${capacity}`,
    snapshot: {
      data: {
        buckets: cloneBuckets(workingBuckets),
        size: workingSize,
        capacity,
        loadFactor: newLoadFactor,
      },
    },
    meta: createStepMeta({ highlightedLine: 8, reads, writes }),
  });

  return steps;
}

export function generateLookupSteps(
  buckets: HashBucket[],
  key: string,
  size: number,
  capacity: number
): Step<HashTableData>[] {
  const steps: Step<HashTableData>[] = [];
  let stepId = 0;
  let reads = 0;

  const workingBuckets = cloneBuckets(buckets);

  steps.push({
    id: stepId++,
    description: `Looking up key "${key}"`,
    snapshot: {
      data: {
        buckets: cloneBuckets(workingBuckets),
        size,
        capacity,
        loadFactor: calculateLoadFactor(size, capacity),
      },
    },
    meta: createStepMeta({ highlightedLine: 1, reads }),
  });

  // Calculate hash
  const hashValue = hashKey(key, capacity);
  workingBuckets[hashValue].state = 'active';
  reads++;

  steps.push({
    id: stepId++,
    description: `hash("${key}") = ${hashValue}`,
    snapshot: {
      data: {
        buckets: cloneBuckets(workingBuckets),
        size,
        capacity,
        loadFactor: calculateLoadFactor(size, capacity),
      },
    },
    meta: createStepMeta({ highlightedLine: 2, reads }),
  });

  // Search chain
  const bucket = workingBuckets[hashValue];

  if (bucket.entries.length === 0) {
    steps.push({
      id: stepId++,
      description: `Bucket ${hashValue} is empty. Key "${key}" not found.`,
      snapshot: {
        data: {
          buckets: cloneBuckets(workingBuckets),
          size,
          capacity,
          loadFactor: calculateLoadFactor(size, capacity),
        },
      },
      meta: createStepMeta({ highlightedLine: 3, reads }),
    });
    return steps;
  }

  for (let i = 0; i < bucket.entries.length; i++) {
    reads++;
    bucket.entries[i].state = 'hashing';

    steps.push({
      id: stepId++,
      description: `Checking entry ${i + 1}/${bucket.entries.length}: "${bucket.entries[i].key}"`,
      snapshot: {
        data: {
          buckets: cloneBuckets(workingBuckets),
          size,
          capacity,
          loadFactor: calculateLoadFactor(size, capacity),
        },
      },
      meta: createStepMeta({ highlightedLine: 4, reads }),
    });

    if (bucket.entries[i].key === key) {
      bucket.entries[i].state = 'found';

      steps.push({
        id: stepId++,
        description: `Found! "${key}" = ${bucket.entries[i].value}`,
        snapshot: {
          data: {
            buckets: cloneBuckets(workingBuckets),
            size,
            capacity,
            loadFactor: calculateLoadFactor(size, capacity),
          },
        },
        meta: createStepMeta({ highlightedLine: 5, reads }),
      });
      return steps;
    }

    bucket.entries[i].state = 'default';
  }

  // Not found
  steps.push({
    id: stepId++,
    description: `Key "${key}" not found in bucket ${hashValue}`,
    snapshot: {
      data: {
        buckets: cloneBuckets(workingBuckets),
        size,
        capacity,
        loadFactor: calculateLoadFactor(size, capacity),
      },
    },
    meta: createStepMeta({ highlightedLine: 6, reads }),
  });

  return steps;
}

export function generateDeleteSteps(
  buckets: HashBucket[],
  key: string,
  size: number,
  capacity: number
): Step<HashTableData>[] {
  const steps: Step<HashTableData>[] = [];
  let stepId = 0;
  let reads = 0;
  let writes = 0;

  const workingBuckets = cloneBuckets(buckets);
  let workingSize = size;

  steps.push({
    id: stepId++,
    description: `Deleting key "${key}"`,
    snapshot: {
      data: {
        buckets: cloneBuckets(workingBuckets),
        size: workingSize,
        capacity,
        loadFactor: calculateLoadFactor(workingSize, capacity),
      },
    },
    meta: createStepMeta({ highlightedLine: 1, reads, writes }),
  });

  // Calculate hash
  const hashValue = hashKey(key, capacity);
  workingBuckets[hashValue].state = 'active';
  reads++;

  steps.push({
    id: stepId++,
    description: `hash("${key}") = ${hashValue}`,
    snapshot: {
      data: {
        buckets: cloneBuckets(workingBuckets),
        size: workingSize,
        capacity,
        loadFactor: calculateLoadFactor(workingSize, capacity),
      },
    },
    meta: createStepMeta({ highlightedLine: 2, reads, writes }),
  });

  // Find entry
  const bucket = workingBuckets[hashValue];
  const entryIndex = bucket.entries.findIndex((e) => e.key === key);

  if (entryIndex === -1) {
    steps.push({
      id: stepId++,
      description: `Key "${key}" not found. Nothing to delete.`,
      snapshot: {
        data: {
          buckets: cloneBuckets(workingBuckets),
          size: workingSize,
          capacity,
          loadFactor: calculateLoadFactor(workingSize, capacity),
        },
      },
      meta: createStepMeta({ highlightedLine: 3, reads, writes }),
    });
    return steps;
  }

  // Mark for deletion
  bucket.entries[entryIndex].state = 'deleted';
  reads++;

  steps.push({
    id: stepId++,
    description: `Found "${key}" at position ${entryIndex + 1} in bucket ${hashValue}`,
    snapshot: {
      data: {
        buckets: cloneBuckets(workingBuckets),
        size: workingSize,
        capacity,
        loadFactor: calculateLoadFactor(workingSize, capacity),
      },
    },
    meta: createStepMeta({ highlightedLine: 4, reads, writes }),
  });

  // Remove
  bucket.entries.splice(entryIndex, 1);
  workingSize--;
  writes++;

  steps.push({
    id: stepId++,
    description: `Deleted "${key}". Table size: ${workingSize}/${capacity}`,
    snapshot: {
      data: {
        buckets: cloneBuckets(workingBuckets),
        size: workingSize,
        capacity,
        loadFactor: calculateLoadFactor(workingSize, capacity),
      },
    },
    meta: createStepMeta({ highlightedLine: 5, reads, writes }),
  });

  // Reset states
  workingBuckets.forEach((b) => {
    b.state = 'default';
    b.entries.forEach((e) => (e.state = 'default'));
  });

  steps.push({
    id: stepId++,
    description: `Delete complete.`,
    snapshot: {
      data: {
        buckets: cloneBuckets(workingBuckets),
        size: workingSize,
        capacity,
        loadFactor: calculateLoadFactor(workingSize, capacity),
      },
    },
    meta: createStepMeta({ highlightedLine: 6, reads, writes }),
  });

  return steps;
}

export function generateResizeSteps(
  buckets: HashBucket[],
  size: number,
  capacity: number
): Step<HashTableData>[] {
  const steps: Step<HashTableData>[] = [];
  let stepId = 0;
  let reads = 0;
  let writes = 0;

  const newCapacity = capacity * 2;

  steps.push({
    id: stepId++,
    description: `Resizing hash table from ${capacity} to ${newCapacity} buckets`,
    snapshot: {
      data: {
        buckets: cloneBuckets(buckets),
        size,
        capacity,
        loadFactor: calculateLoadFactor(size, capacity),
      },
    },
    meta: createStepMeta({ highlightedLine: 1, reads, writes }),
  });

  // Create new table
  const newBuckets = createEmptyTable(newCapacity);
  writes += newCapacity;

  steps.push({
    id: stepId++,
    description: `Created new table with ${newCapacity} empty buckets`,
    snapshot: {
      data: {
        buckets: cloneBuckets(newBuckets),
        size: 0,
        capacity: newCapacity,
        loadFactor: 0,
      },
    },
    meta: createStepMeta({ highlightedLine: 2, reads, writes }),
  });

  // Rehash all entries
  let rehashCount = 0;
  for (let i = 0; i < buckets.length; i++) {
    for (const entry of buckets[i].entries) {
      reads++;
      const newHash = hashKey(entry.key, newCapacity);

      newBuckets[newHash].state = 'active';
      const newEntry: HashEntry = { ...entry, state: 'inserted' };
      newBuckets[newHash].entries.push(newEntry);
      writes++;
      rehashCount++;

      steps.push({
        id: stepId++,
        description: `Rehashing "${entry.key}": old bucket ${i} -> new bucket ${newHash}`,
        snapshot: {
          data: {
            buckets: cloneBuckets(newBuckets),
            size: rehashCount,
            capacity: newCapacity,
            loadFactor: calculateLoadFactor(rehashCount, newCapacity),
          },
        },
        meta: createStepMeta({ highlightedLine: 3, reads, writes }),
      });

      newBuckets[newHash].state = 'default';
      newBuckets[newHash].entries.forEach((e) => (e.state = 'default'));
    }
  }

  // Final state
  steps.push({
    id: stepId++,
    description: `Resize complete. New load factor: ${calculateLoadFactor(size, newCapacity).toFixed(2)}`,
    snapshot: {
      data: {
        buckets: cloneBuckets(newBuckets),
        size,
        capacity: newCapacity,
        loadFactor: calculateLoadFactor(size, newCapacity),
      },
    },
    meta: createStepMeta({ highlightedLine: 4, reads, writes }),
  });

  return steps;
}

// =============================================================================
// Drawing
// =============================================================================

function drawHashTable(
  data: HashTableData,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  const { buckets, size, capacity, loadFactor } = data;

  // Clear
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  // Title and stats
  ctx.fillStyle = '#9ca3af';
  ctx.font = '14px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Hash Table (Chaining)', CANVAS_PADDING, 20);

  ctx.font = '12px Inter, system-ui, sans-serif';
  ctx.fillText(
    `Size: ${size}/${capacity} | Load Factor: ${loadFactor.toFixed(2)}`,
    CANVAS_PADDING,
    38
  );

  // Calculate layout
  const startY = 60;
  const maxChainsToShow = 5;
  const bucketSpacing = Math.min(BUCKET_WIDTH + 10, (width - CANVAS_PADDING * 2) / capacity);
  const startX = (width - bucketSpacing * capacity) / 2;

  // Draw buckets
  for (let i = 0; i < capacity; i++) {
    const bucket = buckets[i];
    const x = startX + i * bucketSpacing;

    // Bucket box
    ctx.fillStyle = BUCKET_COLORS[bucket.state];
    ctx.beginPath();
    ctx.roundRect(x, startY, BUCKET_WIDTH, BUCKET_HEIGHT, 4);
    ctx.fill();

    // Bucket index
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(i), x + BUCKET_WIDTH / 2, startY + BUCKET_HEIGHT / 2 + 4);

    // Draw chain entries
    const chainStartY = startY + BUCKET_HEIGHT + CHAIN_GAP;

    for (let j = 0; j < Math.min(bucket.entries.length, maxChainsToShow); j++) {
      const entry = bucket.entries[j];
      const entryY = chainStartY + j * (ENTRY_HEIGHT + CHAIN_GAP);

      // Entry box
      ctx.fillStyle = STATE_COLORS[entry.state];
      ctx.beginPath();
      ctx.roundRect(x, entryY, BUCKET_WIDTH, ENTRY_HEIGHT, 3);
      ctx.fill();

      // Entry text
      ctx.fillStyle = '#000';
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';

      // Truncate key if too long
      const displayKey = entry.key.length > 6 ? entry.key.slice(0, 5) + '...' : entry.key;
      ctx.fillText(displayKey, x + BUCKET_WIDTH / 2, entryY + 11);
      ctx.fillText(String(entry.value), x + BUCKET_WIDTH / 2, entryY + 23);
    }

    // Show overflow indicator
    if (bucket.entries.length > maxChainsToShow) {
      const overflowY = chainStartY + maxChainsToShow * (ENTRY_HEIGHT + CHAIN_GAP);
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.fillText(`+${bucket.entries.length - maxChainsToShow}`, x + BUCKET_WIDTH / 2, overflowY);
    }

    // Draw chain connector line
    if (bucket.entries.length > 0) {
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + BUCKET_WIDTH / 2, startY + BUCKET_HEIGHT);
      ctx.lineTo(x + BUCKET_WIDTH / 2, chainStartY);
      ctx.stroke();
    }
  }

  // Legend
  const legendY = height - 25;
  ctx.font = '11px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';

  const legendItems = [
    { color: STATE_COLORS.inserted, label: 'Inserted' },
    { color: STATE_COLORS.found, label: 'Found' },
    { color: STATE_COLORS.collision, label: 'Collision' },
    { color: STATE_COLORS.deleted, label: 'Deleted' },
  ];

  let legendX = CANVAS_PADDING;
  for (const item of legendItems) {
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.roundRect(legendX, legendY - 6, 12, 12, 2);
    ctx.fill();

    ctx.fillStyle = '#9ca3af';
    ctx.fillText(item.label, legendX + 16, legendY + 4);
    legendX += 75;
  }
}

// =============================================================================
// Visualizer Class
// =============================================================================

class HashTableVisualizer implements Visualizer<HashTableData> {
  readonly config: VisualizerConfig = {
    id: 'hash-table',
    name: 'Hash Table',
    category: 'data-structure',
    description:
      'A hash table with chaining collision resolution. Demonstrates hashing, collisions, and load factor management.',
    defaultSpeed: 500,
  };

  getInitialState(): Snapshot<HashTableData> {
    const buckets = createEmptyTable(DEFAULT_CAPACITY);

    // Add some initial entries
    const initialData = [
      { key: 'apple', value: 5 },
      { key: 'banana', value: 7 },
      { key: 'cherry', value: 3 },
      { key: 'date', value: 9 },
    ];

    let size = 0;
    for (const { key, value } of initialData) {
      const hash = hashKey(key, DEFAULT_CAPACITY);
      buckets[hash].entries.push({ key, value, state: 'default' });
      size++;
    }

    return {
      data: {
        buckets,
        size,
        capacity: DEFAULT_CAPACITY,
        loadFactor: calculateLoadFactor(size, DEFAULT_CAPACITY),
      },
    };
  }

  getSteps(action: ActionPayload<HashTableData>): Step<HashTableData>[] {
    const { buckets, size, capacity } = action.data ?? this.getInitialState().data;

    switch (action.type) {
      case 'insert': {
        const key = (action.params?.key as string) ?? 'key' + size;
        const value = (action.params?.value as number) ?? Math.floor(Math.random() * 100);
        return generateInsertSteps(buckets, key, value, size, capacity);
      }
      case 'lookup': {
        const key = (action.params?.key as string) ?? 'apple';
        return generateLookupSteps(buckets, key, size, capacity);
      }
      case 'delete': {
        const key = (action.params?.key as string) ?? 'apple';
        return generateDeleteSteps(buckets, key, size, capacity);
      }
      case 'resize': {
        return generateResizeSteps(buckets, size, capacity);
      }
      case 'clear': {
        return [
          {
            id: 0,
            description: 'Cleared hash table',
            snapshot: {
              data: {
                buckets: createEmptyTable(DEFAULT_CAPACITY),
                size: 0,
                capacity: DEFAULT_CAPACITY,
                loadFactor: 0,
              },
            },
            meta: createStepMeta({ writes: DEFAULT_CAPACITY }),
          },
        ];
      }
      default:
        return [
          {
            id: 0,
            description: `Hash table ready with ${size} entries in ${capacity} buckets`,
            snapshot: {
              data: { buckets, size, capacity, loadFactor: calculateLoadFactor(size, capacity) },
            },
            meta: createStepMeta({}),
          },
        ];
    }
  }

  draw(snapshot: Snapshot<HashTableData>, ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    drawHashTable(snapshot.data, ctx, width, height);
  }

  getPseudocode(): string[] {
    return [
      'function insert(key, value):',
      '  index = hash(key) % capacity',
      '  if key exists in bucket[index]:',
      '    update value',
      '  else:',
      '    append (key, value) to bucket[index]',
      '  if loadFactor > 0.75:',
      '    resize()',
      '',
      'function lookup(key):',
      '  index = hash(key) % capacity',
      '  for entry in bucket[index]:',
      '    if entry.key == key:',
      '      return entry.value',
      '  return null',
    ];
  }

  getComplexity(): ComplexityInfo {
    return {
      time: {
        best: 'O(1)',
        average: 'O(1)',
        worst: 'O(n)',
      },
      space: 'O(n)',
    };
  }

  getInputs(): InputField[] {
    return [
      {
        id: 'key',
        label: 'Key',
        type: 'text',
        defaultValue: 'apple',
        placeholder: 'Key to insert/lookup/delete',
      },
      {
        id: 'value',
        label: 'Value',
        type: 'number',
        defaultValue: 42,
        min: 0,
        max: 999,
        placeholder: 'Value',
      },
    ];
  }

  getActions(): ActionButton[] {
    return [
      { id: 'insert', label: 'Insert', primary: true },
      { id: 'lookup', label: 'Lookup' },
      { id: 'delete', label: 'Delete' },
      { id: 'resize', label: 'Resize 2x' },
      { id: 'clear', label: 'Clear' },
    ];
  }
}

// =============================================================================
// Registration
// =============================================================================

const config: VisualizerConfig = {
  id: 'hash-table',
  name: 'Hash Table',
  category: 'data-structure',
  description:
    'A hash table with chaining collision resolution. Demonstrates hashing, collisions, and load factor management.',
  defaultSpeed: 500,
};

registry.register<HashTableData>(config, () => new HashTableVisualizer());

export { HashTableVisualizer };
