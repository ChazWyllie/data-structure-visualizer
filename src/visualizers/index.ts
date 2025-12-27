/**
 * Visualizers module
 * Import this to register all visualizers with the registry
 */

// Import visualizers to trigger self-registration
import './array-demo';
import './bubble-sort';
import './stack';
import './queue';
import './linked-list';
import './binary-search-tree';

// Re-export for convenience
export { ArrayDemoVisualizer } from './array-demo';
export { BubbleSortVisualizer } from './bubble-sort';
export { StackVisualizer } from './stack';
export { QueueVisualizer } from './queue';
export { LinkedListVisualizer } from './linked-list';
export { BinarySearchTreeVisualizer } from './binary-search-tree';
