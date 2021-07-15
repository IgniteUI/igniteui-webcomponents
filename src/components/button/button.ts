import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { IgcButtonBaseComponent } from './button-base.js';

/**
 * @element igc-button
 *
 * @slot prefix - Slot for projecting content at the start of the button.
 * @slot suffix - Slot for projecting content at the end of the button.
 *
 * @cssprop --size - Duh!
 *
 * @csspart native - The native button/a element.
 * @csspart prefix - The prefix container.
 * @csspart suffix - The suffix container.
 */
export class IgcButtonComponent extends IgcButtonBaseComponent {
  @property()
  type!: 'button' | 'reset' | 'submit';

  render() {
    return html`
      <button
        part="native"
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
}
