import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { IgcButtonBaseComponent } from './button-base.js';
import { styles } from './icon-button.material.css';

/**
 * @element igc-icon-button
 *
 * @csspart base - The wrapping element.
 * @csspart icon - The icon element.
 */
export class IgcIconButtonComponent extends IgcButtonBaseComponent {
  public static styles = [styles];

  /** The name of the icon. */
  @property()
  public name!: string;

  /** The name of the icon collection. */
  @property()
  public collection!: string;

  /** Whether to flip the icon button. Useful for RTL layouts. */
  @property({ type: Boolean })
  public mirrored = false;

  /** The href attribute of the icon. */
  @property()
  public href!: string;

  /** The visual variant of the icon button. */
  @property()
  public variant: 'flat' | 'contained' | 'outlined' = 'flat';

  /** The download attribute of the icon. */
  @property()
  public download!: string;

  /** The target attribute of the icon button. */
  @property()
  public target!: '_blank' | '_parent' | '_self' | '_top' | undefined;

  /** The rel attribute of the icon button. */
  @property()
  public rel!: string;

  private renderIcon() {
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

  protected render() {
    const link = !!this.href;

    return link
      ? html`
          <a
            part="base"
            role="button"
            href=${ifDefined(this.href)}
            target=${ifDefined(this.target)}
            download=${ifDefined(this.download)}
            rel=${ifDefined(this.rel)}
            aria-disabled=${this.disabled ? 'true' : 'false'}
            @focus=${this.handleFocus}
            @blur=${this.handleBlur}
          >
            ${this.renderIcon()}
          </a>
        `
      : html`
          <button
            part="base"
            .disabled=${this.disabled}
            aria-disabled=${this.disabled ? 'true' : 'false'}
            @focus=${this.handleFocus}
            @blur=${this.handleBlur}
          >
            ${this.renderIcon()}
          </button>
        `;
  }
}
