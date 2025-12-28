/**
 * Visualizers module
 * Import this to register all visualizers with the registry
 */

// Import visualizers to trigger self-registration
import './array-demo';
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

// Re-export for convenience
export { ArrayDemoVisualizer } from './array-demo';
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
