import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';

import { getThemeController, themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';
import { createCounter, partNameMap } from '../common/util.js';
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
 *
 * @fires igcChange - Emitted when the control's checked state changes.
 *
 * @csspart base - The base wrapper of the checkbox.
 * @csspart control - The checkbox input element.
 * @csspart label - The checkbox label.
 * @csspart indicator - The checkbox indicator icon.
 */
@themes(all, { exposeController: true })
export default class IgcCheckboxComponent extends IgcCheckboxBaseComponent {
  public static readonly tagName = 'igc-checkbox';
  protected static styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcCheckboxComponent);
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

  protected get _isIndigo(): boolean {
    return getThemeController(this)?.theme === 'indigo';
  }

  protected override handleClick() {
    this.indeterminate = false;
    super.handleClick();
  }

  protected renderStandard() {
    return html`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M4.1,12.7 9,17.6 20.3,6.3" />
      </svg>
    `;
  }

  protected renderIndigo() {
    return html`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <rect width="18" height="4" x="3" y="10" rx="1.85" />
        <path
          d="M19.033 5a1.966 1.966 0 0 0-1.418.586l-8.479 8.577-2.753-2.77a1.971 1.971 0 0 0-2.8 0 1.998 1.998 0 0 0 0 2.822l4.155 4.196a1.955 1.955 0 0 0 2.8 0l9.879-9.99a1.998 1.998 0 0 0 0-2.821 1.966 1.966 0 0 0-1.384-.6Z"
        />
      </svg>
    `;
  }

  protected override render() {
    const labelledBy = this.getAttribute('aria-labelledby');

    return html`
      <label
        part=${partNameMap({
          base: true,
          checked: this.checked,
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
          .checked=${live(this.checked)}
          .indeterminate=${live(this.indeterminate)}
          aria-checked=${this.indeterminate && !this.checked
            ? 'mixed'
            : this.checked}
          aria-disabled=${this.disabled ? 'true' : 'false'}
          aria-labelledby=${labelledBy ? labelledBy : this.labelId}
          @click=${this.handleClick}
          @blur=${this.handleBlur}
          @focus=${this.handleFocus}
        />
        <span part=${partNameMap({ control: true, checked: this.checked })}>
          <span part=${partNameMap({ indicator: true, checked: this.checked })}>
            ${this._isIndigo ? this.renderIndigo() : this.renderStandard()}
          </span>
        </span>
        <span
          .hidden=${this.hideLabel}
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
