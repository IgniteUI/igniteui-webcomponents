import { LitElement, html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { alternateName } from '../common/decorators/alternateName.js';

/**
 * The `igc-toggle-button` wraps a native button element and exposes additional `value` and `selected` properties.
 *
 * @element igc-toggle-button
 *
 * @slot Renders the label/content of the button.
 *
 * @csspart base - The native button element.
 */
export default class IgcToggleButtonComponent extends LitElement {
  public static readonly tagName = 'igc-toggle-button';

  private _ariaLabel!: string;

  @query('[part="base"]', true)
  private nativeElement!: HTMLElement;

  /**
   * The value attribute of the control.
   * @attr
   */
  @property({ type: String, reflect: true })
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

  /**
   * The aria label of the control.
   * @attr
   */
  @property({ attribute: 'aria-label' })
  public override get ariaLabel() {
    return this._ariaLabel;
  }

  public override set ariaLabel(value: string) {
    const oldVal = this._ariaLabel;
    this._ariaLabel = value;

    if (this.hasAttribute('aria-label')) {
      this.removeAttribute('aria-label');
    }
    this.requestUpdate('ariaLabel', oldVal);
  }

  /** Sets focus on the button. */
  @alternateName('focusComponent')
  public override focus(options?: FocusOptions) {
    this.nativeElement.focus(options);
  }

  /** Removes focus from the button. */
  @alternateName('blurComponent')
  public override blur() {
    this.nativeElement.blur();
  }

  /** Simulates a mouse click on the element. */
  public override click() {
    this.nativeElement.click();
  }

  protected override render() {
    return html`
      <button
        part="base"
        role="button"
        type="button"
        .disabled=${this.disabled}
        aria-label=${ifDefined(this.ariaLabel)}
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
