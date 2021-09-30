import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { watch } from '../common/decorators/watch.js';
import { styles } from './checkbox.material.css';
import { IgcCheckboxBaseComponent } from './checkbox-base.js';
import { partNameMap } from '../common/util.js';

let nextId = 0;

/**
 * A check box allowing single values to be selected/deselected.
 *
 * @element igc-checkbox
 *
 * @slot - The checkbox label.
 *
 * @fires igcChange - Emitted when the control's checked state changes.
 * @fires igcFocus - Emitted when the control gains focus.
 * @fires igcBlur - Emitted when the control loses focus.
 *
 * @csspart base - The base wrapper of the checkbox.
 * @csspart control - The checkbox control.
 * @csspart label - The checkbox label.
 * @csspart indicator - The checkbox icon.
 */
export class IgcCheckboxComponent extends IgcCheckboxBaseComponent {
  /** @private */
  public static styles = styles;

  private inputId = `checkbox-${nextId++}`;
  private labelId = `checkbox-label-${this.inputId}`;

  /** Draws the checkbox in indeterminate state. */
  @property({ type: Boolean, reflect: true })
  public indeterminate = false;

  private handleClick() {
    this.checked = !this.checked;
    this.indeterminate = false;
  }

  @watch('checked', { waitUntilFirstUpdate: true })
  @watch('indeterminate', { waitUntilFirstUpdate: true })
  protected handleChange() {
    if (this.checked) {
      this.input.focus();
      this.emitEvent('igcChange');
    }
  }

  protected render() {
    return html`
      <label
        part="${partNameMap({ base: true, checked: this.checked })}"
        for="${this.inputId}"
        @mousedown="${this.handleMouseDown}"
      >
        <input
          id=${this.inputId}
          type="checkbox"
          name="${ifDefined(this.name)}"
          value="${ifDefined(this.value)}"
          .disabled="${this.disabled}"
          .checked="${live(this.checked)}"
          .indeterminate="${live(this.indeterminate)}"
          aria-checked="${this.indeterminate && !this.checked
            ? 'mixed'
            : this.checked}"
          aria-disabled="${this.disabled ? 'true' : 'false'}"
          aria-labelledby="${this.ariaLabelledby
            ? this.ariaLabelledby
            : this.labelId}"
          @click="${this.handleClick}"
          @blur="${this.handleBlur}"
          @focus="${this.handleFocus}"
        />
        <span part="${partNameMap({ control: true, checked: this.checked })}">
          <span
            part="${partNameMap({ indicator: true, checked: this.checked })}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M4.1,12.7 9,17.6 20.3,6.3" />
            </svg>
          </span>
        </span>
        <span
          part="${partNameMap({ label: true, checked: this.checked })}"
          id="${this.labelId}"
        >
          <slot></slot>
        </span>
      </label>
    `;
  }
}
