/**
 * Shared utilities for sorting visualizers
 */

import type { ArrayElement, ElementState } from '../core/types';
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

export function drawArrayBars(
  elements: ArrayElement<number>[],
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);
  if (elements.length === 0) {
    return;
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
  elements.forEach((element, index) => {
    const barHeight = (element.value / maxValue) * availableHeight;
    const x = CANVAS_PADDING + index * (barWidth + gap);
    const y = height - CANVAS_PADDING - barHeight;
    ctx.fillStyle = STATE_COLORS[element.state];
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, BAR_CORNER_RADIUS);
    ctx.fill();
    if (barWidth >= 20) {
      ctx.fillStyle = '#e4e4e7';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(element.value.toString(), x + barWidth / 2, y - 4);
    }
  });
}

export function generateRandomArray(size: number): SortingData {
  const elements: ArrayElement<number>[] = [];
  for (let i = 0; i < size; i++) {
    elements.push({ value: Math.floor(Math.random() * 95) + 5, state: 'default' });
  }
  return { elements };
}
