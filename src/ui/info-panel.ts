/**
 * Info Panel Component
 * Updates the sidebar with visualizer info, pseudocode, complexity, and counters
 */

import type { ComplexityInfo, OperationCounters, Step } from '../core/types';
import { getElement } from './layout';

/**
 * Info Panel Manager
 */
export class InfoPanel {
  private descriptionEl: HTMLElement;
  private pseudocodeEl: HTMLElement;
  private stepDescriptionEl: HTMLElement;
  private stepCurrentEl: HTMLElement;
  private stepTotalEl: HTMLElement;

  // Complexity elements
  private timeBestEl: HTMLElement;
  private timeAvgEl: HTMLElement;
  private timeWorstEl: HTMLElement;
  private spaceEl: HTMLElement;

  // Counter elements
  private comparisonsEl: HTMLElement;
  private swapsEl: HTMLElement;
  private readsEl: HTMLElement;
  private writesEl: HTMLElement;

  constructor() {
    this.descriptionEl = getElement('visualizer-description');
    this.pseudocodeEl = getElement('pseudocode-block');
    this.stepDescriptionEl = getElement('step-description');
    this.stepCurrentEl = getElement('step-current');
    this.stepTotalEl = getElement('step-total');

    this.timeBestEl = getElement('complexity-time-best');
    this.timeAvgEl = getElement('complexity-time-avg');
    this.timeWorstEl = getElement('complexity-time-worst');
    this.spaceEl = getElement('complexity-space');

    this.comparisonsEl = getElement('counter-comparisons');
    this.swapsEl = getElement('counter-swaps');
    this.readsEl = getElement('counter-reads');
    this.writesEl = getElement('counter-writes');
  }

  /**
   * Set the visualizer description
   */
  setDescription(description: string): void {
    this.descriptionEl.textContent = description;
  }

  /**
   * Set the pseudocode content
   */
  setPseudocode(lines: string[], highlightLine?: number): void {
    const formattedLines = lines.map((line, index) => {
      const lineNum = index + 1;
      const isHighlighted = lineNum === highlightLine;
      const highlightClass = isHighlighted ? 'pseudocode-line highlighted' : 'pseudocode-line';
      return `<span class="${highlightClass}"><span class="line-number">${lineNum}</span>${this.escapeHtml(line)}</span>`;
    });

    this.pseudocodeEl.innerHTML = `<code>${formattedLines.join('\n')}</code>`;
  }

  /**
   * Highlight a specific line in the pseudocode
   */
  highlightLine(lineNumber: number): void {
    const lines = this.pseudocodeEl.querySelectorAll('.pseudocode-line');
    lines.forEach((line, index) => {
      if (index + 1 === lineNumber) {
        line.classList.add('highlighted');
      } else {
        line.classList.remove('highlighted');
      }
    });
  }

  /**
   * Set the complexity info
   */
  setComplexity(info: ComplexityInfo | null): void {
    if (info) {
      this.timeBestEl.textContent = info.time.best;
      this.timeAvgEl.textContent = info.time.average;
      this.timeWorstEl.textContent = info.time.worst;
      this.spaceEl.textContent = info.space;
    } else {
      this.timeBestEl.textContent = '—';
      this.timeAvgEl.textContent = '—';
      this.timeWorstEl.textContent = '—';
      this.spaceEl.textContent = '—';
    }
  }

  /**
   * Update the operation counters
   */
  setCounters(counters: OperationCounters): void {
    this.comparisonsEl.textContent = counters.comparisons.toString();
    this.swapsEl.textContent = counters.swaps.toString();
    this.readsEl.textContent = counters.reads.toString();
    this.writesEl.textContent = counters.writes.toString();
  }

  /**
   * Reset counters to zero
   */
  resetCounters(): void {
    this.setCounters({ comparisons: 0, swaps: 0, reads: 0, writes: 0 });
  }

  /**
   * Update step info
   */
  setStepInfo(step: Step | null, currentIndex: number, totalSteps: number): void {
    this.stepCurrentEl.textContent = totalSteps > 0 ? (currentIndex + 1).toString() : '0';
    this.stepTotalEl.textContent = totalSteps.toString();

    if (step) {
      this.stepDescriptionEl.textContent = step.description;
      if (step.meta?.highlightedLine !== undefined) {
        this.highlightLine(step.meta.highlightedLine);
      }
    } else {
      this.stepDescriptionEl.textContent = 'Click Play to start the visualization';
    }
  }

  /**
   * Reset the panel to initial state
   */
  reset(): void {
    this.setDescription('Select a visualizer to begin');
    this.pseudocodeEl.innerHTML = '<code>// Select a visualizer</code>';
    this.setComplexity(null);
    this.resetCounters();
    this.stepCurrentEl.textContent = '0';
    this.stepTotalEl.textContent = '0';
    this.stepDescriptionEl.textContent = 'Click Play to start the visualization';
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
