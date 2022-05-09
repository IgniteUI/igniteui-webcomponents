import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { styles } from './themes/light/tab-panel.base.css';

export default class IgcTabPanelComponent extends LitElement {
  public static readonly tagName = 'igc-tab-panel';

  public static override styles = styles;

  @property({ type: String })
  public name = '';

  @state()
  public selected = false;

  @state()
  public disabled = false;

  protected override render() {
    return html`
      <div
        part="base"
        role="tabpanel"
        style=${styleMap({
          display: this.selected ? 'block' : 'none',
        })}
        tabindex=${this.selected ? 0 : -1}
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
