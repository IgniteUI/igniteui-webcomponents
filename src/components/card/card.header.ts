import { LitElement, html } from 'lit';
import { styles } from './card.header.material.css';

export class IgcCardHeader extends LitElement {
  static styles = styles;

  constructor() {
    super();
  }

  render() {
    return html`
      <section class="thumbnail">
        <slot name="thumbnail"></slot>
      </section>
      <section class="titles">
        <slot name="title"></slot>
        <slot name="subtitle"></slot>
        <slot></slot>
      </section>
    `;
  }
}
