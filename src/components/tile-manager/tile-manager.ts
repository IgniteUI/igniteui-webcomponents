import { LitElement, html } from 'lit';

import { registerComponent } from '../common/definitions/register.js';
import { styles } from './themes/tile-manager.base.css.js';
import IgcTileHeaderComponent from './tile-header.js';
import IgcTileComponent from './tile.js';

/**
 * The tile manager component enables the dynamic arrangement, resizing, and interaction of tiles.
 *
 * @element igc-tile-manager
 */
export default class IgcTileManagerComponent extends LitElement {
  public static readonly tagName = 'igc-tile-manager';
  public static override styles = [styles];

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcTileManagerComponent,
      IgcTileComponent,
      IgcTileHeaderComponent
    );
  }

  protected override render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tile-manager': IgcTileManagerComponent;
  }
}
