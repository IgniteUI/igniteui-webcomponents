import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { styles } from './themes/light/tab-panel.base.css.js';

let next = 0;

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

  /** The tab panel's id. */
  @property({ type: String })
  public override id = `tab-panel-${++next}`;

  public override connectedCallback() {
    this.setAttribute('role', 'tabpanel');
    this.tabIndex = this.hasAttribute('tabindex') ? this.tabIndex : 0;
    this.slot = this.hasAttribute('slot') ? this.slot : 'panel';
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
