import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { styles } from './card.material.css';

export class IgcCardComponent extends LitElement {
  static styles = styles;

  constructor() {
    super();
  }

  @property({ type: Boolean, reflect: true })
  outlined = false;

  render() {
    return html`<slot></slot>`;
  }
}
