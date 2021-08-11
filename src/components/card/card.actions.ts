import { LitElement, html } from 'lit';
import { styles } from './card.actions.material.css';

export class IgcCardActions extends LitElement {
  static styles = styles;

  render() {
    return html`
      <div class="buttons">
        <slot name="start"></slot>
      </div>
      <div>
        <slot></slot>
      </div>
      <div class="icons">
        <slot name="end"></slot>
      </div>
    `;
  }
}
