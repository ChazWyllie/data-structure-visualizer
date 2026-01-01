/**
 * Visualizer Selector Component
 * Custom styled dropdown for selecting visualizers by category
 */

import { registry } from '../core/registry';
import { CATEGORY_LABELS } from '../core/constants';
import { iconChevronDown } from './icons';
import type { VisualizerConfig } from '../core/types';

export type SelectionHandler = (visualizerId: string) => void;

/**
 * Visualizer Selector Component
 */
export class VisualizerSelector {
  private container: HTMLElement;
  private onSelect: SelectionHandler;
  private selectedId: string | null = null;
  private isOpen = false;
  private dropdownElement!: HTMLElement;
  private triggerElement!: HTMLButtonElement;

  constructor(container: HTMLElement, onSelect: SelectionHandler) {
    this.container = container;
    this.onSelect = onSelect;
    this.render();
    this.bindEvents();

    // Subscribe to registry changes
    registry.subscribe(() => this.render());
  }

  /**
   * Render the custom dropdown
   */
  private render(): void {
    const visualizers = registry.getAll();
    const categories = registry.getCategories();
    const selectedConfig = this.selectedId ? registry.getConfig(this.selectedId) : null;
    const displayText = selectedConfig?.name ?? 'Select a visualizer...';

    this.container.innerHTML = `
      <div class="custom-dropdown" data-open="${this.isOpen}">
        <button class="dropdown-trigger" type="button" aria-expanded="${this.isOpen}" aria-haspopup="listbox">
          <span class="dropdown-value">${displayText}</span>
          <span class="dropdown-icon">${iconChevronDown({ size: 16 })}</span>
        </button>
        <div class="dropdown-menu" role="listbox" aria-label="Select visualizer">
          ${categories.map((category) => this.renderCategory(category, visualizers)).join('')}
        </div>
      </div>
    `;

    this.dropdownElement = this.container.querySelector('.custom-dropdown')!;
    this.triggerElement = this.container.querySelector('.dropdown-trigger')!;
  }

  /**
   * Render a category group
   */
  private renderCategory(category: string, visualizers: VisualizerConfig[]): string {
    const categoryVisualizers = visualizers.filter((v) => v.category === category);
    if (categoryVisualizers.length === 0) {
      return '';
    }

    const label = CATEGORY_LABELS[category] || category;

    return `
      <div class="dropdown-group">
        <div class="dropdown-group-label">${label}</div>
        ${categoryVisualizers
          .map(
            (v) => `
          <button 
            class="dropdown-item ${v.id === this.selectedId ? 'selected' : ''}" 
            data-value="${v.id}"
            role="option"
            aria-selected="${v.id === this.selectedId}"
          >
            ${v.name}
          </button>
        `
          )
          .join('')}
      </div>
    `;
  }

  /**
   * Bind event listeners
   */
  private bindEvents(): void {
    // Toggle dropdown on trigger click
    this.container.addEventListener('click', (e) => {
      const trigger = (e.target as HTMLElement).closest('.dropdown-trigger');
      if (trigger) {
        e.preventDefault();
        this.toggle();
        return;
      }

      const item = (e.target as HTMLElement).closest('.dropdown-item');
      if (item instanceof HTMLElement && item.dataset.value) {
        this.selectItem(item.dataset.value);
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.container.contains(e.target as Node)) {
        this.close();
      }
    });

    // Keyboard navigation
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
        this.triggerElement.focus();
      }
    });
  }

  /**
   * Toggle dropdown open/closed
   */
  private toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open the dropdown
   */
  private open(): void {
    this.isOpen = true;
    this.dropdownElement.setAttribute('data-open', 'true');
    this.triggerElement.setAttribute('aria-expanded', 'true');
  }

  /**
   * Close the dropdown
   */
  private close(): void {
    this.isOpen = false;
    this.dropdownElement.setAttribute('data-open', 'false');
    this.triggerElement.setAttribute('aria-expanded', 'false');
  }

  /**
   * Select an item
   */
  private selectItem(id: string): void {
    this.selectedId = id;
    this.close();
    this.render();
    this.onSelect(id);
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
      this.render();
      this.onSelect(id);
    }
  }

  /**
   * Clear the current selection (reset to placeholder)
   */
  clear(): void {
    this.selectedId = null;
    this.render();
  }
}
