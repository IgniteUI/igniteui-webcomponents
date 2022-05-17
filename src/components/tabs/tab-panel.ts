import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { watch } from '../common/decorators/watch.js';
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

  @state()
  public selected = false;

  @state()
  public disabled = false;

  /** The tab panel's name. */
  @property({ type: String })
  public name = '';

  public override connectedCallback() {
    super.connectedCallback();

    this.setAttribute('role', 'tabpanel');
    this.setAttribute('tabindex', '0');
  }

  @watch('selected')
  protected selectedChange() {
    const styles: Partial<CSSStyleDeclaration> = {
      display: `${this.selected ? 'block' : 'none'}`,
    };
    Object.assign(this.style, styles);
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
