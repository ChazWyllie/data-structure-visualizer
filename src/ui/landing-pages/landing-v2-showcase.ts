/**
 * Landing Page V2 - Showcase
 * Feature-rich design with algorithm previews, features, and testimonials
 */

import type { BackHandler, LandingPageComponent, LandingPageConfig } from './types';

export const configV2: LandingPageConfig = {
  id: 'landing-v2',
  name: 'Showcase',
  description: 'Feature-rich design with algorithm previews, feature grid, and social proof',
  style: 'showcase',
};

const FEATURES = [
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
    title: 'Step-by-Step Animation',
    description: 'Watch algorithms execute one step at a time with smooth transitions',
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
    title: 'Pseudocode Highlighting',
    description: 'See exactly which line of code is executing at each step',
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>`,
    title: 'Complexity Analysis',
    description: 'Learn time and space complexity with clear Big-O notation',
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>`,
    title: 'Operation Counters',
    description: 'Track comparisons, swaps, and memory operations in real-time',
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    title: 'Dark & Light Themes',
    description: 'Beautiful color schemes that are easy on the eyes',
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
    title: 'Fully Responsive',
    description: 'Works beautifully on desktop, tablet, and mobile devices',
  },
];

const ALGORITHM_CATEGORIES = [
  {
    name: 'Sorting',
    color: 'var(--accent-primary)',
    items: [
      'Bubble Sort',
      'Insertion Sort',
      'Selection Sort',
      'Merge Sort',
      'Quick Sort',
      'Heap Sort',
    ],
  },
  {
    name: 'Data Structures',
    color: 'var(--accent-success)',
    items: [
      'Stack',
      'Queue',
      'Linked List',
      'BST',
      'Heap',
      'Hash Table',
      'Trie',
      'AVL Tree',
      'Union-Find',
    ],
  },
  {
    name: 'Graph Algorithms',
    color: 'var(--accent-secondary)',
    items: ['Dijkstra', 'A*', 'Bellman-Ford', "Prim's MST", "Kruskal's MST", 'Topological Sort'],
  },
];

export class LandingV2Showcase implements LandingPageComponent {
  private container: HTMLElement;
  private onBack: BackHandler;
  private mounted = false;
  private isEntryMode: boolean;

  constructor(container: HTMLElement, onBack: BackHandler, isEntryMode = false) {
    this.container = container;
    this.onBack = onBack;
    this.isEntryMode = isEntryMode;
  }

  mount(): void {
    if (this.mounted) {
      return;
    }

    this.container.innerHTML = this.render();
    this.bindEvents();
    this.container.classList.add('visible');
    this.mounted = true;
  }

  unmount(): void {
    if (!this.mounted) {
      return;
    }

    this.container.classList.remove('visible');
    this.container.innerHTML = '';
    this.mounted = false;
  }

  isMounted(): boolean {
    return this.mounted;
  }

