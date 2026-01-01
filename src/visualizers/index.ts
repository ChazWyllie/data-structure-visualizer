/**
 * Visualizers module
 * Import this to register all visualizers with the registry
 */

// Import visualizers to trigger self-registration
import './bubble-sort';
import './selection-sort';
import './insertion-sort';
import './merge-sort';
import './quick-sort';
import './heap-sort';
import './stack';
import './queue';
import './linked-list';
import './binary-search-tree';
import './heap';
import './union-find';
import './hash-table';
import './kruskal';
import './prim';
import './trie';
import './avl-tree';
import './topological-sort';
import './bellman-ford';
import './a-star';
import './dijkstra';

// Re-export for convenience
export { BubbleSortVisualizer } from './bubble-sort';
export { SelectionSortVisualizer } from './selection-sort';
export { InsertionSortVisualizer } from './insertion-sort';
export { MergeSortVisualizer } from './merge-sort';
export { QuickSortVisualizer } from './quick-sort';
export { HeapSortVisualizer } from './heap-sort';
export { StackVisualizer } from './stack';
export { QueueVisualizer } from './queue';
export { LinkedListVisualizer } from './linked-list';
export { BinarySearchTreeVisualizer } from './binary-search-tree';
export { HeapVisualizer } from './heap';
export { UnionFindVisualizer } from './union-find';
export { HashTableVisualizer } from './hash-table';
export { KruskalVisualizer } from './kruskal';
export { PrimVisualizer } from './prim';
export { TrieVisualizer } from './trie';
export { AVLVisualizer } from './avl-tree';
export { TopologicalSortVisualizer } from './topological-sort';
export { BellmanFordVisualizer } from './bellman-ford';
export { AStarVisualizer } from './a-star';
export { DijkstraVisualizer } from './dijkstra';
