import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { IgcButtonBaseComponent } from './button-base.js';

// @customElement('igc-button')
export class IgcButtonComponent extends IgcButtonBaseComponent {
  @property()
  type?: 'button' | 'reset' | 'submit';

  render() {
    return html`
      <button
        part="native"
        .disabled=${this.disabled}
        class=${classMap(this.classes)}
        type=${ifDefined(this.type)}
      >
        ${this.renderContent()}
      </button>
    `;
  }
}
