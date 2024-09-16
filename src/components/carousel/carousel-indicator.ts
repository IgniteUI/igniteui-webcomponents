import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles } from './themes/carousel-indicator.base.css.js';

/**
 * Used when a custom indicator needs to be passed to the `igc-carousel` component.
 *
 * @element igc-carousel-indicator
 *
 * @slot - Default slot for projected inactive indicator.
 * @slot active - Default slot for projected active indicator.
 *
 * @csspart indicator - The wrapping container of the carousel dot indicator.
 * @csspart inactive - The wrapping container of the inactive dot indicator.
 * @csspart active - The wrapping container of the active dot indicator.
 */
export default class IgcCarouselIndicatorComponent extends LitElement {
  public static readonly tagName = 'igc-carousel-indicator';
  public static override styles = styles;

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcCarouselIndicatorComponent);
  }

  /** @private @hidden @internal */
  @property()
  public active = false;

  public override connectedCallback() {
    super.connectedCallback();
    this.slot = this.slot.length > 0 ? this.slot : 'indicator';
  }

  protected override render() {
    const forward = this.active ? 'visible' : 'hidden';
    const backward = this.active ? 'hidden' : 'visible';

    return html`
      <div
        part="indicator inactive"
        style=${styleMap({ visibility: backward })}
      >
        <slot></slot>
      </div>
      <div part="indicator active" style=${styleMap({ visibility: forward })}>
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
