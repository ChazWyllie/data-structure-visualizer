/**
 * Trie (Prefix Tree) Visualizer
 * Efficient for string operations like autocomplete and prefix matching
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
  CodeSnippets,
} from '../core/types';
import { createStepMeta } from '../core/types';
import { registry } from '../core/registry';
import { CANVAS_PADDING } from '../core/constants';

// =============================================================================
// Types
// =============================================================================

type NodeState = 'default' | 'current' | 'visited' | 'found' | 'inserted' | 'notFound';

interface TrieNodeData {
  id: string;
  char: string;
  isEndOfWord: boolean;
  children: TrieNodeData[];
  state: NodeState;
  depth: number;
  // Layout positions (computed during draw)
  x?: number;
  y?: number;
}

interface TrieData {
  root: TrieNodeData;
  words: string[]; // All words in the trie
  currentWord?: string; // Word being processed
  matchingWords?: string[]; // Words matching current prefix
}

// =============================================================================
// Node State Colors
// =============================================================================

const NODE_STATE_COLORS: Record<NodeState, string> = {
  default: '#374151',
  current: '#f59e0b',
  visited: '#6366f1',
  found: '#10b981',
  inserted: '#22c55e',
  notFound: '#ef4444',
};

// =============================================================================
// Trie Operations
// =============================================================================

function createTrieNode(char: string, depth: number): TrieNodeData {
  return {
    id: `${depth}-${char}-${Math.random().toString(36).substr(2, 5)}`,
    char,
    isEndOfWord: false,
    children: [],
    state: 'default',
    depth,
  };
}

function createEmptyTrie(): TrieData {
  return {
    root: createTrieNode('', 0),
    words: [],
  };
}

function cloneTrieNode(node: TrieNodeData): TrieNodeData {
  return {
    ...node,
    children: node.children.map((child) => cloneTrieNode(child)),
  };
}

function cloneTrie(trie: TrieData): TrieData {
  return {
    root: cloneTrieNode(trie.root),
    words: [...trie.words],
    currentWord: trie.currentWord,
    matchingWords: trie.matchingWords ? [...trie.matchingWords] : undefined,
  };
}

function resetTrieState(node: TrieNodeData): void {
  node.state = 'default';
  for (const child of node.children) {
    resetTrieState(child);
  }
}

function findChild(node: TrieNodeData, char: string): TrieNodeData | undefined {
  return node.children.find((child) => child.char === char);
}

function insertWordIntoTrie(root: TrieNodeData, word: string): void {
  let current = root;
  for (const char of word) {
    let child = findChild(current, char);
    if (!child) {
      child = createTrieNode(char, current.depth + 1);
      current.children.push(child);
      current.children.sort((a, b) => a.char.localeCompare(b.char));
    }
    current = child;
  }
  current.isEndOfWord = true;
}

// collectWords is used internally by generatePrefixSteps
// Keeping for potential future use

// =============================================================================
// Step Generators
// =============================================================================

export function generateInsertSteps(trie: TrieData, word: string): Step<TrieData>[] {
  const steps: Step<TrieData>[] = [];
  let stepId = 0;
  let comparisons = 0;

  const workingTrie = cloneTrie(trie);
  resetTrieState(workingTrie.root);

  // Initial state
  steps.push({
    id: stepId++,
    description: `Inserting word: "${word}"`,
    snapshot: {
      data: {
        ...cloneTrie(workingTrie),
        currentWord: word,
      },
    },
    meta: createStepMeta({ highlightedLine: 0 }),
  });

  let current = workingTrie.root;
  current.state = 'current';

  steps.push({
    id: stepId++,
    description: 'Starting at root node',
    snapshot: {
      data: {
        ...cloneTrie(workingTrie),
        currentWord: word,
      },
    },
    meta: createStepMeta({ highlightedLine: 1 }),
  });

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    comparisons++;

    // Mark current as visited
    current.state = 'visited';

    // Find or create child
    let child = findChild(current, char);
    const isNew = !child;

    if (!child) {
      child = createTrieNode(char, current.depth + 1);
      current.children.push(child);
      current.children.sort((a, b) => a.char.localeCompare(b.char));
    }

    child.state = isNew ? 'inserted' : 'current';

    steps.push({
      id: stepId++,
      description: isNew ? `Created new node for '${char}'` : `Found existing node for '${char}'`,
      snapshot: {
        data: {
          ...cloneTrie(workingTrie),
          currentWord: word,
        },
      },
      meta: createStepMeta({ highlightedLine: isNew ? 3 : 2, comparisons }),
    });

    current = child;
  }

  // Mark end of word
  current.isEndOfWord = true;
  current.state = 'inserted';

  // Add word to list if not already present
  if (!workingTrie.words.includes(word)) {
    workingTrie.words.push(word);
    workingTrie.words.sort();
  }

  steps.push({
    id: stepId++,
    description: `Marked '${word[word.length - 1]}' as end of word. "${word}" inserted!`,
    snapshot: {
      data: {
        ...cloneTrie(workingTrie),
        currentWord: word,
      },
    },
    meta: createStepMeta({ highlightedLine: 4, comparisons }),
  });

  return steps;
}

export function generateSearchSteps(trie: TrieData, word: string): Step<TrieData>[] {
  const steps: Step<TrieData>[] = [];
  let stepId = 0;
  let comparisons = 0;

  const workingTrie = cloneTrie(trie);
  resetTrieState(workingTrie.root);

  // Initial state
  steps.push({
    id: stepId++,
    description: `Searching for word: "${word}"`,
    snapshot: {
      data: {
        ...cloneTrie(workingTrie),
        currentWord: word,
      },
    },
    meta: createStepMeta({ highlightedLine: 0 }),
  });

  let current = workingTrie.root;
  current.state = 'current';

  steps.push({
    id: stepId++,
    description: 'Starting at root node',
    snapshot: {
      data: {
        ...cloneTrie(workingTrie),
        currentWord: word,
      },
    },
    meta: createStepMeta({ highlightedLine: 1 }),
  });

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    comparisons++;

    // Mark current as visited
    current.state = 'visited';

    // Find child
    const child = findChild(current, char);

    if (!child) {
      // Character not found - word doesn't exist
      steps.push({
        id: stepId++,
        description: `Character '${char}' not found! Word "${word}" does not exist.`,
        snapshot: {
          data: {
            ...cloneTrie(workingTrie),
            currentWord: word,
          },
        },
        meta: createStepMeta({ highlightedLine: 5, comparisons }),
      });

      return steps;
    }

    child.state = 'current';

    steps.push({
      id: stepId++,
      description: `Found '${char}'`,
      snapshot: {
        data: {
          ...cloneTrie(workingTrie),
          currentWord: word,
        },
      },
      meta: createStepMeta({ highlightedLine: 2, comparisons }),
    });

    current = child;
  }

  // Check if it's end of word
  if (current.isEndOfWord) {
    current.state = 'found';

    steps.push({
      id: stepId++,
      description: `Word "${word}" found in trie!`,
      snapshot: {
        data: {
          ...cloneTrie(workingTrie),
          currentWord: word,
        },
      },
      meta: createStepMeta({ highlightedLine: 3, comparisons }),
    });
  } else {
    current.state = 'notFound';

    steps.push({
      id: stepId++,
      description: `"${word}" is a prefix but not a complete word in the trie.`,
      snapshot: {
        data: {
          ...cloneTrie(workingTrie),
          currentWord: word,
        },
      },
      meta: createStepMeta({ highlightedLine: 4, comparisons }),
    });
  }

  return steps;
}

export function generatePrefixSteps(trie: TrieData, prefix: string): Step<TrieData>[] {
  const steps: Step<TrieData>[] = [];
  let stepId = 0;
  let comparisons = 0;

  const workingTrie = cloneTrie(trie);
  resetTrieState(workingTrie.root);

  // Initial state
  steps.push({
    id: stepId++,
    description: `Finding all words with prefix: "${prefix}"`,
    snapshot: {
      data: {
        ...cloneTrie(workingTrie),
        currentWord: prefix,
        matchingWords: [],
      },
    },
    meta: createStepMeta({ highlightedLine: 0 }),
  });

  let current = workingTrie.root;
  current.state = 'current';

  // Navigate to prefix node
  for (let i = 0; i < prefix.length; i++) {
    const char = prefix[i];
    comparisons++;

    current.state = 'visited';
    const child = findChild(current, char);

    if (!child) {
      steps.push({
        id: stepId++,
        description: `Prefix "${prefix}" not found. No matching words.`,
        snapshot: {
          data: {
            ...cloneTrie(workingTrie),
            currentWord: prefix,
            matchingWords: [],
          },
        },
        meta: createStepMeta({ highlightedLine: 4, comparisons }),
      });

      return steps;
    }

    child.state = 'current';

    steps.push({
      id: stepId++,
      description: `Found prefix character '${char}'`,
      snapshot: {
        data: {
          ...cloneTrie(workingTrie),
          currentWord: prefix,
        },
      },
      meta: createStepMeta({ highlightedLine: 1, comparisons }),
    });

    current = child;
  }

  // Collect all words under this prefix
  const matchingWords: string[] = [];
  const basePrefix = prefix.slice(0, -1); // All but last char (which is in current node)

  // Helper to mark nodes and collect words
  function collectAndMark(node: TrieNodeData, prefix: string): void {
    node.state = 'found';
    if (node.isEndOfWord) {
      matchingWords.push(prefix + node.char);
    }
    for (const child of node.children) {
      collectAndMark(child, prefix + node.char);
    }
  }

  collectAndMark(current, basePrefix);

  steps.push({
    id: stepId++,
    description: `Found ${matchingWords.length} word(s) with prefix "${prefix}": ${matchingWords.join(', ') || '(none)'}`,
    snapshot: {
      data: {
        ...cloneTrie(workingTrie),
        currentWord: prefix,
        matchingWords,
      },
    },
    meta: createStepMeta({ highlightedLine: 3, comparisons }),
  });

  return steps;
}

// =============================================================================
// Drawing
// =============================================================================

function calculateLayout(
  node: TrieNodeData,
  x: number,
  y: number,
  horizontalSpacing: number,
  verticalSpacing: number
): { width: number } {
  node.x = x;
  node.y = y;

  if (node.children.length === 0) {
    return { width: horizontalSpacing };
  }

  let totalWidth = 0;
  let childX = x;

  for (const child of node.children) {
    const result = calculateLayout(
      child,
      childX,
      y + verticalSpacing,
      horizontalSpacing,
      verticalSpacing
    );
    childX += result.width;
    totalWidth += result.width;
  }

  // Center parent over children
  const firstChild = node.children[0];
  const lastChild = node.children[node.children.length - 1];
  node.x = ((firstChild.x ?? 0) + (lastChild.x ?? 0)) / 2;

  return { width: Math.max(totalWidth, horizontalSpacing) };
}

function drawTrieNode(
  ctx: CanvasRenderingContext2D,
  node: TrieNodeData,
  parentX: number,
  parentY: number
): void {
  if (node.x === undefined || node.y === undefined) {
    return;
  }

  const radius = 18;

  // Draw edge to parent (if not root)
  if (node.depth > 0) {
    ctx.beginPath();
    ctx.moveTo(parentX, parentY + radius);
    ctx.lineTo(node.x, node.y - radius);
    ctx.strokeStyle = node.state !== 'default' ? NODE_STATE_COLORS[node.state] : '#4b5563';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Draw node circle
  ctx.beginPath();
  ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = NODE_STATE_COLORS[node.state];
  ctx.fill();

  // Double circle for end of word
  if (node.isEndOfWord) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius - 4, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Draw character
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.depth === 0 ? 'root' : node.char, node.x, node.y);

  // Draw children
  for (const child of node.children) {
    drawTrieNode(ctx, child, node.x, node.y);
  }
}

function drawTrie(
  data: TrieData,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#9ca3af';
  ctx.font = '14px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Trie (Prefix Tree)', CANVAS_PADDING, 20);

  // Current word/operation
  if (data.currentWord) {
    ctx.textAlign = 'right';
    ctx.fillText(`Current: "${data.currentWord}"`, width - CANVAS_PADDING, 20);
  }

  // Calculate layout
  const verticalSpacing = 60;
  const horizontalSpacing = 45;
  calculateLayout(data.root, width / 2, CANVAS_PADDING + 40, horizontalSpacing, verticalSpacing);

  // Draw the trie
  drawTrieNode(ctx, data.root, width / 2, CANVAS_PADDING + 40);

  // Draw words list
  if (data.words.length > 0) {
    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(
      `Words: ${data.words.slice(0, 8).join(', ')}${data.words.length > 8 ? '...' : ''}`,
      CANVAS_PADDING,
      height - 15
    );
  }

  // Draw matching words (for prefix search)
  if (data.matchingWords && data.matchingWords.length > 0) {
    ctx.fillStyle = '#10b981';
    ctx.textAlign = 'right';
    ctx.fillText(`Matches: ${data.matchingWords.join(', ')}`, width - CANVAS_PADDING, height - 15);
  }

  // Legend
  const legendY = height - 35;
  ctx.font = '11px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';

  const legendItems = [
    { color: NODE_STATE_COLORS.current, label: 'Current' },
    { color: NODE_STATE_COLORS.visited, label: 'Visited' },
    { color: NODE_STATE_COLORS.found, label: 'Found' },
    { color: NODE_STATE_COLORS.inserted, label: 'Inserted' },
  ];

  let legendX = CANVAS_PADDING;
  for (const item of legendItems) {
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(legendX + 6, legendY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#9ca3af';
    ctx.fillText(item.label, legendX + 16, legendY + 4);
    legendX += 85;
  }
}

// =============================================================================
// Create Sample Trie
// =============================================================================

function createSampleTrie(): TrieData {
  const trie = createEmptyTrie();
  const words = ['cat', 'car', 'card', 'care', 'cart', 'dog', 'do', 'dot'];

  for (const word of words) {
    insertWordIntoTrie(trie.root, word);
  }
  trie.words = [...words].sort();

  return trie;
}

// =============================================================================
// Visualizer Class
// =============================================================================

class TrieVisualizer implements Visualizer<TrieData> {
  readonly config: VisualizerConfig = {
    id: 'trie',
    name: 'Trie (Prefix Tree)',
    category: 'data-structure',
    description:
      'A tree structure for efficient string operations like autocomplete, prefix matching, and spell checking.',
    defaultSpeed: 600,
  };

  getInitialState(): Snapshot<TrieData> {
    return { data: createSampleTrie() };
  }

  getSteps(action: ActionPayload<TrieData>): Step<TrieData>[] {
    const data = action.data ?? this.getInitialState().data;
    const word = (action.params?.word as string) ?? '';

    switch (action.type) {
      case 'insert':
        return generateInsertSteps(data, word || 'hello');
      case 'search':
        return generateSearchSteps(data, word || 'car');
      case 'prefix':
        return generatePrefixSteps(data, word || 'ca');
      case 'reset':
        return [
          {
            id: 0,
            description: 'Reset to sample trie',
            snapshot: { data: createSampleTrie() },
            meta: createStepMeta({}),
          },
        ];
      default:
        return generateSearchSteps(data, word || 'car');
    }
  }

  draw(snapshot: Snapshot<TrieData>, ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    drawTrie(snapshot.data, ctx, width, height);
  }

  getPseudocode(): string[] {
    return [
      'insert(word: string): void {',
      '  let node = this.root;',
      '  for (const char of word) {',
      '    if (!node.children[char]) node.children[char] = new TrieNode();',
      '    node = node.children[char];',
      '  }',
      '  node.isEndOfWord = true;',
      '}',
    ];
  }

  getCode(): CodeSnippets {
    return {
      typescript: [
        'class TrieNode {',
        '  children: Map<string, TrieNode> = new Map();',
        '  isEndOfWord: boolean = false;',
        '}',
        '',
        'class Trie {',
        '  private root: TrieNode = new TrieNode();',
        '',
        '  insert(word: string): void {',
        '    let node = this.root;',
        '    for (const char of word) {',
        '      if (!node.children.has(char)) {',
        '        node.children.set(char, new TrieNode());',
        '      }',
        '      node = node.children.get(char)!;',
        '    }',
        '    node.isEndOfWord = true;',
        '  }',
        '',
        '  search(word: string): boolean {',
        '    let node = this.root;',
        '    for (const char of word) {',
        '      if (!node.children.has(char)) return false;',
        '      node = node.children.get(char)!;',
        '    }',
        '    return node.isEndOfWord;',
        '  }',
        '}',
      ],
      python: [
        'class TrieNode:',
        '    def __init__(self):',
        '        self.children: dict[str, TrieNode] = {}',
        '        self.is_end_of_word: bool = False',
        '',
        'class Trie:',
        '    def __init__(self):',
        '        self.root = TrieNode()',
        '',
        '    def insert(self, word: str) -> None:',
        '        node = self.root',
        '        for char in word:',
        '            if char not in node.children:',
        '                node.children[char] = TrieNode()',
        '            node = node.children[char]',
        '        node.is_end_of_word = True',
        '',
        '    def search(self, word: str) -> bool:',
        '        node = self.root',
        '        for char in word:',
        '            if char not in node.children:',
        '                return False',
        '            node = node.children[char]',
        '        return node.is_end_of_word',
      ],
      java: [
        'class TrieNode {',
        '    Map<Character, TrieNode> children = new HashMap<>();',
        '    boolean isEndOfWord = false;',
        '}',
        '',
        'class Trie {',
        '    private TrieNode root = new TrieNode();',
        '',
        '    public void insert(String word) {',
        '        TrieNode node = root;',
        '        for (char c : word.toCharArray()) {',
        '            node.children.putIfAbsent(c, new TrieNode());',
        '            node = node.children.get(c);',
        '        }',
        '        node.isEndOfWord = true;',
        '    }',
        '',
        '    public boolean search(String word) {',
        '        TrieNode node = root;',
        '        for (char c : word.toCharArray()) {',
        '            if (!node.children.containsKey(c)) return false;',
        '            node = node.children.get(c);',
        '        }',
        '        return node.isEndOfWord;',
        '    }',
        '}',
      ],
    };
  }

  getComplexity(): ComplexityInfo {
    return {
      time: {
        best: 'O(m)',
        average: 'O(m)',
        worst: 'O(m)',
      },
      space: 'O(n*m)',
    };
  }

  getInputs(): InputField[] {
    return [
      {
        id: 'word',
        label: 'Word',
        type: 'text',
        defaultValue: 'car',
        placeholder: 'Enter a word',
      },
    ];
  }

  getActions(): ActionButton[] {
    return [
      { id: 'search', label: 'Search', primary: true },
      { id: 'insert', label: 'Insert' },
      { id: 'prefix', label: 'Find Prefix' },
      { id: 'reset', label: 'Reset' },
    ];
  }
}

// =============================================================================
// Registration
// =============================================================================

registry.register<TrieData>(
  {
    id: 'trie',
    name: 'Trie (Prefix Tree)',
    category: 'data-structure',
    description:
      'A tree structure for efficient string operations like autocomplete, prefix matching, and spell checking.',
    defaultSpeed: 600,
  },
  () => new TrieVisualizer()
);

export { TrieVisualizer };
