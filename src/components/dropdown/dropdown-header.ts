import { html, LitElement } from 'lit';
import { styles } from './dropdown-header.material.css';

/**
 * @element igc-dropdown-header - Represents a header item in a dropdown list.
 *
 * @slot - Renders the header.
 */
export default class IgcDropDownHeaderComponent extends LitElement {
  /** private */
  public static styles = styles;

  public render() {
    return html`<slot></slot>`;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'igc-dropdown-header': IgcDropDownHeaderComponent;
  }
}
