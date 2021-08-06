import { html, LitElement } from 'lit';
import { styles } from './navbar.material.css';

export class IgcNavbarComponent extends LitElement {
  static styles = [styles];

  render() {
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
