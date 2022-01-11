import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { IgcButtonBaseComponent } from './button-base.js';
import { styles } from './icon-button.material.css';
import '../icon/icon';
import { alternateName, blazorInclude } from '../common/decorators';
import {
  registerIcon as registerIcon_impl,
  registerIconFromText as registerIconFromText_impl,
} from '../icon/icon.registry.js';

/**
 * @element igc-icon-button
 *
 * @csspart base - The wrapping element.
 * @csspart icon - The icon element.
 */
export default class IgcIconButtonComponent extends IgcButtonBaseComponent {
  /** @private */
  public static tagName = 'igc-icon-button';

  /** @private */
  public static styles = [styles];

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
      <igc-icon
        part="icon"
        name=${ifDefined(this.name)}
        collection=${ifDefined(this.collection)}
        .mirrored=${this.mirrored}
        size=${ifDefined(this.size)}
        aria-hidden="true"
      ></igc-icon>
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
