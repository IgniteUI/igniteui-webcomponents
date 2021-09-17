import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { styles } from './card.material.css';

/** A container which wraps different elements related to a single subject
 * @element igc-card
 *
 * @slot - Renders card content
 */
export class IgcCardComponent extends LitElement {
  static styles = styles;

  constructor() {
    super();
  }

  /** Sets card outline style, otherwise card looks elevated */
  @property({ type: Boolean, reflect: true })
  outlined = false;

  render() {
    return html`<slot></slot>`;
  }
}
