import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './card.material.css';

/** A container which wraps different elements related to a single subject
 * @element igc-card
 *
 * @slot - Renders card content
 */
@customElement('igc-card')
export default class IgcCardComponent extends LitElement {
  /** @private */
  public static styles = styles;

  /** Sets card outline style, otherwise card looks elevated */
  @property({ type: Boolean, reflect: true })
  public outlined = false;

  protected render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-card': IgcCardComponent;
  }
}
