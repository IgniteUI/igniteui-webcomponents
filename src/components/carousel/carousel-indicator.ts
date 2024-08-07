import { LitElement, html } from 'lit';
import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles } from './themes/carousel-indicator.base.css.js';
import { all } from './themes/indicator.js';
import { styles as shared } from './themes/shared/indicator/indicator.common.css.js';

/**
 * Used when a custom indicator needs to be passed to the `igc-carousel` component.
 *
 * @element igc-carousel-indicator
 *
 * @slot - Default slot for projected inactive indicator.
 * @slot active - Default slot for projected active indicator.
 *
 */
@themes(all)
export default class IgcCarouselIndicatorComponent extends LitElement {
  public static readonly tagName = 'igc-carousel-indicator';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcCarouselIndicatorComponent);
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.slot = this.slot.length > 0 ? this.slot : 'indicator';
  }

  protected override render() {
    return html`
      <div part="indicator inactive">
        <slot></slot>
      </div>
      <div part="indicator active">
        <slot name="active"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-carousel-indicator': IgcCarouselIndicatorComponent;
  }
}
