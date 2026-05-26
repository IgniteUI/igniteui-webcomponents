import { html, LitElement } from 'lit';

import { addThemingController } from '../../theming/theming-controller.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles } from './themes/card.header.base.css.js';
import { all } from './themes/header.js';
import { styles as shared } from './themes/shared/header/card.header.common.css.js';

/**
 * A container component for the card's header section.
 * Displays header content including an optional thumbnail, title, subtitle, and additional content.
 *
 * @element igc-card-header
 *
 * @slot thumbnail - Renders header media such as an icon or small image.
 * @slot title - Renders the card title (typically a heading element).
 * @slot subtitle - Renders the card subtitle (typically a smaller heading or text).
 * @slot - Renders additional content displayed next to the title area.
 *
 * @csspart header - The card header text container.
 * @csspart title - The title slot wrapper.
 * @csspart subtitle - The subtitle slot wrapper.
 *
 * @example
 * ```html
 * <igc-card-header>
 *   <igc-avatar slot="thumbnail" initials="AB"></igc-avatar>
 *   <h3 slot="title">Card Title</h3>
 *   <h5 slot="subtitle">Card Subtitle</h5>
 * </igc-card-header>
 * ```
 */
export default class IgcCardHeaderComponent extends LitElement {
  public static readonly tagName = 'igc-card-header';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcCardHeaderComponent);
  }

  constructor() {
    super();
    addThemingController(this, all);
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
