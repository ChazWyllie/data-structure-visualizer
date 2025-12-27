/**
 * Visualizer Registry - Singleton pattern for managing visualizers
 */

import type { Visualizer, VisualizerConfig, VisualizerFactory } from './types';

interface RegisteredVisualizer {
  config: VisualizerConfig;
  factory: VisualizerFactory;
}

/**
 * Registry for managing visualizer registration and instantiation
 */
class VisualizerRegistry {
  private static instance: VisualizerRegistry;
  private visualizers = new Map<string, RegisteredVisualizer>();
  private listeners: Set<() => void> = new Set();

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): VisualizerRegistry {
    if (!VisualizerRegistry.instance) {
      VisualizerRegistry.instance = new VisualizerRegistry();
    }
    return VisualizerRegistry.instance;
  }

  /**
   * Register a new visualizer
   * @param config - Visualizer configuration
   * @param factory - Factory function to create instances
   */
  register<T>(config: VisualizerConfig, factory: VisualizerFactory<T>): void {
    if (this.visualizers.has(config.id)) {
      console.warn(`Visualizer "${config.id}" is already registered. Overwriting.`);
    }
    this.visualizers.set(config.id, {
      config,
      factory: factory as VisualizerFactory,
    });
    this.notifyListeners();
  }

  /**
   * Unregister a visualizer by ID
   */
  unregister(id: string): boolean {
    const result = this.visualizers.delete(id);
    if (result) {
      this.notifyListeners();
    }
    return result;
  }

  /**
   * Get a visualizer instance by ID
   */
  get(id: string): Visualizer | undefined {
    const registered = this.visualizers.get(id);
    return registered?.factory();
  }

  /**
   * Get visualizer config by ID (without instantiating)
   */
  getConfig(id: string): VisualizerConfig | undefined {
    return this.visualizers.get(id)?.config;
  }

  /**
   * Get all registered visualizer configs
   */
  getAll(): VisualizerConfig[] {
    return Array.from(this.visualizers.values()).map((v) => v.config);
  }

  /**
   * Get visualizers filtered by category
   */
  getByCategory(category: string): VisualizerConfig[] {
    return this.getAll().filter((v) => v.category === category);
  }

  /**
   * Get all unique categories
   */
  getCategories(): string[] {
    const categories = new Set(this.getAll().map((v) => v.category));
    return Array.from(categories).sort();
  }

  /**
   * Check if a visualizer is registered
   */
  has(id: string): boolean {
    return this.visualizers.has(id);
  }

  /**
   * Get the count of registered visualizers
   */
  get count(): number {
    return this.visualizers.size;
  }

  /**
   * Subscribe to registry changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Clear all registered visualizers (mainly for testing)
   */
  clear(): void {
    this.visualizers.clear();
    this.notifyListeners();
  }
}

/** Singleton registry instance */
export const registry = VisualizerRegistry.getInstance();
