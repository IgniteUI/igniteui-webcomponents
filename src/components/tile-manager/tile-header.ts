import { LitElement, html } from 'lit';
import IgcIconButtonComponent from '../button/icon-button.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles as shared } from './themes/shared/header/tile-header.common.css.js';
import { styles } from './themes/tile-header.base.css.js';

/** A container for card's header
 * @element igc-card-header
 *
 * @slot title - Renders the tile title
 * @slot subtitle - Renders the tile subtitle
 * @slot actions - Renders the tile actions
 * @slot - Renders content next to the tile title
 *
 * @csspart header - The tile header container
 */
export default class IgcTileHeaderComponent extends LitElement {
  public static readonly tagName = 'igc-tile-header';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcTileHeaderComponent, IgcIconButtonComponent);
  }

  protected override render() {
    return html`
      <div part="header">
        <slot part="title" name="title"></slot>
        <span part="actions">
          <igc-icon-button
            variant="flat"
            collection="default"
            exportparts="icon"
            name="expand_content"
          ></igc-icon-button>
        </span>
        <span part="actions">
          <igc-icon-button
            variant="flat"
            collection="default"
            exportparts="icon"
            name="fullscreen"
          ></igc-icon-button>
        </span>
        <span part="actions">
          <slot name="actions"></slot>
        </span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tile-header': IgcTileHeaderComponent;
  }
}
