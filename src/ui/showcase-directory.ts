/**
 * Showcase Directory Component
 * Displays a dark-themed grid of landing page options with previews
 */

import { LANDING_PAGE_CONFIGS, type LandingPageConfig } from './landing-pages';

export type ShowcaseSelectHandler = (landingPageId: string) => void;

/**
 * Showcase Directory - displays all landing page options
 */
export class ShowcaseDirectory {
  private container: HTMLElement;
  private onSelect: ShowcaseSelectHandler;
  private mounted = false;

  constructor(container: HTMLElement, onSelect: ShowcaseSelectHandler) {
    this.container = container;
    this.onSelect = onSelect;
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
      <div class="showcase-directory">
        <header class="showcase-header">
          <div class="showcase-logo">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <rect x="2" y="20" width="6" height="10" rx="1" fill="var(--accent-primary)"/>
              <rect x="10" y="14" width="6" height="16" rx="1" fill="var(--accent-success)"/>
              <rect x="18" y="8" width="6" height="22" rx="1" fill="var(--accent-warning)"/>
              <rect x="26" y="2" width="6" height="28" rx="1" fill="var(--accent-secondary)"/>
            </svg>
          </div>
          <div class="showcase-header-text">
            <h1 class="showcase-title">Landing Page Options</h1>
            <p class="showcase-subtitle">Data Structure Visualizer</p>
          </div>
        </header>

        <div class="showcase-grid">
          ${LANDING_PAGE_CONFIGS.map((config, index) => this.renderCard(config, index)).join('')}
        </div>

        <footer class="showcase-footer">
          <p>Click a card to preview the full landing page</p>
          <a href="#home" class="showcase-skip-link">
            Skip to Visualizer
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </footer>
      </div>
    `;
  }

  private renderCard(config: LandingPageConfig, index: number): string {
    return `
      <button class="showcase-card" data-landing-id="${config.id}" style="--card-index: ${index}">
        <div class="showcase-card-preview">
          ${this.renderPreviewSVG(config.style)}
        </div>
        <div class="showcase-card-content">
          <span class="showcase-card-badge">${config.style}</span>
          <h2 class="showcase-card-name">${config.name}</h2>
          <p class="showcase-card-desc">${config.description}</p>
        </div>
        <div class="showcase-card-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </button>
    `;
  }

  private renderPreviewSVG(style: 'minimal' | 'showcase' | 'immersive'): string {
    switch (style) {
      case 'minimal':
        return `
          <svg viewBox="0 0 280 180" fill="none" class="showcase-preview-svg">
            <!-- Clean background -->
            <rect width="280" height="180" fill="var(--bg-primary)"/>
            
            <!-- Centered hero content mockup -->
            <rect x="90" y="35" width="100" height="8" rx="2" fill="var(--text-secondary)" opacity="0.3"/>
            <rect x="60" y="55" width="160" height="12" rx="2" fill="var(--text-primary)" opacity="0.6"/>
            <rect x="80" y="75" width="120" height="6" rx="2" fill="var(--text-muted)" opacity="0.4"/>
            
            <!-- Single CTA button -->
            <rect x="100" y="100" width="80" height="24" rx="12" fill="var(--accent-primary)" opacity="0.8"/>
            
            <!-- Minimal bars animation hint -->
            <g transform="translate(95, 140)">
              <rect x="0" y="15" width="18" height="20" rx="2" fill="var(--accent-primary)" opacity="0.6"/>
              <rect x="22" y="5" width="18" height="30" rx="2" fill="var(--accent-success)" opacity="0.6"/>
              <rect x="44" y="10" width="18" height="25" rx="2" fill="var(--accent-warning)" opacity="0.6"/>
              <rect x="66" y="0" width="18" height="35" rx="2" fill="var(--accent-secondary)" opacity="0.6"/>
            </g>
          </svg>
        `;
      case 'showcase':
        return `
          <svg viewBox="0 0 280 180" fill="none" class="showcase-preview-svg">
            <!-- Background -->
            <rect width="280" height="180" fill="var(--bg-primary)"/>
            
            <!-- Top nav bar -->
            <rect x="0" y="0" width="280" height="20" fill="var(--bg-secondary)" opacity="0.5"/>
            <circle cx="15" cy="10" r="4" fill="var(--accent-primary)" opacity="0.6"/>
            <rect x="25" y="7" width="30" height="6" rx="2" fill="var(--text-secondary)" opacity="0.3"/>
            
            <!-- Hero section with visual -->
            <rect x="15" y="35" width="100" height="10" rx="2" fill="var(--text-primary)" opacity="0.5"/>
            <rect x="15" y="50" width="80" height="6" rx="2" fill="var(--text-muted)" opacity="0.3"/>
            <rect x="15" y="65" width="60" height="16" rx="4" fill="var(--accent-primary)" opacity="0.7"/>
            
            <!-- Visual mockup on right -->
            <rect x="150" y="30" width="115" height="60" rx="4" fill="var(--bg-tertiary)" opacity="0.6"/>
            <g transform="translate(160, 55)">
              <rect x="0" y="15" width="12" height="20" rx="1" fill="var(--accent-primary)" opacity="0.7"/>
              <rect x="16" y="5" width="12" height="30" rx="1" fill="var(--accent-success)" opacity="0.7"/>
              <rect x="32" y="10" width="12" height="25" rx="1" fill="var(--accent-warning)" opacity="0.7"/>
              <rect x="48" y="0" width="12" height="35" rx="1" fill="var(--accent-secondary)" opacity="0.7"/>
              <rect x="64" y="8" width="12" height="27" rx="1" fill="var(--accent-error)" opacity="0.7"/>
              <rect x="80" y="12" width="12" height="23" rx="1" fill="var(--vis-active)" opacity="0.7"/>
            </g>
            
            <!-- Feature cards row -->
            <rect x="15" y="105" width="75" height="60" rx="4" fill="var(--bg-secondary)" opacity="0.5"/>
            <rect x="100" y="105" width="75" height="60" rx="4" fill="var(--bg-secondary)" opacity="0.5"/>
            <rect x="185" y="105" width="75" height="60" rx="4" fill="var(--bg-secondary)" opacity="0.5"/>
            
            <!-- Icons in feature cards -->
            <circle cx="52" cy="125" r="8" fill="var(--accent-primary)" opacity="0.4"/>
            <circle cx="137" cy="125" r="8" fill="var(--accent-success)" opacity="0.4"/>
            <circle cx="222" cy="125" r="8" fill="var(--accent-secondary)" opacity="0.4"/>
          </svg>
        `;
      case 'immersive':
        return `
          <svg viewBox="0 0 280 180" fill="none" class="showcase-preview-svg">
            <!-- Dark gradient background -->
            <defs>
              <linearGradient id="immersive-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0a0a0a"/>
                <stop offset="100%" stop-color="#1a1a2e"/>
              </linearGradient>
            </defs>
            <rect width="280" height="180" fill="url(#immersive-bg)"/>
            
            <!-- Grid lines background -->
            <g stroke="var(--border-subtle)" stroke-width="0.5" opacity="0.15">
              <line x1="0" y1="30" x2="280" y2="30"/>
              <line x1="0" y1="60" x2="280" y2="60"/>
              <line x1="0" y1="90" x2="280" y2="90"/>
              <line x1="0" y1="120" x2="280" y2="120"/>
              <line x1="0" y1="150" x2="280" y2="150"/>
              <line x1="50" y1="0" x2="50" y2="180"/>
              <line x1="100" y1="0" x2="100" y2="180"/>
              <line x1="150" y1="0" x2="150" y2="180"/>
              <line x1="200" y1="0" x2="200" y2="180"/>
              <line x1="250" y1="0" x2="250" y2="180"/>
            </g>
            
            <!-- Glowing nodes -->
            <circle cx="80" cy="50" r="5" fill="var(--accent-primary)" opacity="0.7"/>
            <circle cx="200" cy="40" r="4" fill="var(--accent-success)" opacity="0.6"/>
            <circle cx="140" cy="80" r="6" fill="var(--accent-warning)" opacity="0.5"/>
            <circle cx="220" cy="100" r="4" fill="var(--accent-secondary)" opacity="0.6"/>
            <circle cx="60" cy="120" r="5" fill="var(--accent-error)" opacity="0.5"/>
            
            <!-- Connection lines -->
            <line x1="80" y1="50" x2="140" y2="80" stroke="var(--accent-primary)" stroke-width="1" opacity="0.3"/>
            <line x1="140" y1="80" x2="200" y2="40" stroke="var(--accent-warning)" stroke-width="1" opacity="0.3"/>
            <line x1="140" y1="80" x2="220" y2="100" stroke="var(--accent-secondary)" stroke-width="1" opacity="0.3"/>
            
            <!-- Bold centered text mockup -->
            <rect x="60" y="95" width="160" height="16" rx="2" fill="var(--text-primary)" opacity="0.8"/>
            <rect x="90" y="120" width="100" height="8" rx="2" fill="var(--text-secondary)" opacity="0.4"/>
            
            <!-- CTA button -->
            <rect x="95" y="140" width="90" height="22" rx="11" fill="var(--accent-primary)" opacity="0.9"/>
          </svg>
        `;
    }
  }

  private bindEvents(): void {
    this.container.addEventListener('click', (e) => {
      const card = (e.target as HTMLElement).closest('.showcase-card');
      if (card instanceof HTMLElement && card.dataset.landingId) {
        this.onSelect(card.dataset.landingId);
      }
    });
  }
}
