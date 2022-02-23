import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { themes } from '../../theming';
import { watch } from '../common/decorators/watch.js';
import { partNameMap } from '../common/util.js';
import { IgcCheckboxBaseComponent } from './checkbox-base.js';

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
@themes({
  material: './checkbox/themes/light/checkbox.material.scss',
  bootstrap: './checkbox/themes/light/checkbox.bootstrap.scss',
  fluent: './checkbox/themes/light/checkbox.fluent.scss',
  indigo: './checkbox/themes/light/checkbox.indigo.scss',
})
export default class IgcCheckboxComponent extends IgcCheckboxBaseComponent {
  public static readonly tagName = 'igc-checkbox';

  private inputId = `checkbox-${nextId++}`;
  private labelId = `checkbox-label-${this.inputId}`;

  /** Draws the checkbox in indeterminate state. */
  @property({ type: Boolean, reflect: true })
  public indeterminate = false;

  protected handleClick() {
    this.checked = !this.checked;
    this.indeterminate = false;
    this.emitEvent('igcChange', { detail: this.checked });
  }

  @watch('checked', { waitUntilFirstUpdate: true })
  @watch('indeterminate', { waitUntilFirstUpdate: true })
  protected handleChange() {
    this.invalid = !this.input.checkValidity();
  }

  protected override render() {
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
          .indeterminate=${live(this.indeterminate)}
          aria-checked=${this.indeterminate && !this.checked
            ? 'mixed'
            : this.checked}
          aria-disabled=${this.disabled ? 'true' : 'false'}
          aria-labelledby=${this.ariaLabelledby
            ? this.ariaLabelledby
            : this.labelId}
          @click=${this.handleClick}
          @blur=${this.handleBlur}
          @focus=${this.handleFocus}
        />
        <span part=${partNameMap({ control: true, checked: this.checked })}>
          <span part=${partNameMap({ indicator: true, checked: this.checked })}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M4.1,12.7 9,17.6 20.3,6.3" />
            </svg>
          </span>
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
    'igc-checkbox': IgcCheckboxComponent;
  }
}
