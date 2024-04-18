import { html } from 'lit';
import { property } from 'lit/decorators.js';

import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';
import { IgcButtonBaseComponent } from './button-base.js';
import { styles } from './themes/button/button.base.css.js';
import { styles as shared } from './themes/button/shared/button.common.css.js';
import { all } from './themes/button/themes.js';

/**
 * Represents a clickable button, used to submit forms or anywhere in a
 * document for accessible, standard button functionality.
 *
 * @element igc-button
 *
 * @slot - Renders the label of the button.
 * @slot prefix - Renders content before the label of the button.
 * @slot suffix - Renders content after the label of the button.
 *
 * @fires igcFocus - Emitted when the button gains focus.
 * @fires igcBlur - Emitted when the button loses focus.
 *
 * @csspart base - The native button element.
 * @csspart prefix - The prefix container.
 * @csspart suffix - The suffix container.
 */
@themes(all)
export default class IgcButtonComponent extends IgcButtonBaseComponent {
  public static readonly tagName = 'igc-button';
  protected static styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(this);
  }

  /**
   * Sets the variant of the button.
   * @attr
   */
  @property({ reflect: true })
  public variant: 'flat' | 'contained' | 'outlined' | 'fab' = 'contained';

  constructor() {
    super();
    this.size = 'medium';
  }

  protected renderContent() {
    return html`
      <slot name="prefix"></slot>
      <slot></slot>
      <slot name="suffix"></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-button': IgcButtonComponent;
  }
}
