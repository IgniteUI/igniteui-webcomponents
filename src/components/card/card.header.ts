import { html, LitElement } from 'lit';
import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles as bootstrap } from './themes/light/card.header.bootstrap.css.js';
import { styles as fluent } from './themes/light/card.header.fluent.css.js';
import { styles as indigo } from './themes/light/card.header.indigo.css.js';
import { styles } from './themes/light/card.header.material.css.js';

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
  fluent,
  indigo,
})
export default class IgcCardHeaderComponent extends LitElement {
  public static readonly tagName = 'igc-card-header';
  public static override styles = styles;

  public static register() {
    registerComponent(this);
  }

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
