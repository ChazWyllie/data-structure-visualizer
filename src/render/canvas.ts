/**
 * HiDPI Canvas Manager
 * Handles devicePixelRatio scaling for crisp rendering on Retina displays
 */

import type { CanvasDimensions, RenderContext } from '../core/types';

export class CanvasManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr: number;
  private resizeObserver: ResizeObserver | null = null;
  private onResizeCallbacks: Set<(dimensions: CanvasDimensions) => void> = new Set();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
      throw new Error('Failed to get 2D canvas context');
    }
    this.ctx = context;
    this.dpr = window.devicePixelRatio || 1;

    this.setupHiDPI();
    this.setupResizeObserver();
  }

  /**
   * Configure canvas for HiDPI/Retina display
   */
  private setupHiDPI(): void {
    const rect = this.canvas.getBoundingClientRect();

    // Set the "actual" size of the canvas (scaled up for HiDPI)
    this.canvas.width = Math.floor(rect.width * this.dpr);
    this.canvas.height = Math.floor(rect.height * this.dpr);

    // Scale the context so drawing operations are 1:1 with CSS pixels
    this.ctx.scale(this.dpr, this.dpr);

    // Ensure the canvas CSS size matches the container
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
  }

  /**
   * Set up ResizeObserver for responsive canvas
   */
  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === this.canvas) {
          // Update DPR in case it changed (e.g., moving between displays)
          this.dpr = window.devicePixelRatio || 1;
          this.setupHiDPI();

          // Notify listeners
          const dimensions = this.getDimensions();
          this.onResizeCallbacks.forEach((cb) => cb(dimensions));
        }
      }
    });

    this.resizeObserver.observe(this.canvas);
  }

  /**
   * Get the 2D rendering context
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * Get the full render context with utilities
   */
  getRenderContext(): RenderContext {
    return {
      ctx: this.ctx,
      dimensions: this.getDimensions(),
      dpr: this.dpr,
    };
  }

  /**
   * Get logical (CSS) dimensions
   */
  getDimensions(): CanvasDimensions {
    const rect = this.canvas.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
    };
  }

  /**
   * Get the device pixel ratio
   */
  getDevicePixelRatio(): number {
    return this.dpr;
  }

  /**
   * Clear the entire canvas
   */
  clear(backgroundColor?: string): void {
    const { width, height } = this.getDimensions();

    // Reset transform to clear properly
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    // Fill with background color if provided
    if (backgroundColor) {
      this.ctx.fillStyle = backgroundColor;
      this.ctx.fillRect(0, 0, width, height);
    }
  }

  /**
   * Subscribe to resize events
   */
  onResize(callback: (dimensions: CanvasDimensions) => void): () => void {
    this.onResizeCallbacks.add(callback);
    return () => this.onResizeCallbacks.delete(callback);
  }

  /**
   * Force a resize recalculation
   */
  refresh(): void {
    this.dpr = window.devicePixelRatio || 1;
    this.setupHiDPI();
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.onResizeCallbacks.clear();
  }
}
