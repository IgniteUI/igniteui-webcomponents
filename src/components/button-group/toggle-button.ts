import { LitElement, html } from 'lit';
import { property, query } from 'lit/decorators.js';

import { addThemingController } from '../../theming/theming-controller.js';
import { addKeyboardFocusRing } from '../common/controllers/focus-ring.js';
import { registerComponent } from '../common/definitions/register.js';
import { partMap } from '../common/part-map.js';
import { styles } from './themes/button.base.css.js';
import { all } from './themes/button.js';
import { styles as shared } from './themes/shared/button/button.common.css.js';

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
export default class IgcToggleButtonComponent extends LitElement {
  public static override styles = [styles, shared];
  public static readonly tagName = 'igc-toggle-button';

  public static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcToggleButtonComponent);
  }

  private readonly _focusRingManager = addKeyboardFocusRing(this);

  @query('[part="toggle"]', true)
  private readonly _nativeButton!: HTMLButtonElement;

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

  constructor() {
    super();
    addThemingController(this, all);
  }

  /* alternateName: focusComponent */
  /** Sets focus on the button. */
  public override focus(options?: FocusOptions): void {
    this._nativeButton.focus(options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the button. */
  public override blur(): void {
    this._nativeButton.blur();
  }

  /** Simulates a mouse click on the element. */
  public override click(): void {
    this._nativeButton.click();
  }

  protected override render() {
    return html`
      <button
        part=${partMap({
          toggle: true,
          focused: this._focusRingManager.focused,
        })}
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
