import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { IgcBaseComponent } from '../common/component-base.js';

export abstract class IgcButtonBaseComponent extends IgcBaseComponent {
  /**
   * Determines whether the button is disabled.
   */
  @property({ type: Boolean })
  disabled = false;

  @property()
  variant: 'flat' | 'raised' | 'outlined' | 'icon' | 'fab' = 'flat';

  protected get classes() {
    const { size, variant, disabled } = this;

    return {
      'igc-button': true,
      'igc-button--flat': variant === 'flat',
      'igc-button--outlined': variant === 'outlined',
      'igc-button--raised': variant === 'raised',
      'igc-button--icon': variant === 'icon',
      'igc-button--fab': variant === 'fab',
      'igc-button--disabled': disabled,
      'igc-button--small': size === 'small',
      'igc-button--medium': size === 'medium',
      'igc-button--large': size === 'large',
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
