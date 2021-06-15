import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { IgcButtonBaseComponent } from './button-base.js';

// @customElement('igc-link-button')
export class IgcLinkButtonComponent extends IgcButtonBaseComponent {
  @property()
  href?: string;

  @property()
  download?: string;

  @property()
  target?: '_blank' | '_parent' | '_self' | '_top';

  @property()
  rel?: string;

  render() {
    return html`
      <a
        part="native"
        role="button"
        href=${ifDefined(this.href)}
        target=${ifDefined(this.target)}
        download=${ifDefined(this.download)}
        rel=${ifDefined(this.rel)}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        class=${classMap(this.classes)}
      >
        ${this.renderContent()}
      </a>
    `;
  }
}
