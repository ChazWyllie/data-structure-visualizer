/**
 * Input Controls Component
 * Renders visualizer-specific input fields and action buttons
 */

import type { InputField, ActionButton } from '../core/types';

/** Callback for when an action button is clicked */
export type ActionCallback = (actionId: string, inputs: Record<string, string | number>) => void;

/**
 * InputControls manages visualizer-specific inputs and actions
 */
export class InputControls {
  private readonly container: HTMLElement;
  private inputsContainer: HTMLElement;
  private actionsContainer: HTMLElement;
  private currentInputs: InputField[] = [];
  private onAction: ActionCallback | null = null;

  constructor(parent: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'input-controls';

    // Inputs section
    const inputsLabel = document.createElement('div');
    inputsLabel.className = 'input-controls-label';
    inputsLabel.textContent = 'Inputs';
    this.container.appendChild(inputsLabel);

    this.inputsContainer = document.createElement('div');
    this.inputsContainer.className = 'input-fields';
    this.container.appendChild(this.inputsContainer);

    // Actions section
    const actionsLabel = document.createElement('div');
    actionsLabel.className = 'input-controls-label';
    actionsLabel.textContent = 'Actions';
    this.container.appendChild(actionsLabel);

    this.actionsContainer = document.createElement('div');
    this.actionsContainer.className = 'action-buttons';
    this.container.appendChild(this.actionsContainer);

    parent.appendChild(this.container);
  }

  /**
   * Set callback for action button clicks
   */
  setActionCallback(callback: ActionCallback): void {
    this.onAction = callback;
  }

  /**
   * Update displayed input fields
   */
  setInputFields(fields: InputField[]): void {
    this.currentInputs = fields;
    this.inputsContainer.innerHTML = '';

    if (fields.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'input-empty';
      empty.textContent = 'No inputs for this visualizer';
      this.inputsContainer.appendChild(empty);
      return;
    }

    for (const field of fields) {
      const wrapper = document.createElement('div');
      wrapper.className = 'input-field-wrapper';

      const label = document.createElement('label');
      label.className = 'input-field-label';
      label.textContent = field.label;
      label.htmlFor = `input-${field.id}`;
      wrapper.appendChild(label);

      const input = document.createElement('input');
      input.type = field.type;
      input.id = `input-${field.id}`;
      input.className = 'input-field';
      input.value = String(field.defaultValue);

      if (field.type === 'number') {
        if (field.min !== undefined) {
          input.min = String(field.min);
        }
        if (field.max !== undefined) {
          input.max = String(field.max);
        }
        if (field.step !== undefined) {
          input.step = String(field.step);
        }
      }

      wrapper.appendChild(input);
      this.inputsContainer.appendChild(wrapper);
    }
  }

  /**
   * Update displayed action buttons
   */
  setActionButtons(buttons: ActionButton[]): void {
    this.actionsContainer.innerHTML = '';

    if (buttons.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'input-empty';
      empty.textContent = 'No actions for this visualizer';
      this.actionsContainer.appendChild(empty);
      return;
    }

    for (const button of buttons) {
      const btn = document.createElement('button');
      btn.className = 'action-button';
      btn.textContent = button.label;
      btn.dataset.action = button.id;

      btn.addEventListener('click', () => {
        if (this.onAction) {
          const inputs = this.collectInputValues();
          this.onAction(button.id, inputs);
        }
      });

      this.actionsContainer.appendChild(btn);
    }
  }

  /**
   * Collect current values from all input fields
   */
  collectInputValues(): Record<string, string | number> {
    const values: Record<string, string | number> = {};

    for (const field of this.currentInputs) {
      const input = document.getElementById(`input-${field.id}`) as HTMLInputElement | null;
      if (input) {
        if (field.type === 'number') {
          values[field.id] = parseFloat(input.value) || field.defaultValue;
        } else {
          values[field.id] = input.value || String(field.defaultValue);
        }
      }
    }

    return values;
  }

  /**
   * Get a specific input value
   */
  getInputValue(fieldId: string): string | number | undefined {
    const field = this.currentInputs.find((f) => f.id === fieldId);
    if (!field) {
      return undefined;
    }

    const input = document.getElementById(`input-${fieldId}`) as HTMLInputElement | null;
    if (!input) {
      return field.defaultValue;
    }

    if (field.type === 'number') {
      return parseFloat(input.value) || field.defaultValue;
    }
    return input.value || String(field.defaultValue);
  }

  /**
   * Clear all inputs to their default values
   */
  resetToDefaults(): void {
    for (const field of this.currentInputs) {
      const input = document.getElementById(`input-${field.id}`) as HTMLInputElement | null;
      if (input) {
        input.value = String(field.defaultValue);
      }
    }
  }

  /**
   * Enable/disable all action buttons
   */
  setEnabled(enabled: boolean): void {
    const buttons = this.actionsContainer.querySelectorAll('.action-button');
    buttons.forEach((btn) => {
      (btn as HTMLButtonElement).disabled = !enabled;
    });

    const inputs = this.inputsContainer.querySelectorAll('.input-field');
    inputs.forEach((input) => {
      (input as HTMLInputElement).disabled = !enabled;
    });
  }
}
