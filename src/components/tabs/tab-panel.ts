import { LitElement, html } from 'lit';

import { styles } from './themes/light/tab-panel.base.css.js';
import { registerComponent } from '../common/definitions/register.js';
import { createCounter } from '../common/util.js';

/**
 * Represents the content of a tab
 *
 * @element igc-tab-panel
 *
 * @slot - Renders the content.
 */
export default class IgcTabPanelComponent extends LitElement {
  public static readonly tagName = 'igc-tab-panel';
  public static override styles = styles;

  public static register() {
    registerComponent(this);
  }

  private static readonly increment = createCounter();

  public override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'tabpanel');
    this.tabIndex = this.hasAttribute('tabindex') ? this.tabIndex : 0;
    this.slot = this.slot.length > 0 ? this.slot : 'panel';
    this.id =
      this.getAttribute('id') ||
      `igc-tab-panel-${IgcTabPanelComponent.increment()}`;
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tab-panel': IgcTabPanelComponent;
  }
}
