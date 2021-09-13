import { LitElement, html } from 'lit';
import { styles } from './card.media.material.css';

export class IgcCardMedia extends LitElement {
  static styles = styles;

  constructor() {
    super();
  }

  render() {
    return html`<slot></slot>`;
  }
}
