import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import { addThemingController } from '../../theming/theming-controller.js';
import { blazorInclude } from '../common/decorators/blazorInclude.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcIconComponent from '../icon/icon.js';
import {
  registerIcon as registerIcon_impl,
  registerIconFromText as registerIconFromText_impl,
} from '../icon/icon.registry.js';
import type { IconButtonVariant } from '../types.js';
import { IgcButtonBaseComponent } from './button-base.js';
import { styles } from './themes/icon-button/icon-button.base.css.js';
import { styles as shared } from './themes/icon-button/shared/icon-button.common.css.js';
import { all } from './themes/icon-button/themes.js';

/**
 * A button that displays a single icon, designed for compact, icon-only
 * interactions such as toolbar actions, floating action buttons, or inline
 * controls.
 *
 * The icon is sourced from the icon registry via the `name` and `collection`
 * attributes. Like the normal button, it can render as an anchor element when
 * `href` is set and is fully form-associated.
 *
 * @element igc-icon-button
 *
 * @slot - Optional label rendered alongside the icon, useful for
 *   accessibility or augmented layouts.
 *
 * @csspart base - The wrapping element of the icon button.
 * @csspart icon - The icon element of the icon button.
 */
export default class IgcIconButtonComponent extends IgcButtonBaseComponent {
  public static readonly tagName = 'igc-icon-button';
  protected static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcIconButtonComponent, IgcIconComponent);
  }

  /* alternateName: iconName */
  /**
   * The name of the icon to display.
   * @attr name
   */
  @property()
  public name?: string;

  /**
   * The collection the icon belongs to.
   * @attr collection
   */
  @property()
  public collection?: string;

  /**
   * Determines whether the icon should be mirrored in right-to-left contexts.
   * @attr mirrored
   * @default false
   */
  @property({ type: Boolean })
  public mirrored = false;

  /**
   * The variant of the button which determines its visual appearance.
   * - `contained` – filled background; highest visual emphasis (default).
   * - `outlined` – transparent background with a visible border.
   * - `flat` – no background or border; lowest visual emphasis.
   * @attr variant
   * @default 'contained'
   */
  @property({ reflect: true })
  public variant: IconButtonVariant = 'contained';

  constructor() {
    super();
    addThemingController(this, all);
  }

  protected _renderContent() {
    return html`
      ${
        this.name || this.mirrored
          ? html`
              <igc-icon
                part="icon"
                name=${ifDefined(this.name)}
                collection=${ifDefined(this.collection)}
                ?mirrored=${this.mirrored}
                aria-hidden="true"
              ></igc-icon>
              <slot></slot>
            `
          : html`<slot></slot>`
      }
    `;
  }

  /* c8 ignore next 8 */
  @blazorInclude()
  protected async registerIcon(
    name: string,
    url: string,
    collection = 'default'
  ) {
    await registerIcon_impl(name, url, collection);
  }

  /* c8 ignore next 8 */
  @blazorInclude()
  protected registerIconFromText(
    name: string,
    iconText: string,
    collection = 'default'
  ) {
    registerIconFromText_impl(name, iconText, collection);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-icon-button': IgcIconButtonComponent;
  }
}
