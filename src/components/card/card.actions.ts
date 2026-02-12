import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { addThemingController } from '../../theming/theming-controller.js';
import { registerComponent } from '../common/definitions/register.js';
import type { ContentOrientation } from '../types.js';
import { all } from './themes/actions.js';
import { styles } from './themes/card.actions.base.css.js';
import { styles as shared } from './themes/shared/actions/card.actions.common.css.js';

/**
 * A container component for card action items such as buttons or icon buttons.
 * Actions can be positioned at the start, center, or end of the container.
 *
 * @element igc-card-actions
 *
 * @slot start - Renders items at the beginning of the actions area.
 * @slot - Renders items in the center of the actions area.
 * @slot end - Renders items at the end of the actions area.
 *
 * @example
 * ```html
 * <igc-card-actions>
 *   <igc-button slot="start" variant="flat">Like</igc-button>
 *   <igc-button slot="start" variant="flat">Share</igc-button>
 *   <igc-icon-button slot="end" name="more_vert"></igc-icon-button>
 * </igc-card-actions>
 * ```
 */
export default class IgcCardActionsComponent extends LitElement {
  public static readonly tagName = 'igc-card-actions';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcCardActionsComponent);
  }

  constructor() {
    super();
    addThemingController(this, all);
  }

  /**
   * The orientation of the actions layout.
   *
   * @attr orientation
   * @default 'horizontal'
   */
  @property({ reflect: true })
  public orientation: ContentOrientation = 'horizontal';

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
