/**
 * Landing Page V3 - Immersive
 * Full-bleed hero with animated visualization background and bold typography
 */

import type { BackHandler, LandingPageComponent, LandingPageConfig } from './types';

export const configV3: LandingPageConfig = {
  id: 'landing-v3',
  name: 'Immersive',
  description: 'Bold, immersive design with animated background and dramatic typography',
  style: 'immersive',
};

const SHOWCASE_ITEMS = [
  { name: 'Quick Sort', complexity: 'O(n log n)', category: 'sorting' },
  { name: 'Binary Search Tree', complexity: 'O(log n)', category: 'data-structure' },
  { name: "Dijkstra's Algorithm", complexity: 'O(V + E log V)', category: 'graph' },
  { name: 'Merge Sort', complexity: 'O(n log n)', category: 'sorting' },
  { name: 'Hash Table', complexity: 'O(1) avg', category: 'data-structure' },
  { name: 'A* Pathfinding', complexity: 'O(E)', category: 'graph' },
];

export class LandingV3Immersive implements LandingPageComponent {
  private container: HTMLElement;
  private onBack: BackHandler;
  private mounted = false;

  constructor(container: HTMLElement, onBack: BackHandler) {
    this.container = container;
    this.onBack = onBack;
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
    return `
      <div class="lp lp-v3">
        <!-- Back Button -->
        <button class="lp-back-btn lp-back-btn-light" aria-label="Back to showcase">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Back to Options</span>
        </button>

        <!-- Animated Background -->
        <div class="lp-v3-bg">
          ${this.renderAnimatedBackground()}
        </div>

        <!-- Overlay Gradient -->
        <div class="lp-v3-overlay"></div>

        <!-- Main Content -->
        <div class="lp-v3-content">
          <!-- Hero -->
          <section class="lp-v3-hero">
            <div class="lp-v3-hero-inner">
              <span class="lp-v3-eyebrow">Interactive Learning</span>
              <h1 class="lp-v3-title">
                See How
                <br />
                <span class="lp-v3-title-em">Algorithms</span>
                <br />
                Actually Work
              </h1>
              <p class="lp-v3-subtitle">
                Stop reading. Start watching. Beautiful visualizations that make 
                complex algorithms simple to understand.
              </p>
              <a href="#home" class="lp-v3-cta">
                <span>Enter the Visualizer</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none"/>
                </svg>
              </a>
            </div>
          </section>

          <!-- Floating Cards -->
          <section class="lp-v3-showcase">
            <div class="lp-v3-showcase-scroll">
              ${SHOWCASE_ITEMS.map((item, i) => this.renderShowcaseCard(item, i)).join('')}
            </div>
          </section>

          <!-- Bottom Stats -->
          <section class="lp-v3-bottom">
            <div class="lp-v3-stats-row">
              <div class="lp-v3-stat-item">
                <span class="lp-v3-stat-num">21</span>
                <span class="lp-v3-stat-label">Algorithms</span>
              </div>
              <div class="lp-v3-stat-divider"></div>
              <div class="lp-v3-stat-item">
                <span class="lp-v3-stat-num">3</span>
                <span class="lp-v3-stat-label">Categories</span>
              </div>
              <div class="lp-v3-stat-divider"></div>
              <div class="lp-v3-stat-item">
                <span class="lp-v3-stat-num">100%</span>
                <span class="lp-v3-stat-label">Open Source</span>
              </div>
            </div>
            <div class="lp-v3-footer">
              <a href="https://github.com/ChazWyllie/data-structure-visualizer" target="_blank" rel="noopener" class="lp-v3-github-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>View on GitHub</span>
              </a>
              <span class="lp-v3-credit">by Chaz Wyllie</span>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  private renderAnimatedBackground(): string {
    // Create a grid of animated nodes/connections
    return `
      <svg class="lp-v3-bg-svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="var(--accent-primary)" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="var(--accent-primary)" stop-opacity="0"/>
          </radialGradient>
        </defs>
        
        <!-- Grid lines -->
        <g class="lp-v3-grid" stroke="var(--border-subtle)" stroke-width="0.5" opacity="0.3">
          ${Array.from({ length: 13 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="800"/>`).join('')}
          ${Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="${i * 100}" x2="1200" y2="${i * 100}"/>`).join('')}
        </g>
        
        <!-- Animated nodes -->
        <g class="lp-v3-nodes">
          <circle cx="200" cy="150" r="8" fill="var(--accent-primary)" class="lp-v3-node">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite"/>
          </circle>
          <circle cx="400" cy="250" r="6" fill="var(--accent-success)" class="lp-v3-node">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite" begin="0.5s"/>
          </circle>
          <circle cx="600" cy="180" r="10" fill="var(--accent-warning)" class="lp-v3-node">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite" begin="1s"/>
          </circle>
          <circle cx="800" cy="350" r="7" fill="var(--accent-secondary)" class="lp-v3-node">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite" begin="1.5s"/>
          </circle>
          <circle cx="1000" cy="200" r="9" fill="var(--accent-primary)" class="lp-v3-node">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite" begin="2s"/>
          </circle>
          <circle cx="300" cy="450" r="6" fill="var(--accent-error)" class="lp-v3-node">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite" begin="0.8s"/>
          </circle>
          <circle cx="700" cy="500" r="8" fill="var(--vis-active)" class="lp-v3-node">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite" begin="1.2s"/>
          </circle>
          <circle cx="900" cy="600" r="5" fill="var(--accent-success)" class="lp-v3-node">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite" begin="1.8s"/>
          </circle>
        </g>
        
        <!-- Connecting lines -->
        <g class="lp-v3-connections" stroke="var(--accent-primary)" stroke-width="1" opacity="0.2">
          <line x1="200" y1="150" x2="400" y2="250">
            <animate attributeName="opacity" values="0.1;0.4;0.1" dur="4s" repeatCount="indefinite"/>
          </line>
          <line x1="400" y1="250" x2="600" y2="180">
            <animate attributeName="opacity" values="0.1;0.4;0.1" dur="4s" repeatCount="indefinite" begin="0.5s"/>
          </line>
          <line x1="600" y1="180" x2="800" y2="350">
            <animate attributeName="opacity" values="0.1;0.4;0.1" dur="4s" repeatCount="indefinite" begin="1s"/>
          </line>
          <line x1="800" y1="350" x2="1000" y2="200">
            <animate attributeName="opacity" values="0.1;0.4;0.1" dur="4s" repeatCount="indefinite" begin="1.5s"/>
          </line>
          <line x1="300" y1="450" x2="700" y2="500">
            <animate attributeName="opacity" values="0.1;0.4;0.1" dur="4s" repeatCount="indefinite" begin="2s"/>
          </line>
        </g>
      </svg>
    `;
  }

  private renderShowcaseCard(
    item: { name: string; complexity: string; category: string },
    index: number
  ): string {
    const categoryColors: Record<string, string> = {
      sorting: 'var(--accent-primary)',
      'data-structure': 'var(--accent-success)',
      graph: 'var(--accent-secondary)',
    };
    const color = categoryColors[item.category] || 'var(--accent-primary)';

    return `
      <div class="lp-v3-card" style="--card-index: ${index}; --card-color: ${color}">
        <span class="lp-v3-card-category">${item.category.replace('-', ' ')}</span>
        <h3 class="lp-v3-card-name">${item.name}</h3>
        <span class="lp-v3-card-complexity">${item.complexity}</span>
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
  }
}
