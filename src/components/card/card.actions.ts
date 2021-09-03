import { LitElement, html } from 'lit';
import { styles } from './card.actions.material.css';

export class IgcCardActions extends LitElement {
  static styles = styles;

  render() {
    return html`
      <slot name="start"></slot>
      <slot></slot>
      <slot name="end"></slot>
    `;
  }
}
