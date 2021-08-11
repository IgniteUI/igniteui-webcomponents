import { LitElement, html } from 'lit';
import { styles } from './card.header.material.css';

export class IgcCardHeader extends LitElement {
  static styles = styles;

  constructor() {
    super();
    this.setAttribute('role', 'header');
  }

  render() {
    return html`
    <div class="thumbnail">
      <slot name="thumbnail"></slot>
    </div>
    <div class="titles">
      <slot name="title"></slot>
      <slot name="subtitle"></slot>
      <slot><slot>
    </div>
    `;
  }
}
