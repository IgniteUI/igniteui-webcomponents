import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';

import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';
import { all } from './themes/actions.js';
import { styles } from './themes/card.actions.base.css.js';

/** A container for card action items like buttons
 * @element igc-card-actions
 *
 * @slot start - Renders items at the beginning of actions area
 * @slot - Renders items at the middle of actions area
 * @slot end - Renders items at the end of actions area
 */
@themes(all)
export default class IgcCardActionsComponent extends LitElement {
  public static readonly tagName = 'igc-card-actions';
  public static override styles = styles;

  /* blazorSuppress */
  public static register() {
    registerComponent(this);
  }

  /**
   * The orientation of the actions.
   * @attr
   */
  @property({ reflect: true })
  public orientation: 'vertical' | 'horizontal' = 'horizontal';

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
