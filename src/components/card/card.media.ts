import { LitElement, html } from 'lit';
import { styles } from './card.media.material.css';

export class IgcCardMedia extends LitElement {
  static styles = styles;

  constructor() {
    super();
    this.setAttribute('role', 'img');
  }

  render() {
    return html`<slot></slot>`;
  }
}
