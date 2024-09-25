import { LitElement, css, html } from 'lit';

import { registerComponent } from '../common/definitions/register.js';
import { styles } from './themes/tile.base.css.js';

/**
 * The tile component is used within the `igc-tile-manager` as a container
 * for displaying various types of information.
 *
 * @element igc-tile
 */
export default class IgcTileComponent extends LitElement {
  public static readonly tagName = 'igc-tile';
  public static override styles = [styles];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcTileComponent);
  }

  protected override render() {
    return html`
      <div part="base">
        <slot name="header"></slot>
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tile': IgcTileComponent;
  }
}
