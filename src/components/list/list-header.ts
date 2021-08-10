import { html, LitElement } from 'lit';
import { styles } from './list-header.material.css';

export class IgcListHeaderComponent extends LitElement {
  static styles = styles;

  constructor() {
    super();
    this.setAttribute('role', 'separator');
  }

  render() {
    return html`<slot></slot>`;
  }
}
