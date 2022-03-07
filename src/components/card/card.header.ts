import { html, LitElement } from 'lit';
import { themes } from '../../theming';
import { styles as bootstrap } from './themes/light/card.header.bootstrap.css';
import { styles as indigo } from './themes/light/card.header.indigo.css';
import { styles } from './themes/light/card.header.material.css';

/** A container for card's header
 * @element igc-card-header
 *
 * @slot thumbnail - Renders header media like icon
 * @slot title - Renders the card title
 * @slot subtitle - Renders the card subtitle
 * @slot - Renders content next to the card title
 *
 * @csspart header - The card header container
 */
@themes({
  bootstrap,
  indigo,
})
export default class IgcCardHeaderComponent extends LitElement {
  public static readonly tagName = 'igc-card-header';
  public static override styles = styles;

  protected override render() {
    return html`
      <section>
        <slot name="thumbnail"></slot>
      </section>
      <section>
        <header part="header">
          <slot part="title" name="title"></slot>
          <slot part="subtitle" name="subtitle"></slot>
        </header>
        <slot></slot>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-card-header': IgcCardHeaderComponent;
  }
}
