import { html, LitElement } from 'lit';
import {
  property,
  queryAssignedElements,
  queryAssignedNodes,
  state,
} from 'lit/decorators.js';
import { themes } from '../../theming/theming-decorator.js';
import { partNameMap } from '../common/util.js';
import { styles as indigo } from './styles/indigo/nav-drawer-item.indigo.css.js';
import { styles } from './styles/nav-drawer-item.base.css.js';

/**
 * Represents a navigation drawer item.
 *
 * @element igc-nav-drawer-item
 *
 * @slot content - The content slot for the drawer item.
 * @slot icon - The slot for the icon of the drawer item.
 *
 * @csspart base - The base wrapper of the drawer item.
 * @csspart icon - The icon container.
 * @csspart content - The content container.
 */
@themes({ indigo })
export default class IgcNavDrawerItemComponent extends LitElement {
  public static readonly tagName = 'igc-nav-drawer-item';
  public static override styles = styles;

  /** Determines whether the drawer is disabled. */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /** Determines whether the drawer is active. */
  @property({ type: Boolean, reflect: true })
  public active = false;

  @state()
  private _textLength!: number;

  @queryAssignedElements({ slot: 'content' })
  private _text!: Array<HTMLElement>;

  @queryAssignedNodes({ slot: 'icon', flatten: true })
  protected navdrawerIcon!: Array<Node>;

  public override connectedCallback() {
    super.connectedCallback();
    this.shadowRoot?.addEventListener('slotchange', (_) => {
      this._textLength = this._text.length;
    });
  }

  protected resolvePartNames(base: string) {
    return {
      [base]: true,
      mini: this._textLength < 1,
    };
  }

  protected override render() {
    return html`
      <div part="${partNameMap(this.resolvePartNames('base'))}">
        <span part="icon" .hidden="${this.navdrawerIcon.length == 0}">
          <slot name="icon"></slot>
        </span>
        <span part="content">
          <slot name="content"></slot>
        </span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-nav-drawer-item': IgcNavDrawerItemComponent;
  }
}
