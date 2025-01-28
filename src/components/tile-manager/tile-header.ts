import { consume } from '@lit/context';
import { LitElement, html, nothing } from 'lit';
import { themes } from '../../theming/theming-decorator.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import { type TileContext, tileContext } from '../common/context.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcDividerComponent from '../divider/divider.js';
import { all } from './themes/header.js';
import { styles as shared } from './themes/shared/header/tile-header.common.css.js';
import { styles } from './themes/tile-header.base.css.js';

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
@themes(all)
export default class IgcTileHeaderComponent extends LitElement {
  public static readonly tagName = 'igc-tile-header';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcTileHeaderComponent,
      IgcIconButtonComponent,
      IgcDividerComponent
    );
  }

  @consume({ context: tileContext, subscribe: true })
  private _tileContext?: TileContext;

  private get _tile() {
    return this._tileContext?.instance;
  }

  private get _isMaximized() {
    return this._tile ? this._tile.maximized : false;
  }

  private get _isFullscreen() {
    return this._tile ? this._tile.fullscreen : false;
  }

  protected override createRenderRoot() {
    const root = super.createRenderRoot();
    root.addEventListener('slotchange', () => this.requestUpdate());
    return root;
  }

  private handleFullscreen() {
    if (this._tileContext) {
      this._tileContext.setFullscreenState(!this._isFullscreen);
    }
  }

  private handleMaximize() {
    if (!this.emitMaximizedEvent()) {
      return;
    }

    if (this._tile) {
      this._tile.maximized = !this._tile.maximized;
    }
  }

  private emitMaximizedEvent() {
    return this._tile?.emitEvent('igcTileMaximize', {
      detail: { tile: this._tile, state: !this._tile.maximized },
      cancelable: true,
    });
  }

  protected _renderAction({
    icon,
    handler,
  }: {
    icon: string;
    handler: () => unknown;
  }) {
    return html`
      <igc-icon-button
        variant="flat"
        collection="default"
        exportparts="icon"
        name=${icon}
        aria-label=${icon}
        @click=${handler}
      ></igc-icon-button>
    `;
  }

  protected override render() {
    const maximize = {
      icon: this._isMaximized ? 'collapse_content' : 'expand_content',
      handler: this.handleMaximize,
    };
    const fullscreen = {
      icon: this._isFullscreen ? 'fullscreen_exit' : 'fullscreen',
      handler: this.handleFullscreen,
    };

    return html`
      <div part="header">
        <slot part="title" name="title"></slot>
        <section part="actions">
          <slot name="default-actions">
            <slot name="maximize-action">
              ${!this._isFullscreen ? this._renderAction(maximize) : nothing}
            </slot>
            <slot name="fullscreen-action">
              ${this._renderAction(fullscreen)}
            </slot>
          </slot>
          <slot name="actions"></slot>
        </section>
      </div>
      <igc-divider></igc-divider>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tile-header': IgcTileHeaderComponent;
  }
}
