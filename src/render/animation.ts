/**
 * Animation Interpolation System
 * Provides smooth transitions between visualization states using easing functions
 */

// =============================================================================
// Easing Functions (Apple-style spring curves)
// =============================================================================

export type EasingFunction = (t: number) => number;

/** Linear interpolation (no easing) */
export const easeLinear: EasingFunction = (t) => t;

/** Ease out cubic - decelerating to zero velocity */
export const easeOutCubic: EasingFunction = (t) => 1 - Math.pow(1 - t, 3);

/** Ease in out cubic - acceleration until halfway, then deceleration */
export const easeInOutCubic: EasingFunction = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Apple-style spring easing - overshoot and settle */
export const easeSpring: EasingFunction = (t) => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

/** Smooth step - smoother version of linear */
export const easeSmoothStep: EasingFunction = (t) => t * t * (3 - 2 * t);

// =============================================================================
// Interpolation Utilities
// =============================================================================

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Interpolate a color between two hex colors
 */
export function lerpColor(startHex: string, endHex: string, t: number): string {
  const start = hexToRgb(startHex);
  const end = hexToRgb(endHex);

  if (!start || !end) {
    return t < 0.5 ? startHex : endHex;
  }

  const r = Math.round(lerp(start.r, end.r, t));
  const g = Math.round(lerp(start.g, end.g, t));
  const b = Math.round(lerp(start.b, end.b, t));

  return rgbToHex(r, g, b);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

// =============================================================================
// Bar Position Tracker
// =============================================================================

export interface BarState {
  index: number;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface AnimatedBarState extends BarState {
  targetX: number;
  targetY: number;
  targetHeight: number;
  targetColor: string;
  animationProgress: number;
}

/**
 * Bar Animation Manager
 * Tracks and interpolates bar positions for smooth animations
 */
export class BarAnimator {
  private bars: Map<number, AnimatedBarState> = new Map();
  private animationDuration: number;
  private easing: EasingFunction;

  constructor(animationDuration = 200, easing: EasingFunction = easeOutCubic) {
    this.animationDuration = animationDuration;
    this.easing = easing;
  }

  /**
   * Update bar states with new targets
   */
  updateBars(newBars: BarState[]): void {
    const existingIndices = new Set(this.bars.keys());

    for (const bar of newBars) {
      const existing = this.bars.get(bar.index);

      if (existing) {
        // Update targets for existing bar
        existing.targetX = bar.x;
        existing.targetY = bar.y;
        existing.targetHeight = bar.height;
        existing.targetColor = bar.color;
        existing.value = bar.value;
        existing.width = bar.width;
        existing.animationProgress = 0;
        existingIndices.delete(bar.index);
      } else {
        // Add new bar (no animation needed)
        this.bars.set(bar.index, {
          ...bar,
          targetX: bar.x,
          targetY: bar.y,
          targetHeight: bar.height,
          targetColor: bar.color,
          animationProgress: 1,
        });
      }
    }

    // Remove bars that no longer exist
    for (const index of existingIndices) {
      this.bars.delete(index);
    }
  }

  /**
   * Tick the animation forward
   * @param deltaMs Time elapsed since last tick in milliseconds
   * @returns true if animation is still in progress
   */
  tick(deltaMs: number): boolean {
    let animating = false;
    const progressDelta = deltaMs / this.animationDuration;

    for (const bar of this.bars.values()) {
      if (bar.animationProgress < 1) {
        bar.animationProgress = Math.min(1, bar.animationProgress + progressDelta);
        const t = this.easing(bar.animationProgress);

        bar.x = lerp(bar.x, bar.targetX, t);
        bar.y = lerp(bar.y, bar.targetY, t);
        bar.height = lerp(bar.height, bar.targetHeight, t);
        bar.color = lerpColor(bar.color, bar.targetColor, t);

        if (bar.animationProgress < 1) {
          animating = true;
        } else {
          // Snap to final values
          bar.x = bar.targetX;
          bar.y = bar.targetY;
          bar.height = bar.targetHeight;
          bar.color = bar.targetColor;
        }
      }
    }

    return animating;
  }

  /**
   * Get current bar states for rendering
   */
  getBars(): BarState[] {
    return Array.from(this.bars.values()).map((bar) => ({
      index: bar.index,
      value: bar.value,
      x: bar.x,
      y: bar.y,
      width: bar.width,
      height: bar.height,
      color: bar.color,
    }));
  }

  /**
   * Reset all animations
   */
  reset(): void {
    this.bars.clear();
  }

  /**
   * Skip animations and snap to final state
   */
  skipToEnd(): void {
    for (const bar of this.bars.values()) {
      bar.x = bar.targetX;
      bar.y = bar.targetY;
      bar.height = bar.targetHeight;
      bar.color = bar.targetColor;
      bar.animationProgress = 1;
    }
  }
}
