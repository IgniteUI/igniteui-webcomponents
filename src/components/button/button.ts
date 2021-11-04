import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { alternateName } from '../common/decorators';
import { IgcButtonBaseComponent } from './button-base.js';

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
@customElement('igc-button')
export default class IgcButtonComponent extends IgcButtonBaseComponent {
  /**
   * The type of the button. Defaults to undefined.
   */
  @alternateName('displayType')
  @property()
  public type!: 'button' | 'reset' | 'submit';

  private renderButton() {
    return html`
      <button
        part="base"
        .disabled=${this.disabled}
        class=${classMap(this.classes)}
        type=${ifDefined(this.type)}
        @focus=${this.handleFocus}
        @blur=${this.handleBlur}
      >
        ${this.renderContent()}
      </button>
    `;
  }

  private renderLinkButton() {
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

  protected render() {
    const link = !!this.href;
    return link ? this.renderLinkButton() : this.renderButton();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-button': IgcButtonComponent;
  }
}
