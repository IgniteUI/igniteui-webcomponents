import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { DynamicTheme, theme } from '../../theming';

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
export default class IgcBadgeComponent extends LitElement {
  public static readonly tagName = 'igc-badge';
  @theme({
    material: './badge/themes/light/badge.material.scss',
    bootstrap: './badge/themes/light/badge.bootstrap.scss',
    fluent: './badge/themes/light/badge.material.scss',
    indigo: './badge/themes/light/badge.material.scss',
  })
  protected theme!: DynamicTheme;

  /** The type of badge. */
  @property({ reflect: true })
  public variant: 'primary' | 'info' | 'success' | 'warning' | 'danger' =
    'primary';

  /** Sets whether to draw an outlined version of the badge. */
  @property({ type: Boolean, reflect: true })
  public outlined = false;

  /** The shape of the badge. */
  @property({ reflect: true })
  public shape: 'rounded' | 'square' = 'rounded';

  protected override render() {
    return html`
      <span part="base" role="img" aria-label="badge">
        <slot></slot>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-badge': IgcBadgeComponent;
  }
}
