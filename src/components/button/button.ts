import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { IgcButtonBaseComponent } from './button-base.js';
import { styles } from './button.material.css';

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
export default class IgcButtonComponent extends IgcButtonBaseComponent {
  public static readonly tagName = 'igc-button';

  public static styles = [styles];

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
