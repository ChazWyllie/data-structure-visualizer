/**
 * Render Loop Manager
 * Handles requestAnimationFrame-based rendering
 */

export type RenderCallback = (timestamp: number, deltaTime: number) => void;

export class RenderLoop {
  private isRunning = false;
  private animationFrameId: number | null = null;
  private lastTimestamp = 0;
  private renderCallback: RenderCallback | null = null;

  /**
   * Start the render loop
   */
  start(callback: RenderCallback): void {
    if (this.isRunning) {
      return;
    }

    this.renderCallback = callback;
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.tick();
  }

  /**
   * Stop the render loop
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Request a single frame render (for non-animated updates)
   */
  requestFrame(callback: RenderCallback): void {
    const timestamp = performance.now();
    requestAnimationFrame(() => {
      callback(timestamp, 0);
    });
  }

  /**
   * Check if the loop is currently running
   */
  get running(): boolean {
    return this.isRunning;
  }

  /**
   * Internal tick function
   */
  private tick = (): void => {
    if (!this.isRunning || !this.renderCallback) {
      return;
    }

    const timestamp = performance.now();
    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    this.renderCallback(timestamp, deltaTime);

    this.animationFrameId = requestAnimationFrame(this.tick);
  };
}
