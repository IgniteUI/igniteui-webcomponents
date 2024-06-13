import { type TemplateResult, html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';

import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';
import { createCounter, partNameMap } from '../common/util.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import { IgcCheckboxBaseComponent } from './checkbox-base.js';
import { all } from './themes/checkbox-themes.js';
import { styles } from './themes/checkbox.base.css.js';
import { styles as shared } from './themes/shared/checkbox/checkbox.common.css.js';

/**
 * A check box allowing single values to be selected/deselected.
 *
 * @element igc-checkbox
 *
 * @slot - The checkbox label.
 * @slot helper-text - Renders content below the input.
 * @slot value-missing - Renders content when the required validation fails.
 * @slot custom-error - Renders content when setCustomValidity(message) is set.
 * @slot invalid - Renders content when the component is in invalid state (validity.valid = false).
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
@themes(all)
export default class IgcCheckboxComponent extends IgcCheckboxBaseComponent {
  public static readonly tagName = 'igc-checkbox';
  protected static styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcCheckboxComponent, IgcValidationContainerComponent);
  }

  private static readonly increment = createCounter();
  private inputId = `checkbox-${IgcCheckboxComponent.increment()}`;
  private labelId = `checkbox-label-${this.inputId}`;

  /**
   * Draws the checkbox in indeterminate state.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public indeterminate = false;

  protected override handleClick() {
    this.indeterminate = false;
    super.handleClick();
  }

  protected renderValidatorContainer(): TemplateResult {
    return IgcValidationContainerComponent.create(this);
  }

  protected override render() {
    const labelledBy = this.getAttribute('aria-labelledby');
    const checked = this.checked;

    return html`
      <label
        part=${partNameMap({
          base: true,
          checked,
          focused: this._kbFocus.focused,
        })}
        for=${this.inputId}
        @pointerdown=${this._kbFocus.reset}
      >
        <input
          id=${this.inputId}
          type="checkbox"
          name=${ifDefined(this.name)}
          value=${ifDefined(this.value)}
          .required=${this.required}
          .disabled=${this.disabled}
          .checked=${live(checked)}
          .indeterminate=${live(this.indeterminate)}
          aria-checked=${this.indeterminate && !checked ? 'mixed' : checked}
          aria-disabled=${this.disabled ? 'true' : 'false'}
          aria-labelledby=${labelledBy ? labelledBy : this.labelId}
          @click=${this.handleClick}
          @blur=${this.handleBlur}
          @focus=${this.handleFocus}
        />
        <span part=${partNameMap({ control: true, checked })}>
          <span part=${partNameMap({ indicator: true, checked })}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M4.1,12.7 9,17.6 20.3,6.3" />
            </svg>
          </span>
        </span>
        <span
          .hidden=${this.hideLabel}
          part=${partNameMap({ label: true, checked })}
          id=${this.labelId}
        >
          <slot></slot>
        </span>
      </label>
      <!-- @simeonoff: You should take a look at the layout here -->
      ${this.renderValidatorContainer()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-checkbox': IgcCheckboxComponent;
  }
}
