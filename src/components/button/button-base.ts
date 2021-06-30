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
  variant: 'flat' | 'raised' | 'outlined' | 'fab' = 'flat';

  protected get classes() {
    const { size, variant } = this;

    return {
      flat: variant === 'flat',
      outlined: variant === 'outlined',
      raised: variant === 'raised',
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
        <span>
          <slot></slot>
          <span part="suffix">
            <slot name="suffix"></slot>
          </span> </span
      ></span>
    `;
  }
}
