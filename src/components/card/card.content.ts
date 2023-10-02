import { html, LitElement } from 'lit';
import { themes } from '../../theming/theming-decorator.js';
import { styles as bootstrap } from './themes/light/card.content.bootstrap.css.js';
import { styles } from './themes/light/card.content.material.css.js';

/** A container for card's text content
 * @element igc-card-content
 *
 * @slot - Renders the card text content
 */
@themes({ light: { bootstrap }, dark: { bootstrap } })
export default class IgcCardContentComponent extends LitElement {
  public static readonly tagName = 'igc-card-content';
  public static override styles = styles;

  protected override render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-card-content': IgcCardContentComponent;
  }
}
