import { LitElement, html } from 'lit';
import { styles } from './card.header.material.css';

export class IgcCardHeader extends LitElement {
  static styles = styles;

  constructor() {
    super();
  }

  render() {
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
