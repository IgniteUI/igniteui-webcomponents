import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { watch } from '../common/decorators/watch.js';
import { styles } from './checkbox.material.css';
import { IgcCheckboxBaseComponent } from './checkbox-base.js';

let nextId = 0;

// @customElement('igc-checkbox')
export class IgcCheckboxComponent extends IgcCheckboxBaseComponent {
  static styles = styles;

  private inputId = `checkbox-${nextId++}`;
  private labelId = `checkbox-label-${this.inputId}`;

  @property({ type: Boolean, reflect: true })
  indeterminate = false;

  handleClick() {
    this.checked = !this.checked;
    this.indeterminate = false;
  }

  @watch('checked', { waitUntilFirstUpdate: true })
  @watch('indeterminate', { waitUntilFirstUpdate: true })
  handleChange() {
    if (this.checked) {
      this.input.focus();
      this.emitEvent('igcChange');
    }
  }

  render() {
    return html`
      <label
        part="base"
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
          aria-checked="${this.checked ? 'true' : 'false'}"
          aria-disabled="${this.disabled ? 'true' : 'false'}"
          aria-labelledby="${this.ariaLabelledby
            ? this.ariaLabelledby
            : this.labelId}"
          @click="${this.handleClick}"
          @blur="${this.handleBlur}"
          @focus="${this.handleFocus}"
        />
        <span part="control">
          ${this.checked
            ? html` <span part="indicator" class="checked">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M4.1,12.7 9,17.6 20.3,6.3" />
                </svg>
              </span>`
            : ''}
          ${!this.checked && this.indeterminate
            ? html` <span part="indicator" class="indeterminate">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M4.1,12.7 9,17.6 20.3,6.3" />
                </svg>
              </span>`
            : ''}
        </span>
        <span part="label" id="${this.labelId}">
          <slot></slot>
        </span>
      </label>
    `;
  }
}
