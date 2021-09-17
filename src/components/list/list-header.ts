import { html, LitElement } from 'lit';
import { styles } from './list-header.material.css';

/**
 * Header list item.
 *
 * @element igc-list-header
 *
 * @slot - Renders header list item's content.
 */
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
