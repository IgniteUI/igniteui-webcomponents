import { html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { watch } from '../common/decorators/watch.js';
import { themes } from '../../theming/theming-decorator.js';
import { styles } from './themes/tab/light/tab.base.css.js';
import { styles as bootstrap } from './themes/tab/light/tab.bootstrap.css.js';
import { styles as fluent } from './themes/tab/light/tab.fluent.css.js';
import { styles as indigo } from './themes/tab/light/tab.indigo.css.js';
import { styles as material } from './themes/tab/light/tab.material.css.js';

/**
 * `IgcTabComponent` is used within the `igc-tabs` element and it holds the header and the content of each tab.
 *
 * @element igc-tab
 *
 * @slot - Renders the tab's content.
 * @slot label - Renders the tab header's label.
 * @slot prefix - Renders the tab header's prefix.
 * @slot suffix - Renders the tab header's suffix.
 *
 * @csspart header - The header of a single tab.
 * @csspart prefix - Holds the header's label prefix.
 * @csspart content - Holds the header's label.
 * @csspart suffix - Holds the header's label suffix.
 * @csspart body - Holds the body content of a single tab, only the body of the selected tab is visible.
 */
@themes({ bootstrap, fluent, indigo, material })
export default class IgcTabComponent extends LitElement {
  /** @private */
  public static readonly tagName = 'igc-tab';
  /** @private */
  public static override styles = styles;

  @query('[part~="header"]')
  public header!: HTMLElement;

  @query('[part~="body"]')
  public contentBody!: HTMLElement;

  /**
   * The tree item label.
   * @attr
   */
  @property()
  public label = '';

  /**
   * Determines whether the tab is selected.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public selected = false;

  /**
   * Determines whether the tab is disabled.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /** @private */
  @property({ attribute: false })
  public index = -1;

  @watch('selected', { waitUntilFirstUpdate: true })
  protected selectedChange() {
    if (this.selected) {
      this.dispatchEvent(
        new CustomEvent('tabSelectedChanged', { bubbles: true })
      );
    }
  }

  protected override render() {
    return html`
      <div
        part="header"
        role="tab"
        id="igc-tab-header-${this.index}"
        tabindex="${this.selected ? '0' : '-1'}"
        aria-selected="${this.selected}"
        aria-disabled="${this.disabled}"
        aria-controls="igc-tab-content-${this.index}"
        aria-posinset=${this.index + 1}
      >
        <div part="base">
          <slot name="prefix" part="prefix"></slot>
          <div part="content">
            <slot name="label">${this.label}</slot>
          </div>
          <slot name="suffix" part="suffix"></slot>
        </div>
      </div>
      <div
        id="igc-tab-content-${this.index}"
        part="body"
        role="tabpanel"
        aria-labelledby="igc-tab-header-${this.index}"
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tab': IgcTabComponent;
  }
}
