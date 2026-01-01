/**
 * Shared utilities for sorting visualizers
 */

import type { ArrayElement, ElementState } from '../core/types';
import type { BarState } from '../render/animation';
import {
  CANVAS_PADDING,
  BAR_GAP_RATIO,
  MIN_BAR_WIDTH,
  MAX_BAR_WIDTH,
  BAR_CORNER_RADIUS,
} from '../core/constants';

export interface SortingData {
  elements: ArrayElement<number>[];
}

export const STATE_COLORS: Record<ElementState, string> = {
  default: '#60a5fa',
  comparing: '#fbbf24',
  swapping: '#f87171',
  sorted: '#4ade80',
  pivot: '#a78bfa',
  active: '#22d3ee',
};

/**
 * Calculate bar geometry for an array of elements
 */
export function calculateBarGeometry(
  elements: ArrayElement<number>[],
  width: number,
  height: number
): BarState[] {
  if (elements.length === 0) {
    return [];
  }

  const availableWidth = width - CANVAS_PADDING * 2;
  const availableHeight = height - CANVAS_PADDING * 2;
  const totalBars = elements.length;
  const rawBarWidth = availableWidth / totalBars;
  const barWidth = Math.max(
    MIN_BAR_WIDTH,
    Math.min(MAX_BAR_WIDTH, rawBarWidth * (1 - BAR_GAP_RATIO))
  );
  const gap = rawBarWidth - barWidth;
  const maxValue = Math.max(...elements.map((e) => e.value));

  return elements.map((element, index) => {
    const barHeight = (element.value / maxValue) * availableHeight;
    const x = CANVAS_PADDING + index * (barWidth + gap);
    const y = height - CANVAS_PADDING - barHeight;

    return {
      index,
      value: element.value,
      x,
      y,
      width: barWidth,
      height: barHeight,
      color: STATE_COLORS[element.state],
    };
  });
}

/**
 * Draw bars from pre-calculated bar states (for animated rendering)
 */
export function drawBarsFromState(
  bars: BarState[],
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  // Clear canvas
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  if (bars.length === 0) {
    return;
  }

  for (const bar of bars) {
    ctx.fillStyle = bar.color;
    ctx.beginPath();
    ctx.roundRect(bar.x, bar.y, bar.width, bar.height, BAR_CORNER_RADIUS);
    ctx.fill();

    // Draw value label if bar is wide enough
    if (bar.width >= 20) {
      ctx.fillStyle = '#e4e4e7';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(bar.value.toString(), bar.x + bar.width / 2, bar.y - 4);
    }
  }
}

export function drawArrayBars(
  elements: ArrayElement<number>[],
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  const bars = calculateBarGeometry(elements, width, height);
  drawBarsFromState(bars, ctx, width, height);
}

export function generateRandomArray(size: number): SortingData {
  const elements: ArrayElement<number>[] = [];
  for (let i = 0; i < size; i++) {
    elements.push({ value: Math.floor(Math.random() * 95) + 5, state: 'default' });
  }
  return { elements };
}
