import { html } from 'lit';
import { property } from 'lit/decorators.js';
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

  /** Sets the variant of the button. */
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

  protected renderContent() {
    return html`
      <span part="prefix">
        <slot name="prefix"></slot>
      </span>
      <slot></slot>
      <span part="suffix">
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
