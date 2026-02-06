/**
 * Visualizers module
 * Import this to register all visualizers with the registry
 */

// Import visualizers to trigger self-registration
import './sorting/bubble-sort';
import './sorting/selection-sort';
import './sorting/insertion-sort';
import './sorting/merge-sort';
import './sorting/quick-sort';
import './sorting/heap-sort';
import './linear/stack';
import './linear/queue';
import './linear/linked-list';
import './trees/binary-search-tree';
import './linear/heap';
import './linear/union-find';
import './linear/hash-table';
import './graphs/kruskal';
import './graphs/prim';
import './trees/trie';
import './trees/avl-tree';
import './graphs/topological-sort';
import './graphs/bellman-ford';
import './graphs/a-star';
import './graphs/dijkstra';

// Re-export for convenience
export { BubbleSortVisualizer } from './sorting/bubble-sort';
export { SelectionSortVisualizer } from './sorting/selection-sort';
export { InsertionSortVisualizer } from './sorting/insertion-sort';
export { MergeSortVisualizer } from './sorting/merge-sort';
export { QuickSortVisualizer } from './sorting/quick-sort';
export { HeapSortVisualizer } from './sorting/heap-sort';
export { StackVisualizer } from './linear/stack';
export { QueueVisualizer } from './linear/queue';
export { LinkedListVisualizer } from './linear/linked-list';
export { BinarySearchTreeVisualizer } from './trees/binary-search-tree';
export { HeapVisualizer } from './linear/heap';
export { UnionFindVisualizer } from './linear/union-find';
export { HashTableVisualizer } from './linear/hash-table';
export { KruskalVisualizer } from './graphs/kruskal';
export { PrimVisualizer } from './graphs/prim';
export { TrieVisualizer } from './trees/trie';
export { AVLVisualizer } from './trees/avl-tree';
export { TopologicalSortVisualizer } from './graphs/topological-sort';
export { BellmanFordVisualizer } from './graphs/bellman-ford';
export { AStarVisualizer } from './graphs/a-star';
export { DijkstraVisualizer } from './graphs/dijkstra';
