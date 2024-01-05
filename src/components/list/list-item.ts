import { LitElement, html } from 'lit';

import { styles } from './themes/item.base.css.js';
import { all } from './themes/item.js';
import { styles as shared } from './themes/shared/item/list-item.common.css.js';
import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';

/**
 * The list-item component is a container
 * intended for row items in the list component.
 *
 * @element igc-list-item
 *
 * @slot - Renders custom content.
 * @slot start - Renders content before all other content.
 * @slot end - Renders content after all other content.
 * @slot title - Renders the title.
 * @slot subtitle - Renders the subtitle.
 *
 * @csspart start - The start container.
 * @csspart end - The end container.
 * @csspart content - The header and custom content container.
 * @csspart header - The title and subtitle container.
 * @csspart title - The title container.
 * @csspart subtitle - The subtitle container.
 */
@themes(all)
export default class IgcListItemComponent extends LitElement {
  public static readonly tagName = 'igc-list-item';
  public static override styles = [styles, shared];

  public static register() {
    registerComponent(this);
  }

  private _internals: ElementInternals;

  constructor() {
    super();
    this._internals = this.attachInternals();

    this._internals.role = 'listitem';
  }

  protected override render() {
    return html`
      <section part="start">
        <slot name="start"></slot>
      </section>
      <section part="content">
        <header part="header">
          <slot part="title" name="title"></slot>
          <slot part="subtitle" name="subtitle"></slot>
        </header>
        <slot></slot>
      </section>
      <section part="end">
        <slot name="end"></slot>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-list-item': IgcListItemComponent;
  }
}
