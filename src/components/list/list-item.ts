import { html, LitElement } from 'lit';
import { styles } from './list-item.material.css';

/**
 * The list-item component is a container
 * intended for row items in the list component.
 *
 * @element igc-list-item
 *
 * @slot - Renders a custom content.
 * @slot start - Renders the content before the title and subtitle.
 * @slot end - Renders the content after the title and subtitle.
 * @slot title - Renders the title.
 * @slot subtitle - Renders the subtitle.
 *
 * @csspart start - The start container.
 * @csspart end - The end container.
 * @csspart content - The header and custom template container.
 * @csspart header - The title and subtitle container.
 * @csspart title - The title wrapper.
 * @csspart subtitle - The subtitle wrapper.
 */
export class IgcListItemComponent extends LitElement {
  static styles = styles;

  constructor() {
    super();
    this.setAttribute('role', 'listitem');
  }

  render() {
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
