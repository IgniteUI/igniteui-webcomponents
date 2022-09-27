import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { themes } from '../../theming/theming-decorator.js';
import { alternateName } from '../common/decorators/alternateName.js';
import { blazorInclude } from '../common/decorators/blazorInclude.js';
import {
  registerIcon as registerIcon_impl,
  registerIconFromText as registerIconFromText_impl,
} from '../icon/icon.registry.js';
import { IgcButtonBaseComponent } from './button-base.js';
import { styles } from './themes/icon-button/light/icon-button.base.css.js';
import { styles as bootstrap } from './themes/icon-button/light/icon-button.bootstrap.css.js';
import { styles as fluent } from './themes/icon-button/light/icon-button.fluent.css.js';
import { styles as indigo } from './themes/icon-button/light/icon-button.indigo.css.js';
import { styles as material } from './themes/icon-button/light/icon-button.material.css.js';

import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcIconComponent from '../icon/icon.js';

defineComponents(IgcIconComponent);

/**
 * @element igc-icon-button
 *
 * @csspart base - The wrapping element.
 * @csspart icon - The icon element.
 */
@themes({ bootstrap, material, fluent, indigo })
export default class IgcIconButtonComponent extends IgcButtonBaseComponent {
  public static readonly tagName = 'igc-icon-button';
  protected static styles = styles;

  /** The name of the icon. */
  @alternateName('iconName')
  @property()
  public name!: string;

  /** The name of the icon collection. */
  @property()
  public collection!: string;

  /** Whether to flip the icon button. Useful for RTL layouts. */
  @property({ type: Boolean })
  public mirrored = false;

  /** The visual variant of the icon button. */
  @property({ reflect: true })
  public variant: 'flat' | 'contained' | 'outlined' = 'contained';

  protected renderContent() {
    return html`
      ${this.name
        ? html`<igc-icon
            part="icon"
            name=${ifDefined(this.name)}
            collection=${ifDefined(this.collection)}
            .mirrored=${this.mirrored}
            size=${ifDefined(this.size)}
            aria-hidden="true"
          ></igc-icon>`
        : html`<slot></slot>`}
    `;
  }

  @blazorInclude()
  protected async registerIcon(
    name: string,
    url: string,
    collection = 'default'
  ) {
    await registerIcon_impl(name, url, collection);
  }

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
