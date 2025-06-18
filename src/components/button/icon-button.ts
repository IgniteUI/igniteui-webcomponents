import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import { themes } from '../../theming/theming-decorator.js';
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
 * @element igc-icon-button
 *
 * @csspart base - The wrapping element of the icon button.
 * @csspart icon - The icon element of the icon button.
 */
@themes(all)
export default class IgcIconButtonComponent extends IgcButtonBaseComponent {
  public static readonly tagName = 'igc-icon-button';
  protected static styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcIconButtonComponent, IgcIconComponent);
  }

  /* alternateName: iconName */
  /**
   * The name of the icon.
   * @attr
   */
  @property()
  public name!: string;

  /**
   * The name of the icon collection.
   * @attr
   */
  @property()
  public collection!: string;

  /**
   * Whether to flip the icon button. Useful for RTL layouts.
   * @attr
   */
  @property({ type: Boolean })
  public mirrored = false;

  /**
   * The visual variant of the icon button.
   * @attr
   */
  @property({ reflect: true })
  public variant: IconButtonVariant = 'contained';

  protected renderContent() {
    return html`
      ${this.name || this.mirrored
        ? html`
            <igc-icon
              part="icon"
              name=${ifDefined(this.name)}
              collection=${ifDefined(this.collection)}
              .mirrored=${this.mirrored}
              aria-hidden="true"
            ></igc-icon>
            <slot></slot>
          `
        : html`<slot></slot>`}
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
