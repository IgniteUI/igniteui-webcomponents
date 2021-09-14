import { html, LitElement } from 'lit';
import { styles } from './list-header.material.css';

/**
 * Header component for list items.
 *
 * @element igc-list-header
 *
 * @slot - Renders a header for the list items.
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
