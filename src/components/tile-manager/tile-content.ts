import { LitElement, html } from 'lit';
import { registerComponent } from '../common/definitions/register.js';
import { styles } from './themes/tile-content.base.css.js';

/** A container for tile's text content
 * @element igc-tile-content
 *
 * @slot - Renders the tile text content
 */
export default class IgcTileContentComponent extends LitElement {
  public static readonly tagName = 'igc-tile-content';
  public static override styles = [styles];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcTileContentComponent);
  }

  protected override render() {
    return html`
      <div part="content">
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tile-content': IgcTileContentComponent;
  }
}
