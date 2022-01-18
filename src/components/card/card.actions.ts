import { LitElement, html } from 'lit';
import { styles } from './card.actions.material.css';

/** A container for card action items like buttons
 * @element igc-card-actions
 *
 * @slot start - Renders items at the beginning of actions area
 * @slot - Renders items at the middle of actions area
 * @slot end - Renders items at the end of actions area
 */
export default class IgcCardActionsComponent extends LitElement {
  /** @private */
  public static tagName = 'igc-card-actions';

  /** @private */
  public static override styles = styles;

  protected override render() {
    return html`
      <slot name="start"></slot>
      <slot></slot>
      <slot name="end"></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-card-actions': IgcCardActionsComponent;
  }
}
