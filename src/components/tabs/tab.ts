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
 * Represents the tab header.
 *
 * @element igc-tab
 *
 * @slot prefix - Renders before the tab header content.
 * @slot - Renders the tab header content.
 * @slot suffix - Renders after the tab header content.
 *
 * @csspart content - The content wrapper.
 * @csspart prefix - The prefix wrapper.
 * @csspart suffix - The suffix wrapper.
 */
@themes({ bootstrap, fluent, indigo, material })
export default class IgcTabComponent extends LitElement {
  public static readonly tagName = 'igc-tab';

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

  /** @private */
  @property({ attribute: false })
  public activation: 'auto' | 'manual' = 'auto';

  @watch('selected', { waitUntilFirstUpdate: true })
  protected selectedChange() {
    if (this.selected) {
      this.dispatchEvent(
        new CustomEvent('tabSelectedChanged', { bubbles: true, detail: false })
      );
    }
  }

  private handleClick(event: MouseEvent): void {
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('tabSelectedChanged', { bubbles: true, detail: true })
    );
  }

  private handleKeydown(event: KeyboardEvent): void {
    this.dispatchEvent(
      new CustomEvent('tabHeaderKeydown', {
        bubbles: true,
        detail: { event, focusedTab: this },
      })
    );
  }

  protected override render() {
    return html`
      <div
        part="header"
        role="tab"
        aria-selected="${this.selected}"
        aria-disabled="${this.disabled}"
        tabindex="${this.selected ? '0' : '-1'}"
        @click=${this.handleClick}
        @keydown=${this.handleKeydown}
      >
        <div part="base">
          <slot name="prefix" part="prefix"></slot>
          <div part="content">
            <slot name="label" part="label">${this.label}</slot>
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
