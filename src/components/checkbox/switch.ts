import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { watch } from '../common/decorators/watch.js';
import { styles } from './switch.material.css';
import { IgcCheckboxBaseComponent } from './checkbox-base.js';

let nextId = 0;

// @customElement('igc-switch')
export class IgcSwitchComponent extends IgcCheckboxBaseComponent {
  static styles = styles;

  private inputId = `switch-${nextId++}`;
  private labelId = `switch-label-${this.inputId}`;

  handleClick() {
    this.checked = !this.checked;
  }

  @watch('checked', { waitUntilFirstUpdate: true })
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
          <span part="thumb"></span>
        </span>
        <span part="label" id="${this.labelId}">
          <slot></slot>
        </span>
      </label>
    `;
  }
}
