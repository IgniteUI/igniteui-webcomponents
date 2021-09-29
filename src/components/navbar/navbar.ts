import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styles } from './navbar.material.css';

@customElement('igc-navbar')
export default class IgcNavbarComponent extends LitElement {
  /** @private */
  public static styles = [styles];

  protected render() {
    return html`
      <div part="base">
        <span part="start">
          <slot name="start"></slot>
        </span>
        <span part="middle">
          <slot></slot>
        </span>
        <span part="end">
          <slot name="end"></slot>
        </span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-navbar': IgcNavbarComponent;
  }
}
