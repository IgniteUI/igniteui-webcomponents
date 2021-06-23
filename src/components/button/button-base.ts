import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { IgcBaseComponent } from '../common/component-base.js';
import { styles } from './button.css';

export abstract class IgcButtonBaseComponent extends IgcBaseComponent {
  static styles = [styles];

  /**
   * Determines whether the button is disabled.
   */
  @property({ type: Boolean })
  disabled = false;

  @property()
  variant: 'flat' | 'raised' | 'outlined' | 'icon' | 'fab' = 'flat';

  protected get classes() {
    const { size, variant } = this;

    return {
      flat: variant === 'flat',
      outlined: variant === 'outlined',
      raised: variant === 'raised',
      icon: variant === 'icon',
      fab: variant === 'fab',
      small: size === 'small',
      medium: size === 'medium',
      large: size === 'large',
    };
  }

  protected renderContent() {
    return html`
      <slot name="prefix"></slot>
      <slot></slot>
      <slot name="suffix"></slot>
    `;
  }
}
