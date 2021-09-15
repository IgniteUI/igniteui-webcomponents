import { LitElement, html } from 'lit';
import { styles } from './card.content.material.css';

export class IgcCardContent extends LitElement {
  static styles = styles;

  render() {
    return html`<slot></slot>`;
  }
}
