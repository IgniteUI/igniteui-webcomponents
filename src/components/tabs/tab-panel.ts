import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { styles } from './themes/light/tab-panel.base.css';

export default class IgcTabPanelComponent extends LitElement {
  public static readonly tagName = 'igc-tab-panel';

  public static override styles = styles;

  @property({ type: String })
  public name = '';

  @property({ type: Boolean })
  public selected = false;

  @property({ type: Boolean, reflect: true })
  public disabled = false;

  protected override render() {
    return html`
      <div
        part="base"
        role="tabpanel"
        style=${styleMap({
          display: this.selected ? 'block' : 'none',
        })}
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tab-panel': IgcTabPanelComponent;
  }
}
