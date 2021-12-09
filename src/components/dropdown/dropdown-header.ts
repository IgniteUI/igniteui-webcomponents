import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styles } from './dropdown-header.material.css';

@customElement('igc-dropdown-header')
export default class IgcDropDownHeaderComponent extends LitElement {
  /** private */
  public static styles = styles;

  public render() {
    return html` <slot></slot> `;
  }
}
