import { LitElement, html } from 'lit';
import { property, query } from 'lit/decorators.js';

import { styles } from './themes/button.base.css.js';
import { all } from './themes/button.js';
import { styles as shared } from './themes/shared/button/button.common.css.js';
import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';

/**
 * The `igc-toggle-button` wraps a native button element and exposes additional `value` and `selected` properties.
 * It is used in the context of an `igc-button-group` to facilitate the creation of group/toolbar like UX behaviors.
 *
 * @element igc-toggle-button
 *
 * @slot Renders the label/content of the button.
 *
 * @csspart toggle - The native button element.
 */
@themes(all, true)
export default class IgcToggleButtonComponent extends LitElement {
  public static override styles = [styles, shared];
  public static readonly tagName = 'igc-toggle-button';

  public static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  public static register() {
    registerComponent(this);
  }

  @query('[part="toggle"]', true)
  private _nativeButton!: HTMLButtonElement;

  /**
   * The value attribute of the control.
   * @attr
   */
  @property()
  public value!: string;

  /**
   * Determines whether the button is selected.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public selected = false;

  /**
   * Determines whether the button is disabled.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /* alternateName: focusComponent */
  /** Sets focus on the button. */
  public override focus(options?: FocusOptions) {
    this._nativeButton.focus(options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the button. */
  public override blur() {
    this._nativeButton.blur();
  }

  /** Simulates a mouse click on the element. */
  public override click() {
    this._nativeButton.click();
  }

  protected override render() {
    return html`
      <button
        part="toggle"
        type="button"
        ?disabled=${this.disabled}
        .ariaLabel=${this.ariaLabel}
        aria-pressed=${this.selected}
        aria-disabled=${this.disabled}
      >
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-toggle-button': IgcToggleButtonComponent;
  }
}
