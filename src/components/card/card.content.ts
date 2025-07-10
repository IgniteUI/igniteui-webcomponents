import { html, LitElement } from 'lit';

import { addThemingController } from '../../theming/theming-controller.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles } from './themes/card.content.base.css.js';
import { all } from './themes/content.js';
import { styles as shared } from './themes/shared/content/card.content.common.css.js';

/** A container for card's text content
 * @element igc-card-content
 *
 * @slot - Renders the card text content
 */
export default class IgcCardContentComponent extends LitElement {
  public static readonly tagName = 'igc-card-content';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcCardContentComponent);
  }

  constructor() {
    super();
    addThemingController(this, all);
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
