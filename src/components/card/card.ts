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

/** A container which wraps different elements related to a single subject
 * @element igc-card
 *
 * @slot - Renders card content
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
   * Sets card elevated style, otherwise card looks outlined.
   * @attr
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
