import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styles } from './card.actions.material.css';

/** A container for card action items like buttons
 * @element igc-card-actions
 *
 * @slot start - Renders items at the beginning of actions area
 * @slot - Renders items at the middle of actions area
 * @slot end - Renders items at the end of actions area
 */
@customElement('igc-card-actions')
export default class IgcCardActions extends LitElement {
  /** @private */
  public static styles = styles;

  protected render() {
    return html`
      <slot name="start"></slot>
      <slot></slot>
      <slot name="end"></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-card-actions': IgcCardActions;
  }
}
