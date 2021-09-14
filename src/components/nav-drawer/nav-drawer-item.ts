import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';
import { watch } from '../common/decorators';
import { styles } from './nav-drawer-item.material.css';

/**
 * Represents a navigation drawer item.
 *
 * @element igc-nav-drawer-item
 *
 * @slot - The default slot for the drawer item.
 * @slot icon - The slot for the icon of the drawer item.
 *
 * @csspart base - The base wrapper of the drawer item.
 * @csspart icon - The icon container.
 * @csspart text - The text container.
 */
export class IgcNavDrawerItemComponent extends LitElement {
  /** @private */
  static styles = [styles];

  /** Determines whether the drawer is disabled. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Determines whether the drawer is active. */
  @property({ type: Boolean, reflect: true })
  active = false;

  protected handleClick() {
    this.active = true;
  }

  @watch('active', { waitUntilFirstUpdate: true })
  protected handleChange() {
    if (this.active) {
      this.getDrawerItems().forEach((item) => {
        item.active = false;
      });
    }
  }

  private getDrawerItems() {
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
        <span part="text">
          <slot></slot>
        </span>
      </div>
    `;
  }
}
