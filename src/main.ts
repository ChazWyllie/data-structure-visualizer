/**
 * Data Structure Visualizer
 * Entry point - initializes the application
 */

import './style.css';
import { createApp } from './app';

/** Route types for the application */
type Route =
  | { type: 'entry' }
  | { type: 'home' }
  | { type: 'showcase' }
  | { type: 'landing-preview'; landingId: string }
  | { type: 'viz'; vizId: string };

/**
 * Parse the location hash and return the route info
 *
 * Flow: Entry (V2 Showcase) → Home (Category Picker) → Visualizer
 */
function parseHash(): Route {
  const hash = window.location.hash.slice(1); // Remove leading #

  // Empty hash = entry point (V2 Showcase as primary landing)
  if (!hash) {
    return { type: 'entry' };
  }

  if (hash === 'home') {
    return { type: 'home' };
  }

  if (hash === 'showcase') {
    return { type: 'showcase' };
  }

  // Check for landing page preview pattern: landing-v1, landing-v2, landing-v3
  const landingMatch = hash.match(/^(landing-v\d+)$/);
  if (landingMatch) {
    return { type: 'landing-preview', landingId: landingMatch[1] };
  }

  // Check for viz=<id> pattern
  const vizMatch = hash.match(/^viz=(.+)$/);
  if (vizMatch) {
    return { type: 'viz', vizId: vizMatch[1] };
  }

  // Unknown hash, default to home
  return { type: 'home' };
}

/**
 * Navigate to the appropriate view based on hash
 */
function handleNavigation(app: ReturnType<typeof createApp>): void {
  const route = parseHash();

  switch (route.type) {
    case 'entry':
      app.showEntry();
      break;
    case 'showcase':
      app.showShowcase();
      break;
    case 'landing-preview':
      app.showLandingPreview(route.landingId);
      break;
    case 'viz':
      {
        const success = app.loadVisualizerById(route.vizId);
        if (!success) {
          // Invalid visualizer ID, redirect to home
          window.location.hash = 'home';
        }
      }
      break;
    case 'home':
    default:
      app.showLanding();
      break;
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
