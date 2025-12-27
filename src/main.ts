/**
 * Data Structure Visualizer
 * Entry point - initializes the application
 */

import './style.css';
import { createApp } from './app';

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = createApp();

  // Expose app to window for debugging (development only)
  if (import.meta.env.DEV) {
    (window as unknown as { app: typeof app }).app = app;
  }
});
