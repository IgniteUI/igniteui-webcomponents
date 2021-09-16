import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
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
  static styles = [styles];

  /** The name of the icon. */
  @property()
  name!: string;

  /** The name of the icon collection. */
  @property()
  collection!: string;

  /** Whether to flip the icon. Useful for RTL layouts. */
  @property({ type: Boolean })
  mirrored = false;

  /** The href attribute of the icon. */
  @property()
  href!: string;

  /** The visual variant of the icon. */
  @property()
  variant: 'flat' | 'contained' | 'outlined' = 'flat';

  /** The download attribute of the icon. */
  @property()
  download!: string;

  /** The target attribute of the icon. */
  @property()
  target!: '_blank' | '_parent' | '_self' | '_top' | undefined;

  /** The rel attribute of the icon. */
  @property()
  rel!: string;

  protected renderIcon() {
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

  render() {
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
            class=${classMap(this.classes)}
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
            @focus=${this.handleFocus}
            @blur=${this.handleBlur}
          >
            ${this.renderIcon()}
          </button>
        `;
  }
}
