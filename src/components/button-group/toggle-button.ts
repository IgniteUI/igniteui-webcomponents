import { LitElement, html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { themes } from '../../theming/theming-decorator.js';
import { styles } from '../button-group/themes/light/toggle-button/toggle-button.base.css.js';
import { styles as bootstrap } from '../button-group/themes/light/toggle-button/toggle-button.bootstrap.css.js';
import { styles as fluent } from '../button-group/themes/light/toggle-button/toggle-button.fluent.css.js';
import { styles as indigo } from '../button-group/themes/light/toggle-button/toggle-button.indigo.css.js';
import { styles as material } from '../button-group/themes/light/toggle-button/toggle-button.material.css.js';
import { alternateName } from '../common/decorators/alternateName.js';
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
@themes({
  light: { bootstrap, material, fluent, indigo },
  dark: { bootstrap, material, fluent, indigo },
})
export default class IgcToggleButtonComponent extends LitElement {
  public static override styles = styles;

  public static readonly tagName = 'igc-toggle-button';

  public static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  public static register() {
    registerComponent(this);
  }

  @query('[part="toggle"]', true)
  private nativeElement!: HTMLElement;

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
        part="toggle"
        type="button"
        .disabled=${this.disabled}
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
