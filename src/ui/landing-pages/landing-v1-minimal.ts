/**
 * Landing Page V1 - Minimal
 * Clean, minimalist design with hero + single CTA
 */

import type { BackHandler, LandingPageComponent, LandingPageConfig } from './types';

export const configV1: LandingPageConfig = {
  id: 'landing-v1',
  name: 'Minimal',
  description: 'Clean, minimalist design with focused hero section and clear call-to-action',
  style: 'minimal',
};

export class LandingV1Minimal implements LandingPageComponent {
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
      <div class="lp lp-v1">
        <!-- Back Button -->
        <button class="lp-back-btn" aria-label="Back to showcase">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Back to Options</span>
        </button>

        <!-- Hero Section -->
        <section class="lp-v1-hero">
          <div class="lp-v1-hero-content">
            <div class="lp-v1-badge">Open Source</div>
            <h1 class="lp-v1-title">
              Visualize
              <span class="lp-v1-title-accent">Algorithms</span>
            </h1>
            <p class="lp-v1-subtitle">
              Understand data structures and algorithms through beautiful, 
              interactive step-by-step animations.
            </p>
            <div class="lp-v1-cta-group">
              <a href="#home" class="lp-v1-cta-primary">
                Start Exploring
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
              <a href="https://github.com/ChazWyllie/data-structure-visualizer" target="_blank" rel="noopener" class="lp-v1-cta-secondary">
                View on GitHub
              </a>
            </div>
          </div>

          <!-- Minimal Graphic -->
          <div class="lp-v1-graphic">
            <svg class="lp-v1-bars" viewBox="0 0 200 120" fill="none">
              <rect x="10" y="80" width="30" height="30" rx="4" fill="var(--accent-primary)" opacity="0.9">
                <animate attributeName="height" values="30;50;30" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="y" values="80;60;80" dur="2s" repeatCount="indefinite"/>
              </rect>
              <rect x="50" y="40" width="30" height="70" rx="4" fill="var(--accent-success)" opacity="0.9">
                <animate attributeName="height" values="70;40;70" dur="2s" repeatCount="indefinite" begin="0.2s"/>
                <animate attributeName="y" values="40;70;40" dur="2s" repeatCount="indefinite" begin="0.2s"/>
              </rect>
              <rect x="90" y="20" width="30" height="90" rx="4" fill="var(--accent-warning)" opacity="0.9">
                <animate attributeName="height" values="90;60;90" dur="2s" repeatCount="indefinite" begin="0.4s"/>
                <animate attributeName="y" values="20;50;20" dur="2s" repeatCount="indefinite" begin="0.4s"/>
              </rect>
              <rect x="130" y="50" width="30" height="60" rx="4" fill="var(--accent-secondary)" opacity="0.9">
                <animate attributeName="height" values="60;80;60" dur="2s" repeatCount="indefinite" begin="0.6s"/>
                <animate attributeName="y" values="50;30;50" dur="2s" repeatCount="indefinite" begin="0.6s"/>
              </rect>
              <rect x="170" y="60" width="30" height="50" rx="4" fill="var(--accent-error)" opacity="0.9">
                <animate attributeName="height" values="50;70;50" dur="2s" repeatCount="indefinite" begin="0.8s"/>
                <animate attributeName="y" values="60;40;60" dur="2s" repeatCount="indefinite" begin="0.8s"/>
              </rect>
            </svg>
          </div>
        </section>

        <!-- Stats Row -->
        <section class="lp-v1-stats">
          <div class="lp-v1-stat">
            <span class="lp-v1-stat-value">21</span>
            <span class="lp-v1-stat-label">Visualizers</span>
          </div>
          <div class="lp-v1-stat">
            <span class="lp-v1-stat-value">6</span>
            <span class="lp-v1-stat-label">Sorting Algorithms</span>
          </div>
          <div class="lp-v1-stat">
            <span class="lp-v1-stat-value">9</span>
            <span class="lp-v1-stat-label">Data Structures</span>
          </div>
          <div class="lp-v1-stat">
            <span class="lp-v1-stat-value">6</span>
            <span class="lp-v1-stat-label">Graph Algorithms</span>
          </div>
        </section>

        <!-- Footer -->
        <footer class="lp-v1-footer">
          <p>Built by <a href="https://github.com/ChazWyllie" target="_blank" rel="noopener">Chaz Wyllie</a></p>
        </footer>
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
