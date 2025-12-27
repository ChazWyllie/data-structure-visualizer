/**
 * Visualizer Selector Component
 * Dropdown for selecting visualizers by category
 */

import { registry } from '../core/registry';
import { CATEGORY_LABELS } from '../core/constants';
import type { VisualizerConfig } from '../core/types';

export type SelectionHandler = (visualizerId: string) => void;

/**
 * Visualizer Selector Component
 */
export class VisualizerSelector {
  private container: HTMLElement;
  private onSelect: SelectionHandler;
  private selectedId: string | null = null;
  private selectElement!: HTMLSelectElement;

  constructor(container: HTMLElement, onSelect: SelectionHandler) {
    this.container = container;
    this.onSelect = onSelect;
    this.render();
    this.bindEvents();

    // Subscribe to registry changes
    registry.subscribe(() => this.render());
  }

  /**
   * Render the selector
   */
  private render(): void {
    const visualizers = registry.getAll();
    const categories = registry.getCategories();

    this.container.innerHTML = `
      <div class="selector-wrapper">
        <label class="selector-label" for="visualizer-select">Visualizer:</label>
        <select class="selector-dropdown" id="visualizer-select">
          <option value="">Select a visualizer...</option>
          ${categories.map((category) => this.renderCategory(category, visualizers)).join('')}
        </select>
      </div>
    `;

    this.selectElement = this.container.querySelector('#visualizer-select')!;

    // Restore selection
    if (this.selectedId && registry.has(this.selectedId)) {
      this.selectElement.value = this.selectedId;
    }
  }

  /**
   * Render a category optgroup
   */
  private renderCategory(category: string, visualizers: VisualizerConfig[]): string {
    const categoryVisualizers = visualizers.filter((v) => v.category === category);
    if (categoryVisualizers.length === 0) {
      return '';
    }

    const label = CATEGORY_LABELS[category] || category;

    return `
      <optgroup label="${label}">
        ${categoryVisualizers.map((v) => `<option value="${v.id}">${v.name}</option>`).join('')}
      </optgroup>
    `;
  }

  /**
   * Bind event listeners
   */
  private bindEvents(): void {
    this.container.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      if (target.id === 'visualizer-select' && target.value) {
        this.selectedId = target.value;
        this.onSelect(target.value);
      }
    });
  }

  /**
   * Get the currently selected visualizer ID
   */
  getSelectedId(): string | null {
    return this.selectedId;
  }

  /**
   * Programmatically select a visualizer
   */
  select(id: string): void {
    if (registry.has(id)) {
      this.selectedId = id;
      if (this.selectElement) {
        this.selectElement.value = id;
      }
      this.onSelect(id);
    }
  }
}
