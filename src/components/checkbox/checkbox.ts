import { html, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { registerComponent } from '../common/definitions/register.js';
import { partMap } from '../common/part-map.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import { IgcCheckboxBaseComponent } from './checkbox-base.js';
import { styles } from './themes/checkbox.base.css.js';
import { all } from './themes/checkbox-themes.js';
import { styles as shared } from './themes/shared/checkbox/checkbox.common.css.js';

let nextId = 1;

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
 *
 * @csspart base - The base wrapper of the checkbox.
 * @csspart control - The checkbox input element.
 * @csspart label - The checkbox label.
 * @csspart indicator - The checkbox indicator icon.
 */
export default class IgcCheckboxComponent extends IgcCheckboxBaseComponent {
  public static readonly tagName = 'igc-checkbox';
  protected static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcCheckboxComponent, IgcValidationContainerComponent);
  }

  private readonly _themes = addThemingController(this, all);

  private readonly _inputId = `checkbox-${nextId++}`;
  private readonly _labelId = `checkbox-label-${this._inputId}`;

  /**
   * Draws the checkbox in indeterminate state.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public indeterminate = false;

  protected override _handleClick(event: PointerEvent): void {
    this.indeterminate = false;
    super._handleClick(event);
  }

  protected _renderValidatorContainer(): TemplateResult {
    return IgcValidationContainerComponent.create(this);
  }

  protected _renderStandard() {
    return html`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M4.1,12.7 9,17.6 20.3,6.3" />
      </svg>
    `;
  }

  protected _renderIndigo() {
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
    const describedBy = this._slots.hasAssignedElements('helper-text')
      ? 'helper-text'
      : nothing;
    const checked = this.checked;

    return html`
      <label
        part=${partMap({
          base: true,
          checked,
          focused: this._focusRingManager.focused,
        })}
        for=${this._inputId}
      >
        <input
          id=${this._inputId}
          type="checkbox"
          name=${ifDefined(this.name)}
          value=${ifDefined(this.value)}
          ?required=${this.required}
          ?disabled=${this.disabled}
          .checked=${live(checked)}
          .indeterminate=${live(this.indeterminate)}
          aria-labelledby=${labelledBy ? labelledBy : this._labelId}
          aria-describedby=${describedBy}
          @click=${this._handleClick}
          @focus=${this._handleFocus}
        />
        <span part=${partMap({ control: true, checked })}>
          <span part=${partMap({ indicator: true, checked })}>
            ${this._themes.theme === 'indigo'
              ? this._renderIndigo()
              : this._renderStandard()}
          </span>
        </span>
        <span
          id=${this._labelId}
          part=${partMap({ label: true, checked })}
          ?hidden=${this._hideLabel}
          ><slot></slot>
        </span>
      </label>
      ${this._renderValidatorContainer()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-checkbox': IgcCheckboxComponent;
  }
}
