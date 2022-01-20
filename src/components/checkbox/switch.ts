import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { watch } from '../common/decorators/watch.js';
import { styles } from './switch.material.css';
import { IgcCheckboxBaseComponent } from './checkbox-base.js';
import { partNameMap } from '../common/util.js';

let nextId = 0;

/**
 * Similar to a checkbox, a switch controls the state of a single setting on or off.
 *
 * @element igc-switch
 *
 * @slot - The switch label.
 *
 * @fires igcChange - Emitted when the control's checked state changes.
 * @fires igcFocus - Emitted when the control gains focus.
 * @fires igcBlur - Emitted when the control loses focus.
 *
 * @csspart base - The base wrapper of the switch.
 * @csspart control - The switch control.
 * @csspart thumb - The position indicator of the switch.
 * @csspart label - The switch label.
 */
export default class IgcSwitchComponent extends IgcCheckboxBaseComponent {
  /** @private */
  public static tagName = 'igc-switch';

  /** @private */
  public static styles = styles;

  private inputId = `switch-${nextId++}`;
  private labelId = `switch-label-${this.inputId}`;

  private handleClick() {
    this.checked = !this.checked;
    this.emitEvent('igcChange', { detail: this.checked });
  }

  @watch('checked', { waitUntilFirstUpdate: true })
  protected handleChange() {
    this.invalid = !this.input.checkValidity();
  }

  protected render() {
    return html`
      <label
        part=${partNameMap({ base: true, checked: this.checked })}
        for=${this.inputId}
        @mousedown=${this.handleMouseDown}
      >
        <input
          id=${this.inputId}
          type="checkbox"
          name=${ifDefined(this.name)}
          value=${ifDefined(this.value)}
          .required=${this.required}
          .disabled=${this.disabled}
          .checked=${live(this.checked)}
          aria-checked=${this.checked ? 'true' : 'false'}
          aria-disabled=${this.disabled ? 'true' : 'false'}
          aria-labelledby=${this.ariaLabelledby
            ? this.ariaLabelledby
            : this.labelId}
          @click=${this.handleClick}
          @blur=${this.handleBlur}
          @focus=${this.handleFocus}
        />
        <span part=${partNameMap({ control: true, checked: this.checked })}>
          <span
            part=${partNameMap({ thumb: true, checked: this.checked })}
          ></span>
        </span>
        <span
          part=${partNameMap({ label: true, checked: this.checked })}
          id=${this.labelId}
        >
          <slot></slot>
        </span>
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-switch': IgcSwitchComponent;
  }
}
