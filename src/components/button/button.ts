import { html } from 'lit';
import { property, queryAssignedNodes, state } from 'lit/decorators.js';
import { themes } from '../../theming/theming-decorator.js';
import { IgcButtonBaseComponent } from './button-base.js';
import { styles } from './themes/button/light/button.base.css.js';
import { styles as bootstrap } from './themes/button/light/button.bootstrap.css.js';
import { styles as fluent } from './themes/button/light/button.fluent.css.js';
import { styles as indigo } from './themes/button/light/button.indigo.css.js';
import { styles as material } from './themes/button/light/button.material.css.js';

/**
 * Represents a clickable button, used to submit forms or anywhere in a
 * document for accessible, standard button functionality.
 *
 * @element igc-button
 *
 * @slot - Renders the label of the button.
 * @slot prefix - Renders content before the label of the button.
 * @slot suffix - Renders content after the label of the button.
 *
 * @fires igcFocus - Emitted when the button gains focus.
 * @fires igcBlur - Emitted when the button loses focus.
 *
 * @csspart base - The native button element.
 * @csspart prefix - The prefix container.
 * @csspart suffix - The suffix container.
 */
@themes({ bootstrap, indigo, fluent, material })
export default class IgcButtonComponent extends IgcButtonBaseComponent {
  public static readonly tagName = 'igc-button';

  protected static styles = styles;

  @queryAssignedNodes({ slot: 'prefix' })
  protected prefixes!: Array<HTMLElement>;

  @queryAssignedNodes({ slot: 'suffix' })
  protected suffixes!: Array<HTMLElement>;

  @state()
  protected hasPrefixes = false;

  @state()
  protected hasSuffixes = false;

  /**
   * Sets the variant of the button.
   * @attr
   */
  @property({ reflect: true })
  public variant: 'flat' | 'contained' | 'outlined' | 'fab' = 'contained';

  constructor() {
    super();
    this.size = 'medium';
  }

  protected override get classes() {
    const { size, variant } = this;

    return {
      flat: variant === 'flat',
      outlined: variant === 'outlined',
      contained: variant === 'contained',
      fab: variant === 'fab',
      small: size === 'small',
      medium: size === 'medium',
      large: size === 'large',
      disabled: this.disabled,
    };
  }

  public override connectedCallback() {
    super.connectedCallback();

    this.shadowRoot?.addEventListener('slotchange', () => {
      this.hasPrefixes = this.prefixes.length > 0;
      this.hasSuffixes = this.suffixes.length > 0;
    });
  }

  protected renderContent() {
    return html`
      <span part="prefix" ?hidden=${!this.hasPrefixes}>
        <slot name="prefix"></slot>
      </span>
      <slot></slot>
      <span part="suffix" ?hidden=${!this.hasSuffixes}>
        <slot name="suffix"></slot>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-button': IgcButtonComponent;
  }
}
