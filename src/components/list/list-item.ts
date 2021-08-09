import { html, LitElement } from 'lit';
import { styles } from './list-item.material.css';

export class IgcListItemComponent extends LitElement {
  static styles = styles;

  render() {
    return html`
      <section part="start">
        <slot name="start"></slot>
      </section>
      <section part="content">
        <header part="header">
          <slot name="title"></slot>
          <slot name="subtitle"></slot>
        </header>
        <slot></slot>
      </section>
      <section part="end">
        <slot name="end"></slot>
      </section>
    `;
  }
}
