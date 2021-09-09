import { html, LitElement } from 'lit';
import { styles } from './nav-drawer-item.material.css';

export class IgcNavDrawerItemComponent extends LitElement {
  static styles = [styles];

  render() {
    return html`
      <div part="base">
        <span part="icon">
          <slot name="icon"></slot>
        </span>
        <span part="default">
          <slot></slot>
        </span>
      </div>
    `;
  }
}
