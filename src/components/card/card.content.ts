import { LitElement, html } from 'lit';

import { styles } from './themes/card.content.base.css.js';
import { all } from './themes/content.js';
import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';

/** A container for card's text content
 * @element igc-card-content
 *
 * @slot - Renders the card text content
 */
@themes(all)
export default class IgcCardContentComponent extends LitElement {
  public static readonly tagName = 'igc-card-content';
  public static override styles = styles;

  public static register() {
    registerComponent(this);
  }

  protected override render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-card-content': IgcCardContentComponent;
  }
}
