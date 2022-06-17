import { html, LitElement } from 'lit';
import { themes } from '../../theming/theming-decorator.js';
import { property, query } from 'lit/decorators.js';
import { styles } from './themes/light/tab.base.css.js';
import { styles as bootstrap } from './themes/light/tab.bootstrap.css.js';
import { styles as fluent } from './themes/light/tab.fluent.css.js';
import { styles as indigo } from './themes/light/tab.indigo.css.js';

let nextId = 0;

/**
 * Represents the tab header.
 *
 * @element igc-tab
 *
 * @slot prefix - Renders before the tab header content.
 * @slot - Renders the tab header content.
 * @slot suffix - Renders after the tab header content.
 *
 * @csspart prefix - The prefix wrapper.
 * @csspart suffix - The suffix wrapper.
 */
@themes({ bootstrap, fluent, indigo })
export default class IgcTabComponent extends LitElement {
  public static readonly tagName = 'igc-tab';

  public static override styles = styles;

  private readonly componentId = `igc-tab-${nextId++}`;

  @query('[part="base"]', true)
  private tab!: HTMLElement;

  /** The id of the tab panel which will be controlled by the tab. */
  @property({ type: String })
  public panel = '';

  /** Determines whether the tab is selected. */
  @property({ type: Boolean, reflect: true })
  public selected = false;

  /** Determines whether the tab is disabled. */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /** Sets focus to the tab. */
  public override focus(options?: FocusOptions) {
    this.tab.focus(options);
  }

  /** Removes focus from the tab. */
  public override blur() {
    this.tab.blur();
  }

  protected override render() {
    this.id = this.id.length > 0 ? this.id : this.componentId;

    return html`
      <div
        part="base"
        role="tab"
        aria-disabled=${this.disabled ? 'true' : 'false'}
        aria-selected=${this.selected ? 'true' : 'false'}
        tabindex=${this.disabled || !this.selected ? -1 : 0}
      >
        <slot name="prefix" part="prefix"></slot>
        <slot></slot>
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
