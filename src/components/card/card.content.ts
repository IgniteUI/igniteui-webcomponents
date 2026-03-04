import { html, LitElement } from 'lit';

import { addThemingController } from '../../theming/theming-controller.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles } from './themes/card.content.base.css.js';
import { all } from './themes/content.js';
import { styles as shared } from './themes/shared/content/card.content.common.css.js';

/**
 * A container component for the card's main text content.
 * This component should be used within an igc-card element to display the primary content.
 *
 * @element igc-card-content
 *
 * @slot - Renders the card text content (e.g., paragraphs, lists).
 *
 * @example
 * ```html
 * <igc-card-content>
 *   <p>This is the main content of the card. It can contain any text or HTML content.</p>
 * </igc-card-content>
 * ```
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
