import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styles } from './badge.material.css';

/**
 * The badge is a component indicating a status on a related item or an area
 * where some active indication is required.
 *
 * @element igc-badge
 *
 * @slot - Default slot for the badge.
 *
 * @csspart base - The base wrapper of the badge.
 */
export class IgcBadgeComponent extends LitElement {
  static styles = styles;

  /** The type of badge. */
  @property({ reflect: true })
  variant?: 'primary' | 'info' | 'success' | 'warning' | 'danger' = 'primary';

  /** Sets whether to draw an outlined version of the badge. */
  @property({ type: Boolean, reflect: true }) outlined = false;

  /** The shape of the badge. */
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
