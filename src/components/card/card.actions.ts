import { html, LitElement } from 'lit';
import { themes } from '../../theming';

/** A container for card action items like buttons
 * @element igc-card-actions
 *
 * @slot start - Renders items at the beginning of actions area
 * @slot - Renders items at the middle of actions area
 * @slot end - Renders items at the end of actions area
 */
@themes({
  material: './card/themes/light/card.actions.material.scss',
  bootstrap: './card/themes/light/card.actions.bootstrap.scss',
  fluent: './card/themes/light/card.actions.material.scss',
  indigo: './card/themes/light/card.actions.material.scss',
})
export default class IgcCardActionsComponent extends LitElement {
  public static readonly tagName = 'igc-card-actions';

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
