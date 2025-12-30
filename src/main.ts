/**
 * Data Structure Visualizer
 * Entry point - initializes the application
 */

import './style.css';
import { createApp } from './app';

/**
 * Parse the location hash and return the route info
 */
function parseHash(): { route: 'home' | 'viz'; vizId?: string } {
  const hash = window.location.hash.slice(1); // Remove leading #

  if (!hash || hash === 'home') {
    return { route: 'home' };
  }

  // Check for viz=<id> pattern
  const vizMatch = hash.match(/^viz=(.+)$/);
  if (vizMatch) {
    return { route: 'viz', vizId: vizMatch[1] };
  }

  // Unknown hash, default to home
  return { route: 'home' };
}

/**
 * Navigate to the appropriate view based on hash
 */
function handleNavigation(app: ReturnType<typeof createApp>): void {
  const { route, vizId } = parseHash();

  if (route === 'viz' && vizId) {
    const success = app.loadVisualizerById(vizId);
    if (!success) {
      // Invalid visualizer ID, redirect to home
      window.location.hash = 'home';
    }
  } else {
    app.showLanding();
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = createApp();

  // Handle initial navigation
  handleNavigation(app);

  // Handle hash changes (back/forward, manual hash edits)
  window.addEventListener('hashchange', () => {
    handleNavigation(app);
  });

  // Expose app to window for debugging (development only)
  if (import.meta.env.DEV) {
    (window as unknown as { app: typeof app }).app = app;
  }
});
