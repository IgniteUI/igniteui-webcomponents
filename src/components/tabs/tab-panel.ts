import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
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

  /** The tab panel's id. */
  @property({ type: String })
  public override id = '';

  public override connectedCallback() {
    super.connectedCallback();

    this.setAttribute('role', 'tabpanel');
    this.setAttribute('tabindex', '0');
  }

  protected override render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tab-panel': IgcTabPanelComponent;
  }
}
