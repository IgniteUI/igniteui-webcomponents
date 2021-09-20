import { html, LitElement } from 'lit';
import { styles } from './list-header.material.css';

export class IgcListHeaderComponent extends LitElement {
  /** @private */
  public static styles = styles;

  constructor() {
    super();
    this.setAttribute('role', 'separator');
  }

  protected render() {
    return html`<slot></slot>`;
  }
}
