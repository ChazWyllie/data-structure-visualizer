/**
 * Trie (Prefix Tree) Visualizer Tests
 */

import { describe, it, expect } from 'vitest';
import { generateInsertSteps, generateSearchSteps, generatePrefixSteps } from '../visualizers/trie';

// Helper to create a sample trie
interface TestTrieNode {
  id: string;
  char: string;
  isEndOfWord: boolean;
  children: TestTrieNode[];
  state: 'default';
  depth: number;
}

interface TestTrie {
  root: TestTrieNode;
  words: string[];
}

function createTestTrie(): { trie: TestTrie; insert: (word: string) => void } {
  // We'll build it step by step using the visualizer's internal structure
  const trie: TestTrie = {
    root: {
      id: 'root',
      char: '',
      isEndOfWord: false,
      children: [],
      state: 'default',
      depth: 0,
    },
    words: [],
  };

  // Helper to insert words for testing
  function insert(word: string): void {
    let current: TestTrieNode = trie.root;
    for (const char of word) {
      let child = current.children.find((c: TestTrieNode) => c.char === char);
      if (!child) {
        child = {
          id: `${current.depth + 1}-${char}`,
          char,
          isEndOfWord: false,
          children: [],
          state: 'default',
          depth: current.depth + 1,
        };
        current.children.push(child);
        current.children.sort((a: TestTrieNode, b: TestTrieNode) => a.char.localeCompare(b.char));
      }
      current = child;
    }
    current.isEndOfWord = true;
    if (!trie.words.includes(word)) {
      trie.words.push(word);
      trie.words.sort();
    }
  }

  return { trie, insert };
}

describe('Trie Visualizer', () => {
  describe('generateInsertSteps', () => {
    it('should insert a word into empty trie', () => {
      const { trie } = createTestTrie();
      const steps = generateInsertSteps(trie, 'cat');

      expect(steps.length).toBeGreaterThan(0);

      const finalStep = steps[steps.length - 1];
      expect(finalStep.snapshot.data.words).toContain('cat');
    });

    it('should create steps for each character', () => {
      const { trie } = createTestTrie();
      const word = 'dog';
      const steps = generateInsertSteps(trie, word);

      // Should have initial + start + one step per char + end step
      expect(steps.length).toBeGreaterThanOrEqual(word.length + 2);
    });

    it('should handle inserting into existing prefix', () => {
      const { trie, insert } = createTestTrie();
      insert('car');

      const steps = generateInsertSteps(trie, 'cart');

      // Should find existing 'c', 'a', 'r' and create 't'
      const createStep = steps.find((s) => s.description.includes("Created new node for 't'"));
      expect(createStep).toBeDefined();
    });

    it('should handle duplicate word insertion', () => {
      const { trie, insert } = createTestTrie();
      insert('cat');

      const steps = generateInsertSteps(trie, 'cat');

      // All characters should be found (not created)
      const createdSteps = steps.filter((s) => s.description.includes('Created'));
      expect(createdSteps.length).toBe(0);
    });
  });

  describe('generateSearchSteps', () => {
    it('should find existing word', () => {
      const { trie, insert } = createTestTrie();
      insert('cat');

      const steps = generateSearchSteps(trie, 'cat');

      const foundStep = steps.find((s) => s.description.includes('found in trie'));
      expect(foundStep).toBeDefined();
    });

    it('should detect when word does not exist', () => {
      const { trie, insert } = createTestTrie();
      insert('cat');

      const steps = generateSearchSteps(trie, 'dog');

      const notFoundStep = steps.find((s) => s.description.includes('not found'));
      expect(notFoundStep).toBeDefined();
    });

    it('should detect prefix that is not a word', () => {
      const { trie, insert } = createTestTrie();
      insert('cart');

      const steps = generateSearchSteps(trie, 'car');

      const prefixStep = steps.find((s) =>
        s.description.includes('prefix but not a complete word')
      );
      expect(prefixStep).toBeDefined();
    });

    it('should track comparisons', () => {
      const { trie, insert } = createTestTrie();
      insert('hello');

      const steps = generateSearchSteps(trie, 'hello');
      const finalStep = steps[steps.length - 1];

      expect(finalStep.meta.comparisons).toBe(5); // One per character
    });
  });

  describe('generatePrefixSteps', () => {
    it('should find all words with given prefix', () => {
      const { trie, insert } = createTestTrie();
      insert('car');
      insert('card');
      insert('care');
      insert('cart');

      const steps = generatePrefixSteps(trie, 'car');

      const finalStep = steps[steps.length - 1];
      expect(finalStep.snapshot.data.matchingWords).toBeDefined();
      expect(finalStep.snapshot.data.matchingWords?.length).toBe(4);
    });

    it('should return empty for non-existent prefix', () => {
      const { trie, insert } = createTestTrie();
      insert('cat');

      const steps = generatePrefixSteps(trie, 'dog');

      const notFoundStep = steps.find((s) => s.description.includes('not found'));
      expect(notFoundStep).toBeDefined();
    });

    it('should handle single character prefix', () => {
      const { trie, insert } = createTestTrie();
      insert('cat');
      insert('car');
      insert('dog');

      const steps = generatePrefixSteps(trie, 'c');

      const finalStep = steps[steps.length - 1];
      expect(finalStep.snapshot.data.matchingWords?.length).toBe(2);
    });
  });

  describe('step metadata', () => {
    it('should have unique sequential step ids', () => {
      const { trie } = createTestTrie();
      const steps = generateInsertSteps(trie, 'test');

      for (let i = 0; i < steps.length; i++) {
        expect(steps[i].id).toBe(i);
      }
    });

    it('should have descriptions for all steps', () => {
      const { trie, insert } = createTestTrie();
      insert('hello');

      const steps = generateSearchSteps(trie, 'hello');

      for (const step of steps) {
        expect(step.description).toBeTruthy();
        expect(step.description.length).toBeGreaterThan(0);
      }
    });
  });
});
