import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';

import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';
import { partMap } from '../common/part-map.js';
import { createCounter } from '../common/util.js';
import { IgcCheckboxBaseComponent } from './checkbox-base.js';
import { styles as shared } from './themes/shared/switch/switch.common.css.js';
import { all } from './themes/switch-themes.js';
import { styles } from './themes/switch.base.css.js';

/**
 * Similar to a checkbox, a switch controls the state of a single setting on or off.
 *
 * @element igc-switch
 *
 * @slot - The switch label.
 *
 * @fires igcChange - Emitted when the control's checked state changes.
 *
 * @csspart base - The base wrapper of the switch.
 * @csspart control - The switch input element.
 * @csspart thumb - The position indicator of the switch.
 * @csspart label - The switch label.
 */
@themes(all)
export default class IgcSwitchComponent extends IgcCheckboxBaseComponent {
  public static readonly tagName = 'igc-switch';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcSwitchComponent);
  }

  private static readonly increment = createCounter();

  private inputId = `switch-${IgcSwitchComponent.increment()}`;
  private labelId = `switch-label-${this.inputId}`;

  protected override render() {
    const labelledBy = this.getAttribute('aria-labelledby');
    const checked = this.checked;

    return html`
      <label
        part=${partMap({ base: true, checked })}
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
          aria-checked=${checked ? 'true' : 'false'}
          aria-disabled=${this.disabled ? 'true' : 'false'}
          aria-labelledby=${labelledBy ? labelledBy : this.labelId}
          @click=${this.handleClick}
          @blur=${this.handleBlur}
          @focus=${this.handleFocus}
        />
        <span
          part=${partMap({
            control: true,
            checked,
            focused: this._kbFocus.focused,
          })}
        >
          <span part=${partMap({ thumb: true, checked })}></span>
        </span>
        <span
          .hidden=${this.hideLabel}
          part=${partMap({ label: true, checked })}
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
