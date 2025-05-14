import { LitElement, html } from 'lit-element';
import { property } from 'lit/decorators.js';
import IgcChipComponent from '../chip/chip.js';
import { registerComponent } from '../common/definitions/register.js';
import type { CustomDateRange } from './date-range-picker.js';
import { styles } from './predefined-ranges.area.css.js';

export default class IgcPredefinedRangesAreaComponent extends LitElement {
  public static readonly tagName = 'igc-predefined-ranges-area';
  public static override styles = [styles];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcPredefinedRangesAreaComponent, IgcChipComponent);
  }

  /**
   * Renders chips with ranges based on the elements of the array.
   */
  @property({ type: Array }) ranges: CustomDateRange[] = [];

  private handleRangeSelect(range: CustomDateRange) {
    const event = new CustomEvent('range-select', { detail: range });
    this.dispatchEvent(event);
  }

  protected override render() {
    return html`
      <div class="ranges">
        ${this.ranges.map(
          (range) => html`
            <igc-chip @click=${() => this.handleRangeSelect(range)}>
              ${range.label}
            </igc-chip>
          `
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-predefined-ranges-area': IgcPredefinedRangesAreaComponent;
  }
}
