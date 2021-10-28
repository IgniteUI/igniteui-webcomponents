import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styles } from './card.header.material.css';

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
@customElement('igc-card-header')
export default class IgcCardHeader extends LitElement {
  /** @private */
  public static styles = styles;

  protected render() {
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
    'igc-card-header': IgcCardHeader;
  }
}
