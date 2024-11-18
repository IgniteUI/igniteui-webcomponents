import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import IgcIconButtonComponent from '../button/icon-button.js';
import { tileContext } from '../common/context.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles as shared } from './themes/shared/header/tile-header.common.css.js';
import { styles } from './themes/tile-header.base.css.js';
import type IgcTileComponent from './tile.js';

/** A container for tile's header
 * @element igc-tile-header
 *
 * @slot title - Renders the tile title
 * @slot actions - Renders the tile actions
 *
 * @csspart header - The tile header container
 * @csspart title - The tile title container
 * @csspart actions - The tile actions container
 */
export default class IgcTileHeaderComponent extends LitElement {
  public static readonly tagName = 'igc-tile-header';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcTileHeaderComponent, IgcIconButtonComponent);
  }

  @consume({ context: tileContext, subscribe: true })
  private _tile?: IgcTileComponent;

  private handleMaximize() {
    if (this._tile) {
      this._tile.toggleMaximize();
    }
  }

  protected override render() {
    return html`
      <div part="header">
        <slot part="title" name="title"></slot>
        <section part="actions">
          <igc-icon-button
            variant="flat"
            collection="default"
            exportparts="icon"
            name=${this._tile?.maximized
              ? 'collapse_content'
              : 'expand_content'}
            @click=${this.handleMaximize}
          ></igc-icon-button>
          <igc-icon-button
            variant="flat"
            collection="default"
            exportparts="icon"
            name="fullscreen"
          ></igc-icon-button>
          <slot name="actions"></slot>
        </section>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tile-header': IgcTileHeaderComponent;
  }
}
