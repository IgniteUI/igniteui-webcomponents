import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styles } from './badge.material.css';

// @customElement('igc-badge')
export class IgcBadgeComponent extends LitElement {
  static styles = styles;

  @property({ reflect: true })
  variant?: 'primary' | 'info' | 'success' | 'warning' | 'danger' = 'primary';

  @property({ type: Boolean, reflect: true }) outlined = false;

  @property({ reflect: true })
  shape?: 'rounded' | 'square' = 'rounded';

  protected get classes() {
    const { shape, variant } = this;

    return {
      primary: variant === 'primary',
      info: variant === 'info',
      success: variant === 'success',
      warning: variant === 'warning',
      danger: variant === 'danger',
      rounded: shape === 'rounded',
      square: shape === 'square',
      outlined: this.outlined,
    };
  }

  render() {
    return html`
      <span
        part="base"
        class=${classMap(this.classes)}
        role="img"
        aria-label="badge"
      >
        <slot></slot>
      </span>
    `;
  }
}
