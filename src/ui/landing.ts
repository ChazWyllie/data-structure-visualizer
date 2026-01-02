/**
 * Landing Page Component - V2 Style Category Picker
 * Full-featured page with sticky nav, hero, and algorithm category cards
 */

import { registry } from '../core/registry';
import type { VisualizerConfig } from '../core/types';

/** Algorithm categories with their display info */
const ALGORITHM_CATEGORIES = [
  {
    id: 'sorting',
    name: 'Sorting Algorithms',
    color: 'var(--accent-primary)',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h12M3 18h6"/></svg>`,
    description: 'Learn how data gets organized efficiently',
  },
  {
    id: 'data-structure',
    name: 'Data Structures',
    color: 'var(--accent-success)',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    description: 'Explore stacks, queues, trees, and more',
  },
  {
    id: 'graph',
    name: 'Graph Algorithms',
    color: 'var(--accent-secondary)',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="6" r="3"/><circle cx="19" cy="6" r="3"/><circle cx="12" cy="18" r="3"/><path d="M5 9v6l7 3 7-3V9"/></svg>`,
    description: 'Master pathfinding and graph traversal',
  },
];

export type LandingSelectHandler = (visualizerId: string) => void;

/**
 * Landing Page Manager - V2 Style
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
   * Render the landing page content - V2 Style
   */
  private renderContent(): string {
    return `
      <div class="lp lp-home mesh-gradient-bg">
        <!-- Navigation -->
        <nav class="lp-home-nav">
          <a href="#" class="lp-home-nav-brand">
            <div class="lp-home-logo">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect x="2" y="20" width="6" height="10" rx="1" fill="var(--accent-primary)"/>
                <rect x="10" y="14" width="6" height="16" rx="1" fill="var(--accent-success)"/>
                <rect x="18" y="8" width="6" height="22" rx="1" fill="var(--accent-warning)"/>
                <rect x="26" y="2" width="6" height="28" rx="1" fill="var(--accent-secondary)"/>
              </svg>
            </div>
            <span class="lp-home-nav-title">DSV</span>
          </a>
          <div class="lp-home-nav-links">
            <a href="https://github.com/ChazWyllie/data-structure-visualizer" target="_blank" rel="noopener" class="lp-home-nav-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </a>
          </div>
        </nav>

        <!-- Hero -->
        <section class="lp-home-hero">
          <h1 class="lp-home-title">
            Choose Your <span class="gradient-text">Adventure</span>
          </h1>
          <p class="lp-home-subtitle">
            Select a category below to start exploring algorithms and data structures
          </p>
        </section>

        <!-- Category Grid -->
        <section class="lp-home-categories">
          ${ALGORITHM_CATEGORIES.map((cat) => this.renderCategoryCard(cat)).join('')}
        </section>

        <!-- Visualizer Grid by Category -->
        <section class="lp-home-visualizers">
          ${ALGORITHM_CATEGORIES.map((cat) => this.renderVisualizerSection(cat)).join('')}
        </section>

        <!-- Footer -->
        <footer class="lp-home-footer">
          <p class="lp-home-footer-text">
            Designed & Built by <a href="https://github.com/ChazWyllie" target="_blank" rel="noopener" class="lp-home-footer-link">Chaz Wyllie</a>
          </p>
        </footer>
      </div>
    `;
  }

  /**
   * Render a category overview card
   */
  private renderCategoryCard(category: {
    id: string;
    name: string;
    color: string;
    icon: string;
    description: string;
  }): string {
    const visualizers = this.getVisualizersByCategory(category.id);

    return `
      <a href="#category-${category.id}" class="lp-home-category-card" data-category="${category.id}">
        <div class="lp-home-category-icon" style="color: ${category.color}">
          ${category.icon}
        </div>
        <div class="lp-home-category-info">
          <h3 class="lp-home-category-name">${category.name}</h3>
          <p class="lp-home-category-desc">${category.description}</p>
        </div>
        <div class="lp-home-category-count" style="background: ${category.color}">
          ${visualizers.length}
        </div>
      </a>
    `;
  }

  /**
   * Render a section of visualizer cards for a category
   */
  private renderVisualizerSection(category: { id: string; name: string; color: string }): string {
    const visualizers = this.getVisualizersByCategory(category.id);

    if (visualizers.length === 0) {
      return '';
    }

    return `
      <div id="category-${category.id}" class="lp-home-viz-section">
        <div class="lp-home-viz-header">
          <div class="lp-home-viz-dot" style="background: ${category.color}"></div>
          <h2 class="lp-home-viz-title">${category.name}</h2>
          <span class="lp-home-viz-count">${visualizers.length} visualizers</span>
        </div>
        <div class="lp-home-viz-grid">
          ${visualizers.map((viz, i) => this.renderVisualizerCard(viz, i)).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render a single visualizer card
   */
  private renderVisualizerCard(viz: VisualizerConfig, index: number): string {
    const shortDesc =
      viz.description.length > 100 ? viz.description.slice(0, 97) + '...' : viz.description;

    return `
      <button class="lp-home-viz-card" data-viz-id="${viz.id}" style="--card-index: ${index}">
        <h3 class="lp-home-viz-card-name">${viz.name}</h3>
        <p class="lp-home-viz-card-desc">${shortDesc}</p>
        <span class="lp-home-viz-card-cta">
          Explore
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </span>
      </button>
    `;
  }

  /**
   * Get visualizers filtered by category
   */
  private getVisualizersByCategory(categoryId: string): VisualizerConfig[] {
    return registry.getAll().filter((viz) => viz.category === categoryId);
  }

  /**
   * Bind click events for cards and smooth scrolling
   */
  private bindEvents(): void {
    // Handle visualizer card clicks
    this.container.addEventListener('click', (e) => {
      const card = (e.target as HTMLElement).closest('.lp-home-viz-card');
      if (card instanceof HTMLElement && card.dataset.vizId) {
        this.onSelect(card.dataset.vizId);
      }
    });

    // Handle category card smooth scroll
    this.container.querySelectorAll('.lp-home-category-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const href = (card as HTMLAnchorElement).getAttribute('href');
        if (href) {
          const target = this.container.querySelector(href);
          target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Handle nav brand click (scroll to top)
    const navBrand = this.container.querySelector('.lp-home-nav-brand');
    if (navBrand) {
      navBrand.addEventListener('click', (e) => {
        e.preventDefault();
        this.container.querySelector('.lp')?.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }
}
