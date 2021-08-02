import { html, LitElement } from 'lit';

export class IgcNavbarComponent extends LitElement {
  render() {
    return html`
      <header part="base">
        <span part="start">
          <slot name="start"></slot>
        </span>
        <span part="middle">
          <slot></slot>
        </span>
        <span part="end">
          <slot name="end"></slot>
        </span>
      </header>
    `;
  }
}
