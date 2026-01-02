/**
 * Info Panel Component
 * Updates the sidebar with visualizer info, pseudocode, complexity, and counters
 */

import type {
  CodeLanguage,
  CodeSnippets,
  ComplexityInfo,
  OperationCounters,
  Step,
} from '../core/types';
import { getElement } from './layout';

/** Available code display modes */
type CodeMode = 'pseudo' | CodeLanguage;

/**
 * Info Panel Manager
 */
export class InfoPanel {
  private descriptionEl: HTMLElement;
  private pseudocodeEl: HTMLElement;
  private codeTabsEl: HTMLElement;
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

  // Code state
  private currentMode: CodeMode = 'pseudo';
  private currentPseudocode: string[] = [];
  private currentCodeSnippets: CodeSnippets | null = null;
  private currentHighlightLine?: number;
  private currentHighlightColor?: string;

  constructor() {
    this.descriptionEl = getElement('visualizer-description');
    this.pseudocodeEl = getElement('pseudocode-block');
    this.codeTabsEl = getElement('code-tabs');
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

    this.setupTabListeners();
  }

  /**
   * Set up click listeners for language tabs
   */
  private setupTabListeners(): void {
    this.codeTabsEl.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('code-tab')) {
        const lang = target.dataset.lang as CodeMode;
        if (lang) {
          this.setCodeMode(lang);
        }
      }
    });
  }

  /**
   * Switch between code display modes
   */
  private setCodeMode(mode: CodeMode): void {
    this.currentMode = mode;

    // Update active tab
    const tabs = this.codeTabsEl.querySelectorAll('.code-tab');
    tabs.forEach((tab) => {
      const tabEl = tab as HTMLElement;
      tabEl.classList.toggle('active', tabEl.dataset.lang === mode);
    });

    // Render appropriate code
    this.renderCode();
  }

  /**
   * Render code based on current mode
   */
  private renderCode(): void {
    let lines: string[];

    if (this.currentMode === 'pseudo') {
      lines = this.currentPseudocode;
    } else if (this.currentCodeSnippets) {
      lines = this.currentCodeSnippets[this.currentMode];
    } else {
      // Fallback to pseudocode if no code snippets available
      lines = this.currentPseudocode;
    }

    this.renderCodeLines(lines);

    // Re-apply highlight if set
    if (this.currentHighlightLine !== undefined) {
      this.highlightLine(this.currentHighlightLine, this.currentHighlightColor);
    }
  }

  /**
   * Render code lines to the pseudocode element
   */
  private renderCodeLines(lines: string[]): void {
    const formattedLines = lines.map((line, index) => {
      const lineNum = index + 1;
      return `<span class="pseudocode-line"><span class="line-number">${lineNum}</span>${this.escapeHtml(line)}</span>`;
    });

    this.pseudocodeEl.innerHTML = `<code>${formattedLines.join('\n')}</code>`;
  }

  /**
   * Set the visualizer description
   */
  setDescription(description: string): void {
    this.descriptionEl.textContent = description;
  }

  /**
   * Set the pseudocode content and optional code snippets
   */
  setPseudocode(lines: string[], highlightLine?: number, codeSnippets?: CodeSnippets | null): void {
    this.currentPseudocode = lines;
    this.currentCodeSnippets = codeSnippets ?? null;
    this.currentHighlightLine = highlightLine;
    this.currentHighlightColor = undefined;

    this.renderCode();

    if (highlightLine !== undefined) {
      this.highlightLine(highlightLine);
    }
  }

  /**
   * Highlight a specific line in the pseudocode with optional color
   */
  highlightLine(lineNumber: number, highlightColor?: string): void {
    this.currentHighlightLine = lineNumber;
    this.currentHighlightColor = highlightColor;

    const lines = this.pseudocodeEl.querySelectorAll('.pseudocode-line');
    lines.forEach((line, index) => {
      const htmlLine = line as HTMLElement;
      if (index + 1 === lineNumber) {
        htmlLine.classList.add('highlighted');
        if (highlightColor) {
          htmlLine.style.setProperty('--highlight-color', highlightColor);
        } else {
          htmlLine.style.removeProperty('--highlight-color');
        }
      } else {
        htmlLine.classList.remove('highlighted');
        htmlLine.style.removeProperty('--highlight-color');
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
        this.highlightLine(step.meta.highlightedLine, step.meta.highlightColor);
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
