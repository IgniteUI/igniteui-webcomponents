import { LitElement, html } from 'lit';
import { registerComponent } from '../common/definitions/register.js';
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
  public static override styles = [styles];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcTileHeaderComponent);
  }

  // Should we include thumbnail as well?
  protected override render() {
    return html`
      <section>
        <header part="header">
          <slot part="title" name="title"></slot>
          <slot part="subtitle" name="subtitle"></slot>
          <slot part="actions" name="actions"></slot>
        </header>
        <slot></slot>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tile-header': IgcTileHeaderComponent;
  }
}
