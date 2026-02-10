import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { addThemingController } from '../../theming/theming-controller.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcCardActionsComponent from './card.actions.js';
import IgcCardContentComponent from './card.content.js';
import IgcCardHeaderComponent from './card.header.js';
import IgcCardMediaComponent from './card.media.js';
import { styles } from './themes/container.base.css.js';
import { all } from './themes/container.js';
import { styles as shared } from './themes/shared/container/card.common.css.js';

/**
 * A container component that wraps different elements related to a single subject.
 * The card component provides a flexible container for organizing content such as headers,
 * media, text content, and actions.
 *
 * @element igc-card
 *
 * @slot - Renders the card content. Typically contains igc-card-header, igc-card-media, igc-card-content, and igc-card-actions.
 *
 * @example
 * ```html
 * <igc-card>
 *   <igc-card-header>
 *     <h3 slot="title">Card Title</h3>
 *     <h5 slot="subtitle">Card Subtitle</h5>
 *   </igc-card-header>
 *   <igc-card-content>
 *     <p>Card content goes here</p>
 *   </igc-card-content>
 *   <igc-card-actions>
 *     <button slot="start">Action</button>
 *   </igc-card-actions>
 * </igc-card>
 * ```
 */
export default class IgcCardComponent extends LitElement {
  public static readonly tagName = 'igc-card';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcCardComponent,
      IgcCardActionsComponent,
      IgcCardContentComponent,
      IgcCardHeaderComponent,
      IgcCardMediaComponent
    );
  }

  /**
   * Sets the card to have an elevated appearance with shadow.
   * When false, the card uses an outlined style with a border.
   *
   * @attr elevated
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public elevated = false;

  constructor() {
    super();
    addThemingController(this, all);
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-card': IgcCardComponent;
  }
}
