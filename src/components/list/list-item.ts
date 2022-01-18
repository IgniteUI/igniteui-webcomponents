import { html, LitElement } from 'lit';
import { styles } from './list-item.material.css';

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
export default class IgcListItemComponent extends LitElement {
  /** @private */
  public static tagName = 'igc-list-item';

  /** @private */
  public static override styles = styles;

  constructor() {
    super();
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'listitem');
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
