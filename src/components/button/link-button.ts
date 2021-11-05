import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { IgcButtonBaseComponent } from './button-base.js';

/**
 * Represents a button component specifically useful for
 * creating hyperlinks to web pages, files, or anything else
 * a URL can address.
 *
 * @element igc-link-button
 *
 * @slot - Renders the label of the button.
 * @slot prefix - Renders content before the label of the button.
 * @slot suffix - Renders content after the label of the button.
 *
 * @fires igcFocus - Emitted when the button gains focus.
 * @fires igcBlur - Emitted when the button loses focus.
 *
 * @csspart base - The native anchor element.
 * @csspart prefix - The prefix container.
 * @csspart suffix - The suffix container.
 */
export default class IgcLinkButtonComponent extends IgcButtonBaseComponent {
  /** The URL the link-button points to. */
  @property()
  public href!: string;

  /** Prompts to save the linked URL instead of navigating to it. */
  @property()
  public download!: string;

  /** Where to display the linked URL, as the name for a browsing context. */
  @property()
  public target!: '_blank' | '_parent' | '_self' | '_top' | undefined;

  /**
   * The relationship of the linked URL.
   * See https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types
   */
  @property()
  public rel!: string;

  protected render() {
    return html`
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
        ${this.renderContent()}
      </a>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-link-button': IgcLinkButtonComponent;
  }
}
