import { html } from 'lit';
import { registerComponent } from '#internals/definitions/register.js';
import { partMap } from '#internals/part-map.js';
import { renderToggleShell } from '#internals/templates/toggle-shell.js';
import { createIdGenerator } from '#internals/utils/strings.js';
import { addThemingController } from '#theming/theming-controller.js';
import { IgcCheckboxBaseComponent } from './checkbox-base.js';
import { styles as shared } from './themes/shared/switch/switch.common.css.js';
import { all } from './themes/switch-themes.js';
import { styles } from './themes/switch.base.css.js';

const nextId = createIdGenerator('switch');

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
export default class IgcSwitchComponent extends IgcCheckboxBaseComponent {
  public static readonly tagName = 'igc-switch';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcSwitchComponent);
  }

  private readonly _inputId = nextId();
  private readonly _labelId = `switch-label-${this._inputId}`;

  constructor() {
    super();
    addThemingController(this, all);
  }

  protected override render() {
    const checked = this.checked;

    return renderToggleShell(this, {
      type: 'checkbox',
      inputId: this._inputId,
      labelId: this._labelId,
      baseParts: { base: true, checked },
      controlParts: {
        control: true,
        checked,
        focused: this._focusRingManager.focused,
      },
      labelParts: { label: true, checked },
      renderControl: () =>
        html`<span part=${partMap({ thumb: true, checked })}></span>`,
      hideLabel: this._hideLabel,
      onClick: this._handleClick,
      onKeyDown: this._handleEnterKeydown,
      onBlur: this._handleBlur,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-switch': IgcSwitchComponent;
  }
}
