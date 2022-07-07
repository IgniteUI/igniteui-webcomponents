import { html, LitElement } from 'lit';
import { createCounter } from '../common/util.js';
import { styles } from './themes/light/tab-panel.base.css.js';

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

  private static readonly increment = createCounter();

  public override connectedCallback() {
    this.setAttribute('role', 'tabpanel');
    this.tabIndex = this.hasAttribute('tabindex') ? this.tabIndex : 0;
    this.slot = this.slot.length > 0 ? this.slot : 'panel';
    this.id =
      this.id.length > 0
        ? this.id
        : `igc-tab-panel-${IgcTabPanelComponent.increment()}`;
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
