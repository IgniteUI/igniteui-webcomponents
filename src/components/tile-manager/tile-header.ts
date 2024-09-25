import { LitElement, html } from 'lit';
import { registerComponent } from '../common/definitions/register.js';

export default class IgcTileHeaderComponent extends LitElement {
  public static readonly tagName = 'igc-tile-header';

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcTileHeaderComponent);
  }

  protected override render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tile-header': IgcTileHeaderComponent;
  }
}
