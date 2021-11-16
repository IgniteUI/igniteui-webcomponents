import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { styles } from './card.material.css';

/** A container which wraps different elements related to a single subject
 * @element igc-card
 *
 * @slot - Renders card content
 */
export default class IgcCardComponent extends LitElement {
  /** @private */
  public static tagName = 'igc-card';

  /** @private */
  public static styles = styles;

  /** Sets card outline style, otherwise card looks elevated */
  @property({ type: Boolean, reflect: true })
  public outlined = true;

  protected render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-card': IgcCardComponent;
  }
}