  private render(): string {
    const backButton = this.isEntryMode
      ? ''
      : `
        <button class="lp-back-btn" aria-label="Back to showcase">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Back to Options</span>
        </button>
      `;

    return `
      <div class="lp lp-v2 mesh-gradient-bg">
        <!-- Back Button (hidden in entry mode) -->
        ${backButton}

        <!-- Navigation -->
        <nav class="lp-v2-nav">
          <div class="lp-v2-nav-brand">
            <div class="lp-v2-logo">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect x="2" y="20" width="6" height="10" rx="1" fill="var(--accent-primary)"/>
                <rect x="10" y="14" width="6" height="16" rx="1" fill="var(--accent-success)"/>
                <rect x="18" y="8" width="6" height="22" rx="1" fill="var(--accent-warning)"/>
                <rect x="26" y="2" width="6" height="28" rx="1" fill="var(--accent-secondary)"/>
              </svg>
            </div>
            <span class="lp-v2-nav-title">DSV</span>
          </div>
          <div class="lp-v2-nav-links">
            <a href="#features">Features</a>
            <a href="#algorithms">Algorithms</a>
            <a href="https://github.com/ChazWyllie/data-structure-visualizer" target="_blank">GitHub</a>
          </div>
        </nav>

        <!-- Hero -->
        <section class="lp-v2-hero">
          <div class="lp-v2-hero-text">
            <h1 class="lp-v2-title">
              Learn Algorithms
              <span class="lp-v2-title-gradient">Visually</span>
            </h1>
            <p class="lp-v2-subtitle">
              The most intuitive way to understand data structures and algorithms. 
              Watch them come to life with beautiful, interactive visualizations.
            </p>
            <div class="lp-v2-cta-row">
              <a href="#home" class="lp-v2-btn-primary">
                Launch Visualizer
              </a>
              <a href="#algorithms" class="lp-v2-btn-ghost">
                Browse Algorithms
              </a>
            </div>
          </div>
          <div class="lp-v2-hero-visual">
            ${this.renderHeroVisual()}
          </div>
        </section>

        <!-- Features Grid -->
        <section id="features" class="lp-v2-features">
          <h2 class="lp-v2-section-title">Everything You Need to Learn</h2>
          <p class="lp-v2-section-subtitle">Powerful features designed for understanding</p>
          <div class="lp-v2-features-grid">
            ${FEATURES.map((f) => this.renderFeatureCard(f)).join('')}
          </div>
        </section>

        <!-- Algorithm Categories -->
        <section id="algorithms" class="lp-v2-algorithms">
          <h2 class="lp-v2-section-title">21 Visualizers & Counting</h2>
          <p class="lp-v2-section-subtitle">From basic sorting to advanced graph algorithms</p>
          <div class="lp-v2-categories">
            ${ALGORITHM_CATEGORIES.map((cat) => this.renderCategory(cat)).join('')}
          </div>
        </section>

        <!-- CTA Section -->
        <section class="lp-v2-cta-section">
          <div class="lp-v2-cta-content">
            <h2>Ready to Start Learning?</h2>
            <p>Jump in and start visualizing algorithms today. It's free and open source.</p>
            <a href="#home" class="lp-v2-btn-primary lp-v2-btn-large">
              Get Started Now
            </a>
          </div>
        </section>

        <!-- Footer -->
        <footer class="lp-v2-footer">
          <div class="lp-v2-footer-content">
            <div class="lp-v2-footer-brand">
              <div class="lp-v2-logo">
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                  <rect x="2" y="20" width="6" height="10" rx="1" fill="var(--accent-primary)"/>
                  <rect x="10" y="14" width="6" height="16" rx="1" fill="var(--accent-success)"/>
                  <rect x="18" y="8" width="6" height="22" rx="1" fill="var(--accent-warning)"/>
                  <rect x="26" y="2" width="6" height="28" rx="1" fill="var(--accent-secondary)"/>
                </svg>
              </div>
              <span>Data Structure Visualizer</span>
            </div>
            <p class="lp-v2-footer-credit">
              Designed & Built by <a href="https://github.com/ChazWyllie" target="_blank" rel="noopener">Chaz Wyllie</a>
            </p>
          </div>
        </footer>
      </div>
    `;
  }

  private renderHeroVisual(): string {
    return `
      <div class="lp-v2-visual-container">
        <div class="lp-v2-visual-window">
          <div class="lp-v2-window-dots">
            <span></span><span></span><span></span>
          </div>
          <svg class="lp-v2-sorting-anim" viewBox="0 0 240 100" fill="none">
            <rect class="lp-v2-bar" x="20" y="60" width="25" height="30" rx="3" fill="var(--accent-primary)"/>
            <rect class="lp-v2-bar" x="55" y="40" width="25" height="50" rx="3" fill="var(--accent-warning)"/>
            <rect class="lp-v2-bar" x="90" y="20" width="25" height="70" rx="3" fill="var(--accent-success)"/>
            <rect class="lp-v2-bar" x="125" y="50" width="25" height="40" rx="3" fill="var(--accent-secondary)"/>
            <rect class="lp-v2-bar" x="160" y="30" width="25" height="60" rx="3" fill="var(--accent-error)"/>
            <rect class="lp-v2-bar" x="195" y="45" width="25" height="45" rx="3" fill="var(--vis-active)"/>
          </svg>
        </div>
        <div class="lp-v2-visual-glow"></div>
      </div>
    `;
  }

  private renderFeatureCard(feature: { icon: string; title: string; description: string }): string {
    return `
      <div class="lp-v2-feature-card">
        <div class="lp-v2-feature-icon">${feature.icon}</div>
        <h3 class="lp-v2-feature-title">${feature.title}</h3>
        <p class="lp-v2-feature-desc">${feature.description}</p>
      </div>
    `;
  }

  private renderCategory(category: { name: string; color: string; items: string[] }): string {
    return `
      <div class="lp-v2-category">
        <div class="lp-v2-category-header">
          <span class="lp-v2-category-dot" style="background: ${category.color}"></span>
          <h3 class="lp-v2-category-name">${category.name}</h3>
          <span class="lp-v2-category-count">${category.items.length}</span>
        </div>
        <ul class="lp-v2-category-list">
          ${category.items.map((item) => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  private bindEvents(): void {
    const backBtn = this.container.querySelector('.lp-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.onBack();
      });
    }

    // Smooth scroll for anchor links
    this.container.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = (anchor as HTMLAnchorElement).getAttribute('href');
        if (href && href !== '#home' && href.startsWith('#')) {
          e.preventDefault();
          const target = this.container.querySelector(href);
          target?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }
}
