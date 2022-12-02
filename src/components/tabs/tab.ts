import { html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { themes } from '../../theming/theming-decorator.js';
import { createCounter } from '../common/util.js';
import { styles } from './themes/light/tab.base.css.js';
import { styles as bootstrap } from './themes/light/tab.bootstrap.css.js';
import { styles as fluent } from './themes/light/tab.fluent.css.js';
import { styles as indigo } from './themes/light/tab.indigo.css.js';

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
@themes({ bootstrap, fluent, indigo })
export default class IgcTabComponent extends LitElement {
  public static readonly tagName = 'igc-tab';

  public static override styles = styles;

  private static readonly increment = createCounter();

  @query('[part="base"]', true)
  private tab!: HTMLElement;

  /**
   * The id of the tab panel which will be controlled by the tab.
   * @attr
   */
  @property()
  public panel = '';

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

  public override connectedCallback(): void {
    super.connectedCallback();
    this.id =
      this.getAttribute('id') || `igc-tab-${IgcTabComponent.increment()}`;
  }

  /** Sets focus to the tab. */
  public override focus(options?: FocusOptions) {
    this.tab.focus(options);
  }

  /** Removes focus from the tab. */
  public override blur() {
    this.tab.blur();
  }

  protected override render() {
    return html`
      <div
        part="base"
        role="tab"
        aria-disabled=${this.disabled ? 'true' : 'false'}
        aria-selected=${this.selected ? 'true' : 'false'}
        tabindex=${this.disabled || !this.selected ? -1 : 0}
      >
        <slot name="prefix" part="prefix"></slot>
        <div part="content">
          <slot></slot>
        </div>
        <slot name="suffix" part="suffix"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tab': IgcTabComponent;
  }
}
