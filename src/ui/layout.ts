/**
 * Layout Component
 * Creates and manages the main app layout structure
 */

import { HEADER_HEIGHT, SIDEBAR_WIDTH, CONTROLS_HEIGHT } from '../core/constants';

/**
 * Create the main application layout HTML structure
 */
export function createLayout(): HTMLElement {
  const app = document.createElement('div');
  app.id = 'app';
  app.className = 'app-layout';

  app.innerHTML = `
    <header class="app-header">
      <div class="header-brand">
        <a href="#home" id="home-link" class="header-home-link" title="Back to Home">
          <h1 class="header-title">Data Structure Visualizer</h1>
        </a>
      </div>
      <div class="header-selector" id="visualizer-selector-container">
        <!-- Visualizer selector will be mounted here -->
      </div>
      <div class="header-actions">
        <button class="btn btn-icon" id="theme-toggle" title="Toggle theme">
          <span class="icon">🌙</span>
        </button>
      </div>
    </header>

    <main class="app-main">
      <section class="canvas-section">
        <div id="landing-root" class="landing-root">
          <!-- Landing page will be mounted here -->
        </div>
        <div class="canvas-container" id="canvas-container">
          <canvas id="main-canvas"></canvas>
        </div>
        <div class="controls-bar" id="controls-container">
          <!-- Playback controls will be mounted here -->
        </div>
      </section>

      <aside class="info-panel" id="info-panel">
        <button class="mobile-toggle" id="mobile-panel-toggle" aria-expanded="true" aria-controls="info-panel">
          <span class="mobile-toggle-icon">▲</span>
          <span class="mobile-toggle-text">Algorithm Details</span>
        </button>

        <div class="panel-section" id="input-controls-section">
          <!-- Input controls will be mounted here -->
        </div>

        <div class="panel-section">
          <h3 class="panel-title">Description</h3>
          <p class="panel-description" id="visualizer-description">
            Select a visualizer to begin
          </p>
        </div>

        <div class="panel-section">
          <h3 class="panel-title">Pseudocode</h3>
          <pre class="pseudocode-block" id="pseudocode-block"><code>// Select a visualizer</code></pre>
        </div>

        <div class="panel-section">
          <h3 class="panel-title">Complexity</h3>
          <div class="complexity-info" id="complexity-info">
            <div class="complexity-row">
              <span class="complexity-label">Time (Best):</span>
              <span class="complexity-value" id="complexity-time-best">—</span>
            </div>
            <div class="complexity-row">
              <span class="complexity-label">Time (Avg):</span>
              <span class="complexity-value" id="complexity-time-avg">—</span>
            </div>
            <div class="complexity-row">
              <span class="complexity-label">Time (Worst):</span>
              <span class="complexity-value" id="complexity-time-worst">—</span>
            </div>
            <div class="complexity-row">
              <span class="complexity-label">Space:</span>
              <span class="complexity-value" id="complexity-space">—</span>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <h3 class="panel-title">Counters</h3>
          <div class="counters-grid" id="counters-grid">
            <div class="counter-item">
              <span class="counter-value" id="counter-comparisons">0</span>
              <span class="counter-label">Comparisons</span>
            </div>
            <div class="counter-item">
              <span class="counter-value" id="counter-swaps">0</span>
              <span class="counter-label">Swaps</span>
            </div>
            <div class="counter-item">
              <span class="counter-value" id="counter-reads">0</span>
              <span class="counter-label">Reads</span>
            </div>
            <div class="counter-item">
              <span class="counter-value" id="counter-writes">0</span>
              <span class="counter-label">Writes</span>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <h3 class="panel-title">Step Info</h3>
          <p class="step-description" id="step-description">
            Click Play to start the visualization
          </p>
          <div class="step-progress">
            <span id="step-current">0</span> / <span id="step-total">0</span>
          </div>
        </div>
      </aside>
    </main>
  `;

  // Apply CSS custom properties for dimensions
  app.style.setProperty('--header-height', `${HEADER_HEIGHT}px`);
  app.style.setProperty('--sidebar-width', `${SIDEBAR_WIDTH}px`);
  app.style.setProperty('--controls-height', `${CONTROLS_HEIGHT}px`);

  return app;
}

/**
 * Mount the layout to the document
 */
export function mountLayout(): void {
  const existingApp = document.getElementById('app');
  if (existingApp) {
    existingApp.remove();
  }

  const layout = createLayout();
  document.body.appendChild(layout);
}

/**
 * Get a required element by ID, throwing if not found
 */
export function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element with id "${id}" not found`);
  }
  return element as T;
}
