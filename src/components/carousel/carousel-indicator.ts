import { LitElement, html } from 'lit';
import { registerComponent } from '../common/definitions/register.js';

export default class IgcCarouselIndicatorComponent extends LitElement {
  public static readonly tagName = 'igc-carousel-indicator';

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
