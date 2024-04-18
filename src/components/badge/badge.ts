import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';

import { themes } from '../../theming/theming-decorator.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles } from './themes/badge.base.css.js';
import { styles as shared } from './themes/shared/badge.common.css.js';
import { all } from './themes/themes.js';

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
@themes(all)
export default class IgcBadgeComponent extends LitElement {
  public static readonly tagName = 'igc-badge';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcBadgeComponent);
  }

  private __internals: ElementInternals;

  /**
   * The type of badge.
   * @attr
   */
  @property({ reflect: true })
  public variant: 'primary' | 'info' | 'success' | 'warning' | 'danger' =
    'primary';

  /**
   * Sets whether to draw an outlined version of the badge.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public outlined = false;

  /**
   * The shape of the badge.
   * @attr
   */
  @property({ reflect: true })
  public shape: 'rounded' | 'square' = 'rounded';

  constructor() {
    super();
    this.__internals = this.attachInternals();
    this.__internals.role = 'status';
  }

  @watch('variant')
  protected variantChange() {
    this.__internals.ariaRoleDescription = `badge ${this.variant}`;
  }

  protected override render() {
    return html`
      <span part="base">
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
