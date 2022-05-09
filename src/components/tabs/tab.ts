import { html, LitElement } from 'lit';
import { themes } from '../../theming/theming-decorator.js';
import { property, query } from 'lit/decorators.js';
import { styles } from './themes/light/tab.base.css';
import { styles as bootstrap } from './themes/light/tab.bootstrap.css.js';
import { styles as indigo } from './themes/light/tab.indigo.css.js';

@themes({ bootstrap, indigo })
export default class IgcTabComponent extends LitElement {
  public static readonly tagName = 'igc-tab';

  public static override styles = styles;

  @query('[part="base"]')
  private tab!: HTMLElement;

  @property({ type: String })
  public panel = '';

  @property({ type: Boolean, reflect: true })
  public selected = false;

  @property({ type: Boolean, reflect: true })
  public disabled = false;

  public override focus(options?: FocusOptions) {
    this.tab.focus(options);
  }

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
