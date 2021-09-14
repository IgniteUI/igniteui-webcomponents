import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';
import { watch } from '../common/decorators';
import { styles } from './nav-drawer-item.material.css';

export class IgcNavDrawerItemComponent extends LitElement {
  static styles = [styles];

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  active = false;

  handleClick() {
    this.active = true;
  }

  @watch('active', { waitUntilFirstUpdate: true })
  handleChange() {
    if (this.active) {
      this.getDrawerItems().forEach((item) => {
        item.active = false;
      });
    }
  }

  getDrawerItems() {
    const drawer = this.closest('igc-nav-drawer');
    if (!drawer) return [];

    return Array.from<IgcNavDrawerItemComponent>(
      drawer.querySelectorAll('igc-nav-drawer-item')
    ).filter((item) => item !== this);
  }

  render() {
    return html`
      <div
        part="base"
        .disabled="${this.disabled}"
        .active="${live(this.active)}"
        @click="${this.handleClick}"
      >
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
