import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { registerComponent } from '#internals/definitions/register.js';
import { all } from '#themes/button/themes/button/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import type { ButtonVariant } from '../types.js';
import { IgcButtonBaseComponent } from './button-base.js';
import { styles } from './themes/button/button.base.css.js';
import { styles as shared } from './themes/button/shared/button.common.css.js';

/**
 * Represents a clickable button, used to submit forms or anywhere in a
 * document for accessible, standard button functionality.
 *
 * The button has several visual variants. It renders as an anchor (`<a>`)
 * element when the `href` attribute is set. It is form-associated and can
 * act as a native `submit` or `reset` control.
 *
 * @element igc-button
 *
 * @slot - Renders the label of the button.
 * @slot prefix - Renders content before the label of the button.
 * @slot suffix - Renders content after the label of the button.
 *
 * @csspart base - The native button or anchor element.
 */
export default class IgcButtonComponent extends IgcButtonBaseComponent {
  public static readonly tagName = 'igc-button';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcButtonComponent);
  }

  /**
   * The variant of the button which determines its visual appearance.
   * - `contained` – filled background; highest visual emphasis (default).
   * - `outlined` – transparent background with a visible border.
   * - `flat` – no background or border; lowest visual emphasis.
   * - `fab` – floating action button shape; typically used for primary actions.
   * @attr variant
   * @default 'contained'
   */
  @property({ reflect: true })
  public variant: ButtonVariant = 'contained';

  constructor() {
    super();
    addThemingController(this, all);
  }

  protected _renderContent() {
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
