import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { addThemingController } from '../../theming/theming-controller.js';
import { registerComponent } from '../common/definitions/register.js';
import { createCounter } from '../common/util.js';
import { styles as shared } from './themes/shared/tab/tab.common.css.js';
import { styles } from './themes/tab.base.css.js';
import { all } from './themes/tab-themes.js';

/**
 * A tab element slotted into an `igc-tabs` container.
 *
 * @element igc-tab
 *
 * @slot - Renders the tab's content.
 * @slot label - Renders the tab header's label.
 * @slot prefix - Renders the tab header's prefix.
 * @slot suffix - Renders the tab header's suffix.
 *
 * @csspart tab-header - The header of a single tab.
 * @csspart prefix - Tab header's label prefix.
 * @csspart content - Tab header's label slot container.
 * @csspart suffix - Tab header's label suffix.
 * @csspart tab-body - Holds the body content of a single tab, only the body of the selected tab is visible.
 */

export default class IgcTabComponent extends LitElement {
  public static readonly tagName = 'igc-tab';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
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

  constructor() {
    super();
    addThemingController(this, all);
  }

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();
    this.id = this.id || `igc-tab-${IgcTabComponent.increment()}`;
  }

  protected override render() {
    const headerId = `${this.id}-header`;
    const contentId = `${this.id}-content`;

    return html`
      <div
        part="tab-header"
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
        part="tab-body"
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
