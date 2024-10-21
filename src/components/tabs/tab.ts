import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';

import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';
import { createCounter } from '../common/util.js';
import { styles as shared } from './themes/shared/tab/tab.common.css.js';
import { all } from './themes/tab-themes.js';
import { styles } from './themes/tab.base.css.js';

/**
 * Represents the tab header.
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

@themes(all)
export default class IgcTabComponent extends LitElement {
  public static readonly tagName = 'igc-tab';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcTabComponent);
  }

  private static increment = createCounter();

  /**
   * The tab item label.
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

  override connectedCallback(): void {
    super.connectedCallback();
    this.id = this.id || `igc-tab-${IgcTabComponent.increment()}`;
  }

  protected override render() {
    const headerId = `${this.id}-header`;
    const contentId = `${this.id}-content`;

    return html`
      <div
        part="header"
        role="tab"
        id=${headerId}
        aria-disabled=${this.disabled}
        aria-selected=${this.selected}
        aria-controls=${contentId}
        tabindex=${this.selected ? 0 : -1}
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
        part="body"
        role="tabpanel"
        id=${contentId}
        aria-labelledby=${headerId}
        .inert=${!this.selected}
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
