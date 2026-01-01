/**
 * Landing Page Component
 * Displays a hero section and two categorized shelves: Algorithms and Data Structures
 */

import { registry } from '../core/registry';
import type { VisualizerConfig } from '../core/types';

/** Categories that count as "Algorithms" */
const ALGORITHM_CATEGORIES = ['sorting', 'searching', 'graph'];

/** Categories that count as "Data Structures" */
const DATA_STRUCTURE_CATEGORIES = ['data-structure'];

export type LandingSelectHandler = (visualizerId: string) => void;

/**
 * Landing Page Manager
 */
export class Landing {
  private container: HTMLElement;
  private onSelect: LandingSelectHandler;
  private mounted = false;

  constructor(container: HTMLElement, onSelect: LandingSelectHandler) {
    this.container = container;
    this.onSelect = onSelect;
  }

  /**
   * Mount the landing page into the container
   */
  mount(): void {
    if (this.mounted) {
      return;
    }

    this.container.innerHTML = this.renderContent();
    this.bindEvents();
    this.container.classList.add('visible');
    this.mounted = true;
  }

  /**
   * Unmount the landing page
   */
  unmount(): void {
    if (!this.mounted) {
      return;
    }

    this.container.classList.remove('visible');
    this.container.innerHTML = '';
    this.mounted = false;
  }

  /**
   * Check if landing is currently mounted
   */
  isMounted(): boolean {
    return this.mounted;
  }

  /**
   * Render the landing page content
   */
  private renderContent(): string {
    const visualizers = registry.getAll();
    const { algorithms, dataStructures } = this.splitByType(visualizers);

    return `
      <div class="landing-scroll">
        <div class="landing-hero">
          <div class="landing-hero-content">
            <h2 class="landing-title">Explore Data Structures & Algorithms</h2>
            <p class="landing-subtitle">
              Interactive visualizations to help you understand how algorithms work, step by step.
              Select a visualizer below to get started.
            </p>
          </div>
        </div>

        <div class="landing-sections">
          ${this.renderSection('Algorithms', algorithms)}
          ${this.renderSection('Data Structures', dataStructures)}
        </div>

        <div class="landing-footer">
          <p class="landing-footer-text">
            Designed & Built by <a href="https://github.com/ChazWyllie" target="_blank" rel="noopener noreferrer" class="landing-footer-link">Chaz Wyllie</a>
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Split visualizers into Algorithms and Data Structures
   */
  private splitByType(visualizers: VisualizerConfig[]): {
    algorithms: VisualizerConfig[];
    dataStructures: VisualizerConfig[];
  } {
    const algorithms: VisualizerConfig[] = [];
    const dataStructures: VisualizerConfig[] = [];

    for (const viz of visualizers) {
      const category = viz.category || 'other';

      if (ALGORITHM_CATEGORIES.includes(category)) {
        algorithms.push(viz);
      } else if (DATA_STRUCTURE_CATEGORIES.includes(category)) {
        dataStructures.push(viz);
      }
      // Skip 'demo' and 'other' categories from landing display
    }

    return { algorithms, dataStructures };
  }

  /**
   * Render a section with horizontal scrolling shelf
   */
  private renderSection(title: string, visualizers: VisualizerConfig[]): string {
    if (visualizers.length === 0) {
      return '';
    }

    return `
      <section class="landing-section">
        <h3 class="landing-section-title">${title}</h3>
        <div class="landing-shelf">
          <div class="landing-shelf-track">
            ${visualizers.map((viz, index) => this.renderCard(viz, index)).join('')}
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Render a visualizer card with staggered animation index
   */
  private renderCard(viz: VisualizerConfig, index: number): string {
    // Truncate description to ~80 chars for cleaner cards
    const shortDesc =
      viz.description.length > 80 ? viz.description.slice(0, 77) + '...' : viz.description;

    return `
      <button class="landing-card" data-viz-id="${viz.id}" style="--card-index: ${index}">
        <div class="landing-card-header">
          <span class="landing-card-name">${viz.name}</span>
        </div>
        <p class="landing-card-desc">${shortDesc}</p>
      </button>
    `;
  }

  /**
   * Bind click events for cards
   */
  private bindEvents(): void {
    this.container.addEventListener('click', (e) => {
      const card = (e.target as HTMLElement).closest('.landing-card');
      if (card instanceof HTMLElement && card.dataset.vizId) {
        this.onSelect(card.dataset.vizId);
      }
    });
  }
}
